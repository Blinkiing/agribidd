import { useState } from "react";
import { Search, ShoppingCart, Menu, X, Gavel, Store, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
    setMobileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const getDashboardLink = () => {
    if (!currentUser) return null;
    if (currentUser.accountType === "admin") return "/admin";
    if (currentUser.accountType === "seller") return "/seller-dashboard";
    return "/buyer-dashboard";
  };

  return (
    <>
      {/* Top Header Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container">
          {/* Main Header */}
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Logo size="md" className="text-foreground" />
            </button>

            {/* Search Bar - Center */}
            <form onSubmit={handleSearch} className="flex-grow hidden md:flex max-w-2xl mx-4">
              <div className="flex w-full items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden hover:border-orange-400 focus-within:border-orange-400 focus-within:shadow-md transition-all">
                <Input
                  type="text"
                  placeholder="Search products, auctions, sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent px-4 py-2 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              {currentUser && (
                <>
                  <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-orange-500" onClick={() => navigate("/cart")}>
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="md:hidden text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              {!currentUser ? (
                <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="hidden md:block">
                  Sign In
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="hidden md:flex items-center gap-6 h-14 border-t border-gray-100">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
              <Store className="h-4 w-4" /> Marketplace
            </button>
            <button onClick={() => navigate("/auction-house")} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
              <Gavel className="h-4 w-4" /> Auctions
            </button>
            <button onClick={onCategoriesClick} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
              Categories
            </button>
            {currentUser && currentUser.accountType === "buyer" && (
              <button onClick={() => navigate("/become-seller")} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Sell on AgriBid
              </button>
            )}
            {currentUser && (
              <button onClick={() => navigate(getDashboardLink() || "/")} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors ml-auto">
                <User className="h-4 w-4" />
                {currentUser.accountType === "admin" ? "Admin" : currentUser.accountType === "seller" ? "My Store" : "Account"}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
              <div className="container py-4 space-y-3">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <button type="submit" className="px-3 bg-orange-500 text-white rounded">
                    <Search className="h-4 w-4" />
                  </button>
                </form>
                <button onClick={() => { navigate("/"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm font-medium hover:text-orange-500">Marketplace</button>
                <button onClick={() => { navigate("/auction-house"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm font-medium hover:text-orange-500">Auctions</button>
                <button onClick={() => { onCategoriesClick?.(); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm font-medium hover:text-orange-500">Categories</button>
                {!currentUser && (
                  <Button variant="outline" className="w-full" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign In</Button>
                )}
                {currentUser && (
                  <>
                    <button onClick={() => { navigate(getDashboardLink() || "/"); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm font-medium hover:text-orange-500">Account</button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> Logout
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
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
