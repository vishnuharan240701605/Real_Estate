-- =============================================================================
-- AMMAN REAL ESTATE – Database Migration: Property Type Classification
-- =============================================================================
-- Migration: 20261126000003_add_property_type_classification.sql
-- Description: Adds two-level property classification (property_type) with
-- strict category/property_type consistency constraints while preserving
-- all existing properties (allowing NULL initially for unclassified records).
-- Fully idempotent: Safe for both fresh databases and already-modified databases.
-- =============================================================================

-- 1. Add property_type column to public.properties table (nullable initially)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS property_type TEXT;

-- 2. Check and create properties_property_type_check if not already present
-- Validates permitted values (allowing NULL for legacy unclassified records)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'properties_property_type_check'
      AND conrelid = 'public.properties'::regclass
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_property_type_check
      CHECK (
        property_type IS NULL OR
        property_type IN (
          'HOUSE',
          'APARTMENT',
          'RESIDENTIAL_PLOT',
          'AGRICULTURAL_LAND',
          'COMMERCIAL_PROPERTY'
        )
      );
  END IF;
END $$;

-- 3. Check and create properties_property_type_category_check if not already present
-- Enforces category and property_type compatibility (allowing NULL for legacy records)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'properties_property_type_category_check'
      AND conrelid = 'public.properties'::regclass
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_property_type_category_check
      CHECK (
        property_type IS NULL OR
        (category = 'RESIDENTIAL' AND property_type IN ('HOUSE', 'APARTMENT')) OR
        (category = 'LAND' AND property_type IN ('RESIDENTIAL_PLOT', 'AGRICULTURAL_LAND')) OR
        (category = 'COMMERCIAL' AND property_type IN ('COMMERCIAL_PROPERTY'))
      );
  END IF;
END $$;

-- 4. Create index for fast filtering by property_type
CREATE INDEX IF NOT EXISTS idx_properties_property_type
  ON public.properties(property_type);

-- 5. Composite index for public queries filtering status + property_type
CREATE INDEX IF NOT EXISTS idx_properties_status_property_type
  ON public.properties(status, property_type)
  WHERE status = 'PUBLISHED';
