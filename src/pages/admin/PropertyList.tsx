import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  propertyService,
  PROPERTY_TYPE_DISPLAY_MAP,
  type PropertyListResult,
} from '../../services/propertyService';
import { formatPriceINR } from '../../utils/formatters';
import type {
  PropertyRow,
  PropertyCategoryDb,
  PropertyTypeDb,
  PropertyStatusDb,
} from '../../types/database';
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export const PropertyList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from query params
  const currentCategory = (searchParams.get('category') as PropertyCategoryDb | 'ALL') || 'ALL';
  const currentPropertyType =
    (searchParams.get('type') as PropertyTypeDb | 'ALL' | 'UNCLASSIFIED') || 'ALL';
  const currentStatus = (searchParams.get('status') as PropertyStatusDb | 'ALL') || 'ALL';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [propertiesResult, setPropertiesResult] = useState<PropertyListResult>({
    data: [],
    totalCount: 0,
    page: currentPage,
    pageSize: 10,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deletingProperty, setDeletingProperty] = useState<PropertyRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await propertyService.getProperties({
        category: currentCategory,
        propertyType: currentPropertyType,
        status: currentStatus,
        search: currentSearch,
        page: currentPage,
        pageSize: 10,
      });

      if (result.error && result.totalCount === 0) {
        setError(result.error);
      } else {
        setPropertiesResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties.');
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory, currentPropertyType, currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    let isMounted = true;
    propertyService
      .getProperties({
        category: currentCategory,
        propertyType: currentPropertyType,
        status: currentStatus,
        search: currentSearch,
        page: currentPage,
        pageSize: 10,
      })
      .then((result) => {
        if (!isMounted) return;
        if (result.error && result.totalCount === 0) {
          setError(result.error);
        } else {
          setPropertiesResult(result);
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
  }, [currentCategory, currentPropertyType, currentStatus, currentSearch, currentPage]);

  // Update query params helper
  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === 'ALL' || val === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset to page 1 on filter changes if page wasn't explicitly changed
    if (!('page' in updates)) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProperty) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { success, error: delErr } = await propertyService.deleteProperty(deletingProperty.id);
      if (!success || delErr) {
        setDeleteError(delErr || 'Failed to delete property.');
      } else {
        setDeletingProperty(null);
        await fetchProperties();
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'An error occurred during deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: PropertyStatusDb) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
            Draft
          </span>
        );
      case 'SOLD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 uppercase tracking-wider">
            Sold
          </span>
        );
      case 'UNPUBLISHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wider">
            Unpublished
          </span>
        );
    }
  };

  const getCategoryBadge = (category: PropertyCategoryDb) => {
    switch (category) {
      case 'RESIDENTIAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-[#142C38]/5 text-[#142C38] border border-[#142C38]/20">
            Residential
          </span>
        );
      case 'LAND':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-300">
            Land / Plot
          </span>
        );
      case 'COMMERCIAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-900 border border-indigo-200">
            Commercial
          </span>
        );
    }
  };

  const hasActiveFilters =
    currentCategory !== 'ALL' ||
    currentPropertyType !== 'ALL' ||
    currentStatus !== 'ALL' ||
    Boolean(currentSearch);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E1D8] p-6 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#142C38] via-[#C5A46D] to-[#142C38]" />
        <div>
          <h1 className="text-2xl font-serif text-[#142C38] tracking-tight">Property Inventory</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Manage, edit, publish, and delete properties in Thanjavur
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProperties}
            disabled={isLoading}
            title="Refresh List"
            className="p-2.5 bg-[#F7F5F0] border border-[#E5E1D8] text-[#142C38] hover:text-[#C5A46D] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#142C38] text-white hover:bg-[#0D1E27] text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#C5A46D]" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E1D8] p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, location, area sector..."
              className="w-full pl-9 pr-16 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-xs text-[#242424] placeholder:text-[#666666]/60 focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
            />
            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#142C38] text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#0D1E27]"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#666666] shrink-0" />
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ category: e.target.value, type: null })}
              className="w-full py-2.5 px-3 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-xs text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
            >
              <option value="ALL">All Categories</option>
              <option value="RESIDENTIAL">Residential Houses</option>
              <option value="LAND">Land &amp; Plots</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <select
              value={currentPropertyType}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="w-full py-2.5 px-3 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-xs text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
            >
              <option value="ALL">All Property Types</option>
              <option value="UNCLASSIFIED">⚠️ Unclassified</option>
              {currentCategory === 'ALL' || currentCategory === 'RESIDENTIAL' ? (
                <>
                  <option value="HOUSE">Independent House</option>
                  <option value="APARTMENT">Apartment / Flat</option>
                </>
              ) : null}
              {currentCategory === 'ALL' || currentCategory === 'LAND' ? (
                <>
                  <option value="RESIDENTIAL_PLOT">Residential Plot</option>
                  <option value="AGRICULTURAL_LAND">Agricultural Land</option>
                </>
              ) : null}
              {currentCategory === 'ALL' || currentCategory === 'COMMERCIAL' ? (
                <>
                  <option value="COMMERCIAL_PROPERTY">Commercial Property</option>
                </>
              ) : null}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={currentStatus}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full py-2.5 px-3 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-xs text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="UNPUBLISHED">Unpublished</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E1D8]/60 text-xs text-[#666666]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#142C38]">
              Active Filters:
            </span>
            {currentCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E5E1D8] text-[11px]">
                <span>Category: {currentCategory}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ category: null })}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentPropertyType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E5E1D8] text-[11px]">
                <span>
                  Type:{' '}
                  {currentPropertyType === 'UNCLASSIFIED'
                    ? 'Unclassified'
                    : PROPERTY_TYPE_DISPLAY_MAP[currentPropertyType] || currentPropertyType}
                </span>
                <button
                  type="button"
                  onClick={() => updateFilters({ type: null })}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E5E1D8] text-[11px]">
                <span>Status: {currentStatus}</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ status: null })}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E5E1D8] text-[11px]">
                <span>Search: &ldquo;{currentSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ search: null });
                  }}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[11px] underline text-[#C5A46D] hover:text-[#142C38] font-medium ml-2 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border-l-2 border-red-600 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchProperties}
            className="underline font-semibold hover:text-red-950 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Property Inventory List / Table */}
      <div className="bg-white border border-[#E5E1D8] overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-[#666666] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#C5A46D] animate-spin" />
            <span>Loading property inventory...</span>
          </div>
        ) : propertiesResult.data.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Building2 className="w-12 h-12 text-[#C5A46D]/40 mx-auto" />
            <p className="text-base font-serif font-semibold text-[#142C38]">
              {hasActiveFilters ? 'No properties matched your filters.' : 'No properties in inventory.'}
            </p>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try broadening your search or resetting category and status filters.'
                : 'Click "+ Add Property" to begin listing residential, land, or commercial properties.'}
            </p>
            <div className="pt-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-[#142C38] text-[#142C38] text-xs uppercase tracking-wider font-semibold hover:bg-[#142C38] hover:text-white"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/admin/properties/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#142C38] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#0D1E27]"
                >
                  <PlusCircle className="w-4 h-4 text-[#C5A46D]" />
                  <span>Add First Property</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E5E1D8] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    Property Title &amp; Slug
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    Category &amp; Type
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    Location &amp; Area
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    Total Price (INR)
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]">
                {propertiesResult.data.map((prop) => {
                  const createdDate = new Date(prop.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={prop.id} className="hover:bg-[#F7F5F0]/50 transition-colors">
                      {/* Title & Slug */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-[#142C38] max-w-sm truncate">
                          {prop.title}
                        </div>
                        <div className="text-[11px] font-mono text-[#888888] truncate max-w-sm">
                          /{prop.slug}
                        </div>
                      </td>

                      {/* Category & Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div>{getCategoryBadge(prop.category)}</div>
                          {prop.property_type ? (
                            <div className="text-[11px] text-[#242424]/80 font-medium">
                              {PROPERTY_TYPE_DISPLAY_MAP[prop.property_type] || prop.property_type}
                            </div>
                          ) : (
                            <Link
                              to={`/admin/properties/${prop.id}/edit`}
                              title="Legacy unclassified record. Click to assign Property Type."
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Unclassified</span>
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Location & Sector */}
                      <td className="px-6 py-4 whitespace-nowrap text-[#666666]">
                        <span className="font-medium text-[#142C38] block">{prop.location}</span>
                        <span className="text-[11px] text-[#888888]">{prop.area_sector}</span>
                      </td>

                      {/* Total Price */}
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-[#142C38]">
                        {formatPriceINR(prop.total_price || undefined)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(prop.status)}</td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-[#666666]">{createdDate}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {prop.status === 'PUBLISHED' && (
                            <Link
                              to={`/properties/${prop.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview on Public Website"
                              className="p-1.5 text-[#666666] hover:text-[#C5A46D] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/properties/${prop.id}/edit`}
                            title="Edit Property"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#142C38] text-white hover:bg-[#0D1E27] text-xs font-medium transition-colors"
                          >
                            <Edit className="w-3 h-3 text-[#C5A46D]" />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingProperty(prop);
                            }}
                            title="Delete Property"
                            className="p-1.5 text-[#666666] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {propertiesResult.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E5E1D8] bg-[#F7F5F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666666]">
            <div>
              Showing{' '}
              <span className="font-semibold text-[#142C38]">
                {(currentPage - 1) * propertiesResult.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[#142C38]">
                {Math.min(currentPage * propertiesResult.pageSize, propertiesResult.totalCount)}
              </span>{' '}
              of <span className="font-semibold text-[#142C38]">{propertiesResult.totalCount}</span> properties
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => updateFilters({ page: String(currentPage - 1) })}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5E1D8] text-xs font-medium text-[#142C38] hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1.5 font-semibold text-[#142C38]">
                Page {currentPage} of {propertiesResult.totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= propertiesResult.totalPages || isLoading}
                onClick={() => updateFilters({ page: String(currentPage + 1) })}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5E1D8] text-xs font-medium text-[#142C38] hover:bg-[#F7F5F0] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProperty && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E5E1D8] max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-serif font-bold text-[#142C38]">
                  Confirm Property Deletion
                </h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-[#142C38]">&ldquo;{deletingProperty.title}&rdquo;</strong>?
                  This action removes the record and associated data from Supabase.
                </p>

                {deleteError && (
                  <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px]">
                    {deleteError}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDeleting) setDeletingProperty(null);
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-[#E5E1D8] text-xs font-semibold text-[#666666] hover:bg-[#F7F5F0] disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 text-white text-xs uppercase tracking-wider font-semibold hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Property</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
