import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySidebar from "@/components/CategorySidebar";
import FeaturedProducts from "@/components/FeaturedProducts";
import LiveAuctions from "@/components/LiveAuctions";

const Index = () => {
  const [categoriesSidebarOpen, setCategoriesSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCategoriesClick={() => setCategoriesSidebarOpen(true)} />

      {/* Hero Banner - Minimal */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 md:py-12">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Fresh from Farm to Table</h1>
            <p className="text-gray-100">Connect with farmers, processors, and sellers. Auction, buy, and sell agricultural products.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2">
                <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 rounded transition-colors">
                  🌱 Fresh Produce
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 rounded transition-colors">
                  🏭 Agro Processing
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 rounded transition-colors">
                  🥩 Butchery
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 rounded transition-colors">
                  🔨 Auctions
                </button>
              </div>

              {/* Filters */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Filter</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">For Sale</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Auction</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="md:col-span-3 space-y-12">
            {/* Featured Products */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
                <a href="/search" className="text-orange-500 hover:text-orange-600 text-sm font-medium">View All →</a>
              </div>
              <FeaturedProducts />
            </section>

            {/* Live Auctions */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Live Auctions</h2>
                <a href="/auction-house" className="text-orange-500 hover:text-orange-600 text-sm font-medium">View All →</a>
              </div>
              <LiveAuctions />
            </section>

            {/* Trust Section */}
            <section className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why AgriBid?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <h3 className="font-bold text-gray-800 mb-1">Direct from Farmers</h3>
                  <p className="text-sm text-gray-600">Connect directly with agricultural producers and ensure authenticity.</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-bold text-gray-800 mb-1">Secure Payment</h3>
                  <p className="text-sm text-gray-600">Escrow system protects both buyers and sellers in every transaction.</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold text-gray-800 mb-1">Fast Delivery</h3>
                  <p className="text-sm text-gray-600">Track your orders from farm to doorstep in real-time.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <CategorySidebar isOpen={categoriesSidebarOpen} onClose={() => setCategoriesSidebarOpen(false)} />
    </div>
  );
};

export default Index;
