import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatZAR } from "@/lib/data";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

const EscrowManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, escrowTransactions } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  if (!currentUser) {
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please sign in to view escrow transactions</p>
            <Button onClick={() => navigate(`/login?redirectTo=${redirectTo}`)}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  // Filter escrow transactions for current user (as buyer or seller)
  const userEscrows = escrowTransactions.filter(
    (e) => e.buyerId === currentUser.id || e.sellerId === currentUser.id
  );

  const filteredEscrows = filterStatus === "all" ? userEscrows : userEscrows.filter((e) => e.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; icon: React.ElementType }> = {
      pending: { bg: "bg-yellow-50 text-yellow-900 border-yellow-200", icon: Clock },
      processing: { bg: "bg-blue-50 text-blue-900 border-blue-200", icon: AlertCircle },
      completed: { bg: "bg-harvest/10 text-harvest border-harvest/20", icon: CheckCircle2 },
      refunded: { bg: "bg-red-50 text-red-900 border-red-200", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Escrow Management</h1>
              <p className="text-muted-foreground">Track and manage secure transactions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Escrow", value: filteredEscrows.reduce((sum, e) => sum + e.amount, 0) },
              { label: "Pending", value: filteredEscrows.filter((e) => e.status === "pending").length },
              { label: "Completed", value: filteredEscrows.filter((e) => e.status === "completed").length },
              { label: "Commission Paid", value: filteredEscrows.reduce((sum, e) => sum + e.commission, 0) },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {typeof stat.value === "number" && stat.label.includes("Escrow")
                    ? formatZAR(stat.value)
                    : typeof stat.value === "number" && stat.label.includes("Commission")
                    ? formatZAR(stat.value)
                    : stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {["all", "pending", "processing", "completed", "refunded"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Escrow List */}
          {filteredEscrows.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-12 text-center"
            >
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No escrow transactions found</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredEscrows.map((escrow) => (
                <motion.div
                  key={escrow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Order Info */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                      <p className="font-mono font-semibold text-foreground text-sm">{escrow.orderId}</p>
                      <p className="text-xs text-muted-foreground mt-1">{escrow.productName}</p>
                    </div>

                    {/* Buyer Info */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Buyer</p>
                      <p className="font-semibold text-foreground">{escrow.buyerName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{escrow.buyerId}</p>
                    </div>

                    {/* Seller Info */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Seller</p>
                      <p className="font-semibold text-foreground">{escrow.sellerName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{escrow.sellerId}</p>
                    </div>

                    {/* Amount Breakdown */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount Breakdown</p>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-foreground">{formatZAR(escrow.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Commission (10.5%): {formatZAR(escrow.commission)}
                        </p>
                        <p className="text-xs text-harvest font-semibold">
                          Net: {formatZAR(escrow.netAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <div>{getStatusBadge(escrow.status)}</div>
                      <div className="text-xs text-muted-foreground text-right">
                        <p>{new Date(escrow.createdAt).toLocaleDateString()}</p>
                        {escrow.completedAt && (
                          <p className="text-harvest font-semibold">
                            Released: {new Date(escrow.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {escrow.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">Notes:</p>
                      <p className="text-sm text-foreground">{escrow.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscrowManagement;
