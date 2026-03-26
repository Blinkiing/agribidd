import { supabase } from "./supabase";

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: "topup" | "payment" | "refund" | "withdrawal";
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  created_at: string;
  related_order_id?: string;
}

export interface DepositRecord {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

/**
 * Wallet Management Service
 * Handles wallet operations, deposits, and transactions
 */
export const walletService = {
  /**
   * Get wallet balance
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
   * Get wallet transactions
   */
  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get wallet transactions:", error);
      return [];
    }
  },

  /**
   * Create wallet transaction
   */
  async createTransaction(
    userId: string,
    transaction: Omit<WalletTransaction, "id" | "created_at">
  ) {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .insert([
          {
            user_id: userId,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            description: transaction.description,
            related_order_id: transaction.related_order_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        `Failed to create transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Add funds to wallet (topup)
   */
  async addFunds(userId: string, amount: number, paymentMethod: string) {
    try {
      // Create transaction record
      const { data: transaction, error: transError } = await supabase
        .from("wallet_transactions")
        .insert([
          {
            user_id: userId,
            type: "topup",
            amount,
            status: "completed",
            description: `Wallet top-up via ${paymentMethod}`,
          },
        ])
        .select()
        .single();

      if (transError) throw transError;

      // Update wallet balance
      const { error: updateError } = await supabase.rpc(
        "update_wallet_balance",
        {
          p_user_id: userId,
          p_amount: amount,
        }
      );

      if (updateError) throw updateError;

      // Create deposit record
      await supabase.from("deposits").insert([
        {
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          transaction_id: transaction.id,
          status: "completed",
        },
      ]);

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to add funds: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Deduct funds from wallet
   */
  async deductFunds(
    userId: string,
    amount: number,
    reason: string,
    orderId?: string
  ) {
    try {
      // Check balance first
      const balance = await this.getWalletBalance(userId);
      if (balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      // Create transaction record
      const { data: transaction, error: transError } = await supabase
        .from("wallet_transactions")
        .insert([
          {
            user_id: userId,
            type: "payment",
            amount,
            status: "completed",
            description: reason,
            related_order_id: orderId,
          },
        ])
        .select()
        .single();

      if (transError) throw transError;

      // Update wallet balance (negative amount)
      const { error: updateError } = await supabase.rpc(
        "update_wallet_balance",
        {
          p_user_id: userId,
          p_amount: -amount,
        }
      );

      if (updateError) throw updateError;

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to deduct funds: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Refund funds to wallet
   */
  async refundFunds(userId: string, amount: number, reason: string) {
    try {
      const { data: transaction, error: transError } = await supabase
        .from("wallet_transactions")
        .insert([
          {
            user_id: userId,
            type: "refund",
            amount,
            status: "completed",
            description: reason,
          },
        ])
        .select()
        .single();

      if (transError) throw transError;

      // Update wallet balance
      const { error: updateError } = await supabase.rpc(
        "update_wallet_balance",
        {
          p_user_id: userId,
          p_amount: amount,
        }
      );

      if (updateError) throw updateError;

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to refund funds: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Create withdrawal request
   */
  async requestWithdrawal(userId: string, amount: number, bankAccount: string) {
    try {
      // Check balance
      const balance = await this.getWalletBalance(userId);
      if (balance < amount) {
        throw new Error("Insufficient balance for withdrawal");
      }

      // Create transaction
      const { data: transaction, error: transError } = await supabase
        .from("wallet_transactions")
        .insert([
          {
            user_id: userId,
            type: "withdrawal",
            amount,
            status: "pending",
            description: `Withdrawal to bank account ending in ${bankAccount.slice(-4)}`,
          },
        ])
        .select()
        .single();

      if (transError) throw transError;

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to request withdrawal: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Process withdrawal (admin only)
   */
  async processWithdrawal(transactionId: string, approve: boolean) {
    try {
      // Get transaction
      const { data: transaction, error: getError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (getError) throw getError;

      if (approve) {
        // Update transaction status
        const { error: updateError } = await supabase
          .from("wallet_transactions")
          .update({ status: "completed" })
          .eq("id", transactionId);

        if (updateError) throw updateError;

        // Deduct from wallet
        const { error: deductError } = await supabase.rpc(
          "update_wallet_balance",
          {
            p_user_id: transaction.user_id,
            p_amount: -transaction.amount,
          }
        );

        if (deductError) throw deductError;
      } else {
        // Reject withdrawal
        const { error: rejectError } = await supabase
          .from("wallet_transactions")
          .update({ status: "failed" })
          .eq("id", transactionId);

        if (rejectError) throw rejectError;
      }

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to process withdrawal: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Get deposit history
   */
  async getDepositHistory(userId: string): Promise<DepositRecord[]> {
    try {
      const { data, error } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get deposit history:", error);
      return [];
    }
  },

  /**
   * Get wallet statistics (admin only)
   */
  async getWalletStats() {
    try {
      // Total wallet balances
      const { data: users } = await supabase
        .from("users")
        .select("wallet_balance");

      const totalBalance = users?.reduce((sum, u) => sum + u.wallet_balance, 0) || 0;

      // Transaction stats
      const { data: transactions } = await supabase
        .from("wallet_transactions")
        .select("type, amount, status");

      const topups =
        transactions
          ?.filter((t) => t.type === "topup" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      const payments =
        transactions
          ?.filter((t) => t.type === "payment" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      const refunds =
        transactions
          ?.filter((t) => t.type === "refund" && t.status === "completed")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      return {
        totalBalance,
        totalUsers: users?.length || 0,
        avgBalance: users && users.length > 0 ? totalBalance / users.length : 0,
        topupAmount: topups,
        paymentAmount: payments,
        refundAmount: refunds,
        transactionCount: transactions?.length || 0,
      };
    } catch (error) {
      console.error("Failed to get wallet stats:", error);
      return {
        totalBalance: 0,
        totalUsers: 0,
        avgBalance: 0,
        topupAmount: 0,
        paymentAmount: 0,
        refundAmount: 0,
        transactionCount: 0,
      };
    }
  },

  /**
   * Batch deduct funds (for multiple users in settlement)
   */
  async batchDeductFunds(
    deductions: Array<{ userId: string; amount: number; reason: string }>
  ) {
    try {
      const results = [];

      for (const deduction of deductions) {
        try {
          const result = await this.deductFunds(
            deduction.userId,
            deduction.amount,
            deduction.reason
          );
          results.push({ success: true, userId: deduction.userId, ...result });
        } catch (error) {
          results.push({
            success: false,
            userId: deduction.userId,
            error:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(
        `Failed to batch deduct funds: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
