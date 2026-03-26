import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSellerProfile, saveSellerProfile, type SellerProfile } from "@/lib/data";
import { Upload, ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SellerProfileEdit = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    phone: "",
    location: "",
    specialty: "",
    bio: "",
    businessAddress: "",
    taxNumber: "",
    bankAccount: "",
    bankName: "",
  });

  useEffect(() => {
    const sellerProfile = getSellerProfile();
    if (sellerProfile) {
      setForm({
        businessName: sellerProfile.businessName || "",
        email: sellerProfile.email || "",
        phone: sellerProfile.phone || "",
        location: sellerProfile.location || "",
        specialty: sellerProfile.specialty || "",
        bio: sellerProfile.bio || "",
        businessAddress: sellerProfile.businessAddress || "",
        taxNumber: sellerProfile.taxNumber || "",
        bankAccount: sellerProfile.bankAccount || "",
        bankName: sellerProfile.bankName || "",
      });
      if (sellerProfile.logo) {
        setLogo(sellerProfile.logo);
      }
    }
  }, []);

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
    if (!form.businessName || !form.email || !form.phone || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    const currentProfile = getSellerProfile();
    const updatedProfile: SellerProfile = {
      id: currentProfile?.id || `seller-${Date.now()}`,
      ...form,
      logo: logo || undefined,
      verificationStatus: currentProfile?.verificationStatus || "pending",
      idNumber: currentProfile?.idNumber,
      registrationDocument: currentProfile?.registrationDocument,
    };
    saveSellerProfile(updatedProfile);
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully!");
      navigate("/seller-dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-12 max-w-2xl mx-auto">
        <motion.button 
          onClick={() => navigate("/seller-dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-display font-bold text-foreground">Edit Store Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your farm or business information
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="bg-card border border-border rounded-xl p-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Logo Upload */}
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-harvest/20 to-primary/20 border-2 border-dashed border-border mx-auto flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleLogoUpload} 
            />
            <p className="text-xs text-muted-foreground mt-2">Click to upload your farm/business logo</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label className="text-sm font-medium">Business Name *</Label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g. Green Valley Farm"
                className="mt-1"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label className="text-sm font-medium">Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@farm.co.za"
                className="mt-1"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label className="text-sm font-medium">Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
                className="mt-1"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label className="text-sm font-medium">Location *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Limpopo, SA"
                className="mt-1"
              />
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <Label className="text-sm font-medium">Specialty</Label>
            <Input
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              placeholder="e.g. Organic Vegetables, Butchery, Dairy"
              className="mt-1"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <Label className="text-sm font-medium">About Your Business</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell buyers about your farm or business..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
            />
          </motion.div>

          {/* Business Details Section */}
          <motion.div 
            className="bg-secondary/30 border border-border rounded-lg p-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-harvest" />
              <h3 className="font-semibold text-foreground">Business Details</h3>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label className="text-sm font-medium">Business Address</Label>
              <Input
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                placeholder="Full business address"
                className="mt-1"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label className="text-sm font-medium">Tax Number (TIN)</Label>
              <Input
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                placeholder="e.g., 9876543210"
                className="mt-1"
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Label className="text-sm font-medium">Bank Name</Label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none mt-1"
                >
                  <option value="">Select bank...</option>
                  <option value="Absa">Absa</option>
                  <option value="Capitec">Capitec</option>
                  <option value="FNB">FNB</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="Discovery">Discovery</option>
                </select>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Label className="text-sm font-medium">Bank Account Number</Label>
                <Input
                  value={form.bankAccount}
                  onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                  placeholder="Account number for payments"
                  className="mt-1"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              type="submit" 
              variant="harvest" 
              size="lg" 
              className="flex-1 gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <Save className="h-4 w-4" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="lg"
              onClick={() => navigate("/seller-dashboard")}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default SellerProfileEdit;
