import { CreditCard, Plus, TrendingDown, TrendingUp, Banknote, CheckCircle2, AlertCircle, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { formatZAR } from "@/lib/data";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import YocoButton from "@/components/YocoButton";
import BankDepositUpload from "@/components/BankDepositUpload";

const BuyerWallet = () => {
  const { balance, transactions, topupWallet, addBankDeposit, getTransactionHistory } = useWallet();
  const { currentUser } = useAuth();
  const [topupAmount, setTopupAmount] = useState("");
  const [showYoco, setShowYoco] = useState(false);
  const [showBankDeposit, setShowBankDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    accountNumber: "",
    bankCode: "",
    accountHolder: "",
    bankName: ""
  });
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawId, setWithdrawId] = useState("");
  const txHistory = getTransactionHistory();

  const handleYocoSuccess = (reference: string) => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    const amount = parseFloat(topupAmount);
    topupWallet(amount, reference);
    setShowYoco(false);
    setTopupAmount("");
    toast.success(`Successfully added ${formatZAR(amount)} to your wallet!`);
  };

  const handleBankDepositSuccess = (reference: string, screenshotUrl: string) => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    const amount = parseFloat(topupAmount);
    setShowBankDeposit(false);
    setTopupAmount("");
    // Bank deposit transaction is already added by BankDepositUpload component
    toast.success(`Bank deposit submitted! Reference: ${reference}. You'll be credited within 2-4 business hours.`);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawForm.amount || !withdrawForm.accountNumber || !withdrawForm.bankCode || !withdrawForm.accountHolder) {
      toast.error("Please fill in all banking details");
      return;
    }

    const withdrawAmount = parseFloat(withdrawForm.amount);
    if (withdrawAmount <= 0) {
      toast.error("Withdrawal amount must be greater than 0");
      return;
    }

    if (withdrawAmount > balance) {
      toast.error("Insufficient balance for this withdrawal");
      return;
    }

    // Process withdrawal
    const id = `WD-${Date.now()}`;
    setWithdrawId(id);
    
    // Deduct from wallet
    topupWallet(-withdrawAmount, id);
    
    // Show success
    setWithdrawSuccess(true);
    setWithdrawForm({ amount: "", accountNumber: "", bankCode: "", accountHolder: "", bankName: "" });
    
    // Reset after 5 seconds
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawSuccess(false);
    }, 5000);
  };

  const bankCodes = [
    { code: "250155", name: "Absa Bank Limited" },
    { code: "632005", name: "Capitec Bank" },
    { code: "430000", name: "First National Bank" },
    { code: "260009", name: "Nedbank Limited" },
    { code: "196009", name: "Standard Bank" },
    { code: "050037", name: "Discovery Bank" },
    { code: "051001", name: "African Bank" },
    { code: "410015", name: "Investec Bank" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Wallet</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Wallet Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
                  <h2 className="text-4xl font-display font-bold text-foreground">{formatZAR(balance)}</h2>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>

              <div className="flex gap-3">
                <Dialog open={showYoco} onOpenChange={setShowYoco}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Money
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Money to Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <input
                          type="number"
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[250, 500, 1000].map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            onClick={() => setTopupAmount(amt.toString())}
                            className="text-sm"
                          >
                            {formatZAR(amt)}
                          </Button>
                        ))}
                      </div>

                      {topupAmount && parseFloat(topupAmount) > 0 ? (
                        <YocoButton
                          amount={parseFloat(topupAmount)}
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
                  </DialogContent>
                </Dialog>

                <Dialog open={showBankDeposit} onOpenChange={setShowBankDeposit}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="gap-2">
                      <Landmark className="h-4 w-4" />
                      Bank Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Deposit via Bank Transfer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <input
                          type="number"
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[250, 500, 1000].map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            onClick={() => setTopupAmount(amt.toString())}
                            className="text-sm"
                          >
                            {formatZAR(amt)}
                          </Button>
                        ))}
                      </div>

                      {topupAmount && parseFloat(topupAmount) > 0 && currentUser ? (
                        <BankDepositUpload
                          amount={parseFloat(topupAmount)}
                          userId={currentUser.id}
                          onSuccess={handleBankDepositSuccess}
                        />
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs text-yellow-900">
                            Please enter an amount to proceed with bank deposit
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Banknote className="h-4 w-4" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Withdraw Money</DialogTitle>
                    </DialogHeader>

                    {withdrawSuccess ? (
                      <div className="space-y-4 py-8">
                        <div className="flex justify-center">
                          <CheckCircle2 className="h-16 w-16 text-harvest" />
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">Withdrawal Submitted!</h3>
                          <p className="text-muted-foreground">Reference: {withdrawId}</p>
                          <div className="bg-harvest/10 border border-harvest/20 rounded-lg p-4 mt-4">
                            <div className="flex gap-2 text-sm text-harvest">
                              <AlertCircle className="h-5 w-5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold">💰 Money will be deposited in your account within 24 hours</p>
                                <p className="text-xs mt-1">You'll receive an SMS confirmation</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleWithdraw} className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="withdraw-amount">Withdrawal Amount (R)</Label>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            step="0.01"
                            min="100"
                            value={withdrawForm.amount}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                            placeholder="Minimum R100"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Available: {formatZAR(balance)}</p>
                        </div>

                        <div>
                          <Label htmlFor="account-holder">Account Holder Name</Label>
                          <Input
                            id="account-holder"
                            placeholder="Full name"
                            value={withdrawForm.accountHolder}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bank-name">Bank Name</Label>
                          <select
                            id="bank-name"
                            value={withdrawForm.bankName}
                            onChange={(e) => {
                              const selected = bankCodes.find(b => b.name === e.target.value);
                              setWithdrawForm({
                                ...withdrawForm,
                                bankName: e.target.value,
                                bankCode: selected?.code || ""
                              });
                            }}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                          >
                            <option value="">Select your bank</option>
                            {bankCodes.map((bank) => (
                              <option key={bank.code} value={bank.name}>
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="account-number">Account Number</Label>
                          <Input
                            id="account-number"
                            placeholder="Your account number"
                            value={withdrawForm.accountNumber}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-900">
                            ✓ Your banking details are encrypted and secure. We never share your information.
                          </p>
                        </div>

                        <Button type="submit" className="w-full">
                          Withdraw {withdrawForm.amount ? formatZAR(parseFloat(withdrawForm.amount)) : ""}
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-harvest" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Topups</p>
                    <p className="font-semibold text-foreground">{formatZAR(1500)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-auction-hot" />
                  <div>
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="font-semibold text-foreground">{formatZAR(0)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Transaction History</h2>
            </div>

            <div className="divide-y divide-border">
              {txHistory.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No transactions yet</div>
              ) : (
                txHistory.map((tx) => (
                  <div key={tx.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.type === "topup" ? "text-harvest" : "text-foreground"
                        }`}
                      >
                        {tx.type === "topup" ? "+" : "-"}
                        {formatZAR(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BuyerWallet;
