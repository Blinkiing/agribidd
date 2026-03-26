import { useParams, useNavigate } from "react-router-dom";
import { categories, mockProducts } from "@/lib/data";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";

const CategoryPage = () => {
  const { categorySlug, subSlug } = useParams();
  const navigate = useNavigate();

  const category = categories.find((c) => c.slug === categorySlug);

  const filtered = mockProducts.filter((p) => {
    if (subSlug) return p.subcategory === subSlug;
    if (categorySlug) return p.category === categorySlug;
    return true;
  });

  const subCategory = category?.subcategories.find((s) => s.slug === subSlug);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {category && <span className="text-3xl">{category.icon}</span>}
            <h1 className="text-3xl font-display font-bold text-foreground">
              {subCategory?.name || category?.name || "All Products"}
            </h1>
          </div>
          {category && <p className="text-muted-foreground">{category.description}</p>}
        </div>

        {/* Subcategory chips */}
        {category && !subSlug && (
          <div className="flex flex-wrap gap-2 mb-8">
            {category.subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => navigate(`/category/${categorySlug}/${sub.slug}`)}
                className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card hover:bg-secondary text-foreground transition-colors"
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products found in this category yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon — new listings are added daily!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                vendor={p.vendor}
                vendorId={p.vendorId}
                price={p.price}
                unit={p.unit}
                rating={p.rating}
                images={p.images}
                badge={p.badge}
                moq={p.moq}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
