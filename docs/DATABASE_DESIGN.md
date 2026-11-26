# AMMAN REAL ESTATE – Database Design Specification (Supabase PostgreSQL)

## 1. Overview

The AMMAN REAL ESTATE database is hosted on **Supabase Managed PostgreSQL 15+**. It incorporates native Supabase Auth integration, strict Row Level Security (RLS), transactional reliability for property lifecycle changes, and structured audit trails.

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    AUTH_USERS ||--o| ADMIN_PROFILES : profiles
    AUTH_USERS ||--o{ PROPERTIES : creates
    PROPERTIES ||--o{ PROPERTY_IMAGES : contains

    AUTH_USERS {
        uuid id PK
        varchar email
        varchar encrypted_password
    }

    ADMIN_PROFILES {
        uuid id PK_FK
        varchar full_name
        varchar email UK
        varchar role
        boolean active
        timestamptz created_at
        timestamptz updated_at
    }

    PROPERTIES {
        uuid id PK
        varchar title
        varchar slug UK
        text description
        varchar category
        varchar location
        varchar area_sector
        numeric plot_size_value
        varchar plot_size_unit
        numeric building_size_value
        varchar building_size_unit
        boolean borewell
        varchar room_configuration
        int number_of_toilets
        bigint total_price
        varchar status
        timestamptz published_at
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    PROPERTY_IMAGES {
        uuid id PK
        uuid property_id FK
        varchar storage_key
        varchar image_url
        boolean is_cover
        int display_order
        timestamptz created_at
    }
```

---

## 3. Data Dictionary & Table Definitions

### 3.1. `admin_profiles` Table
Stores internal admin authorization metadata linked 1:1 with `auth.users`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | Linked Supabase Auth user ID. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Administrator's display name. |
| `email` | `VARCHAR(150)` | `NOT NULL, UNIQUE` | Normalized login email address. |
| `role` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'admin', CHECK (role IN ('owner', 'admin'))` | Administrative role classification. |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Flag enabling or suspending administrative access. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Account creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Last profile update timestamp (managed via trigger). |

---

### 3.2. `properties` Table
Central entity storing property inventory, specifications, and publishing statuses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique property record identifier. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Descriptive title (e.g. *Contemporary Villa on Medical College Road*). |
| `slug` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | URL-safe slug for public routing. |
| `description` | `TEXT` | `NULL` | Full property overview, narrative, and verification notes. |
| `category` | `VARCHAR(50)` | `NOT NULL, CHECK (category IN ('RESIDENTIAL', 'LAND', 'COMMERCIAL'))` | High-level property category. |
| `location` | `VARCHAR(255)` | `NOT NULL` | Locality (e.g. *Medical College Road, Thanjavur*). |
| `area_sector` | `VARCHAR(255)` | `NOT NULL` | Corridor or transit zone (e.g. *Medical College Residential Sector*). |
| `plot_size_value` | `NUMERIC(12, 2)` | `NULL, CHECK (plot_size_value > 0)` | Numerical value of plot extent. |
| `plot_size_unit` | `VARCHAR(20)` | `NULL, DEFAULT 'sq.ft', CHECK (plot_size_unit IN ('sq.ft', 'cents', 'acres'))` | Unit of land measurement. |
| `building_size_value` | `NUMERIC(12, 2)` | `NULL, CHECK (building_size_value > 0)` | Built-up area numerical value. |
| `building_size_unit` | `VARCHAR(20)` | `NULL, DEFAULT 'sq.ft', CHECK (building_size_unit = 'sq.ft')` | Built-up area unit. |
| `borewell` | `BOOLEAN` | `NULL` | Indicates borewell availability: `true` = Yes, `false` = No, `NULL` = Not specified. |
| `room_configuration` | `VARCHAR(50)` | `NULL` | Room configuration: e.g. `1BHK`, `2BHK`, `3BHK`, `4BHK`, `Studio`, `Custom` (NULL for Land). |
| `number_of_toilets` | `INT` | `NULL, CHECK (number_of_toilets >= 0)` | Toilet / bathroom count. |
| `total_price` | `BIGINT` | `NULL, CHECK (total_price > 0)` | Total property price in INR (e.g. `6500000` = ₹65,00,000). Price per sq.ft is forbidden. |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'DRAFT', CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'SOLD'))` | Lifecycle publishing status. |
| `published_at` | `TIMESTAMPTZ` | `NULL` | Timestamp when property was first or last published. |
| `created_by` | `UUID` | `NULL, REFERENCES auth.users(id) ON DELETE RESTRICT` | Admin user who originated the listing (Immutable after INSERT via trigger; deletion of admin account is RESTRICTED while property listings exist to preserve audit attribution). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Listing creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Listing last modified timestamp (managed via trigger). |

---

### 3.3. `property_images` Table
Stores image references and metadata associated with properties. Actual binary files reside in Cloudflare R2.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique image record identifier. |
| `property_id` | `UUID` | `NOT NULL, REFERENCES properties(id) ON DELETE CASCADE` | Associated property foreign key. |
| `storage_key` | `VARCHAR(500)` | `NOT NULL` | Cloudflare R2 object key (e.g. `properties/prop-01/cover.webp`). |
| `image_url` | `VARCHAR(1000)` | `NOT NULL` | Publicly accessible CDN URL for rendering. |
| `is_cover` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Primary thumbnail flag. |
| `display_order` | `INT` | `NOT NULL, DEFAULT 0` | Sort order for property gallery presentation. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Image upload record timestamp. |

---

## 4. Row Level Security (RLS) Policy Architecture

All application tables strictly enable Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

### 4.1. Authorization Helper: `public.is_admin()`
```sql
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

-- Revoke default public execution; grant explicitly to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
```

### 4.2. Access Rules Summary
| Table | Role / Caller | Operation | Policy Rule |
| :--- | :--- | :---: | :--- |
| **`admin_profiles`** | `anon` (Public) | ALL | **DENIED (Zero public access)** |
| | `authenticated` (Admin) | SELECT | `public.is_admin()` |
| | `authenticated` (All) | UPDATE / INSERT / DELETE | **DENIED (No client updates; trusted provisioning only)** |
| **`properties`** | `anon` / `authenticated` | SELECT | `status = 'PUBLISHED'` |
| | `authenticated` (Admin) | SELECT | `public.is_admin()` (Views DRAFT, PUBLISHED, UNPUBLISHED, SOLD) |
| | `authenticated` (Admin) | INSERT | `public.is_admin() AND created_by = auth.uid()` |
| | `authenticated` (Admin) | UPDATE | `public.is_admin()` |
| | `authenticated` (Admin) | DELETE | `public.is_admin()` |
| **`property_images`**| `anon` / `authenticated` | SELECT | Property `status = 'PUBLISHED'` |
| | `authenticated` (Admin) | ALL | `public.is_admin()` |

---

## 5. Indexing & Performance Strategy

```sql
-- Properties status, category, creation, and publication sorting
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_category ON public.properties(category);
CREATE INDEX idx_properties_published_at ON public.properties(published_at DESC);
CREATE INDEX idx_properties_created_by ON public.properties(created_by);

-- Image ordering and cover lookup per property
CREATE INDEX idx_property_images_order ON public.property_images(property_id, display_order ASC);
CREATE INDEX idx_property_images_cover ON public.property_images(property_id, is_cover) WHERE is_cover = true;
```

---

## 6. Financial Integrity Guarantees

1. **Storage as Whole Rupees:** `total_price` is stored as an integer (`BIGINT`), representing full Indian Rupees (e.g. `₹45,00,000` = `4500000`).
2. **No Rate Calculations:** Database schema does not include price per square foot columns, preventing rounding discrepancies or misaligned claims.
3. **Optional Pricing:** If the property owner or agency has not established a public figure, `total_price` remains `NULL`, signaling the client application to display "Price on Consultation".
