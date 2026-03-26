import React, { createContext, useContext, useState, useCallback } from "react";

export interface Transaction {
  id: string;
  type: "topup" | "payment" | "refund" | "escrow_hold" | "escrow_release" | "bank_deposit";
  amount: number;
  timestamp: string;
  description: string;
  status: "completed" | "pending" | "failed";
  orderId?: string;
  paymentMethod?: "yoco" | "bank_deposit";
  reference?: string;
  screenshotUrl?: string;
}

interface WalletContextType {
  balance: number;
  escrowBalance: number;
  transactions: Transaction[];
  topupWallet: (amount: number, transactionId: string, paymentMethod?: string) => void;
  addBankDeposit: (amount: number, reference: string, screenshotUrl: string) => void;
  deductFromWallet: (amount: number, orderId: string, description: string) => boolean;
  addTransaction: (transaction: Transaction) => void;
  getTransactionHistory: () => Transaction[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(1500.00); // Mock initial balance
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "t1",
      type: "topup",
      amount: 1500,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Card payment via Yoco",
      status: "completed",
      paymentMethod: "yoco",
    },
  ]);

  const topupWallet = useCallback((amount: number, transactionId: string, paymentMethod: string = "yoco") => {
    setBalance((prev) => prev + amount);
    setTransactions((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        type: "topup",
        amount,
        timestamp: new Date().toISOString(),
        description: `Wallet top-up via ${paymentMethod === "yoco" ? "Yoco Card" : "Bank Transfer"}`,
        status: "completed",
        paymentMethod: paymentMethod as "yoco" | "bank_deposit",
        reference: transactionId,
      },
    ]);
  }, []);

  const addBankDeposit = useCallback(
    (amount: number, reference: string, screenshotUrl: string) => {
      setTransactions((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          type: "bank_deposit",
          amount,
          timestamp: new Date().toISOString(),
          description: "Bank deposit awaiting verification",
          status: "pending",
          paymentMethod: "bank_deposit",
          reference,
          screenshotUrl,
        },
      ]);
    },
    []
  );

  const deductFromWallet = useCallback(
    (amount: number, orderId: string, description: string) => {
      if (balance >= amount) {
        setBalance((prev) => prev - amount);
        setEscrowBalance((prev) => prev + amount);
        setTransactions((prev) => [
          ...prev,
          {
            id: `t-${Date.now()}`,
            type: "payment",
            amount,
            timestamp: new Date().toISOString(),
            description,
            status: "completed",
            orderId,
          },
        ]);
        return true;
      }
      return false;
    },
    [balance]
  );

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  }, []);

  const getTransactionHistory = useCallback(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [transactions]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        escrowBalance,
        transactions,
        topupWallet,
        addBankDeposit,
        deductFromWallet,
        addTransaction,
        getTransactionHistory,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};
