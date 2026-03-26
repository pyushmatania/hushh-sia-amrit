import { useState, useRef, useCallback } from "react";
import {
  X, Upload, ChevronLeft, ChevronRight, Image, Info,
  Star, ArrowUp, ArrowDown, RotateCw, Copy, Trash2,
  ZoomIn, Maximize2, GripVertical, Sparkles, Link, ImagePlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface MultiImageEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  storagePath?: string;
  label?: string;
  maxImages?: number;
  dimensionTip?: string;
  fallbackImages?: string[];
  fallbackHint?: string;
}

export default function MultiImageEditor({
  images,
  onChange,
  storagePath = "misc",
  label = "Images",
  maxImages = 10,
  dimensionTip = "Recommended: 1200×800px (3:2 ratio), JPG/WebP, under 2MB",
  fallbackImages = [],
  fallbackHint = "This item currently uses a linked/default image. Upload custom images to replace it.",
}: MultiImageEditorProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const buildStoragePath = useCallback(async (ext?: string) => {
    const safeExt = (ext || "jpg").toLowerCase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // Try anonymous admin path
      return `admin/${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
    }

    return `${user.id}/${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  }, [storagePath]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    const totalFiles = files.length;
    let completed = 0;
    let failed = 0;
    let lastError = "";

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = await buildStoragePath(ext);
      if (!path) {
        failed++;
        completed++;
        continue;
      }

      const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (error) {
        console.error("Upload error:", error.message, error);
        lastError = error.message;
        failed++;
        completed++;
        continue;
      }

      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      completed++;
      setUploadProgress(Math.round((completed / totalFiles) * 100));
    }

    if (newUrls.length > 0) {
      const updated = [...images, ...newUrls].slice(0, maxImages);
      onChange(updated);
      setActiveIndex(images.length);
    }

    if (failed > 0) {
      toast({
        title: "Upload failed",
        description: lastError
          ? `Error: ${lastError}`
          : `${failed} of ${totalFiles} failed. Try Paste URL instead, or check file size (max 5MB).`,
        variant: "destructive",
      });
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleReplace = async (file: File, index: number) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = await buildStoragePath(ext);
    if (!path) {
      setUploading(false);
      setReplaceIndex(null);
      return;
    }

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      if (urlData?.publicUrl) {
        const updated = [...images];
        updated[index] = urlData.publicUrl;
        onChange(updated);
      }
    } else {
      toast({
        title: "Replace failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setUploading(false);
    setReplaceIndex(null);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1));
  };

  const removeAll = () => {
    onChange([]);
    setActiveIndex(0);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
    setActiveIndex(to);
  };

  const setCoverImage = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
  };

  const duplicateImage = (index: number) => {
    if (images.length >= maxImages) return;
    const updated = [...images];
    updated.splice(index + 1, 0, images[index]);
    onChange(updated.slice(0, maxImages));
  };

  // Drag and drop reorder in thumbnail strip
  const handleDragStart = (index: number) => {
    setDragSourceIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragSourceIndex !== null && dragSourceIndex !== targetIndex) {
      moveImage(dragSourceIndex, targetIndex);
    }
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const safeActive = Math.min(activeIndex, Math.max(0, images.length - 1));
  const fallbackPreview = fallbackImages.find((url) => !!url) || null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label} ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={removeAll}
              className="text-[9px] text-destructive/70 hover:text-destructive font-medium px-2 py-0.5 rounded-md hover:bg-destructive/10 transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Dimension tip */}
      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
        <Info size={9} className="shrink-0" /> {dimensionTip}
      </p>

      {/* Main preview with carousel */}
      {images.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden border border-border aspect-video group bg-black/5 dark:bg-white/5">
          <motion.img
            key={images[safeActive]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={images[safeActive]}
            alt=""
            className="w-full h-full object-cover"
          />

          {/* Top bar overlay */}
          <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white font-medium">
                {safeActive + 1} / {images.length}
              </span>
              {safeActive === 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/80 text-[10px] text-white font-bold flex items-center gap-0.5">
                  <Star size={8} /> Cover
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomedUrl(images[safeActive])}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                title="Full preview"
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={() => removeImage(safeActive)}
                className="p-1.5 rounded-full bg-red-500/70 text-white hover:bg-red-500 transition"
                title="Delete image"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {safeActive !== 0 && (
                  <button
                    onClick={() => setCoverImage(safeActive)}
                    className="px-2 py-1 rounded-lg bg-amber-500/80 text-[10px] text-white font-semibold hover:bg-amber-500 transition flex items-center gap-1"
                    title="Set as cover"
                  >
                    <Star size={9} /> Set Cover
                  </button>
                )}
                <button
                  onClick={() => { setReplaceIndex(safeActive); replaceInputRef.current?.click(); }}
                  className="px-2 py-1 rounded-lg bg-white/20 text-[10px] text-white font-medium hover:bg-white/30 transition flex items-center gap-1"
                  title="Replace image"
                >
                  <RotateCw size={9} /> Replace
                </button>
                {images.length < maxImages && (
                  <button
                    onClick={() => duplicateImage(safeActive)}
                    className="px-2 py-1 rounded-lg bg-white/20 text-[10px] text-white font-medium hover:bg-white/30 transition flex items-center gap-1"
                    title="Duplicate"
                  >
                    <Copy size={9} /> Duplicate
                  </button>
                )}
              </div>

              {/* Reorder arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveImage(safeActive, safeActive - 1)}
                  disabled={safeActive === 0}
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-30"
                  title="Move left"
                >
                  <ArrowUp size={10} className="rotate-[-90deg]" />
                </button>
                <button
                  onClick={() => moveImage(safeActive, safeActive + 1)}
                  disabled={safeActive === images.length - 1}
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-30"
                  title="Move right"
                >
                  <ArrowDown size={10} className="rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((safeActive - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveIndex((safeActive + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      ) : fallbackPreview ? (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-secondary/30">
            <img src={fallbackPreview} alt="Fallback preview" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
              Fallback preview
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">{fallbackHint}</p>
        </div>
      ) : (
        <div
          className="rounded-xl border-2 border-dashed border-border aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ImagePlus size={24} className="text-primary/60" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium">Click to add images</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">or drag files here</p>
          </div>
        </div>
      )}

      {/* Drag-reorderable thumbnail strip */}
      {images.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={() => { setDragSourceIndex(null); setDragOverIndex(null); }}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-all group/thumb ${
                i === safeActive
                  ? "border-primary ring-2 ring-primary/20 scale-105"
                  : dragOverIndex === i
                  ? "border-primary/50 scale-105"
                  : "border-border hover:border-primary/40"
              } ${dragSourceIndex === i ? "opacity-40" : ""}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {/* Cover badge */}
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-[7px] text-white font-bold text-center py-0.5">
                  COVER
                </div>
              )}
              {/* Delete on hover */}
              <button
                onClick={e => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 opacity-0 group-hover/thumb:opacity-100 transition"
              >
                <X size={8} className="text-white" />
              </button>
              {/* Index number */}
              <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/50 text-[8px] text-white font-bold flex items-center justify-center">
                {i + 1}
              </span>
            </div>
          ))}

          {/* Add more button in strip */}
          {images.length < maxImages && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition gap-0.5"
            >
              <ImagePlus size={14} className="text-muted-foreground/50" />
              <span className="text-[7px] text-muted-foreground/50 font-medium">Add</span>
            </div>
          )}
        </div>
      )}

      {/* Upload progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-primary/5 border border-primary/20 p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span className="text-[11px] font-medium text-foreground">Uploading...</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload controls */}
      {images.length < maxImages && (
        <div className="grid grid-cols-2 gap-2">
          <label className={`py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-xs text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1.5 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={13} /> {uploading ? "Uploading..." : "Upload"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleUpload(e.target.files)}
            />
          </label>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="py-2.5 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground font-medium hover:bg-secondary/50 hover:border-primary/20 transition flex items-center justify-center gap-1.5"
          >
            <Link size={13} /> Paste URL
          </button>
        </div>
      )}

      {/* URL input */}
      <AnimatePresence>
        {showUrlInput && images.length < maxImages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Input
              placeholder="Paste image URL and press Enter..."
              className="text-xs"
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                  onChange([...images, (e.target as HTMLInputElement).value].slice(0, maxImages));
                  (e.target as HTMLInputElement).value = "";
                  setShowUrlInput(false);
                }
                if (e.key === "Escape") setShowUrlInput(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden replace input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          if (e.target.files?.[0] && replaceIndex !== null) {
            handleReplace(e.target.files[0], replaceIndex);
          }
          e.target.value = "";
        }}
      />

      {/* Fullscreen zoom modal */}
      <AnimatePresence>
        {zoomedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setZoomedUrl(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedUrl}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setZoomedUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
