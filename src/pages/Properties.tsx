import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { PROPERTY_CATEGORIES } from '../data/categories';
import { buildWhatsAppLink } from '../utils/whatsapp';
import type { Property, PropertyCategory } from '../types';
import type { PropertyTypeDb } from '../types/database';

interface PropertyFilterOption {
  id: string;
  label: string;
  propertyType: PropertyTypeDb | null;
}

const PUBLIC_FILTERS: PropertyFilterOption[] = [
  { id: 'all', label: 'All', propertyType: null },
  { id: 'houses', label: 'Houses', propertyType: 'HOUSE' },
  { id: 'apartments', label: 'Apartments', propertyType: 'APARTMENT' },
  { id: 'residential-plots', label: 'Residential Plots', propertyType: 'RESIDENTIAL_PLOT' },
  { id: 'commercial-properties', label: 'Commercial Properties', propertyType: 'COMMERCIAL_PROPERTY' },
  { id: 'agricultural-land', label: 'Agricultural Land', propertyType: 'AGRICULTURAL_LAND' },
];

export const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTypeParam = searchParams.get('type');
  const rawCategoryParam = searchParams.get('category') as PropertyCategory | null;

  // Resolve active property type filter
  const activeFilterOption = PUBLIC_FILTERS.find(
    (f) =>
      f.id === rawTypeParam?.toLowerCase() ||
      (f.propertyType && f.propertyType.toLowerCase() === rawTypeParam?.toLowerCase()) ||
      (f.propertyType && f.propertyType === rawTypeParam)
  );

  const activePropertyType: PropertyTypeDb | null = activeFilterOption
    ? activeFilterOption.propertyType
    : null;

  // Category fallback if user navigated via ?category=residential-houses
  const activeCategory: PropertyCategory | null = !activePropertyType ? rawCategoryParam : null;

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublishedProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await propertyService.getPublishedProperties({
        propertyType: activePropertyType || undefined,
        category: activeCategory || undefined,
        pageSize: 50,
      });

      if (result.error && result.properties.length === 0) {
        setError(result.error);
      } else {
        setProperties(result.properties);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties.');
    } finally {
      setIsLoading(false);
    }
  }, [activePropertyType, activeCategory]);

  useEffect(() => {
    let isMounted = true;

    propertyService
      .getPublishedProperties({
        propertyType: activePropertyType || undefined,
        category: activeCategory || undefined,
        pageSize: 50,
      })
      .then((result) => {
        if (!isMounted) return;
        if (result.error && result.properties.length === 0) {
          setError(result.error);
        } else {
          setProperties(result.properties);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch properties.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activePropertyType, activeCategory]);

  const handleSelectFilter = (filter: PropertyFilterOption) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category'); // Clear category when selecting property type
    if (!filter.propertyType) {
      nextParams.delete('type');
    } else {
      nextParams.set('type', filter.propertyType);
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('type');
    nextParams.delete('category');
    setSearchParams(nextParams);
  };

  const getActiveFilterTitle = () => {
    if (activePropertyType) {
      const found = PUBLIC_FILTERS.find((f) => f.propertyType === activePropertyType);
      return found ? found.label : 'All Properties';
    }
    if (activeCategory) {
      const found = PROPERTY_CATEGORIES.find((c) => c.id === activeCategory);
      return found ? found.title : 'All Properties';
    }
    return 'All Properties';
  };

  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
      {/* Editorial Page Header */}
      <div className="border-b border-[#E5E1D8] pb-8 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A46D] font-semibold">
            Thanjavur Property Directory
          </span>
          <span className="text-xs text-[#242424]/40">•</span>
          <span className="text-xs uppercase tracking-wider text-[#142C38] font-medium">
            {getActiveFilterTitle()}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#142C38]">
          Explore Properties
        </h1>
        <p className="text-sm sm:text-base text-[#242424]/75 max-w-3xl font-light leading-relaxed">
          Explore listings of residential houses, surveyed layout plots, and highway commercial land
          situated across Thanjavur’s key growth corridors.
        </p>
      </div>

      {/* Property Type Classification Filter Pills Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E5E1D8] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[#242424]/60 font-medium mr-2">
            Filter:
          </span>

          {PUBLIC_FILTERS.map((f) => {
            const isSelected =
              (!activePropertyType && !activeCategory && f.id === 'all') ||
              (activePropertyType && f.propertyType === activePropertyType);

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectFilter(f)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#142C38] text-[#C5A46D] border border-[#C5A46D]'
                    : 'bg-[#F7F5F0] text-[#242424]/80 hover:bg-[#E5E1D8] border border-[#E5E1D8]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {(activePropertyType || activeCategory) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center space-x-1.5 text-xs text-[#142C38] font-medium hover:text-[#C5A46D] transition-colors self-end sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Error Alert State */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load properties from the directory.</p>
              <p className="text-[11px] text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchPublishedProperties}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 text-white font-semibold text-[11px] uppercase tracking-wider hover:bg-red-700 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Transparent Notice */}
      <div className="bg-white border-l-4 border-[#C5A46D] border-y border-r border-[#E5E1D8] p-4 flex items-start space-x-3 text-xs text-[#242424]/80">
        <AlertCircle className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Actual property extents, documentation, approvals, and final pricing should be confirmed
          directly with Amman Real Estate before making a decision.
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white border border-[#E5E1D8] p-16 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#C5A46D] animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider text-[#142C38] font-semibold">
            Loading Published Properties...
          </p>
        </div>
      ) : properties.length > 0 ? (
        /* Property Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <article
              key={prop.id}
              className="bg-white border border-[#E5E1D8] flex flex-col group hover:border-[#C5A46D] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] bg-[#E5E1D8] overflow-hidden">
                <img
                  src={prop.imageUrl}
                  alt={prop.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Property Type Badge */}
                <span className="absolute top-3 left-3 bg-[#142C38] text-[#C5A46D] text-xs tracking-wider uppercase font-medium px-2.5 py-1 shadow-sm">
                  {prop.propertyTypeDisplay || prop.categoryDisplay}
                </span>

                {/* Status / Verification Marker */}
                {prop.isDemoPlaceholder ? (
                  <span className="absolute top-3 right-3 bg-black/80 text-white text-[10px] tracking-wider uppercase px-2 py-0.5 font-mono">
                    Sample
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-emerald-900/90 text-emerald-100 text-[10px] tracking-wider uppercase px-2 py-0.5 font-mono border border-emerald-500/30">
                    Verified
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-[#C5A46D] font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{prop.location}</span>
                  </div>

                  <h2 className="font-serif text-lg font-bold text-[#142C38] group-hover:text-[#1D3B4B] transition-colors line-clamp-2">
                    {prop.title}
                  </h2>

                  <p className="text-xs text-[#242424]/70 leading-relaxed line-clamp-2">
                    {prop.shortDescription}
                  </p>
                </div>

                {/* Property Metrics */}
                <div className="space-y-3 pt-3 border-t border-[#E5E1D8]">
                  <div className="flex items-center justify-between text-xs text-[#242424]/80">
                    <span className="font-medium text-[#242424]/60">Area / Extent:</span>
                    <span className="font-mono font-medium text-[#142C38]">
                      {prop.sizeDisplay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#242424]/80">
                    <span className="font-medium text-[#242424]/60">Pricing Status:</span>
                    <span className="text-[#C5A46D] font-semibold">
                      {prop.priceEstimateDisplay}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center space-x-2">
                    <Link
                      to={`/properties/${prop.slug || prop.id}`}
                      className="flex-1 py-2.5 text-center text-xs uppercase tracking-wider font-semibold bg-[#142C38] text-[#F7F5F0] hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors inline-flex items-center justify-center space-x-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={buildWhatsAppLink({
                        propertyId: prop.id,
                        propertyTitle: prop.title,
                        category: prop.propertyTypeDisplay || prop.categoryDisplay,
                        totalPrice:
                          prop.priceEstimateDisplay !== 'Price on Consultation'
                            ? prop.priceEstimateDisplay
                            : undefined,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 border border-[#C5A46D] text-[#142C38] hover:bg-[#C5A46D] hover:text-[#142C38] transition-colors"
                      aria-label={`Inquire about ${prop.title} on WhatsApp`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#E5E1D8] p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#C5A46D]/40 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#142C38]">
            {activePropertyType || activeCategory
              ? `No published properties found in ${getActiveFilterTitle()}`
              : 'No published properties found'}
          </h3>
          <p className="text-sm text-[#242424]/70 max-w-md mx-auto font-light">
            {activePropertyType || activeCategory
              ? 'There are currently no active published properties matching this classification filter.'
              : 'Our property inventory is regularly updated. Contact us on WhatsApp for upcoming listings.'}
          </p>
          {(activePropertyType || activeCategory) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#142C38] text-[#C5A46D] text-xs uppercase tracking-wider font-semibold cursor-pointer hover:bg-[#0D1E27]"
            >
              Show All Properties
            </button>
          )}
        </div>
      )}

      {/* Category Overview Footnote */}
      <div className="bg-[#142C38] text-[#F7F5F0] p-8 space-y-4 border-l-4 border-[#C5A46D]">
        <h3 className="font-serif text-lg font-bold text-[#F7F5F0]">
          Looking for Specific Plots or Houses in Thanjavur?
        </h3>
        <p className="text-xs sm:text-sm text-[#F7F5F0]/75 leading-relaxed max-w-3xl font-light">
          If your preferred dimensions, road width, or locality in Thanjavur is not listed,
          contact us directly via WhatsApp. We identify and survey properties tailored to your exact
          investment requirements.
        </p>
        <div className="pt-2">
          <a
            href={buildWhatsAppLink({
              customMessage: `Hello Amman Real Estate, I would like to inquire about specific property options matching my requirements in Thanjavur.`,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C5A46D] text-[#142C38] font-semibold text-xs uppercase tracking-wider hover:bg-[#D6BC8C] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Submit Custom Requirement via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
