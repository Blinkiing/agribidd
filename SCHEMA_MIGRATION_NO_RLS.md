// SCHEMA MIGRATION GUIDE: Drop Everything & Recreate Without RLS
// ============================================================

## Overview
This guide walks you through completely dropping the current schema and recreating it without Row Level Security (RLS) policies.

**What's Removed:**
- All RLS policies from storage.objects
- All RLS policies from tables (if any existed)
- The is_admin() security function
- All permission-based access controls

**What's Created:**
- Fresh database schema with same structure
- All tables, functions, triggers, and indexes
- Storage buckets for file uploads
- NO access restrictions (open for development/testing)

---

## ⚠️ CRITICAL STEPS - DO IN ORDER

### 1. Backup Your Current Database (REQUIRED)

**Using Supabase Dashboard:**
```
Project Settings → Database → Backups → Create a manual backup
```

**Using pg_dump (recommended):**
```bash
pg_dump -h <HOST> -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Copy the SQL to Supabase Editor

**Steps:**
1. Go to Supabase Dashboard → Your Project
2. Click "SQL Editor" in the left sidebar
3. Click "+ New Query"
4. Copy entire contents of `SUPABASE_SCHEMA_NO_RLS.sql`
5. Paste into the SQL editor
6. Review the script (it starts with DROP statements)
7. Click "Run" button (⚠️ This will DELETE all tables and data)

### 3. Verify Schema Created Successfully

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return: users, wallets, seller_profiles, products, 
-- auctions, orders, reviews, cart_items, deposits, etc.
```

### 4. Verify RLS is Disabled

```sql
-- Check if RLS is disabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show: rowsecurity = false (or 'f')
```

---

## 📝 What Changed From Previous Schema

### Removed:
- ❌ All RLS policies on `storage.objects`
- ❌ Authentication/permission checks
- ❌ `public.is_admin()` function
- ❌ User ownership validation policies
- ❌ Bucket-specific access controls

### Added:
- ✅ `DISABLE ROW LEVEL SECURITY` on `storage.objects`
- ✅ All buckets set to `public = true`
- ✅ All tables accessible to anyone

### Same Structure:
- ✅ All tables identical
- ✅ All columns and types same
- ✅ All foreign keys and constraints same
- ✅ All indexes same
- ✅ Same trigger for wallet creation
- ✅ Same functions for user profiles

---

## 🗄️ Tables Created

1. **users** - User accounts (buyer, seller, admin)
2. **wallets** - User wallet balances
3. **seller_profiles** - Seller business information
4. **categories** - Product categories
5. **products** - Product listings
6. **auctions** - Auction listings
7. **auction_bids** - Auction bid history
8. **orders** - Purchase orders
9. **order_items** - Items in orders
10. **reviews** - Product/seller reviews
11. **cart_items** - Shopping cart
12. **deposits** - Wallet deposits
13. **wallet_transactions** - Transaction history
14. **escrow_transactions** - Escrow holdings
15. **notifications** - User notifications
16. **featured_products** - Featured listings
17. **hero_slides** - Homepage hero section

---

## 📦 Storage Buckets

All public (anyone can read/write):
- `product-images`
- `profile-images`
- `verification-documents` (changed from private)
- `auction-images`
- `hero-images`

---

## ⚡ Next Steps

### 1. Update Backend Code (if needed)
Since no RLS, your app can query directly:
```typescript
// This now works without authentication
const { data } = await supabase
  .from('products')
  .select('*')
  .all(); // No need for auth.uid() checks
```

### 2. Frontend Application
- No changes needed to app code
- Authentication still works normally
- But access control is now app-level, not database-level

### 3. Security Considerations
- ⚠️ **NOT FOR PRODUCTION**
- This schema is for development/testing only
- Any client can read/write to any table
- Implement access control in application layer

---

## 🔄 Rollback Plan

If you need to restore:

```bash
# Using your backup
psql -h <HOST> -U postgres -d postgres < backup_YYYYMMDD_HHMMSS.sql
```

Or restore from Supabase backups:
1. Project Settings → Database → Backups
2. Select your backup date
3. Click "Restore"

---

## ✅ Verification Checklist

After running the script:

- [ ] Script ran without errors (green checkmark in Supabase)
- [ ] All tables exist (run SELECT query above)
- [ ] RLS is disabled on all tables
- [ ] Storage buckets exist and are public
- [ ] Can insert test data without auth
- [ ] Application loads without permission errors

---

## 🐛 Troubleshooting

### Error: "Type already exists"
- The script includes DROP TYPE CASCADE
- Try running again - it cleans up on first pass

### Error: "function is_admin() does not exist"
*(Expected)* - The script removes this function
- Verify line `DROP FUNCTION IF EXISTS public.is_admin();` was executed

### Storage buckets not created
```sql
-- Manually create if needed
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
```

### Application shows "row level security" errors
- RLS was not disabled
- Run this:
```sql
ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;
```

---

## 📞 Support

If issues occur:
1. Check Supabase dashboard for error messages
2. Verify backup exists before attempting fixes
3. Review the SQL script line-by-line in SQL Editor
4. Check schema in Supabase's Schema Education tab

Created: March 26, 2026
Schema Version: No-RLS v1.0
