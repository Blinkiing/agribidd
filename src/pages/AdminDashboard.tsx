import React, { useState } from "react";
import { User, CreditCard, Settings, LogOut, BarChart3, Users, Wallet, TrendingUp, Shield, Upload, CheckCircle2, XCircle, Eye, Plus, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatZAR } from "@/lib/data";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import HeroAdmin from "@/components/HeroAdmin";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { users: contextUsers, deposits, escrowTransactions, verifyDeposit, rejectDeposit, creditUserBalance, releaseEscrowFunds, refundEscrow } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [depositFilter, setDepositFilter] = useState("all");
  const [escrowFilter, setEscrowFilter] = useState("all");
  const [selectedDepositSlip, setSelectedDepositSlip] = useState<string | null>(null);


  
  // Hero slides management state
  interface HeroSlide {
    id: string;
    title: string;
    highlight: string;
    subtitle: string;
    description: string;
    emoji: string;
    gradient: string;
    image_url: string;
    position: number;
    is_active: boolean;
  }
  
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loadingHeroSlides, setLoadingHeroSlides] = useState(false);
  const [submittingHeroSlides, setSubmittingHeroSlides] = useState(false);

  // Load hero slides on component mount
  React.useEffect(() => {
    loadHeroSlides();
  }, []);

  const loadHeroSlides = async () => {
    try {
      setLoadingHeroSlides(true);
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("position", { ascending: true });
      
      if (error) throw error;
      setHeroSlides(data || []);
    } catch (error) {
      console.error("Failed to load hero slides:", error);
      toast.error("Failed to load hero slides");
    } finally {
      setLoadingHeroSlides(false);
    }
  };

  const handleHeroSlidesUpdate = async (updatedSlides: HeroSlide[]) => {
    try {
      setSubmittingHeroSlides(true);
      
      // Identify new slides, updated slides, and deleted slides
      const newSlides = updatedSlides.filter(s => s.id.startsWith("hero-"));
      const existingSlides = updatedSlides.filter(s => !s.id.startsWith("hero-"));
      const deletedSlides = heroSlides.filter(orig => !updatedSlides.some(u => u.id === orig.id));

      // Delete removed slides
      if (deletedSlides.length > 0) {
        await supabase
          .from("hero_slides")
          .delete()
          .in("id", deletedSlides.map(s => s.id));
      }

      // Update existing slides
      for (const slide of existingSlides) {
        await supabase
          .from("hero_slides")
          .update({
            title: slide.title,
            highlight: slide.highlight,
            subtitle: slide.subtitle,
            description: slide.description,
            emoji: slide.emoji,
            gradient: slide.gradient,
            image_url: slide.image_url,
            position: slide.position,
            is_active: slide.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", slide.id);
      }

      // Insert new slides
      if (newSlides.length > 0) {
        await supabase
          .from("hero_slides")
          .insert(newSlides.map(s => ({
            title: s.title,
            highlight: s.highlight,
            subtitle: s.subtitle,
            description: s.description,
            emoji: s.emoji,
            gradient: s.gradient,
            image_url: s.image_url,
            position: s.position,
            is_active: s.is_active,
          })));
      }

      setHeroSlides(updatedSlides);
      toast.success("Hero slides updated successfully!");
    } catch (error) {
      console.error("Failed to update hero slides:", error);
      toast.error("Failed to update hero slides");
    } finally {
      setSubmittingHeroSlides(false);
    }
  };

  // Calculate admin stats from real data
  const totalEscrowBalance = escrowTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTxCommission = escrowTransactions.reduce((sum, tx) => sum + tx.commission, 0);
  
  const adminStats = {
    totalUsers: contextUsers.length,
    totalSellers: contextUsers.filter(u => u.accountType === "seller").length,
    totalTransactions: escrowTransactions.length,
    escrowBalance: totalEscrowBalance,
    platformBalance: totalTxCommission,
    monthlyRevenue: totalTxCommission * 1.2,
  };

  // Recent transactions from escrow
  const recentTransactions = escrowTransactions.slice(-3).map(tx => ({
    id: tx.id,
    user: contextUsers.find(u => u.id === tx.buyerId)?.name || "Unknown",
    type: "escrow",
    amount: tx.amount,
    status: tx.status,
    date: new Date().toISOString().split('T')[0],
  }));

  // Filter deposits
  const filteredDeposits = depositFilter === "all" 
    ? deposits 
    : deposits.filter(d => d.status === depositFilter);

  // Filter escrow
  const filteredEscrow = escrowFilter === "all"
    ? escrowTransactions
    : escrowTransactions.filter(tx => tx.status === escrowFilter);

  // Handle credit balance
  const handleCreditBalance = () => {
    if (!selectedUser || !creditAmount || !creditReason) {
      toast.error("Please fill all fields");
      return;
    }
    creditUserBalance(selectedUser, parseFloat(creditAmount), "ADMIN-001", creditReason);
    toast.success(`Credited ${formatZAR(parseFloat(creditAmount))} to user ${selectedUser}`);
    setSelectedUser("");
    setCreditAmount("");
    setCreditReason("");
  };

  // Handle deposit verification
  const handleVerifyDeposit = (depositId: string) => {
    verifyDeposit(depositId, "ADMIN-001");
    toast.success("Deposit verified and wallet credited");
  };

  // Handle deposit rejection
  const handleRejectDeposit = (depositId: string) => {
    rejectDeposit(depositId, "ADMIN-001");
    toast.success("Deposit rejected");
  };

  // Handle escrow release
  const handleReleaseEscrow = (escrowId: string) => {
    releaseEscrowFunds(escrowId, "ADMIN-001");
    toast.success("Escrow funds released to seller");
  };

  // Handle escrow refund
  const handleRefundEscrow = (escrowId: string) => {
    refundEscrow(escrowId, "Admin refund requested");
    toast.success("Escrow refunded to buyer");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Admin Navbar */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Users", value: adminStats.totalUsers, icon: Users, color: "text-blue-500" },
            { label: "Active Sellers", value: adminStats.totalSellers, icon: User, color: "text-harvest" },
            { label: "Transactions", value: adminStats.totalTransactions, icon: TrendingUp, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-harvest/10 to-harvest/5 border border-harvest/20 rounded-lg p-6"
          >
            <p className="text-muted-foreground text-sm">Escrow Wallet</p>
            <p className="text-3xl font-bold text-harvest mt-2">{formatZAR(adminStats.escrowBalance)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6"
          >
            <p className="text-muted-foreground text-sm">Platform Balance</p>
            <p className="text-3xl font-bold text-primary mt-2">{formatZAR(adminStats.platformBalance)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <p className="text-muted-foreground text-sm">Monthly Revenue</p>
            <p className="text-3xl font-bold text-foreground mt-2">{formatZAR(adminStats.monthlyRevenue)}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="deposits" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Deposits</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sellers</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>

            <TabsTrigger value="hero" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="escrow" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Escrow</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Tx</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Platform Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span>Total GMV (Gross Merchandise Volume)</span>
                  <span className="font-bold text-foreground">{formatZAR(escrowTransactions.reduce((sum, tx) => sum + tx.amount, 0))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span>Platform Commission (10.5%)</span>
                  <span className="font-bold text-primary">{formatZAR(escrowTransactions.reduce((sum, tx) => sum + tx.commission, 0))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span>Average Order Value</span>
                  <span className="font-bold text-foreground">{escrowTransactions.length > 0 ? formatZAR(escrowTransactions.reduce((sum, tx) => sum + tx.amount, 0) / escrowTransactions.length) : formatZAR(0)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits" className="mt-6">
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2">
                {["all", "pending", "verified", "rejected"].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={depositFilter === status ? "default" : "outline"}
                    onClick={() => setDepositFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {/* Deposits List */}
              {filteredDeposits.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No deposits found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDeposits.map(deposit => {
                    const user = contextUsers.find(u => u.id === deposit.userId);
                    return (
                      <div key={deposit.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-foreground">{user?.name || "Unknown"}</p>
                              <span className={`text-xs px-2 py-1 rounded ${deposit.status === "verified" ? "bg-harvest/20 text-harvest" : deposit.status === "rejected" ? "bg-red-500/20 text-red-600" : "bg-yellow-500/20 text-yellow-600"}`}>
                                {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              User ID: <span className="font-mono text-foreground">{deposit.userId}</span> • Reference: <span className="font-mono text-foreground">{deposit.reference}</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Method: {deposit.method === "yoco" ? "Yoco Card" : "Bank Transfer"} • Amount: {formatZAR(deposit.amount)}
                            </p>
                            {deposit.depositSlip && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-2 gap-1 text-xs"
                                onClick={() => setSelectedDepositSlip(selectedDepositSlip === deposit.id ? null : deposit.id)}
                              >
                                <Eye className="h-3 w-3" />
                                {selectedDepositSlip === deposit.id ? "Hide Slip" : "View Slip"}
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {deposit.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleVerifyDeposit(deposit.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Verify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectDeposit(deposit.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {selectedDepositSlip === deposit.id && deposit.depositSlip && (
                          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Deposit Slip Preview:</p>
                            <p className="text-sm font-mono text-foreground">{deposit.depositSlip}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              {/* Credit Balance Form */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Manual Credit Balance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Select User</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none"
                    >
                      <option value="">Choose a user...</option>
                      {contextUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.id}) - {user.accountType}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Amount (ZAR)</label>
                    <Input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Reason</label>
                    <Input
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder="e.g., Refund, Adjustment, Bonus"
                    />
                  </div>
                  <Button onClick={handleCreditBalance} className="w-full">
                    Credit Balance
                  </Button>
                </div>
              </div>

              {/* Users List */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">All Users</h2>
                </div>
                <div className="divide-y divide-border">
                  {contextUsers.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs font-mono text-primary font-semibold mt-1">Ref: {user.id}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-muted-foreground capitalize">Type: {user.accountType}</span>
                            <span className={`${user.verified ? "text-harvest" : "text-yellow-600"}`}>
                              {user.verified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">Wallet: {formatZAR(user.walletBalance)}</p>
                          <p className="text-xs text-muted-foreground">Phone: {user.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sellers Verification Tab */}
          <TabsContent value="sellers" className="mt-6">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-harvest/10 to-primary/10 border border-harvest/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">Seller Verification Management</h3>
                <p className="text-sm text-muted-foreground">Review and approve seller registrations to prevent fraud</p>
              </div>

              {/* Pending Sellers List */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">Pending Verification</h2>
                  <p className="text-xs text-muted-foreground mt-1">Sellers awaiting approval</p>
                </div>
                <div className="divide-y divide-border">
                  {/* Sample pending seller - in production this would come from data */}
                  <motion.div 
                    className="p-4 hover:bg-secondary/30 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Green Valley Farm</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: seller-1234567890</p>
                        <p className="text-sm text-muted-foreground mt-1">Owner: John Doe | ID: 1234567890123</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-muted-foreground">📍 Limpopo, SA</span>
                          <span className="text-muted-foreground">📧 john@greenvalley.co.za</span>
                          <span className="text-harvest font-semibold">⏳ Status: Pending</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => {
                            toast.success("Seller approved!");
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            toast.error("Seller rejected!");
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Approved Sellers List */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border bg-gradient-to-r from-forest/5 to-transparent">
                  <h2 className="text-xl font-semibold text-foreground">Verified Sellers</h2>
                  <p className="text-xs text-muted-foreground mt-1">Approved and active sellers</p>
                </div>
                <div className="divide-y divide-border">
                  <motion.div 
                    className="p-4 hover:bg-secondary/30 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          Sunrise Orchards
                          <CheckCircle2 className="h-4 w-4 text-forest-light" />
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: v2</p>
                        <p className="text-sm text-muted-foreground mt-1">Owner: Sarah Smith | Verified: 2024-03-20</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-muted-foreground">📍 Mpumalanga, SA</span>
                          <span className="text-forest-light font-semibold">✓ Verified</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Escrow Tab */}
          <TabsContent value="escrow" className="mt-6">
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "processing", "completed", "refunded"].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={escrowFilter === status ? "default" : "outline"}
                    onClick={() => setEscrowFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {/* Escrow List */}
              {filteredEscrow.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No escrow transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEscrow.map(tx => {
                    const buyer = contextUsers.find(u => u.id === tx.buyerId);
                    const seller = contextUsers.find(u => u.id === tx.sellerId);
                    return (
                      <div key={tx.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{tx.productName}</p>
                              <p className="text-xs text-muted-foreground">Order: {tx.orderId}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              tx.status === "completed" ? "bg-harvest/20 text-harvest" :
                              tx.status === "processing" ? "bg-blue-500/20 text-blue-600" :
                              tx.status === "refunded" ? "bg-red-500/20 text-red-600" :
                              "bg-yellow-500/20 text-yellow-600"
                            }`}>
                              {tx.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-secondary/30 p-2 rounded">
                              <p className="text-muted-foreground">Buyer</p>
                              <p className="font-semibold text-foreground">{buyer?.name || "Unknown"}</p>
                              <p className="text-muted-foreground font-mono">{tx.buyerId}</p>
                            </div>
                            <div className="bg-secondary/30 p-2 rounded">
                              <p className="text-muted-foreground">Seller</p>
                              <p className="font-semibold text-foreground">{seller?.name || "Unknown"}</p>
                              <p className="text-muted-foreground font-mono">{tx.sellerId}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs bg-secondary/20 p-2 rounded">
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-semibold text-foreground">{formatZAR(tx.amount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Commission (10.5%)</p>
                              <p className="font-semibold text-foreground">{formatZAR(tx.commission)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">To Seller</p>
                              <p className="font-semibold text-harvest">{formatZAR(tx.netAmount)}</p>
                            </div>
                          </div>

                          {(tx.status === "pending" || tx.status === "processing") && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 gap-1"
                                onClick={() => handleReleaseEscrow(tx.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Release Funds
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleRefundEscrow(tx.id)}
                              >
                                <XCircle className="h-4 w-4" />
                                Refund
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
              </div>
              <div className="divide-y divide-border">
                {escrowTransactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No transactions yet
                  </div>
                ) : (
                  escrowTransactions.slice().reverse().map((tx) => {
                    const buyer = contextUsers.find(u => u.id === tx.buyerId);
                    return (
                      <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-secondary/30 transition-colors">
                        <div>
                          <p className="font-semibold text-foreground">{buyer?.name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{tx.productName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatZAR(tx.amount)}</p>
                          <p className={`text-xs capitalize ${tx.status === "completed" ? "text-harvest" : "text-yellow-600"}`}>
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          {/* Hero Tab */}
          <TabsContent value="hero" className="mt-6">
            {loadingHeroSlides ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading hero slides...</p>
              </div>
            ) : (
              <HeroAdmin 
                heroSlides={heroSlides} 
                onUpdate={handleHeroSlidesUpdate}
                isSubmitting={submittingHeroSlides}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
