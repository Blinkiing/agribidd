import React, { createContext, useContext, useState, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: "buyer" | "seller" | "admin";
  walletBalance: number;
  createdAt: string;
  verified: boolean;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: "yoco" | "bank";
  status: "pending" | "verified" | "rejected";
  reference: string;
  depositSlip?: string; // for bank transfers
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string; // admin who verified
}

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  commission: number; // 10.5%
  netAmount: number; // amount after commission
  status: "pending" | "processing" | "completed" | "refunded";
  orderId: string;
  productName: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  deposits: Deposit[];
  escrowTransactions: EscrowTransaction[];
  loginUser: (userId: string) => void;
  logoutUser: () => void;
  createDeposit: (userId: string, amount: number, method: "yoco" | "bank", reference: string, depositSlip?: string) => void;
  verifyDeposit: (depositId: string, adminId: string) => void;
  rejectDeposit: (depositId: string, adminId: string) => void;
  creditUserBalance: (userId: string, amount: number, adminId: string, reason: string) => void;
  createEscrowTransaction: (buyerId: string, sellerId: string, amount: number, orderId: string, productName: string) => void;
  releaseEscrowFunds: (escrowId: string, adminId: string) => void;
  refundEscrow: (escrowId: string, reason: string) => void;
  getUserById: (userId: string) => User | undefined;
  getDepositsByUser: (userId: string) => Deposit[];
  getEscrowByOrder: (orderId: string) => EscrowTransaction | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock initial data
const mockUsers: User[] = [
  {
    id: "USER-001",
    name: "John Buyer",
    email: "john@example.com",
    phone: "+27721234567",
    accountType: "buyer",
    walletBalance: 1500,
    createdAt: "2026-01-15",
    verified: true,
  },
  {
    id: "USER-002",
    name: "Mary Seller",
    email: "mary@example.com",
    phone: "+27721234568",
    accountType: "seller",
    walletBalance: 5000,
    createdAt: "2025-11-20",
    verified: true,
  },
  {
    id: "USER-003",
    name: "Ahmed Customer",
    email: "ahmed@example.com",
    phone: "+27721234569",
    accountType: "buyer",
    walletBalance: 300,
    createdAt: "2026-03-01",
    verified: false,
  },
];

const mockDeposits: Deposit[] = [
  {
    id: "DEP-001",
    userId: "USER-001",
    amount: 1500,
    method: "yoco",
    status: "verified",
    reference: "YOCO-2026-03-15-001",
    createdAt: "2026-03-15",
    verifiedAt: "2026-03-15",
    verifiedBy: "ADMIN-001",
  },
  {
    id: "DEP-002",
    userId: "USER-003",
    amount: 500,
    method: "bank",
    status: "pending",
    reference: "BANK-TRANSFER-2026-03-22",
    depositSlip: "data:image/jpeg;base64,/9j/4AAQ...",
    createdAt: "2026-03-22",
  },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [deposits, setDeposits] = useState<Deposit[]>(mockDeposits);
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);

  const loginUser = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  }, [users]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const createDeposit = useCallback(
    (userId: string, amount: number, method: "yoco" | "bank", reference: string, depositSlip?: string) => {
      const newDeposit: Deposit = {
        id: `DEP-${Date.now()}`,
        userId,
        amount,
        method,
        status: "pending",
        reference,
        depositSlip,
        createdAt: new Date().toISOString(),
      };
      setDeposits((prev) => [...prev, newDeposit]);
    },
    []
  );

  const creditUserBalance = useCallback(
    (userId: string, amount: number, adminId: string, reason: string) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, walletBalance: u.walletBalance + amount } : u
        )
      );

      // Update current user if it's the logged-in user
      if (currentUser?.id === userId) {
        setCurrentUser((prev) =>
          prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null
        );
      }
    },
    [currentUser]
  );

  const verifyDeposit = useCallback(
    (depositId: string, adminId: string) => {
      setDeposits((prev) =>
        prev.map((d) =>
          d.id === depositId
            ? {
                ...d,
                status: "verified",
                verifiedAt: new Date().toISOString(),
                verifiedBy: adminId,
              }
            : d
        )
      );

      // Auto-credit user wallet
      const deposit = deposits.find((d) => d.id === depositId);
      if (deposit) {
        creditUserBalance(deposit.userId, deposit.amount, adminId, `Deposit verified: ${deposit.reference}`);
      }
    },
    [deposits, creditUserBalance]
  );

  const rejectDeposit = useCallback((depositId: string, adminId: string) => {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              status: "rejected",
              verifiedAt: new Date().toISOString(),
              verifiedBy: adminId,
            }
          : d
      )
    );
  }, []);

  const createEscrowTransaction = useCallback(
    (buyerId: string, sellerId: string, amount: number, orderId: string, productName: string) => {
      const commission = amount * 0.105; // 10.5%
      const netAmount = amount - commission;

      const newEscrow: EscrowTransaction = {
        id: `ESC-${Date.now()}`,
        buyerId,
        buyerName: users.find((u) => u.id === buyerId)?.name || "Unknown",
        sellerId,
        sellerName: users.find((u) => u.id === sellerId)?.name || "Unknown",
        amount,
        commission,
        netAmount,
        status: "pending",
        orderId,
        productName,
        createdAt: new Date().toISOString(),
        notes: `Escrow for ${productName}`,
      };

      setEscrowTransactions((prev) => [...prev, newEscrow]);
    },
    [users]
  );

  const releaseEscrowFunds = useCallback(
    (escrowId: string, adminId: string) => {
      const escrow = escrowTransactions.find((e) => e.id === escrowId);
      if (!escrow) return;

      // Update escrow status
      setEscrowTransactions((prev) =>
        prev.map((e) =>
          e.id === escrowId
            ? {
                ...e,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : e
        )
      );

      // Credit seller with net amount
      creditUserBalance(escrow.sellerId, escrow.netAmount, adminId, `Escrow release: ${escrow.id}`);
    },
    [escrowTransactions, creditUserBalance]
  );

  const refundEscrow = useCallback(
    (escrowId: string, reason: string) => {
      const escrow = escrowTransactions.find((e) => e.id === escrowId);
      if (!escrow) return;

      // Update escrow status
      setEscrowTransactions((prev) =>
        prev.map((e) =>
          e.id === escrowId
            ? {
                ...e,
                status: "refunded",
                completedAt: new Date().toISOString(),
                notes: reason,
              }
            : e
        )
      );

      // Refund buyer
      creditUserBalance(escrow.buyerId, escrow.amount, "SYSTEM", `Escrow refunded: ${reason}`);
    },
    [escrowTransactions, creditUserBalance]
  );

  const getUserById = useCallback((userId: string) => {
    return users.find((u) => u.id === userId);
  }, [users]);

  const getDepositsByUser = useCallback((userId: string) => {
    return deposits.filter((d) => d.userId === userId);
  }, [deposits]);

  const getEscrowByOrder = useCallback(
    (orderId: string) => {
      return escrowTransactions.find((e) => e.orderId === orderId);
    },
    [escrowTransactions]
  );

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        deposits,
        escrowTransactions,
        loginUser,
        logoutUser,
        createDeposit,
        verifyDeposit,
        rejectDeposit,
        creditUserBalance,
        createEscrowTransaction,
        releaseEscrowFunds,
        refundEscrow,
        getUserById,
        getDepositsByUser,
        getEscrowByOrder,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
