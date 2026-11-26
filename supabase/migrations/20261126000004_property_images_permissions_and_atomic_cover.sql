-- =============================================================================
-- AMMAN REAL ESTATE – Database Migration: Property Images Permissions & Atomic Cover Selection
-- =============================================================================
-- Migration: 20261126000004_property_images_permissions_and_atomic_cover.sql
-- Description:
-- 1. Grants authenticated users UPDATE privilege ONLY on required columns:
--    is_cover and display_order of public.property_images (least-privilege).
-- 2. Normalizes existing image data deterministically before creating constraints:
--    - Properties with multiple covers retain exactly one (lowest display_order, earliest created_at, id).
--    - Properties with images but no cover receive one (using the same deterministic ordering).
--    - Properties with no images remain unchanged.
--    - Zero image records or Backblaze B2 objects are deleted.
-- 3. Adds unique partial index preventing multiple cover images per property.
-- 4. Creates atomic stored function public.set_property_cover_image() to guarantee
--    single-transaction cover switching and ownership validation.
-- 5. Preserves strict Row Level Security (RLS) and active administrator checks.
--
-- SAFETY:
-- Safe for both fresh databases and existing live database.
-- Does NOT delete any image records or Backblaze B2 objects.
-- Does NOT modify table structure, foreign keys, or authentication.
-- Do NOT execute this migration directly without user instruction.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Least-Privilege Column UPDATE Grants
-- -----------------------------------------------------------------------------
-- Rather than granting unrestricted UPDATE on all columns of public.property_images,
-- restrict authenticated users to modifying only is_cover and display_order.
-- storage_key, image_url, property_id, id, and created_at cannot be updated directly.
GRANT UPDATE (is_cover, display_order) ON public.property_images TO authenticated;

-- Ensure anonymous role (anon) has zero write permissions
REVOKE INSERT, UPDATE, DELETE ON public.property_images FROM anon;

-- -----------------------------------------------------------------------------
-- 2. Existing Data Normalization (Pre-Index Deduplication & Cover Assignment)
-- -----------------------------------------------------------------------------
-- 2a. Deduplicate properties with multiple covers:
--     Retain exactly one cover image per property (preferring lowest display_order ASC,
--     earliest created_at ASC, and stable id ASC). All duplicate covers are set to is_cover = false.
WITH ranked_duplicate_covers AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY property_id
      ORDER BY display_order ASC, created_at ASC, id ASC
    ) AS cover_rank
  FROM public.property_images
  WHERE is_cover = true
)
UPDATE public.property_images
SET is_cover = false
WHERE id IN (
  SELECT id
  FROM ranked_duplicate_covers
  WHERE cover_rank > 1
);

-- 2b. Assign cover for properties with images but no cover:
--     For properties having image records but zero is_cover = true records,
--     deterministically promote the primary image (lowest display_order ASC,
--     earliest created_at ASC, and stable id ASC) to is_cover = true.
WITH ranked_uncovered_images AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY property_id
      ORDER BY display_order ASC, created_at ASC, id ASC
    ) AS image_rank
  FROM public.property_images
  WHERE property_id IN (
    SELECT property_id
    FROM public.property_images
    GROUP BY property_id
    HAVING COUNT(*) FILTER (WHERE is_cover = true) = 0
  )
)
UPDATE public.property_images
SET is_cover = true
WHERE id IN (
  SELECT id
  FROM ranked_uncovered_images
  WHERE image_rank = 1
);

-- -----------------------------------------------------------------------------
-- 3. Unique Partial Index on Cover Image
-- -----------------------------------------------------------------------------
-- Enforces at the database constraint level that a property can have AT MOST
-- one active cover image (is_cover = true) at any time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_property_images_single_cover
  ON public.property_images(property_id)
  WHERE is_cover = true;

-- -----------------------------------------------------------------------------
-- 4. Atomic Stored Function: set_property_cover_image
-- -----------------------------------------------------------------------------
-- Switches the cover image for a property in a single atomic transaction.
-- Guarantees:
-- a) Caller is an active administrator (public.is_admin()).
-- b) Target image exists and belongs strictly to the target property.
-- c) Exactly one cover image exists upon completion (no orphan or multi-cover states).
CREATE OR REPLACE FUNCTION public.set_property_cover_image(
  p_property_id UUID,
  p_image_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_image_exists BOOLEAN;
BEGIN
  -- 1. Authorization: verify caller is an active administrator
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Active administrator profile required.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Verification: confirm image exists and belongs strictly to the specified property
  SELECT EXISTS (
    SELECT 1 FROM public.property_images
    WHERE id = p_image_id AND property_id = p_property_id
  ) INTO v_image_exists;

  IF NOT v_image_exists THEN
    RAISE EXCEPTION 'Image % does not belong to property % or was not found.', p_image_id, p_property_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Atomic transition: Unset any existing cover image(s) for this property
  UPDATE public.property_images
  SET is_cover = false
  WHERE property_id = p_property_id
    AND is_cover = true;

  -- 4. Set the new cover image
  UPDATE public.property_images
  SET is_cover = true
  WHERE id = p_image_id
    AND property_id = p_property_id;

  RETURN TRUE;
END;
$$;

-- Revoke default public execution, grant to authenticated role only
REVOKE EXECUTE ON FUNCTION public.set_property_cover_image(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_property_cover_image(UUID, UUID) TO authenticated;
