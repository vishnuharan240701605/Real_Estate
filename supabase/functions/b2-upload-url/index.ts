// Supabase Edge Function: b2-upload-url
// Generates a pre-signed S3 PutObject URL for direct, private binary upload to Backblaze B2.
// Access: Active authenticated administrators only.

import { PutObjectCommand } from 'npm:@aws-sdk/client-s3@^3.750.0';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@^3.750.0';
import { getAdminCorsHeaders, handleAdminCorsPreflight } from '../_shared/cors.ts';
import { getB2Client, getB2BucketName } from '../_shared/b2.ts';
import { verifyAdmin, isAdminAuthFailure } from '../_shared/auth.ts';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

    const { propertyId, contentType } = body;

    // Validate propertyId
    if (!propertyId || typeof propertyId !== 'string' || !UUID_REGEX.test(propertyId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid propertyId. Must be a valid UUID string.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Validate contentType MIME
    if (!contentType || typeof contentType !== 'string' || !ALLOWED_MIME_TYPES.has(contentType)) {
      return new Response(
        JSON.stringify({
          error: `Unsupported content type "${contentType}". Permitted: image/jpeg, image/png, image/webp.`,
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Verify property exists in properties table
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .maybeSingle();

    if (propError || !property) {
      return new Response(
        JSON.stringify({ error: `Property with ID "${propertyId}" does not exist.` }),
        { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Generate unique, random storage key (never trust client filename)
    const extension =
      contentType === 'image/webp' ? 'webp' : contentType === 'image/png' ? 'png' : 'jpg';
    const randomUuid = crypto.randomUUID();
    const storageKey = `properties/${propertyId}/${randomUuid}.${extension}`;

    // 5. Generate pre-signed S3 PutObject URL (TTL: 10 minutes)
    const s3Client = getB2Client();
    const bucket = getB2BucketName();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl,
        storageKey,
        expiresIn: 600,
      }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error while generating upload URL.',
      }),
      {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    );
  }
});
