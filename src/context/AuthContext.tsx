import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "@/lib/auth";

// ─── Order & Dispute Interfaces ─────────────────────────────────────────
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  orderId: string;
  productName: string;
  quantity: number;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  deliveredAt?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  description: string;
  status: "open" | "in_review" | "resolved" | "closed";
  evidence?: string[];
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Seller Financial Interfaces ───────────────────────────────────────
export interface SellerFinance {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayouts: number;
  completedPayouts: number;
  lastUpdated: string;
}

export interface TaxRecord {
  id: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  year: number;
  revenue: number;
  expenses: number;
  taxableIncome: number;
  taxRate: number; // percentage
  taxAmount: number;
  status: "pending" | "filed" | "paid";
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  salary?: number;
  status: "active" | "inactive";
}

export interface LoansApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  tenure: number; // months
  interestRate: number;
  status: "pending" | "approved" | "rejected" | "active" | "completed";
  createdAt: string;
  approvedAt?: string;
}

// ─── Main Extended User Interface ───────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: "buyer" | "seller" | "admin";
  walletBalance: number;
  createdAt: string;
  verified: boolean;
  // Seller specific fields
  businessName?: string;
  businessLocation?: string;
  businessLogo?: string;
  // Financial fields
  finances?: SellerFinance;
  taxRecords?: TaxRecord[];
  employees?: Employee[];
  // For tracking  
  orders?: Order[];
  disputes?: Dispute[];
  loanApplications?: LoansApplication[];
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: "yoco" | "bank";
  status: "pending" | "verified" | "rejected";
  reference: string;
  depositSlip?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: "pending" | "processing" | "completed" | "refunded";
  orderId: string;
  productName: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  deposits: Deposit[];
  escrowTransactions: EscrowTransaction[];
  orders: Order[];
  disputes: Dispute[];
  loanApplications: LoansApplication[];
  isLoading: boolean;
  // Auth functions
  logoutUser: () => Promise<void>;
  // User functions
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  // Order functions
  createOrder: (buyerId: string, sellerId: string, productName: string, quantity: number, amount: number) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  // Dispute functions
  createDispute: (orderId: string, buyerId: string, sellerId: string, reason: string, description: string) => void;
  updateDisputeStatus: (disputeId: string, status: Dispute["status"], resolution?: string) => void;
  // Financial functions
  getSellerFinances: (userId: string) => SellerFinance | undefined;
  addTaxRecord: (userId: string, record: Omit<TaxRecord, "id" | "createdAt">) => void;
  calculateTax: (userId: string, revenue: number, expenses: number) => number;
  // Employee functions
  addEmployee: (userId: string, employee: Omit<Employee, "id">) => void;
  removeEmployee: (userId: string, employeeId: string) => void;
  // Loan functions
  applyForLoan: (userId: string, amount: number, purpose: string, tenure: number) => void;
  updateLoanStatus: (loanId: string, status: LoansApplication["status"]) => void;
  // Deposit functions
  createDeposit: (userId: string, amount: number, method: "yoco" | "bank", reference: string, depositSlip?: string) => void;
  verifyDeposit: (depositId: string, adminId: string) => void;
  rejectDeposit: (depositId: string, adminId: string) => void;
  creditUserBalance: (userId: string, amount: number, adminId: string, reason: string) => void;
  // Escrow functions
  createEscrowTransaction: (buyerId: string, sellerId: string, amount: number, orderId: string, productName: string) => void;
  releaseEscrowFunds: (escrowId: string, adminId: string) => void;
  refundEscrow: (escrowId: string, reason: string) => void;
  // Query functions
  getUserById: (userId: string) => User | undefined;
  getDepositsByUser: (userId: string) => Deposit[];
  getEscrowByOrder: (orderId: string) => EscrowTransaction | undefined;
  getOrdersByUser: (userId: string) => Order[];
  getDisputesByUser: (userId: string) => Dispute[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Initial Data ──────────────────────────────────────────────────
// Empty state - no mock data
const initialDeposits: Deposit[] = [];
const initialOrders: Order[] = [];
const initialDisputes: Dispute[] = [];
const initialLoanApplications: LoansApplication[] = [];
const initialEscrowTransactions: EscrowTransaction[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>(initialEscrowTransactions);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes);
  const [loanApplications, setLoanApplications] = useState<LoansApplication[]>(initialLoanApplications);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          // Convert from authService UserProfile to our User interface
          setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            accountType: user.accountType,
            walletBalance: user.walletBalance,
            createdAt: user.createdAt,
            verified: user.verified,
            businessName: user.businessName,
            businessLocation: user.businessLocation,
            businessLogo: user.businessLogo,
            orders: [],
            disputes: [],
            loanApplications: [],
          });
          // Add user to users list if not already there
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === user.id);
            if (!exists) {
              return [
                ...prev,
                {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone || "",
                  accountType: user.accountType,
                  walletBalance: user.walletBalance,
                  createdAt: user.createdAt,
                  verified: user.verified,
                  businessName: user.businessName,
                  businessLocation: user.businessLocation,
                  businessLogo: user.businessLogo,
                  orders: [],
                  disputes: [],
                  loanApplications: [],
                },
              ];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes - this will trigger on sign-in
    const subscription = authService.onAuthStateChange(async (user) => {
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          accountType: user.accountType,
          walletBalance: user.walletBalance,
          createdAt: user.createdAt,
          verified: user.verified,
          businessName: user.businessName,
          businessLocation: user.businessLocation,
          businessLogo: user.businessLogo,
          orders: [],
          disputes: [],
          loanApplications: [],
        });
        // Also add to users list
        setUsers((prev) => {
          const exists = prev.some((u) => u.id === user.id);
          if (!exists) {
            return [
              ...prev,
              {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                accountType: user.accountType,
                walletBalance: user.walletBalance,
                createdAt: user.createdAt,
                verified: user.verified,
                businessName: user.businessName,
                businessLocation: user.businessLocation,
                businessLogo: user.businessLogo,
                orders: [],
                disputes: [],
                loanApplications: [],
              },
            ];
          }
          return prev;
        });
      } else {
        setCurrentUser(null);
      }
    });

    initializeAuth();

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const logoutUser = useCallback(async () => {
    await authService.signOut();
    setCurrentUser(null);
  }, []);

  const updateUserProfile = useCallback((userId: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  }, [currentUser]);

  const createOrder = useCallback(
    (buyerId: string, sellerId: string, productName: string, quantity: number, amount: number) => {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        buyerId,
        sellerId,
        orderId: `ORD-${Date.now()}`,
        productName,
        quantity,
        amount,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [...prev, newOrder]);
    },
    []
  );

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, deliveredAt: status === "delivered" ? new Date().toISOString() : o.deliveredAt }
          : o
      )
    );
  }, []);

  const createDispute = useCallback(
    (orderId: string, buyerId: string, sellerId: string, reason: string, description: string) => {
      const newDispute: Dispute = {
        id: `DSP-${Date.now()}`,
        orderId,
        buyerId,
        sellerId,
        reason,
        description,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDisputes((prev) => [...prev, newDispute]);
    },
    []
  );

  const updateDisputeStatus = useCallback(
    (disputeId: string, status: Dispute["status"], resolution?: string) => {
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? { ...d, status, resolution, updatedAt: new Date().toISOString() }
            : d
        )
      );
    },
    []
  );

  const getSellerFinances = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId);
      return user?.finances;
    },
    [users]
  );

  const addTaxRecord = useCallback(
    (userId: string, record: Omit<TaxRecord, "id" | "createdAt">) => {
      const newRecord: TaxRecord = {
        ...record,
        id: `TAX-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                taxRecords: [...(u.taxRecords || []), newRecord],
              }
            : u
        )
      );
    },
    []
  );

  const calculateTax = useCallback(
    (userId: string, revenue: number, expenses: number) => {
      const taxableIncome = revenue - expenses;
      // Simple tax rate: 28% for sellers
      return taxableIncome * 0.28;
    },
    []
  );

  const addEmployee = useCallback(
    (userId: string, employee: Omit<Employee, "id">) => {
      const newEmployee: Employee = {
        ...employee,
        id: `EMP-${Date.now()}`,
      };
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                employees: [...(u.employees || []), newEmployee],
              }
            : u
        )
      );
    },
    []
  );

  const removeEmployee = useCallback((userId: string, employeeId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              employees: u.employees?.filter((e) => e.id !== employeeId) || [],
            }
          : u
      )
    );
  }, []);

  const applyForLoan = useCallback(
    (userId: string, amount: number, purpose: string, tenure: number) => {
      const newLoan: LoansApplication = {
        id: `LOAN-${Date.now()}`,
        userId,
        amount,
        purpose,
        tenure,
        interestRate: 12, // 12% annual interest
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setLoanApplications((prev) => [...prev, newLoan]);
    },
    []
  );

  const updateLoanStatus = useCallback(
    (loanId: string, status: LoansApplication["status"]) => {
      setLoanApplications((prev) =>
        prev.map((l) =>
          l.id === loanId
            ? { ...l, status, approvedAt: status === "approved" ? new Date().toISOString() : l.approvedAt }
            : l
        )
      );
    },
    []
  );

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
      const commission = amount * 0.105;
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

      creditUserBalance(escrow.sellerId, escrow.netAmount, adminId, `Escrow release: ${escrow.id}`);
    },
    [escrowTransactions, creditUserBalance]
  );

  const refundEscrow = useCallback(
    (escrowId: string, reason: string) => {
      const escrow = escrowTransactions.find((e) => e.id === escrowId);
      if (!escrow) return;

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

      creditUserBalance(escrow.buyerId, escrow.amount, "SYSTEM", `Escrow refunded: ${reason}`);
    },
    [escrowTransactions, creditUserBalance]
  );

  const getUserById = useCallback(
    (userId: string) => {
      return users.find((u) => u.id === userId);
    },
    [users]
  );

  const getDepositsByUser = useCallback(
    (userId: string) => {
      return deposits.filter((d) => d.userId === userId);
    },
    [deposits]
  );

  const getEscrowByOrder = useCallback(
    (orderId: string) => {
      return escrowTransactions.find((e) => e.orderId === orderId);
    },
    [escrowTransactions]
  );

  const getOrdersByUser = useCallback(
    (userId: string) => {
      return orders.filter((o) => o.buyerId === userId || o.sellerId === userId);
    },
    [orders]
  );

  const getDisputesByUser = useCallback(
    (userId: string) => {
      return disputes.filter((d) => d.buyerId === userId || d.sellerId === userId);
    },
    [disputes]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        deposits,
        escrowTransactions,
        orders,
        disputes,
        loanApplications,
        isLoading,
        logoutUser,
        updateUserProfile,
        createOrder,
        updateOrderStatus,
        createDispute,
        updateDisputeStatus,
        getSellerFinances,
        addTaxRecord,
        calculateTax,
        addEmployee,
        removeEmployee,
        applyForLoan,
        updateLoanStatus,
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
        getOrdersByUser,
        getDisputesByUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
