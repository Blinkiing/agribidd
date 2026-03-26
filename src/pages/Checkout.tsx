import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatZAR } from "@/lib/data";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { balance, deductFromWallet } = useWallet();
  const { currentUser, createEscrowTransaction, createOrder } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const totalWithVAT = cartTotal * 1.15;
  const walletSufficient = balance >= totalWithVAT;

  const handlePaymentWithWallet = async () => {
    if (!walletSufficient) {
      toast.error("Insufficient wallet balance");
      return;
    }

    if (!currentUser) {
      toast.error("User not logged in");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const newOrderId = `ORD-${Date.now()}`;
      const success = deductFromWallet(totalWithVAT, newOrderId, "Purchase order");

      if (success) {
        // Group items by seller and create escrow transactions
        const itemsBySeller: { [key: string]: typeof items } = {};
        items.forEach(item => {
          if (!itemsBySeller[item.vendorId]) {
            itemsBySeller[item.vendorId] = [];
          }
          itemsBySeller[item.vendorId].push(item);
        });

        // Create order and escrow for each seller
        Object.entries(itemsBySeller).forEach(([sellerId, sellerItems]) => {
          const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          
          // Create order in AuthContext for each item
          sellerItems.forEach(item => {
            createOrder(
              currentUser.id,
              sellerId,
              item.name,
              item.quantity,
              item.price * item.quantity
            );
          });
          
          // Create escrow transaction
          createEscrowTransaction(
            currentUser.id,
            sellerId,
            sellerTotal,
            newOrderId,
            sellerItems.map(i => i.name).join(", ")
          );
        });

        setOrderId(newOrderId);
        setOrderPlaced(true);
        clearCart();
        toast.success("Order placed successfully! Escrow transactions created.");
      } else {
        toast.error("Payment failed. Please try again.");
      }
      setIsProcessing(false);
    }, 2000);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center container">
          <h1 className="text-2xl font-bold text-foreground mb-4">Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Add items to proceed to checkout</p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <CheckCircle2 className="h-16 w-16 text-harvest mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-6">Your order has been placed successfully</p>
            <div className="bg-card border border-border rounded-lg p-6 mb-6 max-w-md">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-semibold text-foreground">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-bold text-primary">{formatZAR(totalWithVAT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-harvest">Processing</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
              <Button onClick={() => navigate("/wallet")} className="gap-2">
                View Wallet
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container py-8">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-display font-bold text-foreground mb-6">Checkout</h1>

              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center pb-4 border-b border-border last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.vendor}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} × {formatZAR(item.price)}</p>
                      </div>
                      <p className="font-bold text-primary">{formatZAR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Pay with Wallet</p>
                        <p className="text-sm text-muted-foreground">Use your AgriBid Wallet balance</p>
                      </div>
                    </div>
                  </div>

                  {!walletSufficient && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        ⚠️ Insufficient wallet balance. Please <span className="font-semibold">top up your wallet</span> to complete this purchase.
                      </p>
                      <Button variant="outline" className="mt-2 w-full" onClick={() => navigate("/wallet")}>
                        Top Up Wallet
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Payment Summary</h2>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatZAR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (15%)</span>
                    <span>{formatZAR(cartTotal * 0.15)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatZAR(totalWithVAT)}</span>
                </div>

                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
                  <p className={`text-lg font-bold ${walletSufficient ? "text-harvest" : "text-red-500"}`}>
                    {formatZAR(balance)}
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handlePaymentWithWallet}
                  disabled={!walletSufficient || isProcessing}
                >
                  {isProcessing ? "Processing..." : "Complete Purchase"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/wallet")}
                >
                  Top Up Wallet
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
