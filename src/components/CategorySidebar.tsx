import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar = ({ isOpen, onClose }: CategorySidebarProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleCategoryClick = (categorySlug: string, subSlug?: string) => {
    if (subSlug) {
      navigate(`/category/${categorySlug}/${subSlug}`);
    } else {
      navigate(`/category/${categorySlug}`);
    }
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-screen w-[85vw] max-w-sm bg-card border-r border-border overflow-y-auto md:hidden"
          >
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-display font-bold text-foreground">Categories</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-2">
              {categories.map((cat) => (
                <div key={cat.slug} className="space-y-1">
                  <button
                    onClick={() => setExpanded(expanded === cat.slug ? null : cat.slug)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expanded === cat.slug ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expanded === cat.slug && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pr-2 py-2 space-y-1 bg-secondary/30 rounded-lg mx-2">
                          {cat.subcategories.map((sub) => (
                            <button
                              key={sub.slug}
                              onClick={() => handleCategoryClick(cat.slug, sub.slug)}
                              className="w-full text-left px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              {sub.name}
                            </button>
                          ))}
                          <button
                            onClick={() => handleCategoryClick(cat.slug)}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-primary hover:underline"
                          >
                            View all →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategorySidebar;
