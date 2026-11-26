// Supabase Edge Function: b2-confirm-upload
// Server-side verification and database registration of an uploaded Backblaze B2 image.
// Security:
// 1. Enforces <= 5 MB size limit via S3 HeadObject.
// 2. Enforces authentic image binary signature (magic bytes) for JPEG, PNG, or WebP via S3 GetObject (Range: 0-15).
// 3. Purges invalid or oversized files immediately from B2.
// 4. Inserts verified record into public.property_images with automatic rollback on DB error.
// Access: Active authenticated administrators only.

import {
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from 'npm:@aws-sdk/client-s3@^3.750.0';
import { getAdminCorsHeaders, handleAdminCorsPreflight } from '../_shared/cors.ts';
import { getB2Client, getB2BucketName, validateImageMagicBytes } from '../_shared/b2.ts';
import { verifyAdmin, isAdminAuthFailure } from '../_shared/auth.ts';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum
const STORAGE_KEY_PARSER =
  /^properties\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(jpe?g|png|webp)$/i;

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight (explicitly rejects unapproved origins)
  const preflightResponse = handleAdminCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  const cors = getAdminCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Verify caller is an active administrator
    const authResult = await verifyAdmin(req);
    if (isAdminAuthFailure(authResult)) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { supabaseAdmin } = authResult;

    // 3. Parse and validate payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { propertyId, storageKey, isCover = false, displayOrder = 0 } = body;

    if (!propertyId || typeof propertyId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid propertyId.' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!storageKey || typeof storageKey !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid storageKey.' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Verify storage key follows the exact generated pattern: properties/<propertyId>/<imageUuid>.<ext>
    const keyMatch = storageKey.match(STORAGE_KEY_PARSER);
    if (!keyMatch) {
      return new Response(
        JSON.stringify({
          error:
            'Invalid storageKey format. Must strictly match generated properties/<propertyId>/<imageUuid>.<ext> pattern.',
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const [, embeddedPropertyId] = keyMatch;

    // Verify storage key ownership: the property UUID embedded in storageKey must exactly match submitted propertyId
    if (embeddedPropertyId.toLowerCase() !== propertyId.toLowerCase()) {
      return new Response(
        JSON.stringify({
          error:
            'Storage key ownership mismatch: The property UUID in storageKey does not match the submitted propertyId.',
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const s3Client = getB2Client();
    const bucket = getB2BucketName();

    // Helper to purge invalid/rejected object from B2
    const purgeObjectFromB2 = async () => {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: storageKey,
          })
        );
      } catch (purgeErr) {
        console.error('Failed to purge rejected object from B2:', purgeErr);
      }
    };

    // 4. Server-Side Size & Existence Verification via HeadObject
    let headMetadata;
    try {
      headMetadata = await s3Client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: storageKey,
        })
      );
    } catch (headErr) {
      return new Response(
        JSON.stringify({
          error: `Storage verification failed: Object "${storageKey}" was not found in Backblaze B2.`,
          details: headErr instanceof Error ? headErr.message : String(headErr),
        }),
        { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const actualSize = headMetadata.ContentLength || 0;

    // Strict Size Enforcement
    if (actualSize <= 0 || actualSize > MAX_FILE_SIZE_BYTES) {
      await purgeObjectFromB2();
      return new Response(
        JSON.stringify({
          error: `Uploaded object size (${(actualSize / 1024 / 1024).toFixed(2)} MB) exceeds the maximum permitted limit of 5.00 MB. The object has been purged from storage.`,
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Binary File Signature (Magic Bytes) Verification
    // Retrieve the first 16 bytes directly from B2
    let headerBytes: Uint8Array;
    try {
      const rangeResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: storageKey,
          Range: 'bytes=0-15',
        })
      );

      const stream = rangeResponse.Body;
      const chunks: Uint8Array[] = [];
      // Read stream chunks in Deno
      // @ts-ignore stream iterable in modern runtime
      for await (const chunk of stream) {
        chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
      }

      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      headerBytes = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        headerBytes.set(c, offset);
        offset += c.length;
      }
    } catch (rangeErr) {
      await purgeObjectFromB2();
      return new Response(
        JSON.stringify({
          error: 'Failed to inspect object binary header. The object has been purged.',
          details: rangeErr instanceof Error ? rangeErr.message : String(rangeErr),
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Validate magic bytes
    const magicCheck = validateImageMagicBytes(headerBytes);
    if (!magicCheck.valid) {
      await purgeObjectFromB2();
      return new Response(
        JSON.stringify({
          error:
            'Invalid file content: The file binary signature does not match an authentic JPEG, PNG, or WebP image. The object has been purged.',
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Register Verified Image Record in Database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const publicViewUrl = `${supabaseUrl}/functions/v1/b2-image-view?key=${encodeURIComponent(storageKey)}`;

    // If marked as cover, un-cover any previous images for this property
    if (isCover) {
      await supabaseAdmin
        .from('property_images')
        .update({ is_cover: false })
        .eq('property_id', propertyId);
    }

    const { data: newImageRecord, error: insertError } = await supabaseAdmin
      .from('property_images')
      .insert({
        property_id: propertyId,
        storage_key: storageKey,
        image_url: publicViewUrl,
        is_cover: Boolean(isCover),
        display_order: Number(displayOrder) || 0,
      })
      .select()
      .single();

    if (insertError) {
      // Rollback: Purge B2 binary so no orphaned file remains
      await purgeObjectFromB2();
      return new Response(
        JSON.stringify({
          error: `Database insertion failed: ${insertError.message}. Uploaded file has been purged from storage.`,
        }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: newImageRecord,
        verifiedSize: actualSize,
        verifiedType: magicCheck.detectedType,
      }),
      {
        status: 201,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error while confirming upload.',
      }),
      {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    );
  }
});
