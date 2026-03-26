import { supabase } from "./supabase";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  vendor_id: string;
  vendor_name?: string;
  created_at: string;
  rating?: number;
  review_count?: number;
}

export interface ProductCreateInput {
  name: string;
  description: string;
  category: string;
  price: number;
  stock_quantity: number;
  image_urls?: string[];
}

/**
 * Product Management Service
 * Handles product CRUD operations in Supabase
 */
export const productService = {
  /**
   * Get all products with optional filtering
   */
  async getAllProducts(filters?: {
    category?: string;
    vendorId?: string;
    search?: string;
  }): Promise<Product[]> {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          vendor:vendor_id(name)
        `
        );

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.vendorId) {
        query = query.eq("vendor_id", filters.vendorId);
      }

      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      return (
        data?.map((p) => ({
          ...p,
          vendor_name: p.vendor?.name,
        })) || []
      );
    } catch (error) {
      console.error("Failed to get products:", error);
      return [];
    }
  },

  /**
   * Get product by ID with reviews and images
   */
  async getProductById(productId: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          images:product_images(id, image_url),
          reviews:reviews(id, rating, comment, reviewer_name, created_at)
        `
        )
        .eq("id", productId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Failed to get product:", error);
      return null;
    }
  },

  /**
   * Get products by vendor
   */
  async getVendorProducts(vendorId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get vendor products:", error);
      return [];
    }
  },

  /**
   * Create new product
   */
  async createProduct(vendorId: string, productData: ProductCreateInput) {
    try {
      // Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([
          {
            vendor_id: vendorId,
            name: productData.name,
            description: productData.description,
            category: productData.category,
            price: productData.price,
            stock_quantity: productData.stock_quantity,
            image_url: productData.image_urls?.[0],
            status: "active",
          },
        ])
        .select()
        .single();

      if (productError) throw productError;

      // Insert additional images
      if (productData.image_urls && productData.image_urls.length > 1) {
        const imageRecords = productData.image_urls.map((url) => ({
          product_id: product.id,
          image_url: url,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      return product;
    } catch (error) {
      throw new Error(
        `Failed to create product: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Update product
   */
  async updateProduct(productId: string, updates: Partial<ProductCreateInput>) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to update product: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(productId: string) {
    try {
      // Delete images first
      await supabase.from("product_images").delete().eq("product_id", productId);

      // Delete product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
    } catch (error) {
      throw new Error(
        `Failed to delete product: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Add product review
   */
  async addReview(
    productId: string,
    reviewData: {
      rating: number;
      comment: string;
      reviewer_name: string;
      reviewer_email: string;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            product_id: productId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            reviewer_name: reviewData.reviewer_name,
            reviewer_email: reviewData.reviewer_email,
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to add review: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get products by category:", error);
      return [];
    }
  },

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to search products:", error);
      return [];
    }
  },

  /**
   * Get featured products (newest or highest rated)
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get featured products:", error);
      return [];
    }
  },

  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({ stock_quantity: quantity })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to update stock: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get product statistics (admin only)
   */
  async getProductStats() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category, price, stock_quantity");

      if (error) throw error;

      const stats = {
        totalProducts: data?.length || 0,
        categories: [...new Set(data?.map((p) => p.category))].length,
        avgPrice:
          data && data.length > 0
            ? data.reduce((sum, p) => sum + p.price, 0) / data.length
            : 0,
        totalStock: data?.reduce((sum, p) => sum + p.stock_quantity, 0) || 0,
      };

      return stats;
    } catch (error) {
      console.error("Failed to get product stats:", error);
      return {
        totalProducts: 0,
        categories: 0,
        avgPrice: 0,
        totalStock: 0,
      };
    }
  },
};
