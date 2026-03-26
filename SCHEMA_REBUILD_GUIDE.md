# Database Schema Rebuild Guide

## Overview
The updated `SUPABASE_SCHEMA.sql` file now provides error-free schema management that can be safely dropped and rebuilt. It follows proper dependency order and handles all cleanup operations.

## What Changed

### Key Improvements
1. **Drop Order Matters** - All storage policies are dropped before any table operations
2. **Proper Sequence** - Triggers → Functions → Indexes → Tables → Enums
3. **Reverse Dependencies** - Tables dropped in reverse dependency order (newest first)
4. **No IF NOT EXISTS** - Uses `DROP IF EXISTS` for safe cleanup, then clean `CREATE` statements
5. **Atomic Operations** - Storage buckets use `ON CONFLICT DO NOTHING` for idempotency

### Problem Solved
- ❌ Old: Would fail on re-run due to existing objects
- ✅ New: Can be run multiple times without errors

## How to Rebuild the Schema

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project
2. Open **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `SUPABASE_SCHEMA.sql`
5. Paste into the query editor
6. Click **Run** (or Cmd+Enter)
7. Wait for completion

### Option 2: Using psql Command Line
```bash
# Connect to your Supabase database
psql -h db.your-project.supabase.co -U postgres -d postgres -p 5432 -f SUPABASE_SCHEMA.sql
```

### Option 3: Using Supabase CLI
```bash
# Push schema changes (if using migrations)
supabase push
```

## What Gets Rebuilt

### Phase 1: Cleanup (Drops Everything)
- ✓ Storage policies (8 policies)
- ✓ Triggers (1 trigger)
- ✓ Functions (3 functions)
- ✓ Indexes (32 indexes)
- ✓ Tables (16 tables)
- ✓ Enum types (10 types)

### Phase 2: Rebuild (Creates Everything)
- ✓ Extensions (uuid-ossp, pgjwt)
- ✓ Enum types (10 custom types)
- ✓ Tables (16 tables with proper constraints)
- ✓ Indexes (32 indexes for performance)
- ✓ Functions (3 PL/pgSQL functions)
- ✓ Triggers (1 trigger for wallet creation)
- ✓ Storage buckets (5 buckets)
- ✓ Storage policies (8 RLS policies)

## Data Loss Warning ⚠️

**This script will delete ALL data in the database!**

If you need to preserve data:
1. **Export first**: Use Supabase dashboard to export tables
2. **Backup the database**: `pg_dump your_database > backup.sql`
3. **After rebuild**: You can reimport data using `psql` or the dashboard

## Schema Structure

### Core Tables
- **users** - User accounts (buyer/seller/admin)
- **wallets** - Wallet balances per user
- **seller_profiles** - Seller business information
- **categories** - Product categories

### Product & Auction Tables
- **products** - Product listings
- **auctions** - Auction listings
- **auction_bids** - Individual auction bids

### Order & Payment Tables
- **orders** - Customer orders
- **order_items** - Items within orders
- **deposits** - Wallet deposits
- **wallet_transactions** - Transaction history
- **escrow_transactions** - Escrow holds during sale

### Support Tables
- **reviews** - Product/seller reviews
- **cart_items** - Shopping cart items
- **notifications** - User notifications
- **featured_products** - Featured product listings
- **hero_slides** - Homepage hero section content

## Storage Setup

### Buckets Created
1. **product-images** (Public) - Product photos
2. **profile-images** (Public) - User profile pictures
3. **verification-documents** (Private) - Seller verification files
4. **auction-images** (Public) - Auction item photos
5. **hero-images** (Public) - Homepage hero images

### Access Control
- **Public buckets**: Readable by everyone, uploadable by authenticated users
- **Private buckets**: Owner only, except admin can access all

## Verification Checklist

After rebuild, verify:

```sql
-- Check tables were created (should show 16)
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check indexes were created (should show 32)
SELECT count(*) FROM pg_indexes 
WHERE schemaname = 'public';

-- Check triggers exist (should show 1)
SELECT count(*) FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Check functions exist (should show 3)
SELECT count(*) FROM pg_proc 
WHERE pronamespace::regnamespace::text = 'public';

-- Check storage buckets (should show 5)
SELECT * FROM storage.buckets;
```

## Troubleshooting

### Error: "relation already exists"
- This shouldn't happen with the new schema
- If it does, ensure you're running the latest `SUPABASE_SCHEMA.sql`

### Error: "permission denied"
- Ensure you're logged in as `postgres` or a superuser
- On Supabase, use the default `postgres` role

### Error in storage policies
- Verify the `is_admin()` function exists
- Ensure `public.users` table is created before storage policies

### Need to keep data?
- Export data before running
- Use a separate database for backups
- Consider using Supabase's `pg_dump` functionality

## Alternative: Selective Rebuild

If you only want to rebuild specific tables, copy the sections you need rather than running the entire script.

Example (rebuild only products):
```sql
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (...);
CREATE TABLE products (...);
CREATE INDEX idx_products_seller_id ON products(seller_id);
```

## Files Provided

1. **SUPABASE_SCHEMA.sql** - Main schema file (use this)
2. **SUPABASE_SCHEMA_CLEAN.sql** - Backup copy (same content, for reference)

Both files are identical and can be used interchangeably.

---

**Last Updated**: 2026-03-25  
**Status**: Clean & Error-Free ✓
