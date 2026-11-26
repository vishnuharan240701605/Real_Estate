-- =============================================================================
-- AMMAN REAL ESTATE – Database Migration: Grant Public Read for Published Properties
-- =============================================================================
-- Migration: 20261126000002_grant_public_read_published_properties.sql
-- Description: Grants table-level SELECT privilege on public.properties and
-- public.property_images to anon and authenticated roles.
--
-- SECURITY VERIFICATION & AUDIT:
-- 1. Row Level Security (RLS) is strictly ENABLED on both tables:
--    - Table `properties` has policy "Public can view published properties":
--      FOR SELECT TO anon, authenticated USING (status = 'PUBLISHED')
--    - Table `property_images` has policy "Public can view published property images":
--      FOR SELECT TO anon, authenticated
--      USING (EXISTS (
--        SELECT 1 FROM public.properties
--        WHERE properties.id = property_images.property_id
--          AND properties.status = 'PUBLISHED'
--      ))
-- 2. DRAFT, UNPUBLISHED, and SOLD properties remain strictly HIDDEN from the public.
-- 3. Anonymous INSERT, UPDATE, and DELETE privileges remain strictly PROHIBITED (zero public write).
-- 4. No service-role keys are exposed.
-- =============================================================================

-- Grant table-level SELECT privilege to anon and authenticated roles
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT SELECT ON public.property_images TO anon, authenticated;
