import { useState } from "react";
import { Search, ShoppingCart, Menu, X, Gavel, Store, User, Grid3x3, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { getSellerProfile } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onCategoriesClick?: () => void;
}

const Navbar = ({ onCategoriesClick }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();
  const isSeller = !!getSellerProfile();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!currentUser) return null;
    if (currentUser.accountType === "admin") return "/admin";
    if (currentUser.accountType === "seller") return "/seller-dashboard";
    return "/buyer-dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size="md" className="text-foreground" />
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <Store className="h-4 w-4" /> Marketplace
          </button>
          <button onClick={() => navigate("/auction-house")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <Gavel className="h-4 w-4" /> Live Auctions
          </button>
          <button onClick={() => navigate("/#vendors")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <User className="h-4 w-4" /> Vendors
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/search")}>
            <Search className="h-5 w-5" />
          </Button>
          {currentUser && (
            <>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/wallet")}>
                <Wallet className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-harvest text-[10px] font-bold flex items-center justify-center text-accent-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
              {/* Show "Become a Seller" button for logged-in buyers */}
              {currentUser.accountType === "buyer" && (
                <Button
                  variant="harvest"
                  size="sm"
                  onClick={() => navigate("/become-seller")}
                >
                  Become a Seller
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(getDashboardLink() || "/")}
              >
                {currentUser.accountType === "admin"
                  ? "Admin Panel"
                  : currentUser.accountType === "seller"
                    ? "Seller Dashboard"
                    : "My Dashboard"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          )}
          {!currentUser && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="container py-4 flex flex-col gap-3">
              <button onClick={() => { navigate("/"); setMobileOpen(false); }} className="text-sm font-medium py-2 text-left">Marketplace</button>
              <button onClick={() => { navigate("/auction-house"); setMobileOpen(false); }} className="text-sm font-medium py-2 text-left">Live Auctions</button>
              <button onClick={() => { navigate("/#vendors"); setMobileOpen(false); }} className="text-sm font-medium py-2 text-left">Vendors</button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onCategoriesClick?.();
                }}
                className="text-sm font-medium py-2 text-left flex items-center gap-2"
              >
                <Grid3x3 className="h-4 w-4" />
                Browse Categories
              </button>
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                {currentUser && (
                  <>
                    <button onClick={() => { navigate("/wallet"); setMobileOpen(false); }} className="text-sm font-medium py-2 text-left flex items-center gap-2 w-full">
                      <Wallet className="h-4 w-4" />
                      My Wallet
                    </button>
                    <button onClick={() => { navigate("/cart"); setMobileOpen(false); }} className="text-sm font-medium py-2 text-left flex items-center gap-2 w-full">
                      <ShoppingCart className="h-4 w-4" />
                      Cart {itemCount > 0 && `(${itemCount})`}
                    </button>
                  </>
                )}
              </div>
              {currentUser ? (
                <>
                  {currentUser.accountType === "buyer" && (
                    <Button
                      variant="harvest"
                      className="mt-2 w-full"
                      onClick={() => {
                        navigate("/become-seller");
                        setMobileOpen(false);
                      }}
                    >
                      Become a Seller
                    </Button>
                  )}
                  <Button
                    variant="default"
                    className="mt-2 w-full"
                    onClick={() => {
                      navigate(getDashboardLink() || "/");
                      setMobileOpen(false);
                    }}
                  >
                    {currentUser.accountType === "admin"
                      ? "Admin Panel"
                      : currentUser.accountType === "seller"
                        ? "Seller Dashboard"
                        : "My Dashboard"}
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-1 w-full gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    className="mt-2 w-full"
                    onClick={() => {
                      navigate("/signin");
                      setMobileOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
