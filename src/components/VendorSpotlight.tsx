import { motion } from "framer-motion";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockVendors } from "@/lib/data";
import { useNavigate } from "react-router-dom";

const VendorSpotlight = () => {
  const navigate = useNavigate();
  const featured = mockVendors.slice(0, 3);

  return (
    <section id="vendors" className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-foreground">Trusted Vendors</h2>
          <p className="text-muted-foreground mt-2">Meet the farmers and suppliers behind your food</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/vendor/${v.id}`)}
              className="rounded-xl bg-card border border-border p-6 shadow-soft hover:shadow-card transition-all text-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-display font-bold text-primary">{v.name[0]}</span>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <h3 className="font-semibold text-foreground">{v.name}</h3>
                {v.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
                <MapPin className="h-3.5 w-3.5" /> {v.location}
              </div>
              <Badge variant="secondary" className="mb-3">{v.specialty}</Badge>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-harvest text-harvest" /> {v.rating}
                </div>
                <span>{v.products} products</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendorSpotlight;
