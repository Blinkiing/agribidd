import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import BecomeSeller from "./pages/BecomeSeller.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import SellerProfileEdit from "./pages/SellerProfileEdit.tsx";
import BuyerDashboard from "./pages/BuyerDashboard.tsx";
import VendorProfile from "./pages/VendorProfile.tsx";
import Cart from "./pages/Cart.tsx";
import BuyerWallet from "./pages/BuyerWallet.tsx";
import Checkout from "./pages/Checkout.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Search from "./pages/Search.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AuctionHouse from "./pages/AuctionHouse.tsx";
import FAQ from "./pages/FAQ.tsx";
import Pricing from "./pages/Pricing.tsx";
import About from "./pages/About.tsx";
import Careers from "./pages/Careers.tsx";
import Contact from "./pages/Contact.tsx";
import Blog from "./pages/Blog.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WalletProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<SignIn />} />
                <Route path="/search" element={<Search />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/category/:categorySlug/:subSlug" element={<CategoryPage />} />
                <Route path="/auction-house" element={<AuctionHouse />} />
                <Route path="/become-seller" element={<BecomeSeller />} />
                <Route
                  path="/seller-dashboard"
                  element={
                    <ProtectedRoute requiredRole="seller">
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-profile-edit"
                  element={
                    <ProtectedRoute requiredRole="seller">
                      <SellerProfileEdit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buyer-dashboard"
                  element={
                    <ProtectedRoute requiredRole="buyer">
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/vendor/:vendorId" element={<VendorProfile />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute requiredRole="buyer">
                      <BuyerWallet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileBottomNav />
            </BrowserRouter>
          </WalletProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
