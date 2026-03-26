import { supabase } from "./supabase";

export interface Auction {
  id: string;
  product_id: string;
  seller_id: string;
  starting_price: number;
  current_price: number;
  highest_bidder_id?: string;
  bid_count: number;
  start_time: string;
  end_time: string;
  status: "active" | "ended" | "cancelled";
  created_at: string;
  product?: {
    name: string;
    image_url?: string;
    category: string;
  };
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

/**
 * Auction Management Service
 * Handles auction creation, bidding, and settlement
 */
export const auctionService = {
  /**
   * Create new auction
   */
  async createAuction(
    productId: string,
    sellerId: string,
    startingPrice: number,
    endTime: Date
  ) {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .insert([
          {
            product_id: productId,
            seller_id: sellerId,
            starting_price: startingPrice,
            current_price: startingPrice,
            bid_count: 0,
            start_time: new Date().toISOString(),
            end_time: endTime.toISOString(),
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to create auction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get auction by ID
   */
  async getAuctionById(auctionId: string) {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(
          `
          *,
          product:product_id(*),
          bids:auction_bids(*)
        `
        )
        .eq("id", auctionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get auction:", error);
      return null;
    }
  },

  /**
   * Get active auctions
   */
  async getActiveAuctions(): Promise<Auction[]> {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(
          `
          *,
          product:product_id(name, image_url, category),
          seller:seller_id(name, business_name)
        `
        )
        .eq("status", "active")
        .gt("end_time", new Date().toISOString())
        .order("end_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get active auctions:", error);
      return [];
    }
  },

  /**
   * Get seller's auctions
   */
  async getSellerAuctions(sellerId: string): Promise<Auction[]> {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(
          `
          *,
          product:product_id(name, image_url)
        `
        )
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get seller auctions:", error);
      return [];
    }
  },

  /**
   * Place bid on auction
   */
  async placeBid(auctionId: string, bidderId: string, amount: number) {
    try {
      // Get auction
      const auction = await this.getAuctionById(auctionId);
      if (!auction) throw new Error("Auction not found");

      if (auction.status !== "active") {
        throw new Error("Auction is not active");
      }

      if (new Date() > new Date(auction.end_time)) {
        throw new Error("Auction has ended");
      }

      if (amount <= auction.current_price) {
        throw new Error(
          `Bid must be higher than ${auction.current_price}`
        );
      }

      // Create bid
      const { data: bid, error: bidError } = await supabase
        .from("auction_bids")
        .insert([
          {
            auction_id: auctionId,
            bidder_id: bidderId,
            amount,
          },
        ])
        .select()
        .single();

      if (bidError) throw bidError;

      // Update auction
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          current_price: amount,
          highest_bidder_id: bidderId,
          bid_count: (auction.bid_count || 0) + 1,
        })
        .eq("id", auctionId);

      if (updateError) throw updateError;

      return bid;
    } catch (error) {
      throw new Error(
        `Failed to place bid: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get auction bids
   */
  async getAuctionBids(auctionId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from("auction_bids")
        .select("*")
        .eq("auction_id", auctionId)
        .order("amount", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get auction bids:", error);
      return [];
    }
  },

  /**
   * Get user's bids
   */
  async getUserBids(userId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from("auction_bids")
        .select("*")
        .eq("bidder_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get user bids:", error);
      return [];
    }
  },

  /**
   * End auction (called by system or admin)
   */
  async endAuction(auctionId: string) {
    try {
      // Get auction
      const auction = await this.getAuctionById(auctionId);
      if (!auction) throw new Error("Auction not found");

      if (auction.status !== "active") {
        throw new Error("Auction is not active");
      }

      // Update auction status
      const { error: updateError } = await supabase
        .from("auctions")
        .update({ status: "ended" })
        .eq("id", auctionId);

      if (updateError) throw updateError;

      // If there's a winner, create order
      if (auction.highest_bidder_id) {
        // Create order for winning bid
        const { error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              buyer_id: auction.highest_bidder_id,
              seller_id: auction.seller_id,
              amount: auction.current_price,
              status: "pending",
              order_type: "auction",
            },
          ]);

        if (orderError) throw orderError;

        // Create escrow
        const { error: escrowError } = await supabase
          .from("escrow_transactions")
          .insert([
            {
              order_id: null, // Will need to be updated
              buyer_id: auction.highest_bidder_id,
              seller_id: auction.seller_id,
              amount: auction.current_price,
              status: "held",
              hold_reason: "auction_sale",
            },
          ]);

        if (escrowError) throw escrowError;
      }

      return auction;
    } catch (error) {
      throw new Error(
        `Failed to end auction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Cancel auction
   */
  async cancelAuction(auctionId: string, reason: string) {
    try {
      const { data: auction, error: getError } = await supabase
        .from("auctions")
        .select("*")
        .eq("id", auctionId)
        .single();

      if (getError) throw getError;

      // Update status
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          status: "cancelled",
        })
        .eq("id", auctionId);

      if (updateError) throw updateError;

      // If there were bids, need to handle refunds
      if (auction.bid_count > 0) {
        // Get all bids
        const { data: bids, error: bidsError } = await supabase
          .from("auction_bids")
          .select("*")
          .eq("auction_id", auctionId);

        if (bidsError) throw bidsError;
      }

      return auction;
    } catch (error) {
      throw new Error(
        `Failed to cancel auction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get featured auctions for homepage
   */
  async getFeaturedAuctions(limit: number = 6): Promise<Auction[]> {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(
          `
          *,
          product:product_id(name, image_url, category)
        `
        )
        .eq("status", "active")
        .gt("end_time", new Date().toISOString())
        .order("bid_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get featured auctions:", error);
      return [];
    }
  },

  /**
   * Get auction statistics (admin only)
   */
  async getAuctionStats() {
    try {
      // Total auctions
      const { count: totalAuctions } = await supabase
        .from("auctions")
        .select("*", { count: "exact", head: true });

      // Active auctions
      const { data: active } = await supabase
        .from("auctions")
        .select("*")
        .eq("status", "active");

      // Total bids
      const { count: totalBids } = await supabase
        .from("auction_bids")
        .select("*", { count: "exact", head: true });

      // Total auction value
      const { data: auctions } = await supabase
        .from("auctions")
        .select("current_price");

      const totalValue =
        auctions?.reduce((sum, a) => sum + a.current_price, 0) || 0;

      return {
        totalAuctions: totalAuctions || 0,
        activeAuctions: active?.length || 0,
        totalBids: totalBids || 0,
        totalValue,
        avgAuctionValue:
          totalAuctions && totalAuctions > 0
            ? totalValue / totalAuctions
            : 0,
      };
    } catch (error) {
      console.error("Failed to get auction stats:", error);
      return {
        totalAuctions: 0,
        activeAuctions: 0,
        totalBids: 0,
        totalValue: 0,
        avgAuctionValue: 0,
      };
    }
  },

  /**
   * Search auctions
   */
  async searchAuctions(query: string): Promise<Auction[]> {
    try {
      const { data, error } = await supabase
        .from("auctions")
        .select(
          `
          *,
          product:product_id(name, image_url)
        `
        )
        .eq("status", "active")
        .or(`product.name.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to search auctions:", error);
      return [];
    }
  },
};
