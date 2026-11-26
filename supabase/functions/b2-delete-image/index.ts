// Supabase Edge Function: b2-delete-image
// Deletes an image object from Backblaze B2, with optional database record deletion.
// Retry Safety for Property Deletion:
// - Supports deleteRecord: false to delete B2 objects while preserving database rows.
// - S3 DeleteObject is idempotent; repeating deletion of an already-deleted key succeeds safely.
// Access: Active authenticated administrators only.

import { DeleteObjectCommand } from 'npm:@aws-sdk/client-s3@^3.750.0';
import { getAdminCorsHeaders, handleAdminCorsPreflight } from '../_shared/cors.ts';
import { getB2Client, getB2BucketName } from '../_shared/b2.ts';
import { verifyAdmin, isAdminAuthFailure } from '../_shared/auth.ts';

const STORAGE_KEY_REGEX = /^properties\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpe?g|png|webp)$/i;

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight (explicitly rejects unapproved origins)
  const preflightResponse = handleAdminCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  const cors = getAdminCorsHeaders(req);

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST or DELETE.' }), {
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

    const { storageKey, imageId, deleteRecord = true } = body;

    if (!storageKey || typeof storageKey !== 'string' || !STORAGE_KEY_REGEX.test(storageKey)) {
      return new Response(
        JSON.stringify({ error: 'Invalid storageKey format.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Delete object from Backblaze B2 (idempotent S3 delete)
    const s3Client = getB2Client();
    const bucket = getB2BucketName();

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: storageKey,
        })
      );
    } catch (s3Err) {
      // If error is 404 (NoSuchKey), S3 considers it already deleted. Otherwise throw.
      const statusCode = (s3Err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
      if (statusCode !== 404) {
        return new Response(
          JSON.stringify({
            error: `Failed to delete object from storage: ${s3Err instanceof Error ? s3Err.message : String(s3Err)}`,
          }),
          { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Delete database record if requested (individual image removal)
    // When cleaning up before property deletion, deleteRecord is false to preserve records for retry
    if (deleteRecord && imageId) {
      const { error: dbError } = await supabaseAdmin
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        return new Response(
          JSON.stringify({
            error: `Storage object was deleted, but database record removal failed: ${dbError.message}`,
          }),
          { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        storageKey,
        databaseRecordDeleted: Boolean(deleteRecord && imageId),
      }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal server error deleting property image.',
      }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
