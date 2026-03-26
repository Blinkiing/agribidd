import { supabase } from "./supabase";

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface OrderCreateInput {
  buyer_id: string;
  seller_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Order Management Service
 * Handles order CRUD operations and workflow
 */
export const orderService = {
  /**
   * Create new order
   */
  async createOrder(orderData: OrderCreateInput) {
    try {
      // Calculate total
      const amount = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            buyer_id: orderData.buyer_id,
            seller_id: orderData.seller_id,
            amount,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const itemRecords = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemRecords);

      if (itemsError) throw itemsError;

      // Create escrow transaction
      const { error: escrowError } = await supabase
        .from("escrow_transactions")
        .insert([
          {
            order_id: order.id,
            buyer_id: orderData.buyer_id,
            seller_id: orderData.seller_id,
            amount,
            status: "held",
            hold_reason: "pending_delivery",
          },
        ]);

      if (escrowError) throw escrowError;

      return order;
    } catch (error) {
      throw new Error(
        `Failed to create order: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get order by ID with items
   */
  async getOrderById(orderId: string) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:product_id(name, price, image_url)
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get order:", error);
      return null;
    }
  },

  /**
   * Get buyer's orders
   */
  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:product_id(name, price, image_url)
          ),
          seller:seller_id(name, business_name)
        `
        )
        .eq("buyer_id", buyerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get buyer orders:", error);
      return [];
    }
  },

  /**
   * Get seller's orders
   */
  async getSellerOrders(sellerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:product_id(name, price, image_url)
          ),
          buyer:buyer_id(name, email)
        `
        )
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get seller orders:", error);
      return [];
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  ) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;

      // If delivered, release escrow
      if (status === "delivered") {
        await supabase
          .from("escrow_transactions")
          .update({
            status: "released",
            released_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);
      }

      return data;
    } catch (error) {
      throw new Error(
        `Failed to update order status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string) {
    try {
      // Update order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Release escrow
      const { error: escrowError } = await supabase
        .from("escrow_transactions")
        .update({
          status: "refunded",
          release_reason: reason,
          released_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (escrowError) throw escrowError;

      // Refund buyer
      await supabase.rpc("update_wallet_balance", {
        p_user_id: order.buyer_id,
        p_amount: order.amount,
      });

      return order;
    } catch (error) {
      throw new Error(
        `Failed to cancel order: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get order statistics
   */
  async getOrderStats() {
    try {
      // Total orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Orders by status
      const { data: orders } = await supabase.from("orders").select("status");

      const statusCounts = {
        pending: orders?.filter((o) => o.status === "pending").length || 0,
        confirmed: orders?.filter((o) => o.status === "confirmed").length || 0,
        shipped: orders?.filter((o) => o.status === "shipped").length || 0,
        delivered: orders?.filter((o) => o.status === "delivered").length || 0,
        cancelled: orders?.filter((o) => o.status === "cancelled").length || 0,
      };

      // Total revenue
      const { data: revenueData } = await supabase
        .from("orders")
        .select("amount")
        .eq("status", "delivered");

      const totalRevenue =
        revenueData?.reduce((sum, o) => sum + o.amount, 0) || 0;

      return {
        totalOrders: totalOrders || 0,
        statusCounts,
        totalRevenue,
        avgOrderValue:
          totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    } catch (error) {
      console.error("Failed to get order stats:", error);
      return {
        totalOrders: 0,
        statusCounts: {
          pending: 0,
          confirmed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        totalRevenue: 0,
        avgOrderValue: 0,
      };
    }
  },

  /**
   * Create dispute
   */
  async createDispute(
    orderId: string,
    raisedBy: string,
    reason: string,
    description: string
  ) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) throw new Error("Order not found");

      const { data, error } = await supabase
        .from("disputes")
        .insert([
          {
            order_id: orderId,
            buyer_id: order.buyer_id,
            seller_id: order.seller_id,
            raised_by: raisedBy,
            reason,
            description,
            status: "open",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to create dispute: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get order's dispute
   */
  async getOrderDispute(orderId: string) {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error?.code === "PGRST116") {
        // Not found
        return null;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get dispute:", error);
      return null;
    }
  },

  /**
   * Resolve dispute
   */
  async resolveDispute(
    disputeId: string,
    resolution: "buyer_wins" | "seller_wins" | "split",
    adminNotes: string
  ) {
    try {
      // Get dispute
      const { data: dispute, error: disputeError } = await supabase
        .from("disputes")
        .select("*")
        .eq("id", disputeId)
        .single();

      if (disputeError) throw disputeError;

      // Get order
      const order = await this.getOrderById(dispute.order_id);
      if (!order) throw new Error("Order not found");

      // Update dispute
      const { error: updateError } = await supabase
        .from("disputes")
        .update({
          status: "resolved",
          resolution,
          admin_notes: adminNotes,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", disputeId);

      if (updateError) throw updateError;

      // Handle refund based on resolution
      if (resolution === "buyer_wins") {
        // Full refund to buyer
        await supabase.rpc("update_wallet_balance", {
          p_user_id: dispute.buyer_id,
          p_amount: order.amount,
        });
      } else if (resolution === "split") {
        // Split refund
        const halfAmount = order.amount / 2;
        await supabase.rpc("update_wallet_balance", {
          p_user_id: dispute.buyer_id,
          p_amount: halfAmount,
        });
        await supabase.rpc("update_wallet_balance", {
          p_user_id: dispute.seller_id,
          p_amount: halfAmount,
        });
      }

      return dispute;
    } catch (error) {
      throw new Error(
        `Failed to resolve dispute: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
