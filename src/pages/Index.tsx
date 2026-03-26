import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import CategorySidebar from "@/components/CategorySidebar";
import FeaturedProducts from "@/components/FeaturedProducts";
import LiveAuctions from "@/components/LiveAuctions";

const Index = () => {
  const [categoriesSidebarOpen, setCategoriesSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar onCategoriesClick={() => setCategoriesSidebarOpen(true)} />
      <CategorySidebar isOpen={categoriesSidebarOpen} onClose={() => setCategoriesSidebarOpen(false)} />
      <HeroSection />
      <div className="hidden md:block">
        <CategorySection />
      </div>
      <FeaturedProducts />
      <LiveAuctions />
    </div>
  );
};

export default Index;
