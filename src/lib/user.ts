import { supabase } from "./supabase";

export interface UserBalance {
  userId: string;
  walletBalance: number;
}

export interface SellerInfo {
  id: string;
  name: string;
  businessName?: string;
  businessLocation?: string;
  businessLogo?: string;
  specialty?: string;
  bio?: string;
  rating: number;
  verified: boolean;
}

export interface SellerVerification {
  id: string;
  seller_id: string;
  id_number: string;
  registration_document?: string;
  business_address: string;
  tax_number: string;
  bank_account: string;
  bank_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

/**
 * User Management Service
 * Handles user profiles, wallets, and seller operations
 */
export const userService = {
  /**
   * Get all buyers
   */
  async getBuyers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("account_type", "buyer");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get buyers:", error);
      return [];
    }
  },

  /**
   * Get all sellers (public profiles)
   */
  async getSellers(): Promise<SellerInfo[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("account_type", "seller");

      if (error) throw error;

      return (
        data?.map((seller) => ({
          id: seller.id,
          name: seller.name,
          businessName: seller.business_name,
          businessLocation: seller.business_location,
          businessLogo: seller.business_logo,
          specialty: seller.specialty,
          bio: seller.bio,
          rating: 4.5, // TODO: Calculate from reviews
          verified: seller.verified,
        })) || []
      );
    } catch (error) {
      console.error("Failed to get sellers:", error);
      return [];
    }
  },

  /**
   * Get seller by ID
   */
  async getSellerById(sellerId: string): Promise<SellerInfo | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sellerId)
        .eq("account_type", "seller")
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        businessName: data.business_name,
        businessLocation: data.business_location,
        businessLogo: data.business_logo,
        specialty: data.specialty,
        bio: data.bio,
        rating: 4.5, // TODO: Calculate from reviews
        verified: data.verified,
      };
    } catch (error) {
      console.error("Failed to get seller:", error);
      return null;
    }
  },

  /**
   * Get user wallet balance
   */
  async getWalletBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data?.wallet_balance || 0;
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      return 0;
    }
  },

  /**
   * Update wallet balance (admin only)
   */
  async updateWalletBalance(
    userId: string,
    amount: number,
    reason: string
  ) {
    try {
      // Call the database function
      const { data, error } = await supabase
        .rpc("update_wallet_balance", {
          p_user_id: userId,
          p_amount: amount,
        });

      if (error) throw error;

      // Create transaction record
      await supabase.from("wallet_transactions").insert([
        {
          user_id: userId,
          type: amount > 0 ? "topup" : "payment",
          amount: Math.abs(amount),
          status: "completed",
          description: reason,
        },
      ]);

      return data;
    } catch (error) {
      throw new Error(
        `Failed to update wallet: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get user's seller verification status
   */
  async getSellerVerificationStatus(sellerId: string) {
    try {
      const { data, error } = await supabase
        .from("seller_verification")
        .select("*")
        .eq("seller_id", sellerId)
        .single();

      if (error?.code === "PGRST116") {
        // Not found
        return null;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get verification status:", error);
      return null;
    }
  },

  /**
   * Submit seller verification
   */
  async submitSellerVerification(
    sellerId: string,
    verificationData: {
      idNumber: string;
      registrationDocument: string;
      businessAddress: string;
      taxNumber: string;
      bankAccount: string;
      bankName: string;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from("seller_verification")
        .upsert(
          [
            {
              seller_id: sellerId,
              id_number: verificationData.idNumber,
              registration_document: verificationData.registrationDocument,
              business_address: verificationData.businessAddress,
              tax_number: verificationData.taxNumber,
              bank_account: verificationData.bankAccount,
              bank_name: verificationData.bankName,
              status: "pending",
            },
          ],
          { onConflict: "seller_id" }
        );

      if (error) throw error;
      const verifications = (data || []) as SellerVerification[];
      if (verifications.length === 0) {
        return null;
      }
      return verifications[0];
    } catch (error) {
      throw new Error(
        `Failed to submit verification: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get pending verifications (admin only)
   */
  async getPendingVerifications() {
    try {
      const { data, error } = await supabase
        .from("seller_verification")
        .select("*, users:seller_id(name, email, business_name)")
        .eq("status", "pending");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get pending verifications:", error);
      return [];
    }
  },

  /**
   * Approve seller verification (admin only)
   */
  async approveSellerVerification(verificationId: string, adminId: string) {
    try {
      // Update verification status
      const { data: verifyData, error: verifyError } = await supabase
        .from("seller_verification")
        .update({
          status: "approved",
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq("id", verificationId)
        .select()
        .single();

      if (verifyError) throw verifyError;

      // Mark user as verified
      const { error: userError } = await supabase
        .from("users")
        .update({ verified: true })
        .eq("id", verifyData.seller_id);

      if (userError) throw userError;

      return verifyData;
    } catch (error) {
      throw new Error(
        `Failed to approve verification: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Reject seller verification (admin only)
   */
  async rejectSellerVerification(verificationId: string, adminId: string) {
    try {
      const { data, error } = await supabase
        .from("seller_verification")
        .update({
          status: "rejected",
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq("id", verificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to reject verification: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get seller statistics
   */
  async getSellerStats(sellerId: string) {
    try {
      // Get products count
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", sellerId);

      // Get total revenue
      const { data: orders } = await supabase
        .from("orders")
        .select("amount")
        .eq("seller_id", sellerId)
        .eq("status", "delivered");

      const totalRevenue =
        (orders || []).reduce((sum, order) => sum + order.amount, 0);

      // Get seller rating
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating");

      const avgRating =
        reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
        productCount: productCount || 0,
        totalRevenue,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews?.length || 0,
      };
    } catch (error) {
      console.error("Failed to get seller stats:", error);
      return {
        productCount: 0,
        totalRevenue: 0,
        rating: 0,
        reviewCount: 0,
      };
    }
  },
};
