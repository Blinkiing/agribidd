import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockProducts, formatZAR, addToCart } from "@/lib/data";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Minus, Plus, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = mockProducts.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Product not found</h1>
          <Button variant="default" className="mt-4" onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (quantity < product.moq) {
      toast.error(`Minimum order quantity is ${product.moq} ${product.unit}(s)`);
      return;
    }
    addToCart(product.id, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.badge && (
              <Badge className="bg-harvest text-accent-foreground border-0">{product.badge}</Badge>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">{product.vendor}</p>
              <h1 className="text-3xl font-display font-bold text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-harvest text-harvest" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <div>
              <span className="text-3xl font-bold text-primary">{formatZAR(product.price)}</span>
              <span className="text-muted-foreground ml-2">/{product.unit}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* MOQ Notice */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Minimum Order: {product.moq} {product.unit}(s)
              </p>
              <p className="text-xs text-muted-foreground">
                {product.stock > 20 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-medium text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                Total: {formatZAR(product.price * quantity)}
              </span>
            </div>

            <Button variant="harvest" size="xl" className="w-full gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Verified Seller
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Direct Delivery
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">Customer Reviews</h2>
          {product.reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{review.user[0]}</span>
                      </div>
                      <span className="font-medium text-foreground text-sm">{review.user}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-harvest text-harvest" : "text-border"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
