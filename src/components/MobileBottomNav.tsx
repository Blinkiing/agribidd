import { Home, Search, ShoppingCart, Wallet, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { items } = useCart();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/", badge: null },
    { icon: Search, label: "Search", path: "/search", badge: null },
    { icon: ShoppingCart, label: "Cart", path: "/cart", badge: items.length > 0 ? items.length : null },
    { icon: Wallet, label: "Wallet", path: "/wallet", badge: null },
    { icon: User, label: "Account", path: currentUser ? "/buyer-dashboard" : "/signin", badge: null },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all relative ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute top-1 right-1 bg-harvest text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
