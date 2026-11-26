import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { propertyService, type DashboardStats } from '../../services/propertyService';
import { formatPriceINR } from '../../utils/formatters';
import type { PropertyCategoryDb, PropertyStatusDb } from '../../types/database';
import {
  Building2,
  CheckCircle2,
  Clock,
  Tag,
  PlusCircle,
  Building,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const result = await propertyService.getDashboardStats();
      if (result.error && !result.total) {
        setError(result.error);
      } else {
        setStats(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    await fetchStats();
  };

  useEffect(() => {
    let isMounted = true;
    propertyService
      .getDashboardStats()
      .then((result) => {
        if (!isMounted) return;
        if (result.error && !result.total) {
          setError(result.error);
        } else {
          setStats(result);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const getCategoryLabel = (category: PropertyCategoryDb) => {
    switch (category) {
      case 'RESIDENTIAL':
        return 'Residential House';
      case 'LAND':
        return 'Land / Plot';
      case 'COMMERCIAL':
        return 'Commercial';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E5E1D8] p-6 sm:p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#142C38] via-[#C5A46D] to-[#142C38]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#142C38] tracking-tight">
              Welcome back, {profile?.full_name || 'Administrator'}
            </h1>
            <p className="text-sm font-sans text-[#666666] mt-1">
              AMMAN REAL ESTATE Property Management System &bull; Thanjavur, Tamil Nadu
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh Dashboard Statistics"
              className="p-2.5 bg-[#F7F5F0] border border-[#E5E1D8] text-[#142C38] hover:text-[#C5A46D] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142C38] text-white hover:bg-[#0D1E27] text-xs uppercase tracking-widest font-semibold transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#C5A46D]" />
              <span>Add Property</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border-l-2 border-red-600 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="underline font-semibold hover:text-red-950 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Properties */}
        <div className="bg-white border border-[#E5E1D8] p-5 transition-shadow hover:shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-medium text-[#666666]">
              Total Properties
            </span>
            <div className="w-8 h-8 rounded-none bg-[#142C38]/5 text-[#142C38] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#C5A46D]" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin" />
            ) : (
              <span className="text-3xl font-serif font-bold text-[#142C38]">
                {stats?.total ?? 0}
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-[#666666] flex items-center justify-between border-t border-[#E5E1D8]/50 pt-2">
            <span>All inventory records</span>
            <Link
              to="/admin/properties"
              className="text-[#C5A46D] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Published Properties */}
        <div className="bg-white border border-[#E5E1D8] p-5 transition-shadow hover:shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-medium text-[#666666]">
              Published Live
            </span>
            <div className="w-8 h-8 rounded-none bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin" />
            ) : (
              <span className="text-3xl font-serif font-bold text-emerald-800">
                {stats?.published ?? 0}
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-[#666666] flex items-center justify-between border-t border-[#E5E1D8]/50 pt-2">
            <span>Publicly visible on website</span>
            <Link
              to="/admin/properties?status=PUBLISHED"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Filter</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Draft Properties */}
        <div className="bg-white border border-[#E5E1D8] p-5 transition-shadow hover:shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-medium text-[#666666]">
              Draft Properties
            </span>
            <div className="w-8 h-8 rounded-none bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin" />
            ) : (
              <span className="text-3xl font-serif font-bold text-amber-800">
                {stats?.draft ?? 0}
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-[#666666] flex items-center justify-between border-t border-[#E5E1D8]/50 pt-2">
            <span>Unpublished internal drafts</span>
            <Link
              to="/admin/properties?status=DRAFT"
              className="text-amber-800 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Filter</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Sold Properties */}
        <div className="bg-white border border-[#E5E1D8] p-5 transition-shadow hover:shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-medium text-[#666666]">
              Sold Properties
            </span>
            <div className="w-8 h-8 rounded-none bg-purple-50 text-purple-700 flex items-center justify-center">
              <Tag className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin" />
            ) : (
              <span className="text-3xl font-serif font-bold text-purple-800">
                {stats?.sold ?? 0}
              </span>
            )}
          </div>
          <div className="mt-3 text-[11px] text-[#666666] flex items-center justify-between border-t border-[#E5E1D8]/50 pt-2">
            <span>Closed property sales</span>
            <Link
              to="/admin/properties?status=SOLD"
              className="text-purple-800 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Filter</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Strip */}
      <div className="bg-white border border-[#E5E1D8] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#142C38]">Real Estate Catalog Inventory</h2>
            <p className="text-xs text-[#666666]">
              Access complete property listing details, specifications, prices, and status controls.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/admin/properties"
            className="flex-1 sm:flex-none text-center px-4 py-2 border border-[#142C38] text-[#142C38] hover:bg-[#142C38] hover:text-white text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            Manage Properties
          </Link>
          <Link
            to="/admin/properties/new"
            className="flex-1 sm:flex-none text-center px-4 py-2 bg-[#142C38] text-white hover:bg-[#0D1E27] text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            + Add New
          </Link>
        </div>
      </div>

      {/* Recent Properties Table */}
      <div className="bg-white border border-[#E5E1D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E1D8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-[#142C38]">
              Recent Property Listings
            </h2>
            <p className="text-xs text-[#666666]">Latest additions to the database</p>
          </div>
          <Link
            to="/admin/properties"
            className="text-xs uppercase tracking-wider font-semibold text-[#142C38] hover:text-[#C5A46D] flex items-center gap-1.5 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#666666] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#C5A46D] animate-spin" />
            <span>Loading recent property listings...</span>
          </div>
        ) : !stats?.recentProperties || stats.recentProperties.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-[#C5A46D]/40 mx-auto" />
            <p className="text-sm font-medium text-[#142C38]">No properties registered yet.</p>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              Create your first Thanjavur property listing to begin building the online inventory catalog.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#142C38] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#0D1E27]"
              >
                <PlusCircle className="w-4 h-4 text-[#C5A46D]" />
                <span>Create First Property</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E5E1D8] text-[11px] uppercase tracking-wider text-[#666666]">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Property Title
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Location &amp; Sector
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Total Price
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]">
                {stats.recentProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-[#F7F5F0]/50 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#142C38] max-w-xs truncate">
                        {property.title}
                      </div>
                      <div className="text-[11px] font-mono text-[#888888] truncate max-w-xs">
                        /{property.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap text-[#666666]">
                      {getCategoryLabel(property.category)}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap text-[#666666]">
                      <span className="font-medium text-[#142C38]">{property.location}</span>
                      <span className="text-[#888888] block text-[11px]">{property.area_sector}</span>
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#142C38]">
                      {formatPriceINR(property.total_price || undefined)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(property.status)}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {property.status === 'PUBLISHED' && (
                          <Link
                            to={`/properties/${property.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview on Public Website"
                            className="p-1 text-[#666666] hover:text-[#C5A46D]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          to={`/admin/properties/${property.id}/edit`}
                          className="px-2.5 py-1 bg-[#142C38] text-white hover:bg-[#0D1E27] text-[11px] font-medium transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
