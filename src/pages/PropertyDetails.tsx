import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  ImageIcon,
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { SITE_CONFIG } from '../data/siteConfig';
import { PropertySpecifications } from '../components/property/PropertySpecifications';
import { formatTotalPriceINR } from '../utils/formatters';
import type { Property } from '../types';

interface PropertyImageGalleryProps {
  property: Property;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const galleryImages =
    property.images && property.images.length > 0
      ? property.images
      : property.imageUrl
        ? [
            {
              id: 'fallback-cover',
              image_url: property.imageUrl,
              storage_key: '',
              is_cover: true,
              display_order: 0,
            },
          ]
        : [];

  const hasMultipleImages = galleryImages.length > 1;

  const handlePrevImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length, hasMultipleImages]);

  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length, hasMultipleImages]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (!hasMultipleImages) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage, hasMultipleImages]);

  // Touch swipe navigation for mobile devices
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || !hasMultipleImages) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePrevImage();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[16/10] bg-[#F7F5F0] border border-[#E5E1D8] overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {galleryImages.length > 0 ? (
          <>
            <img
              src={galleryImages[currentImageIndex]?.image_url || property.imageUrl}
              alt={`${property.title} - View ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-200"
            />

            {/* Cover Badge */}
            {galleryImages[currentImageIndex]?.is_cover && (
              <div className="absolute top-3 left-3 bg-[#C5A46D] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs flex items-center gap-1.5 shadow-sm">
                <Star className="w-3 h-3 fill-current" />
                <span>Cover Photo</span>
              </div>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute top-3 right-3 bg-[#142C38]/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-xs font-mono tracking-wider shadow-sm">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            )}

            {/* Previous / Next Arrow Buttons */}
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#142C38]/80 hover:bg-[#142C38] text-white flex items-center justify-center transition-colors cursor-pointer rounded-xs shadow-md focus:outline-none focus:ring-2 focus:ring-[#C5A46D]"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#142C38]/80 hover:bg-[#142C38] text-white flex items-center justify-center transition-colors cursor-pointer rounded-xs shadow-md focus:outline-none focus:ring-2 focus:ring-[#C5A46D]"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F5F0] text-[#666666] space-y-2">
            <ImageIcon className="w-12 h-12 text-[#C5A46D]/50" />
            <p className="text-xs uppercase tracking-wider font-semibold text-[#142C38]">
              No Photos Available
            </p>
            <p className="text-[11px] text-[#666666]">
              Photography for this listing is being prepared.
            </p>
          </div>
        )}
      </div>

      {/* Clickable Thumbnail Strip */}
      {hasMultipleImages && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {galleryImages.map((img, idx) => {
            const isSelected = idx === currentImageIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#C5A46D] ring-2 ring-[#C5A46D]/30 opacity-100 shadow-xs'
                    : 'border-[#E5E1D8] opacity-65 hover:opacity-100 hover:border-[#142C38]'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={img.image_url}
                  alt={`${property.title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {img.is_cover && (
                  <div
                    className="absolute bottom-0 right-0 bg-[#C5A46D] text-white p-0.5"
                    title="Cover Photo"
                  >
                    <Star className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(!id);

  const fetchProperty = async (targetId: string) => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const { property: foundProperty, error: fetchErr } =
        await propertyService.getPublishedPropertyByIdOrSlug(targetId);

      if (fetchErr) {
        setError(fetchErr);
      } else if (!foundProperty) {
        setNotFound(true);
      } else {
        setProperty(foundProperty);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch property details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    propertyService
      .getPublishedPropertyByIdOrSlug(id)
      .then(({ property: foundProperty, error: fetchErr }) => {
        if (!isMounted) return;
        if (fetchErr) {
          setError(fetchErr);
        } else if (!foundProperty) {
          setNotFound(true);
        } else {
          setProperty(foundProperty);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch property details.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#C5A46D] animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-wider text-[#142C38] font-semibold">
          Loading Property Specifications...
        </p>
      </div>
    );
  }

  // Not found state (removes erroneous sample fallback)
  if (notFound || !property) {
    return (
      <div className="py-16 md:py-24 max-w-2xl mx-auto px-4 sm:px-8 text-center space-y-6">
        <Building2 className="w-16 h-16 text-[#C5A46D]/40 mx-auto" />
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-[#142C38]">Property Not Found</h1>
          <p className="text-sm text-[#242424]/75 leading-relaxed font-light">
            The requested property listing does not exist, has been archived, or is not publicly
            published.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/properties"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#142C38] text-[#C5A46D] text-xs uppercase tracking-wider font-semibold hover:bg-[#0D1E27] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Properties Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-16 md:py-24 max-w-2xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="p-6 bg-red-50 border-l-4 border-red-600 text-red-900 space-y-3">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <h2 className="font-serif text-lg font-bold">Unable to Load Property Details</h2>
          </div>
          <p className="text-xs text-red-800 leading-relaxed">{error}</p>
          <div className="pt-2 flex items-center space-x-3">
            {id && (
              <button
                type="button"
                onClick={() => fetchProperty(id)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 text-white font-semibold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
            <Link
              to="/properties"
              className="text-xs uppercase tracking-wider font-semibold text-[#142C38] underline hover:text-[#C5A46D]"
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = property.specifications?.totalPrice
    ? formatTotalPriceINR(property.specifications.totalPrice)
    : null;

  const whatsappInquiryUrl = buildWhatsAppLink({
    propertyId: property.id,
    propertyTitle: property.title,
    category: property.propertyTypeDisplay || property.categoryDisplay,
    totalPrice: formattedPrice || undefined,
  });

  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#142C38] font-semibold hover:text-[#C5A46D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties Catalog</span>
        </Link>
      </div>

      {/* Main Detail Header */}
      <div className="space-y-3 border-b border-[#E5E1D8] pb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-widest px-2.5 py-1 bg-[#142C38] text-[#C5A46D] font-semibold">
            {property.propertyTypeDisplay || property.categoryDisplay}
          </span>
          {property.isDemoPlaceholder ? (
            <span className="text-xs uppercase tracking-widest px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono">
              [Sample Preview Entry]
            </span>
          ) : (
            <span className="text-xs uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
              Verified Listing
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#142C38]">
          {property.title}
        </h1>

        <div className="flex items-center space-x-2 text-sm text-[#242424]/70">
          <MapPin className="w-4 h-4 text-[#C5A46D]" />
          <span>
            {property.location}
            {property.areaSector ? ` (${property.areaSector})` : ''}
          </span>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Image, Detailed Specifications & Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Property Photo / Multi-Image Carousel */}
          <PropertyImageGallery property={property} />

          {/* Dedicated Property Specifications Section */}
          <PropertySpecifications property={property} />

          {/* Property Overview & Highlights */}
          <div className="bg-white border border-[#E5E1D8] p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#142C38]">
              Property Overview & Highlights
            </h2>
            <p className="text-sm text-[#242424]/80 leading-relaxed font-light">
              {property.fullDescription}
            </p>

            {property.highlights && property.highlights.length > 0 && (
              <div className="pt-4 border-t border-[#E5E1D8] space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">
                  Property Highlights
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#242424]/80">
                  {property.highlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Spec Sheet & Direct WhatsApp CTA */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E1D8] p-6 space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#142C38] border-b border-[#E5E1D8] pb-3">
              Property Summary
            </h3>

            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E5E1D8]/60">
                <dt className="text-[#242424]/70">Reference ID</dt>
                <dd className="font-mono font-medium text-[#142C38]">
                  {property.slug || property.id.slice(0, 8)}
                </dd>
              </div>
              {property.propertyTypeDisplay && (
                <div className="flex justify-between py-1.5 border-b border-[#E5E1D8]/60">
                  <dt className="text-[#242424]/70">Property Type</dt>
                  <dd className="font-medium text-[#142C38]">{property.propertyTypeDisplay}</dd>
                </div>
              )}
              {property.areaSector && (
                <div className="flex justify-between py-1.5 border-b border-[#E5E1D8]/60">
                  <dt className="text-[#242424]/70">Sector / Zone</dt>
                  <dd className="font-medium text-[#142C38]">{property.areaSector}</dd>
                </div>
              )}
              {property.dimensions && (
                <div className="flex justify-between py-1.5 border-b border-[#E5E1D8]/60">
                  <dt className="text-[#242424]/70">Dimensions</dt>
                  <dd className="font-mono text-[#142C38]">{property.dimensions}</dd>
                </div>
              )}
              {property.roadWidth && (
                <div className="flex justify-between py-1.5 border-b border-[#E5E1D8]/60">
                  <dt className="text-[#242424]/70">Road Width</dt>
                  <dd className="text-[#142C38]">{property.roadWidth}</dd>
                </div>
              )}
              {property.facing && (
                <div className="flex justify-between py-1.5 border-b border-[#E5E1D8]/60">
                  <dt className="text-[#242424]/70">Facing</dt>
                  <dd className="text-[#142C38]">{property.facing}</dd>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <dt className="text-[#242424]/70 font-semibold">Total Price</dt>
                <dd className="font-semibold text-[#C5A46D]">
                  {formattedPrice
                    ? `${formattedPrice}${property.isDemoPlaceholder ? ' [Sample]' : ''}`
                    : 'Price on Consultation'}
                </dd>
              </div>
            </dl>

            <div className="pt-2">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-4 bg-[#142C38] text-[#C5A46D] border border-[#C5A46D] font-semibold text-xs uppercase tracking-widest hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </a>
              <p className="text-[11px] text-[#242424]/60 text-center mt-2 font-light">
                Sends pre-formatted WhatsApp message directly to {SITE_CONFIG.contact.phoneDisplay}
              </p>
            </div>
          </div>

          {/* Compliance Box */}
          <div className="bg-[#142C38] text-[#F7F5F0] p-6 space-y-3 border-l-2 border-[#C5A46D]">
            <div className="flex items-center space-x-2 text-[#C5A46D] text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verification Notice</span>
            </div>
            <p className="text-xs text-[#F7F5F0]/75 leading-relaxed font-light">
              Actual property extents, documentation, approvals, and final pricing should be
              confirmed directly with Amman Real Estate before making a decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
