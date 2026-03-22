import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface MultiImageEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  storagePath?: string;
  label?: string;
  maxImages?: number;
}

export default function MultiImageEditor({
  images,
  onChange,
  storagePath = "misc",
  label = "Images",
  maxImages = 10,
}: MultiImageEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("listing-images").upload(path, file);
      if (error) continue;
      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
    }
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls].slice(0, maxImages));
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1));
  };

  const safeActive = Math.min(activeIndex, Math.max(0, images.length - 1));

  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
        {label} ({images.length}/{maxImages})
      </label>

      {/* Main preview with carousel */}
      {images.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden border border-border aspect-video mb-2 group bg-secondary">
          <img
            src={images[safeActive]}
            alt=""
            className="w-full h-full object-cover transition-opacity"
          />
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((safeActive - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setActiveIndex((safeActive + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronRight size={14} />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition ${i === safeActive ? "bg-white scale-125" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Remove current */}
          <button
            onClick={() => removeImage(safeActive)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition"
          >
            <X size={12} className="text-white" />
          </button>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white font-medium">
            {safeActive + 1} / {images.length}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground mb-2">
          <Image size={24} className="text-muted-foreground/40" />
          <p className="text-xs">No images yet</p>
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {images.map((url, i) => (
            <div
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition group ${
                i === safeActive ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={e => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={8} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload controls */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <label className={`w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-xs text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1.5 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={14} /> {uploading ? "Uploading..." : "Upload from Device"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleUpload(e.target.files)}
            />
          </label>
          <Input
            placeholder="Or paste image URL and press Enter..."
            className="text-xs"
            onKeyDown={e => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                onChange([...images, (e.target as HTMLInputElement).value].slice(0, maxImages));
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
