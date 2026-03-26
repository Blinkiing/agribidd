// QUICK START: Deploy Schema Without RLS
// ============================================================

## 🚀 TL;DR - 3 Steps to Deploy

### Step 1: Backup (CRITICAL)
```
Supabase Dashboard → Your Project → Project Settings 
→ Database → Backups → Create manual backup
```
⏱️ Wait for backup to complete (2-5 minutes)

### Step 2: Copy & Run SQL
1. Open file: `SUPABASE_SCHEMA_NO_RLS.sql`
2. Copy ALL content
3. Go to: Supabase Dashboard → SQL Editor
4. Create new query (+ New Query button)
5. Paste the entire SQL script
6. Click "Run" (⚠️ This DELETES all current data)
7. Wait for completion (green checkmark ✓)

### Step 3: Verify
Run this test query in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

✅ Should list all 17 tables:
- auction_bids
- auctions
- cart_items
- categories
- deposits
- escrow_transactions
- featured_products
- hero_slides
- notifications
- order_items
- orders
- products
- reviews
- seller_profiles
- users
- wallet_transactions
- wallets

---

## 📋 What Gets Dropped

❌ All RLS policies
❌ All tables and data
❌ All indexes
❌ All triggers
❌ All functions
❌ All enum types

---

## ✅ What Gets Created

✅ Full database schema (no RLS)
✅ 17 tables
✅ 38 indexes
✅ 2 functions
✅ 1 trigger
✅ 10 enum types
✅ 5 storage buckets (all public)

---

## ⚡ Key Differences From Previous Schema

| Feature | Before | After |
|---------|--------|-------|
| RLS Enabled | ✅ Yes | ❌ No |
| Public Access | ❌ Restricted | ✅ Open |
| Admin Function | ✅ is_admin() | ❌ Removed |
| Storage Policies | ✅ 8 policies | ❌ None |
| Access Control | Database-level | Application-level |

---

## 🔧 Database Access

After deployment, you can:

```typescript
// Read any table without auth
const { data } = await supabase
  .from('products')
  .select('*');

// Write to any table without checks
await supabase
  .from('orders')
  .insert({ ... });

// Upload files anywhere
await supabase.storage
  .from('product-images')
  .upload(path, file);
```

---

## ⚠️ IMPORTANT NOTES

### This is for Development ONLY

- No row-level security means anyone can see/modify everything
- Not suitable for production
- Not suitable for sensitive data
- Implement access control in application code

### Keep Your Backup Safe

- Store the backup file securely
- Keep the backup available for rollback
- Don't delete from Supabase Backups for at least 30 days

### Rollback If Problems Occur

```
Supabase → Project Settings → Database → Backups
→ Select backup date → Restore
```

---

## 📞 Troubleshooting

### "Cannot run query" error
→ Backup might be running
→ Wait a few minutes, try again

### "Table still exists" error  
→ First pass removes RLS and policies
→ Run script again, it should complete

### Types not dropping
→ Script has CASCADE - will remove dependencies
→ Run script a 2nd time if first attempt partially fails

### Application still says "no RLS"
→ Refresh your browser cache (Ctrl+Shift+R)
→ Check if app is still pointing to old database

---

## ✅ Post-Deployment Checklist

- [ ] Backup created successfully
- [ ] SQL script run in Supabase SQL Editor
- [ ] No error messages in editor
- [ ] Tables visible in Schema Editor tab
- [ ] Can insert test data:
  ```sql
  INSERT INTO categories (name) VALUES ('Test') RETURNING *;
  ```
- [ ] Application loads without auth errors
- [ ] Can read products without authentication

---

## 📂 Files Included

1. **SUPABASE_SCHEMA_NO_RLS.sql**
   - The main SQL script to run
   - ~600 lines
   - Completely recreates database

2. **SCHEMA_MIGRATION_NO_RLS.md**
   - Detailed migration guide
   - Troubleshooting section
   - Verification steps

3. **SCHEMA_NO_RLS_QUICKSTART.md** (this file)
   - TL;DR version
   - Quick reference

---

## 🎯 Next Steps After Deployment

1. **Test the application**
   - Load homepage
   - Browse products
   - Check no auth errors

2. **Add sample data** (optional)
   ```sql
   INSERT INTO categories (name, description) 
   VALUES ('Vegetables', 'Fresh vegetables');
   
   INSERT INTO hero_slides (title, highlight, subtitle) 
   VALUES ('Fresh Connect', 'Farm to Table', 'Premium produce');
   ```

3. **Update application code** (if using RLS checks)
   - Remove auth.uid() checks from queries
   - Remove row level security assumptions
   - Implement business logic access control

---

Created: March 26, 2026
Version: No-RLS v1.0

⏱️ Deployment time: ~5-10 minutes
💾 Backup size: ~5-50 MB (varies)
