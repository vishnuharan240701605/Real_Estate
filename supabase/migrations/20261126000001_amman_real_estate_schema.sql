-- =============================================================================
-- AMMAN REAL ESTATE – Database Schema & Row Level Security (Supabase PostgreSQL)
-- =============================================================================
-- Migration: 20261126000001_amman_real_estate_schema.sql
-- Description: Core schema for admin profiles, properties catalog, and property images
-- with strict Row Level Security (RLS) enforcement.
-- =============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Automatic updated_at Trigger Function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Table: admin_profiles
-- -----------------------------------------------------------------------------
-- Linked 1:1 with Supabase auth.users. Stores internal admin profile metadata.
-- Only two authorized admin accounts (owner and second administrator) are granted access.
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL CONSTRAINT uq_admin_profiles_email UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for admin_profiles updated_at
DROP TRIGGER IF EXISTS trigger_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trigger_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Authorization Helper Function: is_admin()
-- -----------------------------------------------------------------------------
-- Security Definer function to check if the current caller is an active admin.
-- Using search_path = public prevents search-path hijacking vulnerabilities.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND active = true
  );
$$;

-- Restrict function execution: revoke default PUBLIC access, grant to authenticated only
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Table: properties
-- -----------------------------------------------------------------------------
-- Central property inventory supporting Residential Houses, Land & Plots, and Commercial Properties.
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL CONSTRAINT uq_properties_slug UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('RESIDENTIAL', 'LAND', 'COMMERCIAL')),
  location VARCHAR(255) NOT NULL,
  area_sector VARCHAR(255) NOT NULL,
  
  -- Category-Specific Specifications
  plot_size_value NUMERIC(12, 2) CHECK (plot_size_value IS NULL OR plot_size_value > 0),
  plot_size_unit VARCHAR(20) DEFAULT 'sq.ft' CHECK (plot_size_unit IN ('sq.ft', 'cents', 'acres')),
  building_size_value NUMERIC(12, 2) CHECK (building_size_value IS NULL OR building_size_value > 0),
  building_size_unit VARCHAR(20) DEFAULT 'sq.ft' CHECK (building_size_unit = 'sq.ft'),
  
  -- Borewell: Nullable (true = Yes, false = No, NULL = Not specified)
  borewell BOOLEAN,
  
  -- Room Configuration: e.g. 1BHK, 2BHK, 3BHK, 4BHK, Studio, Custom (NULL for Land)
  room_configuration VARCHAR(50),
  
  number_of_toilets INTEGER CHECK (number_of_toilets IS NULL OR number_of_toilets >= 0),
  
  -- Pricing: Total Property Price in INR (Bigint). Price per sq.ft is strictly prohibited.
  total_price BIGINT CHECK (total_price IS NULL OR total_price > 0),
  
  -- Lifecycle & Audit
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'SOLD')),
  created_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties Performance Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_published_at ON public.properties(published_at DESC);

-- Trigger for properties updated_at
DROP TRIGGER IF EXISTS trigger_properties_updated_at ON public.properties;
CREATE TRIGGER trigger_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4.1. Trigger Function: Protect created_by Immutability
-- -----------------------------------------------------------------------------
-- Enforces that created_by cannot be altered after the initial INSERT.
-- Uses standard security invoker context (no unnecessary SECURITY DEFINER privileges).
CREATE OR REPLACE FUNCTION public.protect_properties_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Field created_by is immutable and cannot be modified after property creation.'
    USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_properties_protect_created_by ON public.properties;
CREATE TRIGGER trigger_properties_protect_created_by
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_properties_created_by();

-- -----------------------------------------------------------------------------
-- 5. Table: property_images
-- -----------------------------------------------------------------------------
-- Property photography metadata. Binary storage is managed via Cloudflare R2 / Object Storage.
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_key VARCHAR(500) NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property Images Performance Indexes
-- Composite index covers foreign key lookups and gallery display ordering
CREATE INDEX IF NOT EXISTS idx_property_images_order ON public.property_images(property_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_property_images_cover ON public.property_images(property_id, is_cover) WHERE is_cover = true;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Configuration
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- 6.1. admin_profiles Policies
-- Public/Anon: Zero read, zero write
-- Active Admins: Can view all admin profiles
CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Note: Admin profile UPDATE policy is deliberately omitted.
-- Role, email, and active status must not be editable through the frontend client.
-- Provisioning and profile updates are managed strictly through trusted administrative processes.

-- 6.2. properties Policies
-- Public/Anon/Authenticated: Read ONLY published properties
CREATE POLICY "Public can view published properties"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (status = 'PUBLISHED');

-- Active Admins: Full read across all property statuses (DRAFT, PUBLISHED, UNPUBLISHED, SOLD)
CREATE POLICY "Admins can view all properties"
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Active Admins: Insert properties, strictly binding created_by to the caller's auth.uid()
CREATE POLICY "Admins can insert properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() AND created_by = auth.uid()
  );

-- Active Admins: Update properties
CREATE POLICY "Admins can update properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Active Admins: Delete properties
CREATE POLICY "Admins can delete properties"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6.3. property_images Policies
-- Public/Anon/Authenticated: Read images of PUBLISHED properties only
CREATE POLICY "Public can view published property images"
  ON public.property_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
        AND properties.status = 'PUBLISHED'
    )
  );

-- Active Admins: View all property images
CREATE POLICY "Admins can view all property images"
  ON public.property_images
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Active Admins: Insert property images
CREATE POLICY "Admins can insert property images"
  ON public.property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Active Admins: Update property images
CREATE POLICY "Admins can update property images"
  ON public.property_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Active Admins: Delete property images
CREATE POLICY "Admins can delete property images"
  ON public.property_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
