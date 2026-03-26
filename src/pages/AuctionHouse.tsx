import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, Clock, Users, Filter, Search, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatZAR } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AuctionCard from "@/components/AuctionCard";

interface FilterState {
  category: string;
  priceRange: [number, number];
  searchQuery: string;
  sortBy: "ending-soon" | "highest-bid" | "most-bids" | "newest";
}

const auctionCategories = [
  { id: "all", name: "All Auctions", emoji: "🔨" },
  { id: "livestock-auctions", name: "Livestock", emoji: "🐄" },
  { id: "equipment", name: "Equipment & Machinery", emoji: "🚜" },
  { id: "crop-bulk-sales", name: "Bulk Crops", emoji: "🌾" },
  { id: "surplus-stock", name: "Surplus Stock", emoji: "📦" },
];

const formatTime = (ms: number) => {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return { h, m, s };
};

const AuctionHouse = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  interface Auction {
    id: string;
    title: string;
    image: string;
    category?: string;
    productName?: string;
    description?: string;
    startingPrice: number;
    currentBid?: number;
    endTime?: Date;
    createdAt?: Date;
    totalBids?: number;
    endsInMs?: number;
    vendor?: string;
  }
  
  const auctions = useMemo<Auction[]>(() => [], []); // TODO: Fetch real auctions from Supabase
  
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: [0, 1000000],
    searchQuery: "",
    sortBy: "ending-soon",
  });

  // Filter and sort auctions - using real data from context
  const filteredAuctions = useMemo(() => {
    let result = [...(auctions || [])];

    // Category filter
    if (filters.category !== "all") {
      result = result.filter((a) => a.category === filters.category);
    }

    // Price range filter
    result = result.filter(
      (a) =>
        (a.currentBid || a.startingPrice) >= filters.priceRange[0] &&
        (a.currentBid || a.startingPrice) <= filters.priceRange[1]
    );

    // Search filter
    if (filters.searchQuery) {
      result = result.filter(
        (a) =>
          a.productName?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "ending-soon":
          return (a.endTime?.getTime() || 0) - (b.endTime?.getTime() || 0);
        case "highest-bid":
          return (b.currentBid || 0) - (a.currentBid || 0);
        case "most-bids":
          return (b.totalBids || 0) - (a.totalBids || 0);
        case "newest":
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [filters, auctions]);

  // Calculate real stats from actual auction data
  const totalValue = (auctions || []).reduce((sum, a) => sum + (a.currentBid || a.startingPrice), 0);
  const activeBids = (auctions || []).reduce((sum, a) => sum + (a.totalBids || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-auction-hot/20 via-background to-background border-b border-border">
        <div className="container py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🔨</span>
                <div className="inline-flex items-center gap-2 rounded-full bg-auction-hot/10 border border-auction-hot/30 px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-auction-hot animate-pulse" />
                  <span className="text-sm font-semibold text-auction-hot uppercase tracking-wider">
                    Live Auctions
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-2">
                Auction House
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Bid on livestock, machinery, bulk crops, and surplus stock. Real-time bidding with competitive
                prices for farmers, businesses, and buyers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Gavel className="h-6 w-6 text-auction-hot" />
                  <div>
                    <p className="text-xs text-muted-foreground">Active Auctions</p>
                    <p className="text-2xl font-bold text-foreground">{filteredAuctions.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-harvest" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bids</p>
                    <p className="text-2xl font-bold text-foreground">{activeBids}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold text-foreground">{formatZAR(totalValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search auctions..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4" /> Categories
                </label>
                <div className="space-y-2">
                  {auctionCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters({ ...filters, category: cat.id })}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
                        filters.category === cat.id
                          ? "bg-auction-hot/10 border border-auction-hot text-auction-hot"
                          : "bg-card border border-border hover:border-auction-hot/50 text-foreground"
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-3">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as FilterState["sortBy"],
                    })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ending-soon">Ending Soon</option>
                  <option value="highest-bid">Highest Bid</option>
                  <option value="most-bids">Most Bids</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({
                    category: "all",
                    priceRange: [0, 1000000],
                    searchQuery: "",
                    sortBy: "ending-soon",
                  })
                }
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold">{filteredAuctions.length}</span> of{" "}
                <span className="font-semibold">{auctions.length}</span> auctions
              </p>
            </div>

            {/* Auctions Grid */}
            {filteredAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAuctions.map((auction, index) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AuctionCard
                      title={auction.title}
                      image={auction.image}
                      currentBid={auction.currentBid}
                      totalBids={auction.totalBids}
                      endsInMs={auction.endsInMs}
                      vendor={auction.vendor}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-20">
                <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No auctions found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    setFilters({
                      category: "all",
                      priceRange: [0, 1000000],
                      searchQuery: "",
                      sortBy: "ending-soon",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionHouse;
