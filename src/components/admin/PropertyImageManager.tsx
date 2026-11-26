import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  imageService,
  type ConfirmUploadResult,
} from '../../services/imageService';
import type { PropertyImageRow } from '../../types/database';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  FileWarning,
} from 'lucide-react';

interface PropertyImageManagerProps {
  propertyId: string | null;
  isEditMode: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'validating' | 'requesting_url' | 'uploading_b2' | 'confirming' | 'completed' | 'error';
  errorMessage?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Preview renderer that attaches the admin session token for viewing draft/restricted images.
 */
const AuthenticatedImagePreview: React.FC<{
  storageKey: string;
  fallbackUrl?: string;
  alt: string;
  className?: string;
}> = ({ storageKey, fallbackUrl, alt, className = '' }) => {
  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrlToRevoke: string | null = null;

    async function fetchImage() {
      setIsLoading(true);
      setHasError(false);

      try {
        const viewUrl = fallbackUrl || imageService.getImagePublicViewUrl(storageKey);
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(viewUrl, { headers });
        if (!res.ok) {
          throw new Error(`Failed to load preview (HTTP ${res.status})`);
        }

        const blob = await res.blob();
        if (!isMounted) return;

        objectUrlToRevoke = URL.createObjectURL(blob);
        setSrc(objectUrlToRevoke);
      } catch {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [storageKey, fallbackUrl]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-[#F7F5F0] ${className}`}>
        <Loader2 className="w-5 h-5 text-[#C5A46D] animate-spin" />
      </div>
    );
  }

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F7F5F0] text-[#999999] p-2 ${className}`}
      >
        <ImageIcon className="w-6 h-6 mb-1 text-[#C5A46D]/60" />
        <span className="text-[10px] text-center font-medium">B2 Image</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
};

export const PropertyImageManager: React.FC<PropertyImageManagerProps> = ({
  propertyId,
  isEditMode,
  onUploadingChange,
}) => {
  const [images, setImages] = useState<PropertyImageRow[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(isEditMode && Boolean(propertyId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Upload queue tracking
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Action busy states for individual images
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Notify parent of uploading state to prevent duplicate submissions
  useEffect(() => {
    onUploadingChange?.(isProcessingQueue);
  }, [isProcessingQueue, onUploadingChange]);

  // Load existing images on mount or when propertyId changes
  useEffect(() => {
    if (!propertyId || !isEditMode) {
      return;
    }

    let isMounted = true;

    imageService
      .getPropertyImages(propertyId)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setLoadError(error);
        } else {
          setImages(data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load property images.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingImages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyId, isEditMode]);

  // Handle file selection from input or dropzone and execute sequential upload
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !propertyId || isProcessingQueue) return;

    setActionError(null);
    setActionSuccess(null);

    const selectedFiles = Array.from(fileList);
    const newQueueItems: UploadQueueItem[] = selectedFiles.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Immediate pre-validation
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
          id,
          file,
          name: file.name,
          size: file.size,
          status: 'error',
          errorMessage: `Unsupported format (${file.type || 'unknown'}). Allowed: JPG, PNG, WebP.`,
        };
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
          id,
          file,
          name: file.name,
          size: file.size,
          status: 'error',
          errorMessage: `File exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        };
      }

      return {
        id,
        file,
        name: file.name,
        size: file.size,
        status: 'validating',
      };
    });

    setUploadQueue((prev) => [...prev, ...newQueueItems]);

    const validItems = newQueueItems.filter((item) => item.status === 'validating');
    if (validItems.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsProcessingQueue(true);

    // Track display order and cover status synchronously for the batch
    let nextDisplayOrder =
      images.length > 0
        ? Math.max(...images.map((img) => img.display_order)) + 1
        : 0;
    let hasCover = images.some((img) => img.is_cover);

    try {
      for (const item of validItems) {
        const { id: itemId, file } = item;

        try {
          // Step 1: Request pre-signed B2 upload URL
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: 'requesting_url' } : i))
          );

          const urlRes = await imageService.getUploadUrl(propertyId, file);
          if (!urlRes.success || !urlRes.uploadUrl || !urlRes.storageKey) {
            throw new Error(`[Step 1: b2-upload-url] ${urlRes.error || 'Failed to generate B2 upload URL.'}`);
          }

          const { uploadUrl, storageKey } = urlRes;

          // Step 2: Upload binary directly to Backblaze B2
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: 'uploading_b2' } : i))
          );

          const putRes = await imageService.uploadBinaryToB2ViaArrayBuffer(uploadUrl, file);
          if (!putRes.success) {
            throw new Error(`[Step 2: B2 PUT ArrayBuffer] ${putRes.error || 'Failed to upload image binary to Backblaze B2.'}`);
          }

          // Step 3: Server-side validation and DB insertion
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: 'confirming' } : i))
          );

          // Synchronous cover designation and display order assignment
          const isCover = !hasCover;
          const displayOrder = nextDisplayOrder;

          const confirmRes: ConfirmUploadResult = await imageService.confirmUpload(
            propertyId,
            storageKey,
            isCover,
            displayOrder
          );

          if (!confirmRes.success || !confirmRes.image) {
            throw new Error(`[Step 3: b2-confirm-upload] ${confirmRes.error || 'Server rejected upload confirmation.'}`);
          }

          // On successful confirmation, advance synchronous batch tracking
          if (isCover) {
            hasCover = true;
          }
          nextDisplayOrder++;

          // Add confirmed image to state immediately
          const newImage = confirmRes.image;
          setImages((prev) => {
            if (newImage.is_cover) {
              return [...prev.map((img) => ({ ...img, is_cover: false })), newImage];
            }
            return [...prev, newImage];
          });

          setUploadQueue((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: 'completed' } : i))
          );
          setActionSuccess(`"${file.name}" uploaded and registered successfully.`);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Upload failed.';
          console.error('[PropertyImageManager Upload Error]', err);
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, status: 'error', errorMessage: errMsg } : i))
          );
        }
      }
    } finally {
      setIsProcessingQueue(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Set Cover Image
  const handleSetCover = async (imageId: string) => {
    if (!propertyId || actionBusyId) return;

    setActionBusyId(imageId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await imageService.setCoverImage(propertyId, imageId);
      if (!res.success) {
        setActionError(res.error || 'Failed to update cover image.');
      } else {
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_cover: img.id === imageId,
          }))
        );
        setActionSuccess('Cover image updated successfully.');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update cover image.');
    } finally {
      setActionBusyId(null);
    }
  };

  // Reorder Image (Move Up / Down)
  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    if (actionBusyId) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const imageToMove = images[index];
    setActionBusyId(imageToMove.id);
    setActionError(null);
    setActionSuccess(null);

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update display_order values sequentially
    const updatedWithOrder = reordered.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));

    // Optimistically update UI
    setImages(updatedWithOrder);

    try {
      const payload = updatedWithOrder.map((img) => ({
        id: img.id,
        display_order: img.display_order,
      }));

      const res = await imageService.updateImageOrder(payload);
      if (!res.success) {
        // Rollback on failure
        setImages(images);
        setActionError(res.error || 'Failed to update image display order.');
      } else {
        setActionSuccess('Image order updated.');
      }
    } catch (err) {
      setImages(images);
      setActionError(err instanceof Error ? err.message : 'Failed to update image order.');
    } finally {
      setActionBusyId(null);
    }
  };

  // Delete Individual Image
  const handleDeleteImage = async (image: PropertyImageRow) => {
    if (!propertyId || actionBusyId) return;

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this image from storage and directory?'
    );
    if (!confirmed) return;

    setActionBusyId(image.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      // deleteRecord = true: B2 object is purged first; if B2 deletion fails, DB row is retained
      const res = await imageService.deleteB2Image(image.storage_key, image.id, true);

      if (!res.success) {
        setActionError(
          res.error ||
            'Failed to delete image from Backblaze B2. Database record has been retained.'
        );
      } else {
        // Remove deleted image from local state
        const remaining = images.filter((img) => img.id !== image.id);

        // If the deleted image was the cover image, assign the first remaining image as cover
        if (image.is_cover && remaining.length > 0) {
          const newCoverId = remaining[0].id;
          const coverRes = await imageService.setCoverImage(propertyId, newCoverId);
          if (!coverRes.success) {
            setActionError(
              `Image was deleted from storage, but reassigning cover failed: ${coverRes.error || 'Unknown error'}`
            );
          }
          setImages(
            remaining.map((img) => ({
              ...img,
              is_cover: coverRes.success ? img.id === newCoverId : false,
            }))
          );
        } else {
          setImages(remaining);
        }

        setActionSuccess('Image deleted successfully from storage and directory.');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete image.');
    } finally {
      setActionBusyId(null);
    }
  };

  // Clear completed items from upload queue
  const handleClearFinishedQueue = () => {
    setUploadQueue((prev) => prev.filter((item) => item.status !== 'completed'));
  };

  // When in CREATE mode (property has no database record yet)
  if (!isEditMode || !propertyId) {
    return (
      <div className="bg-white border border-[#E5E1D8] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="w-5 h-5 text-[#C5A46D]" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-[#142C38]">
            Property Image Gallery
          </h2>
        </div>
        <div className="bg-[#F7F5F0] border border-[#E5E1D8] p-4 text-xs text-[#666666] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#142C38] mb-1">
              Image upload is enabled after initial save
            </p>
            <p className="leading-relaxed">
              To guarantee database referential integrity, property images must be attached to an
              existing property record. Save this property listing first to activate the Backblaze
              B2 multi-image uploader.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E1D8] p-6 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E5E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#C5A46D]" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-[#142C38]">
              Property Image Gallery
            </h2>
            <span className="text-xs bg-[#142C38] text-white px-2 py-0.5 font-semibold rounded-xs">
              {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Private Backblaze B2 storage integration. Select exactly one cover image per property.
          </p>
        </div>

        {uploadQueue.some((i) => i.status === 'completed') && (
          <button
            type="button"
            onClick={handleClearFinishedQueue}
            className="text-xs text-[#666666] hover:text-[#142C38] underline cursor-pointer"
          >
            Clear completed uploads
          </button>
        )}
      </div>

      {/* Global Action Alerts */}
      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-green-600 hover:text-green-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoadingImages ? (
        <div className="py-12 flex flex-col items-center justify-center text-[#666666] text-xs">
          <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin mb-2" />
          <span>Loading property images from directory...</span>
        </div>
      ) : loadError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs mb-5">
          <p className="font-semibold mb-1">Failed to load property images:</p>
          <p>{loadError}</p>
        </div>
      ) : (
        <>
          {/* Upload Dropzone Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFilesSelected(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed transition-colors p-6 text-center mb-6 cursor-pointer ${
              isDragOver
                ? 'border-[#C5A46D] bg-[#F7F5F0]'
                : 'border-[#E5E1D8] hover:border-[#C5A46D]/60 hover:bg-[#FAFAF8]'
            }`}
            onClick={() => !isProcessingQueue && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#142C38]/5 flex items-center justify-center text-[#C5A46D]">
                {isProcessingQueue ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#142C38]">
                  {isProcessingQueue
                    ? 'Uploading images to Backblaze B2...'
                    : 'Click or drag & drop images to upload'}
                </p>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Supports JPEG, PNG, and WebP up to 5 MB each. Multiple selection allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Active Upload Queue Display */}
          {uploadQueue.length > 0 && (
            <div className="mb-6 border border-[#E5E1D8] divide-y divide-[#E5E1D8] bg-[#FAFAF8] text-xs">
              <div className="px-4 py-2 bg-[#F7F5F0] font-semibold text-[#142C38] flex items-center justify-between">
                <span>Upload Queue ({uploadQueue.length})</span>
                {isProcessingQueue && (
                  <span className="flex items-center gap-1 text-[#C5A46D] text-[11px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing uploads...</span>
                  </span>
                )}
              </div>

              {uploadQueue.map((item) => (
                <div key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-[#999999] truncate max-w-[200px] sm:max-w-[300px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[#999999]">
                      ({(item.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'validating' && (
                      <span className="text-[#666666] text-[11px]">Queued</span>
                    )}
                    {item.status === 'requesting_url' && (
                      <span className="text-[#C5A46D] text-[11px] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Requesting URL...
                      </span>
                    )}
                    {item.status === 'uploading_b2' && (
                      <span className="text-[#C5A46D] text-[11px] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading to B2...
                      </span>
                    )}
                    {item.status === 'confirming' && (
                      <span className="text-[#C5A46D] text-[11px] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying magic bytes...
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-green-700 text-[11px] flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Done
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span
                        className="text-red-700 text-[11px] flex items-center gap-1"
                        title={item.errorMessage}
                      >
                        <FileWarning className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="truncate max-w-[360px] sm:max-w-[450px]">
                          {item.errorMessage || 'Failed'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Gallery Grid */}
          {images.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#666666] bg-[#FAFAF8] border border-[#E5E1D8]">
              <ImageIcon className="w-8 h-8 text-[#C5A46D]/60 mx-auto mb-2" />
              <p className="font-semibold text-[#142C38]">No images uploaded yet</p>
              <p className="text-[11px] mt-0.5">
                Upload one or more photos above to showcase this property.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, index) => {
                const isBusy = actionBusyId === img.id;

                return (
                  <div
                    key={img.id}
                    className={`relative border transition-all bg-white group ${
                      img.is_cover
                        ? 'border-[#C5A46D] ring-2 ring-[#C5A46D]/30'
                        : 'border-[#E5E1D8] hover:border-[#142C38]/40'
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative aspect-4/3 w-full bg-[#F7F5F0] overflow-hidden">
                      <AuthenticatedImagePreview
                        storageKey={img.storage_key}
                        fallbackUrl={img.image_url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {img.is_cover && (
                        <div className="absolute top-2 left-2 bg-[#C5A46D] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-current" /> Cover Image
                        </div>
                      )}

                      {/* Display Order Badge */}
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-xs font-mono">
                        #{index + 1}
                      </div>

                      {/* Busy Overlay */}
                      {isBusy && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Image Controls Bar */}
                    <div className="p-2 bg-[#FAFAF8] border-t border-[#E5E1D8] flex items-center justify-between gap-1 text-xs">
                      {/* Set Cover Button */}
                      {!img.is_cover ? (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          disabled={Boolean(actionBusyId)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-[#666666] hover:text-[#C5A46D] hover:bg-[#F7F5F0] transition-colors rounded-xs cursor-pointer disabled:opacity-50"
                          title="Set as main cover image"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Make Cover</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#C5A46D] font-semibold flex items-center gap-1 px-2 py-1">
                          <Star className="w-3.5 h-3.5 fill-current" /> Main Cover
                        </span>
                      )}

                      {/* Order & Delete Actions */}
                      <div className="flex items-center gap-1">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'up')}
                          disabled={index === 0 || Boolean(actionBusyId)}
                          className="p-1 text-[#666666] hover:text-[#142C38] hover:bg-[#F7F5F0] transition-colors rounded-xs disabled:opacity-30 cursor-pointer"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'down')}
                          disabled={index === images.length - 1 || Boolean(actionBusyId)}
                          className="p-1 text-[#666666] hover:text-[#142C38] hover:bg-[#F7F5F0] transition-colors rounded-xs disabled:opacity-30 cursor-pointer"
                          title="Move later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Image */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img)}
                          disabled={Boolean(actionBusyId)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors rounded-xs disabled:opacity-30 cursor-pointer ml-1"
                          title="Delete image permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
