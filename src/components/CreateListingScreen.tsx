import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Plus, X, Check, Camera, ImagePlus, Loader2 } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import type { HostListing } from "@/hooks/use-host-listings";
import { useImageUpload } from "@/hooks/use-image-upload";

interface CreateListingScreenProps {
  onBack: () => void;
  onSubmit: (listing: Omit<HostListing, "id" | "createdAt">) => Promise<unknown>;
  initialData?: HostListing | null;
}

const categories = ["Stays", "Experiences", "Party Venues", "Dining", "Outdoor", "Services"];
const amenityOptions = [
  "Private Pool", "Bonfire Pit", "Sound System", "Free Parking", "BBQ Area",
  "Fairy Lights", "WiFi", "Washroom", "AC Rooms", "Kitchen", "Garden",
  "Projector", "Board Games", "Gym", "Spa", "Rooftop"
];

const steps = ["Basics", "Photos", "Details", "Amenities", "Review"];

export default function CreateListingScreen({ onBack, onSubmit, initialData }: CreateListingScreenProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { uploadImage, deleteImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    fullDescription: initialData?.fullDescription ?? "",
    location: initialData?.location ?? "Jeypore, Odisha",
    category: initialData?.category ?? "Stays",
    basePrice: initialData?.basePrice ?? 0,
    capacity: initialData?.capacity ?? 10,
    amenities: initialData?.amenities ?? [] as string[],
    tags: initialData?.tags ?? [] as string[],
    imageUrls: initialData?.imageUrls ?? [] as string[],
    status: initialData?.status ?? "draft" as HostListing["status"],
  });
  const [tagInput, setTagInput] = useState("");

  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleAmenity = useCallback((amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  }, [tagInput, form.tags]);

  const removeTag = useCallback((tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const url = await uploadImage(file);
      if (url) {
        setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadImage]);

  const handleRemoveImage = useCallback(async (url: string) => {
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((u) => u !== url) }));
    await deleteImage(url);
  }, [deleteImage]);

  const canNext = step === 0
    ? form.name.trim().length > 0 && form.basePrice > 0
    : step === 2
    ? form.description.trim().length > 0
    : true;

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  }, [form, onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen bg-mesh"
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </motion.button>
        <h1 className="text-xl font-bold text-foreground flex-1">
          {initialData ? "Edit Listing" : "Create Listing"}
        </h1>
      </div>

      {/* Step indicator */}
      <div className="px-5 mb-6 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
            <p className={`text-[10px] mt-1 font-medium ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="px-5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Property name</label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., The Firefly Villa"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateField("category", cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        form.category === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Base price (₹)</label>
                  <input
                    type="number"
                    value={form.basePrice || ""}
                    onChange={(e) => updateField("basePrice", Number(e.target.value))}
                    placeholder="2000"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Capacity</label>
                  <input
                    type="number"
                    value={form.capacity || ""}
                    onChange={(e) => updateField("capacity", Number(e.target.value))}
                    placeholder="10"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Property photos</label>
                <p className="text-xs text-muted-foreground mb-3">Add up to 8 photos. The first photo will be the cover.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="grid grid-cols-3 gap-2">
                  {form.imageUrls.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-foreground" />
                      </button>
                    </div>
                  ))}
                  {form.imageUrls.length < 8 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 size={20} className="text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <ImagePlus size={20} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Add photo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Short description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Private pool villa · Bonfire · Sound system"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full description</label>
                <textarea
                  value={form.fullDescription}
                  onChange={(e) => updateField("fullDescription", e.target.value)}
                  placeholder="Describe the property in detail..."
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Tags</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                      {tag}
                      <button onClick={() => removeTag(tag)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={addTag} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Plus size={16} className="text-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <label className="text-sm font-medium text-foreground mb-3 block">Select amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => {
                  const selected = form.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {selected && <Check size={14} className="inline mr-1" />}
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="glass rounded-2xl p-5 space-y-4">
                <h3 className="text-lg font-bold text-foreground">{form.name || "Untitled"}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">{form.category}</span>
                  <span>{form.location}</span>
                </div>
                <p className="text-sm text-muted-foreground">{form.description || "No description"}</p>
                <div className="border-t border-border pt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Base price</p>
                    <p className="font-semibold text-foreground">₹{form.basePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-semibold text-foreground">{form.capacity} guests</p>
                  </div>
                </div>
                {form.amenities.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.amenities.map((a) => (
                        <span key={a} className="text-xs bg-secondary px-2.5 py-1 rounded-full text-muted-foreground">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {form.tags.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map((t) => (
                        <span key={t} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 p-5 glass">
        <div className="flex gap-3">
          {step > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm"
            >
              Back
            </motion.button>
          )}
          {step < 3 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex-1 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1 disabled:opacity-40"
            >
              Continue <ChevronRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60"
            >
              {submitting ? "Saving..." : initialData ? "Update Listing" : "Create Listing"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
