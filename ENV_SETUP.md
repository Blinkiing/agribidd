# Environment Configuration & API Integration

This document explains how to set up and manage environment variables for Supabase and Yoco integration.

## 🔒 Security Rules

**CRITICAL:** Never commit `.env.local`, `.env`, or any files containing credentials to version control!

The following patterns are already in `.gitignore`:
- `*.local` (covers `.env.local`)
- All environment files with sensitive data

## 📋 Environment Variables Setup

### 1. Create `.env.local` File

Create a `.env.local` file in the project root with these variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Yoco Configuration (Client/Public Key only - anon key)
VITE_YOCO_PUBLIC_KEY=your_yoco_public_key

# Yoco Secret Key (Server-side only - DO NOT expose to browser)
VITE_YOCO_SECRET_KEY=your_yoco_secret_key
```

**Important:**
- `VITE_` prefix = exposed to browser (public keys only)
- Never use `VITE_` for secrets intended for server-side only
- Yoco secret should only be used in backend/server functions

### 2. Development vs Production

**Local Development:**
- Use `.env.local` (Git-ignored)
- Variables are automatically loaded by Vite

**Production Deployment:**
Set environment variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Build & Deploy → Environment
- Railway/Render: Environment Configuration
- And your platform's UI

## 🔧 Current Credentials Configuration

Your credentials are configured in `.env.local`:

**Supabase:**
- URL: `https://ujfsgmvhdixitheofwot.supabase.co`
- Anon Key: JWT token (public key for browser)

**Yoco:**
- Public Key: `your_yoco_public_key` (public key for browser)
- Secret Key: Stored securely (server-side only)

## 📝 Using Environment Variables in Code

### Accessing in React/TypeScript:

```typescript
// Using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const yocoPublicKey = import.meta.env.VITE_YOCO_PUBLIC_KEY;

// Using the config module (recommended)
import { config } from "@/config/env";

// Access nested config
console.log(config.supabase.url);
console.log(config.yoco.publicKey);
```

### Type-Safe Config Module:

The `src/config/env.ts` file provides:
- ✅ Type-safe environment access
- ✅ Validation in production
- ✅ Default fallbacks for development
- ✅ Centralized configuration

## 🚀 Supabase Integration

Supabase client is initialized in `src/lib/supabase.ts`:

```typescript
import { supabase } from "@/lib/supabase";

// Use for database queries, auth, etc.
const { data, error } = await supabase
  .from("products")
  .select("*");
```

**Available Services:**
- Database (PostgreSQL)
- Authentication
- Real-time subscriptions
- File storage

## 💳 Yoco Payment Integration

Yoco buttons are implemented in `src/components/YocoButton.tsx`:

```typescript
import YocoButton from "@/components/YocoButton";

// In your component
<YocoButton
  amount={transactionAmount}
  onSuccess={(reference) => handleSuccess(reference)}
  onError={() => handleError()}
/>
```

**Features:**
- ✅ Dynamic SDK loading with live client ID
- ✅ ZAR currency support
- ✅ Error handling and toast notifications
- ✅ Order capture and success callbacks

## ⚠️ Common Security Mistakes to Avoid

❌ **DON'T:**
- Hardcode credentials in source files
- Commit `.env.local` to git
- Mix client/server credentials
- Use production credentials in development
- Expose secrets in error messages

✅ **DO:**
- Use environment variables for all credentials
- Give each environment its own credentials
- Rotate credentials regularly
- Monitor API usage and access logs
- Use minimal permission scopes

## 🔄 Rotating Credentials

### If credentials are compromised:

1. **Supabase:**
   - Go to Project Settings → API Keys
   - Regenerate the anon key
   - Update `.env.local`

2. **PayPal:**
   - Log into PayPal Developer Dashboard
   - Apps & Credentials → Regenerate Secret
   - Update environment variables

## 📚 References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PayPal Server Integration](https://developer.paypal.com/docs/checkout/standard/integrate/)
- [Environment Variable Best Practices](https://12factor.net/config)

## ✅ Verification Checklist

- [ ] `.env.local` created with all credentials
- [ ] `.env.local` is in `.gitignore`
- [ ] Supabase client can authenticate
- [ ] PayPal buttons render correctly in wallet
- [ ] No credentials appear in browser console
- [ ] Production environment has separate credentials set
