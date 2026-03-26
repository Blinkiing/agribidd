import { motion } from "framer-motion";
import { categories } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const CategorySection = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Solid color palette matching logo design
  const colorPalette = [
    { bgColor: "#39FF14", bgOpacity: "0.15", borderColor: "#39FF14", textColor: "#1a7e35", icon: "text-emerald-600", lightBg: "#e8ffd9" },
    { bgColor: "#FF9F1C", bgOpacity: "0.15", borderColor: "#FF9F1C", textColor: "#d97706", icon: "text-orange-600", lightBg: "#fff5e6" },
    { bgColor: "#FF6B35", bgOpacity: "0.15", borderColor: "#FF6B35", textColor: "#dc2626", icon: "text-red-600", lightBg: "#ffe6d9" },
    { bgColor: "#0066FF", bgOpacity: "0.15", borderColor: "#0066FF", textColor: "#2563eb", icon: "text-blue-600", lightBg: "#e6f0ff" },
  ];

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container">
        {/* Header with multi-color text (no gradient) */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              <span style={{ color: "#39FF14" }}>Browse</span>{" "}
              <span style={{ color: "#FF9F1C" }}>Categories</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              From fresh produce to premium butchery — find it all
            </p>
          </motion.div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => {
            const color = colorPalette[i % colorPalette.length];
            
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group relative h-full"
              >
                {/* Card with solid color fill */}
                <div
                  className="relative h-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2"
                  style={{
                    backgroundColor: color.lightBg,
                    borderColor: color.borderColor,
                  }}
                >
                  {/* Top accent bar with solid color */}
                  <div className="h-1" style={{ backgroundColor: color.borderColor }} />

                  {/* Card Content */}
                  <button
                    onClick={() => setExpanded(expanded === cat.slug ? null : cat.slug)}
                    className="w-full p-6 text-left h-auto"
                  >
                    <div className="space-y-3">
                      {/* Icon */}
                      <div className={`text-5xl transform group-hover:scale-110 transition-transform duration-300`}>
                        {cat.icon}
                      </div>

                      {/* Title with solid logo color */}
                      <div>
                        <h3
                          className="text-lg font-black mb-1 transition-colors duration-300"
                          style={{ color: color.textColor }}
                        >
                          {cat.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          {cat.description}
                        </p>
                      </div>

                      {/* Expand indicator */}
                      <motion.div
                        animate={{ rotate: expanded === cat.slug ? 180 : 0 }}
                        className="pt-2"
                      >
                        <ChevronRight className="w-5 h-5" style={{ color: color.borderColor }} />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <motion.div
                    initial={false}
                    animate={{ height: expanded === cat.slug ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-6 pb-4 space-y-1 border-t border-current"
                      style={{ borderColor: color.borderColor, borderOpacity: 0.3 }}
                    >
                      {cat.subcategories.map((sub) => (
                        <motion.button
                          key={sub.slug}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => navigate(`/category/${cat.slug}/${sub.slug}`)}
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white hover:bg-opacity-50"
                          style={{ color: color.textColor }}
                        >
                          {sub.name}
                          <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover/item:opacity-100 transform group-hover/item:translate-x-1 transition-all duration-200" />
                        </motion.button>
                      ))}
                      <button
                        onClick={() => navigate(`/category/${cat.slug}`)}
                        className="w-full text-sm font-bold rounded-lg py-2.5 px-3 mt-2 transition-all duration-200 text-white"
                        style={{
                          backgroundColor: color.borderColor,
                        }}
                      >
                        View all →
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
