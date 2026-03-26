import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/data";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { formatZAR } from "@/lib/data";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockProducts>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.vendor.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container py-8">
          {/* Search Header */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </button>

          <div className="mb-12">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Product Search</h1>
            <p className="text-muted-foreground">Find fresh products from verified farmers and suppliers</p>

            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, vendors, categories..."
                  className="w-full px-6 py-4 pr-14 text-lg border-2 border-border rounded-2xl focus:outline-none focus:border-primary transition-colors bg-card"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SearchIcon className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Filters */}
          {!hasSearched && (
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-foreground mb-4">Browse Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {["Vegetables", "Fruits", "Dairy", "Meat", "Grains", "Auctions"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSearchQuery(cat);
                      const query = cat.toLowerCase();
                      const results = mockProducts.filter(
                        (p) =>
                          p.name.toLowerCase().includes(query) ||
                          p.category.toLowerCase().includes(query)
                      );
                      setSearchResults(results);
                      setHasSearched(true);
                    }}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:bg-secondary transition-all"
                  >
                    <span className="font-medium text-foreground">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched && (
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                {searchResults.length} Results for "{searchQuery}"
              </h2>

              {searchResults.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No products found matching "{searchQuery}"
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSearchQuery("");
                      setHasSearched(false);
                      setSearchResults([]);
                    }}
                  >
                    Clear Search
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      vendor={product.vendor}
                      vendorId={product.vendorId}
                      price={product.price}
                      unit={product.unit}
                      rating={product.rating}
                      images={product.images}
                      badge={product.badge}
                      moq={product.moq}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
