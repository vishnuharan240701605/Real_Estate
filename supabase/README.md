# AMMAN REAL ESTATE – Supabase Setup & Migrations Guide

## 1. Overview
AMMAN REAL ESTATE uses Supabase as its Serverless Backend-as-a-Service (BaaS) providing:
- Managed PostgreSQL 15+ database
- Secure Supabase Auth (Email & Password)
- Strict Row Level Security (RLS) enforcement
- Zero-cost initial deployment tier ($0/month)

---

## 2. Migration Files
- `supabase/migrations/20261126000001_amman_real_estate_schema.sql`:
  - Creates `admin_profiles`, `properties`, and `property_images` tables.
  - Implements the `is_admin()` Security Definer authorization function.
  - Enforces automatic `updated_at` timestamps via triggers.
  - Configures comprehensive Row Level Security (RLS) policies.
  - Excludes all permissive public writes.
- `supabase/migrations/20261126000002_grant_public_read_published_properties.sql`:
  - Grants table-level `SELECT` privilege on `public.properties` and `public.property_images` to `anon` and `authenticated` roles.
  - Required for public visitors to read published properties under Row Level Security.
  - Preserves strict RLS: `anon` users only see rows where `status = 'PUBLISHED'`.
  - Zero public write permissions; unpublished, draft, and sold properties remain hidden.
- `supabase/migrations/20261126000003_add_property_type_classification.sql`:
  - Adds two-level classification column `property_type` (HOUSE, APARTMENT, RESIDENTIAL_PLOT, AGRICULTURAL_LAND, COMMERCIAL_PROPERTY).
  - Enforces `properties_property_type_check` (valid values) and `properties_property_type_category_check` (compatibility check).
  - Fully idempotent: checks existing constraints by name using `pg_constraint` before creating, ensuring safety for both existing and fresh databases.
  - Permits NULL for legacy records while preserving existing listings without destructive changes.

---

## 3. How to Apply Migrations

### Option A: Via Supabase Dashboard (Recommended for ₹0 setup)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (or create a new free tier project).
3. Navigate to **SQL Editor** from the left sidebar.
4. Click **New query**.
5. Copy the entire contents of `supabase/migrations/20261126000001_amman_real_estate_schema.sql` and paste it into the query editor.
6. Click **Run** (or `Ctrl+Enter`).
7. Confirm all tables and policies appear under **Table Editor** and **Authentication -> Policies**.

### Option B: Via Supabase CLI
```bash
# Link project
npx supabase link --project-ref your-project-ref

# Apply pending migrations
npx supabase db push
```

---

## 4. Environment Variables Configuration
In the root project directory, copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the values from your Supabase Dashboard (**Project Settings -> API**):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-anon-key
VITE_WHATSAPP_NUMBER=+919894215932
```

> [!CAUTION]
> NEVER expose your `service_role` key in `.env.local` or frontend code. The frontend client must strictly use the publishable `anon` key.
