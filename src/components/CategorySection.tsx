import { motion } from "framer-motion";
import { categories } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const CategorySection = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-foreground">Browse Categories</h2>
          <p className="text-muted-foreground mt-2">From fresh produce to premium butchery — find it all</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-card transition-all"
            >
              <button
                onClick={() => setExpanded(expanded === cat.slug ? null : cat.slug)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{ height: expanded === cat.slug ? "auto" : 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => navigate(`/category/${cat.slug}/${sub.slug}`)}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      {sub.name}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <button
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className="w-full text-sm font-medium text-primary hover:underline py-2"
                  >
                    View all →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
