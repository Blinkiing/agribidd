import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatZAR } from "@/lib/data";
import Navbar from "@/components/Navbar";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, cartTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container py-16">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-display font-bold text-foreground mb-6">Shopping Cart</h1>

            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 bg-card border border-border rounded-lg p-4"
                >
                  <img src={item.image} alt={item.name} className="h-24 w-24 object-cover rounded-lg" />

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.vendor}</p>
                    <p className="text-lg font-bold text-primary mt-2">{formatZAR(item.price)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-secondary-foreground transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-secondary-foreground transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-sm font-semibold">
                      {formatZAR(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatZAR(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-harvest font-semibold">TBD</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (15%)</span>
                  <span>{formatZAR(cartTotal * 0.15)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatZAR(cartTotal * 1.15)}</span>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate("/checkout")}
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
