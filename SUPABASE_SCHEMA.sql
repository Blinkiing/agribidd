-- Farm Fresh Connect - Complete Schema (Clean & Error-Free)
-- This schema can be safely dropped and rebuilt without errors
-- All dependencies are handled in proper order

-- ============================================================
-- STEP 1: DROP ALL STORAGE POLICIES (must drop before objects)
-- ============================================================
DROP POLICY IF EXISTS "Public read (public buckets)" ON storage.objects;
DROP POLICY IF EXISTS "Upload (public buckets)" ON storage.objects;
DROP POLICY IF EXISTS "Update own (public buckets)" ON storage.objects;
DROP POLICY IF EXISTS "Delete own (public buckets)" ON storage.objects;
DROP POLICY IF EXISTS "Upload (verification-documents)" ON storage.objects;
DROP POLICY IF EXISTS "Read own (verification-documents)" ON storage.objects;
DROP POLICY IF EXISTS "Update own (verification-documents)" ON storage.objects;
DROP POLICY IF EXISTS "Delete own (verification-documents)" ON storage.objects;

-- ============================================================
-- STEP 2: DROP ALL TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS trigger_create_wallet ON users;

-- ============================================================
-- STEP 3: DROP ALL FUNCTIONS
-- ============================================================
DROP FUNCTION IF EXISTS create_user_profile(UUID, VARCHAR, VARCHAR, VARCHAR, account_type_enum);
DROP FUNCTION IF EXISTS create_wallet_for_new_user();
DROP FUNCTION IF EXISTS public.is_admin();

-- ============================================================
-- STEP 4: DROP ALL INDEXES
-- ============================================================
DROP INDEX IF EXISTS idx_users_auth_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_account_type;
DROP INDEX IF EXISTS idx_wallets_user_id;
DROP INDEX IF EXISTS idx_seller_profiles_user_id;
DROP INDEX IF EXISTS idx_products_seller_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_auctions_seller_id;
DROP INDEX IF EXISTS idx_auctions_status;
DROP INDEX IF EXISTS idx_auctions_end_time;
DROP INDEX IF EXISTS idx_auction_bids_auction_id;
DROP INDEX IF EXISTS idx_auction_bids_bidder_id;
DROP INDEX IF EXISTS idx_orders_buyer_id;
DROP INDEX IF EXISTS idx_orders_seller_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_reviews_order_id;
DROP INDEX IF EXISTS idx_reviews_reviewer_id;
DROP INDEX IF EXISTS idx_reviews_reviewee_id;
DROP INDEX IF EXISTS idx_cart_items_user_id;
DROP INDEX IF EXISTS idx_cart_items_product_id;
DROP INDEX IF EXISTS idx_deposits_user_id;
DROP INDEX IF EXISTS idx_deposits_status;
DROP INDEX IF EXISTS idx_wallet_transactions_user_id;
DROP INDEX IF EXISTS idx_wallet_transactions_type;
DROP INDEX IF EXISTS idx_escrow_transactions_buyer_id;
DROP INDEX IF EXISTS idx_escrow_transactions_seller_id;
DROP INDEX IF EXISTS idx_escrow_transactions_order_id;
DROP INDEX IF EXISTS idx_escrow_transactions_status;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_featured_products_product_id;
DROP INDEX IF EXISTS idx_hero_slides_position;
DROP INDEX IF EXISTS idx_hero_slides_is_active;

-- ============================================================
-- STEP 5: DROP ALL TABLES (in reverse dependency order)
-- ============================================================
DROP TABLE IF EXISTS hero_slides CASCADE;
DROP TABLE IF EXISTS featured_products CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS escrow_transactions CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS auction_bids CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS seller_profiles CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- STEP 6: DROP ALL ENUM TYPES
-- ============================================================
DROP TYPE IF EXISTS account_type_enum CASCADE;
DROP TYPE IF EXISTS product_status_enum CASCADE;
DROP TYPE IF EXISTS auction_status_enum CASCADE;
DROP TYPE IF EXISTS order_status_enum CASCADE;
DROP TYPE IF EXISTS verification_status_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS deposit_status_enum CASCADE;
DROP TYPE IF EXISTS transaction_type_enum CASCADE;
DROP TYPE IF EXISTS escrow_status_enum CASCADE;
DROP TYPE IF EXISTS dispute_status_enum CASCADE;

-- ============================================================
-- STEP 7: ENABLE EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- ============================================================
-- STEP 8: CREATE ENUM TYPES
-- ============================================================
CREATE TYPE account_type_enum AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE product_status_enum AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE auction_status_enum AS ENUM ('active', 'pending', 'ended', 'cancelled');
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_method_enum AS ENUM ('bank', 'card', 'yoco');
CREATE TYPE deposit_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdrawal', 'purchase', 'sale', 'refund', 'commission');
CREATE TYPE escrow_status_enum AS ENUM ('pending', 'held', 'released', 'refunded');
CREATE TYPE dispute_status_enum AS ENUM ('open', 'in_review', 'resolved', 'closed');

-- ============================================================
-- STEP 9: CREATE USERS TABLE
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  account_type account_type_enum NOT NULL DEFAULT 'buyer',
  wallet_balance DECIMAL(15, 2) DEFAULT 0.00,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 10: CREATE WALLETS TABLE
-- ============================================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  total_earned DECIMAL(15, 2) DEFAULT 0.00,
  total_spent DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 11: CREATE SELLER PROFILES TABLE
-- ============================================================
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_location VARCHAR(255),
  farm_size VARCHAR(100),
  crops_produced TEXT[],
  certifications TEXT[],
  verification_status verification_status_enum DEFAULT 'pending',
  verification_date TIMESTAMP WITH TIME ZONE,
  bio TEXT,
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 12: CREATE CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 13: CREATE PRODUCTS TABLE
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(50),
  image_url VARCHAR(500),
  tags TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  status product_status_enum DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 14: CREATE AUCTIONS TABLE
-- ============================================================
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  starting_price DECIMAL(10, 2) NOT NULL,
  current_bid DECIMAL(10, 2) NOT NULL,
  highest_bidder_id UUID REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status auction_status_enum DEFAULT 'active',
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 15: CREATE AUCTION BIDS TABLE
-- ============================================================
CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 16: CREATE ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status_enum DEFAULT 'pending',
  payment_method payment_method_enum,
  shipping_address TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 17: CREATE ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 18: CREATE REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 19: CREATE CART ITEMS TABLE
-- ============================================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- STEP 20: CREATE DEPOSITS TABLE
-- ============================================================
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  method payment_method_enum NOT NULL,
  status deposit_status_enum DEFAULT 'pending',
  reference VARCHAR(255),
  deposit_slip_url VARCHAR(500),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 21: CREATE WALLET TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type transaction_type_enum NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  balance_before DECIMAL(15, 2),
  balance_after DECIMAL(15, 2),
  related_order_id UUID REFERENCES orders(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 22: CREATE ESCROW TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  commission DECIMAL(15, 2) DEFAULT 0.00,
  net_amount DECIMAL(15, 2),
  status escrow_status_enum DEFAULT 'pending',
  release_date TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  released_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 23: CREATE NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  related_order_id UUID REFERENCES orders(id),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 24: CREATE FEATURED PRODUCTS TABLE
-- ============================================================
CREATE TABLE featured_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  featured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- STEP 25: CREATE HERO SLIDES TABLE
-- ============================================================
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  highlight VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  emoji VARCHAR(20) DEFAULT '🌱',
  gradient VARCHAR(255) DEFAULT 'from-forest-dark/90 via-forest/70 to-transparent',
  image_url VARCHAR(500),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 26: CREATE INDEXES
-- ============================================================
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_auctions_seller_id ON auctions(seller_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_auction_bids_auction_id ON auction_bids(auction_id);
CREATE INDEX idx_auction_bids_bidder_id ON auction_bids(bidder_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_escrow_transactions_buyer_id ON escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_transactions_seller_id ON escrow_transactions(seller_id);
CREATE INDEX idx_escrow_transactions_order_id ON escrow_transactions(order_id);
CREATE INDEX idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX idx_hero_slides_position ON hero_slides(position);
CREATE INDEX idx_hero_slides_is_active ON hero_slides(is_active);

-- ============================================================
-- STEP 27: CREATE FUNCTIONS
-- ============================================================

-- Create user profile function (for signup)
CREATE OR REPLACE FUNCTION create_user_profile(
  p_auth_id UUID,
  p_email VARCHAR,
  p_name VARCHAR,
  p_phone VARCHAR,
  p_account_type account_type_enum DEFAULT 'buyer'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (auth_id, email, name, phone, account_type)
  VALUES (p_auth_id, p_email, p_name, p_phone, COALESCE(p_account_type, 'buyer'::account_type_enum))
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create wallet for new user (trigger function)
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin checker function for storage policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.auth_id = auth.uid()
      AND u.account_type = 'admin'
  );
$$;

-- ============================================================
-- STEP 28: CREATE TRIGGERS
-- ============================================================

-- Trigger for creating wallet on user creation
CREATE TRIGGER trigger_create_wallet
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_wallet_for_new_user();

-- ============================================================
-- STEP 29: SET UP STORAGE BUCKETS
-- ============================================================

-- Insert storage buckets (using ON CONFLICT to handle existing buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('profile-images', 'profile-images', true),
  ('verification-documents', 'verification-documents', false),
  ('auction-images', 'auction-images', true),
  ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 30: CREATE STORAGE POLICIES
-- ============================================================

-- Public read access for public buckets
CREATE POLICY "Public read (public buckets)"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id IN ('product-images', 'profile-images', 'auction-images', 'hero-images')
);

-- Authenticated uploads to public buckets
CREATE POLICY "Upload (public buckets)"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('product-images', 'profile-images', 'auction-images', 'hero-images')
);

-- Authenticated updates/deletes for own files (or admin) in public buckets
CREATE POLICY "Update own (public buckets)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('product-images', 'profile-images', 'auction-images', 'hero-images')
  AND (owner = auth.uid() OR public.is_admin())
)
WITH CHECK (
  bucket_id IN ('product-images', 'profile-images', 'auction-images', 'hero-images')
  AND (owner = auth.uid() OR public.is_admin())
);

CREATE POLICY "Delete own (public buckets)"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('product-images', 'profile-images', 'auction-images', 'hero-images')
  AND (owner = auth.uid() OR public.is_admin())
);

-- Verification documents: private (owner/admin only)
CREATE POLICY "Upload (verification-documents)"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents'
);

CREATE POLICY "Read own (verification-documents)"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (owner = auth.uid() OR public.is_admin())
);

CREATE POLICY "Update own (verification-documents)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (owner = auth.uid() OR public.is_admin())
)
WITH CHECK (
  bucket_id = 'verification-documents'
  AND (owner = auth.uid() OR public.is_admin())
);

CREATE POLICY "Delete own (verification-documents)"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (owner = auth.uid() OR public.is_admin())
);

-- ============================================================
-- SCHEMA REBUILD COMPLETE ✓
-- ============================================================
-- All tables, functions, triggers, indexes, and policies created successfully.
-- Database is ready for application use without errors.
