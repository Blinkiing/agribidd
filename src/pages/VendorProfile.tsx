import { useParams, useNavigate } from "react-router-dom";
import { mockVendors, mockProducts, formatZAR } from "@/lib/data";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, MapPin, Star, ShieldCheck, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VendorProfile = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const vendor = mockVendors.find((v) => v.id === vendorId);
  const vendorProducts = mockProducts.filter((p) => p.vendorId === vendorId);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Vendor not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-card border border-border rounded-xl p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-display font-bold text-primary">{vendor.name[0]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold text-foreground">{vendor.name}</h1>
                {vendor.verified && <ShieldCheck className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-2">Reference: {vendor.id}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {vendor.location}</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-harvest text-harvest" /> {vendor.rating}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {vendor.joinDate}</span>
              </div>
              <Badge variant="secondary" className="mb-3">{vendor.specialty}</Badge>
              <p className="text-sm text-muted-foreground">{vendor.bio}</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-display font-bold text-foreground mb-6">
          Products by {vendor.name} ({vendorProducts.length})
        </h2>

        {vendorProducts.length === 0 ? (
          <p className="text-muted-foreground">No products listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendorProducts.map((p) => (
              <ProductCard key={p.id} id={p.id} name={p.name} vendor={p.vendor} vendorId={p.vendorId} price={p.price} unit={p.unit} rating={p.rating} images={p.images} badge={p.badge} moq={p.moq} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProfile;
