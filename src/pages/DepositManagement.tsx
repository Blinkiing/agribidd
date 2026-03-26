import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Upload, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatZAR } from "@/lib/data";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import YocoButton from "@/components/YocoButton";

const DepositManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, createDeposit, getDepositsByUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"yoco" | "bank">("yoco");
  const [amount, setAmount] = useState("");
  const [depositSlip, setDepositSlip] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentUser) {
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please sign in to manage deposits</p>
            <Button onClick={() => navigate(`/login?redirectTo=${redirectTo}`)}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  const userDeposits = getDepositsByUser(currentUser.id);

  const handleDepositSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only images and PDF files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setDepositSlip(reader.result as string);
        toast.success("Deposit slip uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleYocoSuccess = (reference: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createDeposit(currentUser.id, parseFloat(amount), "yoco", reference);
    toast.success(`Payment completed: ${reference}`);
    setAmount("");
  };

  const handleBankDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!depositSlip) {
      toast.error("Please upload deposit slip");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const reference = `BANK-${currentUser.id}-${Date.now()}`;
      createDeposit(currentUser.id, parseFloat(amount), "bank", reference, depositSlip);
      toast.success(`Bank deposit submitted: ${reference}\nWaiting for admin verification`);
      setAmount("");
      setDepositSlip(null);
      setIsProcessing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-harvest" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Wallet Top-up</h1>
          <p className="text-muted-foreground mb-8">Add funds to your AgriBid wallet using Yoco card payment or Bank Transfer</p>

          {/* Wallet Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Your User ID</p>
                <p className="text-lg font-mono font-bold text-foreground">{currentUser.id}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-primary">{formatZAR(currentUser.walletBalance)}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Deposit Methods */}
            <div className="lg:col-span-2 space-y-6">
            {/* Yoco Card Payment Tab */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-foreground">Yoco Card Payment</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Amount (ZAR)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full mt-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        onClick={() => setAmount(amt.toString())}
                        className="text-sm"
                      >
                        {formatZAR(amt)}
                      </Button>
                    ))}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-900">
                      Fast and secure card payment via Yoco. Your payment will be processed immediately.
                    </p>
                  </div>

                  {amount && parseFloat(amount) > 0 ? (
                    <YocoButton
                      amount={parseFloat(amount)}
                      onSuccess={handleYocoSuccess}
                      userId={currentUser.id}
                    />
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-900">
                        Please enter an amount to proceed with card payment
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Bank Transfer Tab */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">Bank Transfer</h2>

                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Bank Details:</p>
                    <div className="space-y-1 text-xs text-amber-800">
                      <p>
                        <span className="font-semibold">Bank:</span> FNB South Africa
                      </p>
                      <p>
                        <span className="font-semibold">Account:</span> AgriBid Trading (Pty) Ltd
                      </p>
                      <p>
                        <span className="font-semibold">Account No:</span> 62 123 4567 89
                      </p>
                      <p>
                        <span className="font-semibold">Branch Code:</span> 250551
                      </p>
                      <p className="mt-2 font-semibold">Reference: {currentUser.id}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Amount (ZAR)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full mt-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        onClick={() => setAmount(amt.toString())}
                        className="text-sm"
                      >
                        {formatZAR(amt)}
                      </Button>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Upload Deposit Slip</label>
                    <button
                      onClick={() => document.getElementById("deposit-slip")?.click()}
                      className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      {depositSlip ? (
                        <span className="text-sm text-harvest font-medium">✓ Slip uploaded</span>
                      ) : (
                        <p className="text-sm text-muted-foreground">Click to upload proof of payment</p>
                      )}
                    </button>
                    <input
                      id="deposit-slip"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDepositSlipUpload}
                      className="hidden"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleBankDeposit}
                    disabled={isProcessing || !amount || !depositSlip}
                  >
                    {isProcessing ? "Processing..." : "Submit Bank Transfer"}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Deposit History */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-lg p-6 sticky top-20"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Deposit History</h3>

                {userDeposits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No deposits yet</p>
                ) : (
                  <div className="space-y-3">
                    {userDeposits.map((deposit) => (
                      <div key={deposit.id} className="pb-3 border-b border-border last:border-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-foreground text-sm">{formatZAR(deposit.amount)}</p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(deposit.status)}
                            <span className="text-xs capitalize font-medium">{deposit.status}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{deposit.reference}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositManagement;
