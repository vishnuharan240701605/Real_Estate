import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { imageService } from './imageService';
import type {
  PropertyRow,
  PropertyInsert,
  PropertyUpdate,
  PropertyCategoryDb,
  PropertyTypeDb,
  PropertyStatusDb,
  PropertyImageRow,
} from '../types/database';
import type { Property, PropertyCategory, PropertyType, PropertyImageItem } from '../types';
import { formatPriceINR } from '../utils/formatters';
import { PROPERTY_CATEGORIES } from '../data/categories';

export const UI_TO_DB_CATEGORY_MAP: Record<string, PropertyCategoryDb> = {
  'residential-houses': 'RESIDENTIAL',
  'land-plots': 'LAND',
  'commercial': 'COMMERCIAL',
};

export const DB_TO_UI_CATEGORY_MAP: Record<PropertyCategoryDb, PropertyCategory> = {
  RESIDENTIAL: 'residential-houses',
  LAND: 'land-plots',
  COMMERCIAL: 'commercial',
};

export const DB_TO_CATEGORY_DISPLAY_MAP: Record<PropertyCategoryDb, string> = {
  RESIDENTIAL: 'Residential House',
  LAND: 'Land & Plots',
  COMMERCIAL: 'Commercial Property',
};

export const PROPERTY_TYPE_DISPLAY_MAP: Record<PropertyTypeDb, string> = {
  HOUSE: 'Independent House',
  APARTMENT: 'Apartment',
  RESIDENTIAL_PLOT: 'Residential Plot',
  AGRICULTURAL_LAND: 'Agricultural Land',
  COMMERCIAL_PROPERTY: 'Commercial Property',
};

export const PROPERTY_TYPE_TO_CATEGORY_MAP: Record<PropertyTypeDb, PropertyCategoryDb> = {
  HOUSE: 'RESIDENTIAL',
  APARTMENT: 'RESIDENTIAL',
  RESIDENTIAL_PLOT: 'LAND',
  AGRICULTURAL_LAND: 'LAND',
  COMMERCIAL_PROPERTY: 'COMMERCIAL',
};

export const CATEGORY_TO_PROPERTY_TYPES_MAP: Record<PropertyCategoryDb, PropertyTypeDb[]> = {
  RESIDENTIAL: ['HOUSE', 'APARTMENT'],
  LAND: ['RESIDENTIAL_PLOT', 'AGRICULTURAL_LAND'],
  COMMERCIAL: ['COMMERCIAL_PROPERTY'],
};

/**
 * Adapt a database PropertyRow (with optional attached images) to the frontend Property model.
 */
export function adaptPropertyRowToProperty(
  row: PropertyRow,
  images?: PropertyImageRow[]
): Property {
  const uiCategory = DB_TO_UI_CATEGORY_MAP[row.category] || 'residential-houses';
  const categoryDisplay = DB_TO_CATEGORY_DISPLAY_MAP[row.category] || 'Residential House';
  const propertyType = row.property_type || null;
  const propertyTypeDisplay = propertyType
    ? PROPERTY_TYPE_DISPLAY_MAP[propertyType]
    : categoryDisplay;

  // Find cover image or first image, else fallback to category default image
  const defaultCategoryMeta = PROPERTY_CATEGORIES.find((c) => c.id === uiCategory);
  let imageUrl =
    defaultCategoryMeta?.imageUrl ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  let adaptedImages: PropertyImageItem[] = [];

  if (images && images.length > 0) {
    // Sort images: cover image first, then display_order ascending, then created_at ascending
    const sortedImages = [...images].sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;
      if (a.display_order !== b.display_order) return a.display_order - b.display_order;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    adaptedImages = sortedImages.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      storage_key: img.storage_key,
      is_cover: img.is_cover,
      display_order: img.display_order,
      created_at: img.created_at,
    }));

    // Keep imageUrl mapped to cover image, falling back to the first available image
    const coverImage = sortedImages.find((img) => img.is_cover);
    if (coverImage && coverImage.image_url) {
      imageUrl = coverImage.image_url;
    } else if (sortedImages[0]?.image_url) {
      imageUrl = sortedImages[0].image_url;
    }
  }

  // Size display calculation
  let sizeDisplay = 'Extent on Request';
  if (row.building_size_value && row.plot_size_value) {
    sizeDisplay = `${Number(row.building_size_value).toLocaleString('en-IN')} ${row.building_size_unit || 'sq.ft'} Built-up / ${Number(row.plot_size_value).toLocaleString('en-IN')} ${row.plot_size_unit || 'sq.ft'} Plot`;
  } else if (row.building_size_value) {
    sizeDisplay = `${Number(row.building_size_value).toLocaleString('en-IN')} ${row.building_size_unit || 'sq.ft'} Built-up`;
  } else if (row.plot_size_value) {
    sizeDisplay = `${Number(row.plot_size_value).toLocaleString('en-IN')} ${row.plot_size_unit || 'sq.ft'}`;
  }

  // Price estimate display
  const priceEstimateDisplay =
    row.total_price && row.total_price > 0
      ? formatPriceINR(row.total_price)
      : 'Price on Consultation';

  // Description and highlights
  const shortDescription = row.description
    ? row.description.length > 150
      ? `${row.description.slice(0, 150).trim()}...`
      : row.description
    : `${row.title} situated in ${row.location} (${row.area_sector}).`;

  const fullDescription =
    row.description ||
    `${row.title} situated in ${row.location} (${row.area_sector}). Contact Amman Real Estate for on-site inspection, layout plans, and legal title documents.`;

  const highlights: string[] = [];
  if (row.area_sector) highlights.push(`${row.area_sector} growth corridor`);
  if (row.plot_size_value)
    highlights.push(
      `Plot Extent: ${Number(row.plot_size_value).toLocaleString('en-IN')} ${row.plot_size_unit || 'sq.ft'}`
    );
  if (row.building_size_value)
    highlights.push(
      `Built-up Area: ${Number(row.building_size_value).toLocaleString('en-IN')} ${row.building_size_unit || 'sq.ft'}`
    );
  if (row.room_configuration) highlights.push(`${row.room_configuration} configuration`);
  if (row.borewell) highlights.push('Borewell water facility available');
  highlights.push('Clear approach road connectivity');

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: uiCategory,
    categoryDisplay,
    propertyType: propertyType as PropertyType | null,
    propertyTypeDisplay,
    location: row.location,
    areaSector: row.area_sector,
    priceEstimateDisplay,
    sizeDisplay,
    isDemoPlaceholder: false,
    shortDescription,
    fullDescription,
    highlights,
    imageUrl,
    images: adaptedImages,
    specifications: {
      plotSize: row.plot_size_value
        ? { value: Number(row.plot_size_value), unit: row.plot_size_unit || 'sq.ft' }
        : undefined,
      buildingSize: row.building_size_value
        ? { value: Number(row.building_size_value), unit: row.building_size_unit || 'sq.ft' }
        : undefined,
      borewell: row.borewell,
      roomConfiguration: row.room_configuration,
      numberOfToilets:
        row.number_of_toilets !== null && row.number_of_toilets !== undefined
          ? row.number_of_toilets
          : undefined,
      totalPrice: row.total_price || undefined,
    },
  };
}

export interface PublicPropertyListResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

export interface PropertyFilterParams {
  category?: PropertyCategoryDb | 'ALL';
  propertyType?: PropertyTypeDb | 'ALL' | 'UNCLASSIFIED';
  status?: PropertyStatusDb | 'ALL';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PropertyListResult {
  data: PropertyRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

export interface DashboardStats {
  total: number;
  published: number;
  draft: number;
  sold: number;
  unpublished: number;
  recentProperties: PropertyRow[];
  error?: string;
}

/**
 * Generate a URL-friendly slug from title, appending a short unique suffix.
 */
export function generatePropertySlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return base ? `${base}-${randomSuffix}` : `property-${randomSuffix}`;
}

/**
 * Property Management Service for AMMAN REAL ESTATE.
 * Directly communicates with Supabase PostgreSQL properties table
 * protected by Row Level Security (RLS).
 */
export const propertyService = {
  /**
   * Retrieve ONLY published properties for the public website.
   * STRICT SECURITY: Always enforces status = 'PUBLISHED' in the database query.
   */
  async getPublishedProperties(params: {
    category?: PropertyCategory | PropertyCategoryDb | 'ALL';
    propertyType?: PropertyTypeDb | 'ALL' | null;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PublicPropertyListResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 24));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!isSupabaseConfigured) {
      return {
        properties: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      // Map category if provided as frontend category ID or DB enum
      let dbCategory: PropertyCategoryDb | undefined;
      if (params.category && params.category !== 'ALL') {
        dbCategory = UI_TO_DB_CATEGORY_MAP[params.category] || (params.category as PropertyCategoryDb);
      }

      // Query published properties with associated images
      let query = supabase
        .from('properties')
        .select('*, property_images(*)', { count: 'exact' })
        .eq('status', 'PUBLISHED'); // ALWAYS strictly enforced

      if (dbCategory) {
        query = query.eq('category', dbCategory);
      }

      if (params.propertyType && params.propertyType !== 'ALL') {
        query = query.eq('property_type', params.propertyType);
      }

      if (params.search && params.search.trim()) {
        const term = params.search.trim();
        query = query.or(
          `title.ilike.%${term}%,location.ilike.%${term}%,area_sector.ilike.%${term}%,slug.ilike.%${term}%`
        );
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      let resolvedRows: (PropertyRow & { property_images?: PropertyImageRow[] })[] = [];
      let resolvedCount = 0;

      const { data, count, error } = await query;
      if (!error && data) {
        resolvedRows = data as (PropertyRow & { property_images?: PropertyImageRow[] })[];
        resolvedCount = count !== null ? count : resolvedRows.length;
      } else if (
        error &&
        (error.code === '42501' ||
          error.message.includes('property_images') ||
          error.message.includes('schema'))
      ) {
        // Fallback: If property_images join fails (e.g. prior to table grant), query properties table alone
        let retryQuery = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .eq('status', 'PUBLISHED');

        if (dbCategory) {
          retryQuery = retryQuery.eq('category', dbCategory);
        }
        if (params.propertyType && params.propertyType !== 'ALL') {
          retryQuery = retryQuery.eq('property_type', params.propertyType);
        }
        if (params.search && params.search.trim()) {
          const term = params.search.trim();
          retryQuery = retryQuery.or(
            `title.ilike.%${term}%,location.ilike.%${term}%,area_sector.ilike.%${term}%,slug.ilike.%${term}%`
          );
        }
        retryQuery = retryQuery.order('created_at', { ascending: false }).range(from, to);

        const retryRes = await retryQuery;
        if (!retryRes.error && retryRes.data) {
          resolvedRows = retryRes.data as (PropertyRow & { property_images?: PropertyImageRow[] })[];
          resolvedCount = retryRes.count !== null ? retryRes.count : resolvedRows.length;
        } else if (retryRes.error) {
          return {
            properties: [],
            totalCount: 0,
            page,
            pageSize,
            totalPages: 0,
            error: retryRes.error.message,
          };
        }
      } else if (error) {
        return {
          properties: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 0,
          error: error.message,
        };
      }

      const properties = resolvedRows.map((row) =>
        adaptPropertyRowToProperty(row, row.property_images)
      );
      const totalPages = Math.ceil(resolvedCount / pageSize);

      return {
        properties,
        totalCount: resolvedCount,
        page,
        pageSize,
        totalPages,
      };
    } catch (err) {
      return {
        properties: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        error: err instanceof Error ? err.message : 'Failed to fetch properties.',
      };
    }
  },

  /**
   * Retrieve a single published property by UUID or URL slug.
   * STRICT SECURITY: Always enforces status = 'PUBLISHED'.
   */
  async getPublishedPropertyByIdOrSlug(
    idOrSlug: string
  ): Promise<{ property: Property | null; error?: string }> {
    if (!isSupabaseConfigured) {
      return { property: null, error: 'Supabase credentials are not configured.' };
    }

    const trimmed = idOrSlug.trim();
    if (!trimmed) {
      return { property: null, error: 'Property identifier is required.' };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    try {
      let query = supabase
        .from('properties')
        .select('*, property_images(*)')
        .eq('status', 'PUBLISHED'); // ALWAYS strictly enforced

      if (isUuid) {
        query = query.eq('id', trimmed);
      } else {
        query = query.eq('slug', trimmed);
      }

      let resolvedRow: (PropertyRow & { property_images?: PropertyImageRow[] }) | null = null;
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        resolvedRow = data as PropertyRow & { property_images?: PropertyImageRow[] };
      } else if (
        error &&
        (error.code === '42501' ||
          error.message.includes('property_images') ||
          error.message.includes('schema'))
      ) {
        // Fallback if property_images join fails
        let retryQuery = supabase
          .from('properties')
          .select('*')
          .eq('status', 'PUBLISHED');

        if (isUuid) {
          retryQuery = retryQuery.eq('id', trimmed);
        } else {
          retryQuery = retryQuery.eq('slug', trimmed);
        }

        const retryRes = await retryQuery.maybeSingle();
        if (!retryRes.error && retryRes.data) {
          resolvedRow = retryRes.data as PropertyRow & { property_images?: PropertyImageRow[] };
        } else if (retryRes.error) {
          return { property: null, error: retryRes.error.message };
        }
      } else if (error) {
        return { property: null, error: error.message };
      }

      // If querying by UUID didn't find anything, try slug fallback
      if (!resolvedRow && isUuid) {
        const slugQuery = await supabase
          .from('properties')
          .select('*, property_images(*)')
          .eq('status', 'PUBLISHED')
          .eq('slug', trimmed)
          .maybeSingle();

        if (slugQuery.data) {
          resolvedRow = slugQuery.data as PropertyRow & { property_images?: PropertyImageRow[] };
        }
      }

      if (!resolvedRow) {
        return { property: null };
      }

      return { property: adaptPropertyRowToProperty(resolvedRow, resolvedRow.property_images) };
    } catch (err) {
      return {
        property: null,
        error: err instanceof Error ? err.message : 'Failed to fetch property details.',
      };
    }
  },

  /**
   * Retrieve featured published properties for the homepage.
   */
  async getFeaturedPublishedProperties(
    limit = 3
  ): Promise<{ properties: Property[]; error?: string }> {
    const res = await this.getPublishedProperties({ pageSize: limit });
    return {
      properties: res.properties,
      error: res.error,
    };
  },

  /**
   * Retrieve properties with filtering, search, and pagination.
   */
  async getProperties(params: PropertyFilterParams = {}): Promise<PropertyListResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 10));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!isSupabaseConfigured) {
      return {
        data: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });

      // Category filter
      if (params.category && params.category !== 'ALL') {
        query = query.eq('category', params.category);
      }

      // Property type filter
      if (params.propertyType === 'UNCLASSIFIED') {
        query = query.is('property_type', null);
      } else if (params.propertyType && params.propertyType !== 'ALL') {
        query = query.eq('property_type', params.propertyType);
      }

      // Status filter
      if (params.status && params.status !== 'ALL') {
        query = query.eq('status', params.status);
      }

      // Search across title, location, area_sector
      if (params.search && params.search.trim()) {
        const term = params.search.trim();
        query = query.or(
          `title.ilike.%${term}%,location.ilike.%${term}%,area_sector.ilike.%${term}%,slug.ilike.%${term}%`
        );
      }

      // Order by created_at descending (latest first)
      query = query.order('created_at', { ascending: false });

      // Pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        return {
          data: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 0,
          error: error.message,
        };
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: (data as PropertyRow[]) || [],
        totalCount,
        page,
        pageSize,
        totalPages,
      };
    } catch (err) {
      return {
        data: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        error: err instanceof Error ? err.message : 'Failed to fetch properties.',
      };
    }
  },

  /**
   * Retrieve a single property by UUID.
   */
  async getPropertyById(id: string): Promise<{ data: PropertyRow | null; error?: string }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase credentials are not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data as PropertyRow) || null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch property details.',
      };
    }
  },

  /**
   * Retrieve overview statistics for the admin dashboard.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    if (!isSupabaseConfigured) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        sold: 0,
        unpublished: 0,
        recentProperties: [],
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      // Execute parallel queries for counts and recent properties
      const [allRes, pubRes, draftRes, soldRes, unpubRes, recentRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'DRAFT'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'SOLD'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'UNPUBLISHED'),
        supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const error =
        allRes.error?.message ||
        pubRes.error?.message ||
        draftRes.error?.message ||
        soldRes.error?.message ||
        unpubRes.error?.message ||
        recentRes.error?.message;

      return {
        total: allRes.count || 0,
        published: pubRes.count || 0,
        draft: draftRes.count || 0,
        sold: soldRes.count || 0,
        unpublished: unpubRes.count || 0,
        recentProperties: (recentRes.data as PropertyRow[]) || [],
        error,
      };
    } catch (err) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        sold: 0,
        unpublished: 0,
        recentProperties: [],
        error: err instanceof Error ? err.message : 'Failed to fetch dashboard metrics.',
      };
    }
  },

  /**
   * Create a new property record.
   * Auto-generates slug if missing and automatically timestamps published_at on publish.
   */
  async createProperty(payload: PropertyInsert): Promise<{ data: PropertyRow | null; error?: string }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase credentials are not configured.' };
    }

    try {
      // Category & Property Type compatibility check
      if (payload.property_type && payload.category) {
        const expectedCategory = PROPERTY_TYPE_TO_CATEGORY_MAP[payload.property_type];
        if (expectedCategory && expectedCategory !== payload.category) {
          return {
            data: null,
            error: `Property type ${payload.property_type} is not valid for category ${payload.category}.`,
          };
        }
      } else if (payload.property_type && !payload.category) {
        payload.category = PROPERTY_TYPE_TO_CATEGORY_MAP[payload.property_type];
      }

      const slug = payload.slug?.trim() || generatePropertySlug(payload.title);
      const isPublishing = payload.status === 'PUBLISHED';
      const publishedAt = isPublishing ? (payload.published_at || new Date().toISOString()) : null;

      const insertData: PropertyInsert = {
        ...payload,
        slug,
        published_at: publishedAt,
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as PropertyRow };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create property.',
      };
    }
  },

  /**
   * Update an existing property record.
   * Explicitly avoids modifying created_by to respect trigger_properties_protect_created_by.
   */
  async updateProperty(
    id: string,
    payload: PropertyUpdate
  ): Promise<{ data: PropertyRow | null; error?: string }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase credentials are not configured.' };
    }

    try {
      // Exclude created_by to avoid immutable field trigger violation
      const { created_by: _omitCreatedBy, ...safeUpdateData } = payload;

      // Category & Property Type compatibility check
      if (safeUpdateData.property_type && safeUpdateData.category) {
        const expectedCategory = PROPERTY_TYPE_TO_CATEGORY_MAP[safeUpdateData.property_type];
        if (expectedCategory && expectedCategory !== safeUpdateData.category) {
          return {
            data: null,
            error: `Property type ${safeUpdateData.property_type} is not valid for category ${safeUpdateData.category}.`,
          };
        }
      } else if (safeUpdateData.property_type && !safeUpdateData.category) {
        safeUpdateData.category = PROPERTY_TYPE_TO_CATEGORY_MAP[safeUpdateData.property_type];
      }

      // Handle published_at timestamp when changing to PUBLISHED
      if (safeUpdateData.status === 'PUBLISHED' && !safeUpdateData.published_at) {
        safeUpdateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('properties')
        .update(safeUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as PropertyRow };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update property.',
      };
    }
  },

  /**
   * Delete a property record by UUID.
   * Integrates safe B2 cleanup:
   * 1. Fetches all property_images associated with the property.
   * 2. Deletes each corresponding B2 object with deleteRecord: false.
   * 3. If any B2 deletion fails, aborts immediately and preserves the property and image records for retry.
   * 4. Only after all B2 objects succeed, deletes the property row (foreign-key CASCADE removes the image rows).
   * 5. Safe for retries: B2 deletion is idempotent.
   */
  async deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase credentials are not configured.' };
    }

    try {
      // 1. Fetch all property_images records for the property
      const { data: images, error: fetchImagesError } = await supabase
        .from('property_images')
        .select('id, storage_key')
        .eq('property_id', id);

      if (fetchImagesError) {
        return {
          success: false,
          error: `Failed to inspect property images before deletion: ${fetchImagesError.message}`,
        };
      }

      // 2. Delete every corresponding B2 object with deleteRecord: false
      // If even one B2 deletion fails, STOP immediately. Do not delete property row or image metadata records.
      if (images && images.length > 0) {
        for (const img of images) {
          const deleteResult = await imageService.deleteB2Image(img.storage_key, img.id, false);
          if (!deleteResult.success) {
            return {
              success: false,
              error: `Storage cleanup failed for image "${img.storage_key}": ${deleteResult.error || 'Unknown storage error'}. Property deletion aborted to prevent orphaned files; image records have been retained for retry.`,
            };
          }
        }
      }

      // 3. Only after all B2 deletions succeed, delete the property row from Supabase
      // The database ON DELETE CASCADE foreign key constraint automatically removes the image metadata records.
      const { error: deletePropertyError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (deletePropertyError) {
        return {
          success: false,
          error: `Storage objects were cleared, but property database deletion failed: ${deletePropertyError.message}. Image records are preserved for retry.`,
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete property.',
      };
    }
  },
};
