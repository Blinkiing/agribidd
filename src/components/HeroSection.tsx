import { Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-farm.jpg";
import { supabase } from "@/lib/supabase";

interface HeroSlide {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  emoji: string;
  gradient: string;
  image_url: string;
  position: number;
  is_active: boolean;
}

// Fallback slides if database is empty
const defaultHeroSlides: HeroSlide[] = [
  {
    id: "default-1",
    title: "AgriBid.",
    highlight: "Fair Prices.",
    subtitle: "Direct to You.",
    description: "Connect directly with local farmers and suppliers. Buy fresh produce at fixed prices.",
    emoji: "🌱",
    gradient: "from-forest-dark/90 via-forest/70 to-transparent",
    image_url: heroImg,
    position: 1,
    is_active: true,
  },
  {
    id: "default-2",
    title: "Butchery Direct.",
    highlight: "Grade A Meat.",
    subtitle: "Fresh & Trusted.",
    description: "Premium cuts from verified South African suppliers. Delivered to your door.",
    emoji: "🥩",
    gradient: "from-auction-hot-dark/90 via-auction-hot/70 to-transparent",
    image_url: heroImg,
    position: 2,
    is_active: true,
  },
  {
    id: "default-3",
    title: "Grains & Dairy.",
    highlight: "Bulk Business.",
    subtitle: "Wholesale Ready.",
    description: "Source large quantities at competitive prices. Perfect for restaurants and retailers.",
    emoji: "🌾",
    gradient: "from-primary-dark/90 via-primary/70 to-transparent",
    image_url: heroImg,
    position: 3,
    is_active: true,
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Immediately set slides to defaults first
    setHeroSlides(defaultHeroSlides);
    setLoading(false);
    
    // Then try to fetch from Supabase (non-blocking)
    fetchHeroSlides();
  }, []);

  const fetchHeroSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (error) {
        console.warn("Failed to fetch hero slides:", error);
        return;
      }
      
      // Use database slides if available, otherwise keep defaults
      if (data && data.length > 0) {
        setHeroSlides(data as HeroSlide[]);
      }
    } catch (error) {
      console.warn("Failed to fetch hero slides, using defaults:", error);
    }
  };

  useEffect(() => {
    if (heroSlides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const goToPrevious = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goToNext = () => setCurrent((prev) => (prev + 1) % heroSlides.length);
  const goToSlide = (index: number) => setCurrent(index);

  const slide = heroSlides[current] || defaultHeroSlides[0];

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="South African farm" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{slide.emoji}</span>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-harvest animate-pulse" />
                <span className="text-sm font-medium text-primary-foreground/90">{slide.title.split(".")[0]}</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.1]">
              {slide.title.endsWith(".") ? slide.title.slice(0, -1) : slide.title}.{" "}
              <span className="text-gradient-harvest">{slide.highlight}</span>{" "}
              {slide.subtitle}
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-lg leading-relaxed">
              {slide.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="harvest" 
                size="xl" 
                className="gap-2"
                onClick={() => navigate("/search")}
              >
                Explore Marketplace <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
                onClick={() => navigate("/auction-house")}
              >
                Join Live Auctions
              </Button>
            </div>

            <div className="relative max-w-lg mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for vegetables, fruits, livestock..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-primary-foreground/95 text-foreground placeholder:text-muted-foreground shadow-elevated focus:outline-none focus:ring-2 focus:ring-harvest font-body text-sm"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {heroSlides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === current 
                  ? "bg-harvest w-8" 
                  : "bg-primary-foreground/50 w-2 hover:bg-primary-foreground/75"
              }`}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
