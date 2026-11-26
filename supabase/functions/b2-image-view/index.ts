// Supabase Edge Function: b2-image-view
// Secure public delivery endpoint for property images stored in private Backblaze B2 bucket.
// Security:
// 1. Never accepts arbitrary storage keys without exact database record verification.
// 2. Checks parent property status = 'PUBLISHED' (or active admin session).
// 3. Generates short-lived 5-minute pre-signed S3 GetObject URL.
// 4. Returns HTTP 302 Found with strict Cache-Control: no-store to enforce instantaneous revocation checks.
// 5. Injects ResponseCacheControl: no-store into the S3 presigned URL so B2 also instructs clients not to store.

import { GetObjectCommand } from 'npm:@aws-sdk/client-s3@^3.750.0';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@^3.750.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.49.1';
import { publicImageCorsHeaders } from '../_shared/cors.ts';
import { getB2Client, getB2BucketName } from '../_shared/b2.ts';
import { verifyAdmin, isAdminAuthFailure } from '../_shared/auth.ts';

const STORAGE_KEY_REGEX = /^properties\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpe?g|png|webp)$/i;

Deno.serve(async (req: Request) => {
  // Public CORS headers allowing anonymous <img> tag rendering across web clients
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: publicImageCorsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { ...publicImageCorsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const storageKey = url.searchParams.get('key')?.trim();

    // 1. Validate storage key parameter and format
    if (!storageKey || !STORAGE_KEY_REGEX.test(storageKey)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing storage key.' }),
        { status: 400, headers: { ...publicImageCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Internal configuration error.' }),
        { status: 500, headers: { ...publicImageCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 2. Strict Database Verification: Must exist in property_images
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from('property_images')
      .select('id, property_id, storage_key, properties!inner(status)')
      .eq('storage_key', storageKey)
      .maybeSingle();

    if (dbError || !imageRecord) {
      return new Response(
        JSON.stringify({ error: 'Property image not found in directory.' }),
        { status: 404, headers: { ...publicImageCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify Publication Status
    const parentPropertyStatus = (imageRecord.properties as unknown as { status: string })?.status;

    if (parentPropertyStatus !== 'PUBLISHED') {
      // If parent property is DRAFT, UNPUBLISHED, or SOLD, only active administrators may view it
      const authResult = await verifyAdmin(req);
      if (isAdminAuthFailure(authResult)) {
        return new Response(
          JSON.stringify({
            error: 'Access denied: This image belongs to an unpublished or restricted property listing.',
          }),
          { status: 403, headers: { ...publicImageCorsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Generate 5-Minute Pre-Signed S3 GetObject URL
    const s3Client = getB2Client();
    const bucket = getB2BucketName();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      ResponseCacheControl: 'no-store, no-cache, must-revalidate',
    });

    // Exact 300 seconds (5 minutes) expiry
    const presignedGetUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // 5. Issue HTTP 302 Found Redirect with Strict no-store Caching Headers
    return new Response(null, {
      status: 302,
      headers: {
        Location: presignedGetUrl,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...publicImageCorsHeaders,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal error retrieving property image.',
      }),
      { status: 500, headers: { ...publicImageCorsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
