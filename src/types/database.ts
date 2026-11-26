export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PropertyCategoryDb = 'RESIDENTIAL' | 'LAND' | 'COMMERCIAL';
export type PropertyTypeDb =
  | 'HOUSE'
  | 'APARTMENT'
  | 'RESIDENTIAL_PLOT'
  | 'AGRICULTURAL_LAND'
  | 'COMMERCIAL_PROPERTY';
export type PropertyStatusDb = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'SOLD';
export type SizeUnitDb = 'sq.ft' | 'cents' | 'acres';

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: PropertyCategoryDb;
          property_type: PropertyTypeDb | null;
          location: string;
          area_sector: string;
          plot_size_value: number | null;
          plot_size_unit: SizeUnitDb | null;
          building_size_value: number | null;
          building_size_unit: SizeUnitDb | null;
          borewell: boolean | null;
          room_configuration: string | null;
          number_of_toilets: number | null;
          total_price: number | null;
          status: PropertyStatusDb;
          created_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          category: PropertyCategoryDb;
          property_type?: PropertyTypeDb | null;
          location: string;
          area_sector: string;
          plot_size_value?: number | null;
          plot_size_unit?: SizeUnitDb | null;
          building_size_value?: number | null;
          building_size_unit?: SizeUnitDb | null;
          borewell?: boolean | null;
          room_configuration?: string | null;
          number_of_toilets?: number | null;
          total_price?: number | null;
          status?: PropertyStatusDb;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          category?: PropertyCategoryDb;
          property_type?: PropertyTypeDb | null;
          location?: string;
          area_sector?: string;
          plot_size_value?: number | null;
          plot_size_unit?: SizeUnitDb | null;
          building_size_value?: number | null;
          building_size_unit?: SizeUnitDb | null;
          borewell?: boolean | null;
          room_configuration?: string | null;
          number_of_toilets?: number | null;
          total_price?: number | null;
          status?: PropertyStatusDb;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'admin_profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          storage_key: string;
          image_url: string;
          is_cover: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          storage_key: string;
          image_url: string;
          is_cover?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          storage_key?: string;
          image_url?: string;
          is_cover?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_images_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_property_cover_image: {
        Args: {
          p_property_id: string;
          p_image_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      property_category: PropertyCategoryDb;
      property_status: PropertyStatusDb;
      size_unit: SizeUnitDb;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type AdminProfile = Database['public']['Tables']['admin_profiles']['Row'];
export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
export type PropertyImageRow = Database['public']['Tables']['property_images']['Row'];

