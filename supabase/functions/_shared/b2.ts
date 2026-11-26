// Supabase Edge Functions Shared Backblaze B2 S3 Client Utility
import { S3Client } from 'npm:@aws-sdk/client-s3@^3.750.0';

export function getB2Client(): S3Client {
  const endpoint = Deno.env.get('B2_ENDPOINT') || 'https://s3.us-east-005.backblazeb2.com';
  const region = Deno.env.get('B2_REGION') || 'us-east-005';
  const accessKeyId = Deno.env.get('B2_APPLICATION_KEY_ID');
  const secretAccessKey = Deno.env.get('B2_APPLICATION_KEY');

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing Backblaze B2 credentials in environment variables (B2_APPLICATION_KEY_ID or B2_APPLICATION_KEY).');
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

export function getB2BucketName(): string {
  return Deno.env.get('B2_BUCKET_NAME') || 'amman-real-estate-images';
}

/**
 * Validates the first 12-16 bytes of a binary file against known magic bytes signatures.
 * Supports:
 * - JPEG (FF D8 FF)
 * - PNG (89 50 4E 47 0D 0A 1A 0A)
 * - WebP (52 49 46 46 [RIFF] ... 57 45 42 50 [WEBP])
 */
export function validateImageMagicBytes(headerBytes: Uint8Array): {
  valid: boolean;
  detectedType?: 'image/jpeg' | 'image/png' | 'image/webp';
} {
  if (!headerBytes || headerBytes.length < 12) {
    return { valid: false };
  }

  // 1. JPEG signature: FF D8 FF
  if (headerBytes[0] === 0xff && headerBytes[1] === 0xd8 && headerBytes[2] === 0xff) {
    return { valid: true, detectedType: 'image/jpeg' };
  }

  // 2. PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    headerBytes[0] === 0x89 &&
    headerBytes[1] === 0x50 &&
    headerBytes[2] === 0x4e &&
    headerBytes[3] === 0x47 &&
    headerBytes[4] === 0x0d &&
    headerBytes[5] === 0x0a &&
    headerBytes[6] === 0x1a &&
    headerBytes[7] === 0x0a
  ) {
    return { valid: true, detectedType: 'image/png' };
  }

  // 3. WebP signature: RIFF at offset 0, WEBP at offset 8
  // RIFF = 52 49 46 46
  // WEBP = 57 45 42 50
  if (
    headerBytes[0] === 0x52 &&
    headerBytes[1] === 0x49 &&
    headerBytes[2] === 0x46 &&
    headerBytes[3] === 0x46 &&
    headerBytes[8] === 0x57 &&
    headerBytes[9] === 0x45 &&
    headerBytes[10] === 0x42 &&
    headerBytes[11] === 0x50
  ) {
    return { valid: true, detectedType: 'image/webp' };
  }

  return { valid: false };
}
