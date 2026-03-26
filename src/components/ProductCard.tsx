import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatZAR } from "@/lib/data";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  price: number;
  unit: string;
  rating: number;
  images: string[];
  badge?: string;
  moq?: number;
}

const ProductCard = ({ id, name, vendor, vendorId, price, unit, rating, images, badge, moq }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group rounded-xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-card transition-all cursor-pointer"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={images[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {badge && (
          <Badge className="absolute top-3 left-3 bg-harvest text-accent-foreground border-0 font-semibold text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground">{vendor}</p>
        <h3 className="font-semibold text-foreground leading-tight">{name}</h3>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-harvest text-harvest" />
          <span className="text-xs font-medium text-foreground">{rating}</span>
        </div>
        {moq && moq > 1 && (
          <p className="text-xs text-muted-foreground">MOQ: {moq} {unit}s</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-primary">{formatZAR(price)}</span>
            <span className="text-xs text-muted-foreground ml-1">/{unit}</span>
          </div>
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              addItem({
                productId: id,
                name,
                price,
                quantity: moq || 1,
                unit,
                image: images[0],
                vendor,
                vendorId,
              });
              toast.success(`${name} added to cart`);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
