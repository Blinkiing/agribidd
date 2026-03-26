import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { mockProducts, categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group products by category
  const primaryFarmingProducts = mockProducts.filter(p => p.category === "primary-farming").slice(0, 10);
  const agroProcessingProducts = mockProducts.filter(p => p.category === "agro-processing").slice(0, 10);
  const butcheryProducts = mockProducts.filter(p => p.category === "butchery").slice(0, 10);

  const categoryGroups = [
    {
      name: "Primary Farming",
      slug: "primary-farming",
      icon: "🌱",
      description: "Fresh produce directly from South African farms",
      products: primaryFarmingProducts,
      color: "text-primary"
    },
    {
      name: "Agro Processing",
      slug: "agro-processing",
      icon: "🏭",
      description: "Value-added, processed agricultural goods",
      products: agroProcessingProducts,
      color: "text-harvest"
    },
    {
      name: "Butchery",
      slug: "butchery",
      icon: "🥩",
      description: "Premium meat cuts and processed meat products",
      products: butcheryProducts,
      color: "text-auction-hot"
    }
  ];

  return (
    <div className="space-y-16 py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-foreground mb-2">Marketplace Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of products from South African farmers, suppliers, and distributors
          </p>
        </div>
      </div>

      {categoryGroups.map((group) => (
        <section key={group.slug} className="py-8">
          <div className="container">
            {/* Category Header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{group.icon}</span>
                  <h3 className={`text-3xl font-display font-bold ${group.color}`}>{group.name}</h3>
                </div>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 hidden sm:flex"
                onClick={() => navigate(`/category/${group.slug}`)}
              >
                View All ({mockProducts.filter(p => p.category === group.slug).length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Products Grid - Show 10 items */}
            {group.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                  {group.products.map((product) => (
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

                {/* Mobile View All Button */}
                <div className="mt-8 flex justify-center sm:hidden">
                  <Button 
                    variant="outline" 
                    className="gap-2 w-full"
                    onClick={() => navigate(`/category/${group.slug}`)}
                  >
                    View All {group.products.length > 0 ? `(${mockProducts.filter(p => p.category === group.slug).length})` : ""} {group.name}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products available in this category yet.
              </div>
            )}
          </div>

          {/* Divider */}
          {categoryGroups.indexOf(group) < categoryGroups.length - 1 && (
            <div className="mt-12 border-t border-border" />
          )}
        </section>
      ))}
    </div>
  );
};

export default FeaturedProducts;
