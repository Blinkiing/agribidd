import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { saveSellerProfile, type SellerProfile } from "@/lib/data";
import { Store, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState<"form" | "success">("form");
  const [logo, setLogo] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    phone: "",
    location: "",
    specialty: "",
    bio: "",
    idNumber: "",
    registrationDocument: "",
    businessAddress: "",
    taxNumber: "",
    bankAccount: "",
    bankName: "",
  });

  // Check authentication and authorization
  useEffect(() => {
    if (!currentUser) {
      // Not logged in, redirect to login
      toast.error("Please sign in to become a seller");
      navigate("/login?redirectTo=/become-seller");
    } else if (currentUser.accountType !== "buyer") {
      // Already a seller or admin
      toast.error("You already have a seller account");
      navigate("/seller-dashboard");
    }
  }, [currentUser, navigate]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.email || !form.phone || !form.location || !form.idNumber || !form.businessAddress || !form.taxNumber) {
      toast.error("Please fill in all required fields including verification documents");
      return;
    }
    const profile: SellerProfile = {
      id: `seller-${Date.now()}`,
      ...form,
      logo: logo || undefined,
      verificationStatus: "pending",
    };
    saveSellerProfile(profile);
    setStep("success");
    toast.success("Seller account created! Awaiting verification...");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">Welcome, Seller!</h1>
          <p className="text-muted-foreground mb-8">Your seller account has been created. Start listing your products on AgriBid.</p>
          <Button variant="harvest" size="xl" onClick={() => navigate("/seller-dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Don't render form if not authenticated as buyer
  if (!currentUser || currentUser.accountType !== "buyer") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">Please sign in as a buyer to become a seller.</p>
          <Button variant="default" size="xl" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-12 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Store className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground">Become a Seller</h1>
          <p className="text-muted-foreground mt-2">
            Join thousands of farmers and suppliers on AgriBid
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
          {/* Logo Upload */}
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border mx-auto flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <p className="text-xs text-muted-foreground mt-2">Upload your farm/business logo</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Business Name *</Label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Green Valley Farm"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@farm.co.za"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Limpopo, SA"
              />
            </div>
          </div>

          <div>
            <Label>Specialty</Label>
            <Input
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="e.g. Organic Vegetables, Butchery, Dairy"
            />
          </div>

          <div>
            <Label>About Your Business</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell buyers about your farm or business..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Verification Section */}
          <div className="bg-secondary/30 border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-harvest" />
              <h3 className="font-semibold text-foreground">Verification Required</h3>
            </div>
            <p className="text-sm text-muted-foreground">To prevent scams, please provide the following verification documents:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>ID Number (e.g., RSA ID) *</Label>
                <Input
                  value={form.idNumber}
                  onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  placeholder="e.g., 1234567890123"
                />
              </div>
              <div>
                <Label>Tax Number (TIN) *</Label>
                <Input
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  placeholder="e.g., 9876543210"
                />
              </div>
            </div>

            <div>
              <Label>Business Address *</Label>
              <Input
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                placeholder="Full business address"
              />
            </div>

            <div>
              <Label>Registration Document</Label>
              <Input
                value={form.registrationDocument}
                onChange={(e) => setForm({ ...form, registrationDocument: e.target.value })}
                placeholder="Upload registration document (description or file name)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none"
                >
                  <option value="">Select bank...</option>
                  <option value="Absa">Absa</option>
                  <option value="Capitec">Capitec</option>
                  <option value="FNB">FNB</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="Discovery">Discovery</option>
                </select>
              </div>
              <div>
                <Label>Bank Account Number</Label>
                <Input
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  placeholder="Account number for payments"
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="harvest" size="xl" className="w-full">
            Create Seller Account (Pending Verification)
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
