import { useState } from "react";
import { Upload, Trash2, Plus, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { uploadImage } from "@/lib/storage";

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

interface HeroAdminProps {
  heroSlides: HeroSlide[];
  onUpdate: (slides: HeroSlide[]) => void;
  isSubmitting?: boolean;
}

const HeroAdmin = ({ heroSlides, onUpdate, isSubmitting = false }: HeroAdminProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    highlight: "",
    subtitle: "",
    description: "",
    emoji: "🌱",
    gradient: "from-forest-dark/90 via-forest/70 to-transparent",
    imageFile: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const gradientOptions = [
    { label: "Forest", value: "from-forest-dark/90 via-forest/70 to-transparent", emoji: "🌿" },
    { label: "Auction Hot", value: "from-auction-hot-dark/90 via-auction-hot/70 to-transparent", emoji: "🔥" },
    { label: "Primary", value: "from-primary-dark/90 via-primary/70 to-transparent", emoji: "🌾" },
    { label: "Earth", value: "from-earth-dark/90 via-earth/70 to-transparent", emoji: "🌍" },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.highlight || !formData.subtitle) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = imagePreview;
      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile, "hero-images", "hero");
      }

      const newSlide: HeroSlide = {
        id: editingId || `hero-${Date.now()}`,
        title: formData.title,
        highlight: formData.highlight,
        subtitle: formData.subtitle,
        description: formData.description,
        emoji: formData.emoji,
        gradient: formData.gradient,
        image_url: imageUrl,
        position: editingId ? heroSlides.find(s => s.id === editingId)?.position || heroSlides.length : heroSlides.length,
        is_active: editingId ? heroSlides.find(s => s.id === editingId)?.is_active || true : true,
      };

      if (editingId) {
        onUpdate(heroSlides.map(s => s.id === editingId ? newSlide : s));
        toast.success("Hero slide updated successfully!");
      } else {
        onUpdate([...heroSlides, newSlide]);
        toast.success("Hero slide added successfully!");
      }

      setFormData({
        title: "",
        highlight: "",
        subtitle: "",
        description: "",
        emoji: "🌱",
        gradient: "from-forest-dark/90 via-forest/70 to-transparent",
        imageFile: null,
      });
      setImagePreview("");
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error(`Failed to save hero slide: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setFormData({
      title: slide.title,
      highlight: slide.highlight,
      subtitle: slide.subtitle,
      description: slide.description,
      emoji: slide.emoji,
      gradient: slide.gradient,
      imageFile: null,
    });
    setImagePreview(slide.image_url);
    setEditingId(slide.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this hero slide?")) {
      onUpdate(heroSlides.filter(s => s.id !== id));
      toast.success("Hero slide deleted");
    }
  };

  const handleToggleActive = (id: string) => {
    onUpdate(
      heroSlides.map(s =>
        s.id === id ? { ...s, is_active: !s.is_active } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Hero Slides</h3>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditingId(null);
          }}
          variant={showForm ? "outline" : "harvest"}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Slide"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Farm Fresh"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Highlight *</Label>
                <Input
                  value={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                  placeholder="e.g., Fair Prices"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Subtitle *</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., Direct to You"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Emoji</Label>
                <Input
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🌱"
                  maxLength={2}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Slide description"
                className="w-full mt-1 p-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Gradient</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {gradientOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, gradient: opt.value })}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      formData.gradient === opt.value
                        ? "ring-2 ring-primary bg-primary/10"
                        : "border border-border hover:border-primary/50"
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Image Upload</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview("");
                        setFormData({ ...formData, imageFile: null });
                      }}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="harvest" disabled={uploading || isSubmitting}>
                {uploading || isSubmitting ? "Saving..." : "Save Slide"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Hero Slides List */}
      <div className="space-y-3">
        {heroSlides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hero slides yet. Add one to get started!</p>
          </div>
        ) : (
          heroSlides.map((slide, idx) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary/50 transition-colors"
            >
              {imagePreview && (
                <img src={slide.image_url} alt={slide.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{slide.emoji}</span>
                  <h4 className="font-medium text-foreground">{slide.title}</h4>
                  <span className="text-sm text-muted-foreground">- {slide.highlight}</span>
                </div>
                <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(slide.id)}
                  title={slide.is_active ? "Hide" : "Show"}
                >
                  {slide.is_active ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(slide)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(slide.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeroAdmin;
