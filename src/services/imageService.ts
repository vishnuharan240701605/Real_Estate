import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { PropertyImageRow } from '../types/database';

export interface UploadUrlResult {
  success: boolean;
  uploadUrl?: string;
  storageKey?: string;
  expiresIn?: number;
  error?: string;
}

export interface ConfirmUploadResult {
  success: boolean;
  image?: PropertyImageRow;
  verifiedSize?: number;
  verifiedType?: string;
  error?: string;
}

export interface DeleteImageResult {
  success: boolean;
  storageKey?: string;
  databaseRecordDeleted?: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum

/**
 * Safely extract descriptive error message from Supabase Edge Function invocation response.
 */
async function extractFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (!error) return fallback;
  if (typeof error === 'object' && error !== null) {
    if ('context' in error && (error as { context?: unknown }).context instanceof Response) {
      try {
        const cloned = (error as { context: Response }).context.clone();
        const json = await cloned.json();
        if (json && typeof json.error === 'string') {
          return json.error;
        }
      } catch {
        // Response body might not be valid JSON
      }
    }
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return fallback;
}

/**
 * Request a pre-signed Backblaze B2 upload URL from the admin-only b2-upload-url Edge Function.
 * Pre-validates file MIME type and size on client before calling the function.
 */
export async function getUploadUrl(propertyId: string, file: File): Promise<UploadUrlResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  if (!propertyId || typeof propertyId !== 'string') {
    return { success: false, error: 'A valid property ID is required.' };
  }

  if (!file) {
    return { success: false, error: 'No file provided for upload.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file format "${file.type}". Permitted formats: JPEG, PNG, WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      uploadUrl: string;
      storageKey: string;
      expiresIn: number;
      error?: string;
    }>('b2-upload-url', {
      body: {
        propertyId,
        contentType: file.type,
      },
    });

    if (error) {
      const errorMsg = await extractFunctionErrorMessage(
        error,
        'Failed to obtain upload URL from server.'
      );
      return { success: false, error: errorMsg };
    }

    if (!data || !data.uploadUrl || !data.storageKey) {
      return {
        success: false,
        error: data?.error || 'Failed to receive upload URL from server.',
      };
    }

    return {
      success: true,
      uploadUrl: data.uploadUrl,
      storageKey: data.storageKey,
      expiresIn: data.expiresIn,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to request upload URL.',
    };
  }
}

/**
 * Upload the binary file directly to Backblaze B2 using the pre-signed HTTP PUT URL.
 * Uploads directly from browser to Backblaze B2 without routing large binary data through Supabase.
 */
export async function uploadBinaryToB2(
  uploadUrl: string,
  file: File
): Promise<{ success: boolean; error?: string }> {
  if (!uploadUrl) {
    return { success: false, error: 'Missing pre-signed upload URL.' };
  }

  if (!file) {
    return { success: false, error: 'No file provided for upload.' };
  }

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => '');
      return {
        success: false,
        error: `Storage upload failed with HTTP ${response.status}: ${responseText || response.statusText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error uploading file to storage.',
    };
  }
}

/**
 * Diagnostic alternative: Upload binary directly to Backblaze B2 using XMLHttpRequest.
 * Preserves the existing uploadBinaryToB2 (Fetch) implementation untouched above.
 */
export async function uploadBinaryToB2ViaXhr(
  uploadUrl: string,
  file: File
): Promise<{ success: boolean; status?: number; error?: string }> {
  if (!uploadUrl) {
    return { success: false, error: 'Missing pre-signed upload URL.' };
  }

  if (!file) {
    return { success: false, error: 'No file provided for upload.' };
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true, status: xhr.status });
      } else {
        resolve({
          success: false,
          status: xhr.status,
          error: `Storage upload failed with HTTP ${xhr.status}: ${xhr.responseText || xhr.statusText}`,
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        status: xhr.status,
        error: `Network error (XHR status: ${xhr.status || 0}, readyState: ${xhr.readyState}) uploading to storage.`,
      });
    };

    xhr.onabort = () => {
      resolve({
        success: false,
        error: 'Upload was aborted.',
      });
    };

    xhr.send(file);
  });
}

/**
 * Diagnostic experiment: Upload binary directly to Backblaze B2 using XMLHttpRequest
 * with an in-memory ArrayBuffer. Preserves both uploadBinaryToB2 (Fetch) and
 * uploadBinaryToB2ViaXhr (XHR-with-File) unchanged above.
 */
export async function uploadBinaryToB2ViaArrayBuffer(
  uploadUrl: string,
  file: File
): Promise<{ success: boolean; status?: number; error?: string }> {
  if (!uploadUrl) {
    return { success: false, error: 'Missing pre-signed upload URL.' };
  }

  if (!file) {
    return { success: false, error: 'No file provided for upload.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true, status: xhr.status });
        } else {
          resolve({
            success: false,
            status: xhr.status,
            error: `Storage upload failed with HTTP ${xhr.status}: ${xhr.responseText || xhr.statusText}`,
          });
        }
      };

      xhr.onerror = () => {
        resolve({
          success: false,
          status: xhr.status,
          error: `Network error (XHR status: ${xhr.status || 0}, readyState: ${xhr.readyState}) uploading to storage.`,
        });
      };

      xhr.onabort = () => {
        resolve({
          success: false,
          error: 'Upload was aborted.',
        });
      };

      xhr.send(arrayBuffer);
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to read file into ArrayBuffer.',
    };
  }
}

/**
 * Confirm the uploaded image with the server-side b2-confirm-upload Edge Function.
 * The server enforces <= 5 MB size check, binary magic bytes validation, and inserts
 * the record into public.property_images with automatic rollback on error.
 */
export async function confirmUpload(
  propertyId: string,
  storageKey: string,
  isCover: boolean = false,
  displayOrder: number = 0
): Promise<ConfirmUploadResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  if (!propertyId || !storageKey) {
    return { success: false, error: 'Missing required propertyId or storageKey.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      image: PropertyImageRow;
      verifiedSize?: number;
      verifiedType?: string;
      error?: string;
    }>('b2-confirm-upload', {
      body: {
        propertyId,
        storageKey,
        isCover,
        displayOrder,
      },
    });

    if (error) {
      const errorMsg = await extractFunctionErrorMessage(
        error,
        'Server rejected upload confirmation.'
      );
      return { success: false, error: errorMsg };
    }

    if (!data || !data.success || !data.image) {
      return {
        success: false,
        error: data?.error || 'Server rejected upload confirmation.',
      };
    }

    return {
      success: true,
      image: data.image,
      verifiedSize: data.verifiedSize,
      verifiedType: data.verifiedType,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to confirm upload with server.',
    };
  }
}

/**
 * Delete an image from Backblaze B2 (and optionally its database record) via b2-delete-image.
 * When deleteRecord is false, the database record is retained (used for batch property deletion retry safety).
 */
export async function deleteB2Image(
  storageKey: string,
  imageId?: string,
  deleteRecord: boolean = true
): Promise<DeleteImageResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  if (!storageKey) {
    return { success: false, error: 'Missing storageKey for image deletion.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      storageKey: string;
      databaseRecordDeleted: boolean;
      error?: string;
    }>('b2-delete-image', {
      body: {
        storageKey,
        imageId,
        deleteRecord,
      },
    });

    if (error) {
      const errorMsg = await extractFunctionErrorMessage(
        error,
        'Storage image deletion failed.'
      );
      return { success: false, error: errorMsg };
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error || 'Storage image deletion failed.',
      };
    }

    return {
      success: true,
      storageKey: data.storageKey,
      databaseRecordDeleted: data.databaseRecordDeleted,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to invoke image deletion service.',
    };
  }
}

/**
 * Construct the public viewing URL pointing to the b2-image-view Supabase Edge Function.
 * This URL performs database verification and 302 redirects to a short-lived pre-signed URL.
 */
export function getImagePublicViewUrl(storageKey: string): string {
  if (!storageKey) return '';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  if (!supabaseUrl) return '';
  const cleanUrl = supabaseUrl.replace(/\/+$/, '');
  return `${cleanUrl}/functions/v1/b2-image-view?key=${encodeURIComponent(storageKey)}`;
}

/**
 * Retrieve all images for a property ordered by display_order ASC, created_at ASC.
 */
export async function getPropertyImages(
  propertyId: string
): Promise<{ data: PropertyImageRow[]; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: 'Supabase credentials are not configured.' };
  }

  if (!propertyId) {
    return { data: [], error: 'Property ID is required.' };
  }

  try {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as PropertyImageRow[]) || [] };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch property images.',
    };
  }
}

/**
 * Atomically update the cover image for a property.
 * Exclusively executes the atomic set_property_cover_image RPC function.
 * Guarantees single-transaction execution, ensures target image belongs to property,
 * and prevents multiple or zero-cover states.
 */
export async function setCoverImage(
  propertyId: string,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  if (!propertyId || !imageId) {
    return { success: false, error: 'Both propertyId and imageId are required.' };
  }

  try {
    // Exclusively invoke atomic database RPC function
    const { data: rpcSuccess, error: rpcError } = await supabase.rpc(
      'set_property_cover_image',
      {
        p_property_id: propertyId,
        p_image_id: imageId,
      }
    );

    if (rpcError) {
      if (rpcError.code === '42883' || rpcError.code === 'PGRST202') {
        return {
          success: false,
          error:
            'Atomic cover selection requires database migration 20261126000004_property_images_permissions_and_atomic_cover.sql to be applied in Supabase.',
        };
      }
      return {
        success: false,
        error: `Database cover update failed: ${rpcError.message} (${rpcError.code || 'UNKNOWN'})`,
      };
    }

    if (!rpcSuccess) {
      return {
        success: false,
        error: 'Database cover selection returned false without error.',
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update cover image.',
    };
  }
}

/**
 * Update display orders for multiple images.
 * Restricts updates to the display_order column and reports errors cleanly.
 */
export async function updateImageOrder(
  orderedItems: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  if (!orderedItems || orderedItems.length === 0) {
    return { success: true };
  }

  try {
    const updatePromises = orderedItems.map((item) =>
      supabase
        .from('property_images')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      return {
        success: false,
        error: `Database order update failed: ${failed.error.message}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update image order.',
    };
  }
}

/**
 * Unified imageService object exporting all image operations.
 */
export const imageService = {
  getUploadUrl,
  uploadBinaryToB2,
  uploadBinaryToB2ViaXhr,
  uploadBinaryToB2ViaArrayBuffer,
  confirmUpload,
  deleteB2Image,
  getImagePublicViewUrl,
  getPropertyImages,
  setCoverImage,
  updateImageOrder,
};
