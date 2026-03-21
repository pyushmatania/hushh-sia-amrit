import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Plus, Trash2, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface BookingPhoto {
  id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  user_id: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  propertyName: string;
}

export default function BookingPhotosSheet({ open, onClose, bookingId, propertyName }: Props) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<BookingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("booking_photos")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });
    setPhotos((data as BookingPhoto[]) ?? []);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user) return;
    setUploading(true);
    const file = e.target.files[0];
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${bookingId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("booking-photos")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("booking-photos").getPublicUrl(path);

    await supabase.from("booking_photos").insert({
      booking_id: bookingId,
      user_id: user.id,
      photo_url: urlData.publicUrl,
      caption: "",
    });

    toast.success("Photo uploaded!");
    setUploading(false);
    load();
  };

  const handleDelete = async (photo: BookingPhoto) => {
    await supabase.from("booking_photos").delete().eq("id", photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    toast.success("Photo removed");
  };

  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-card z-10 px-5 pt-4 pb-3 border-b border-border/50">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Camera size={16} className="text-primary" /> Event Photos
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{propertyName}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold cursor-pointer active:scale-95 transition-transform">
                <Plus size={14} /> Add Photo
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {uploading && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-xs text-primary font-medium">Uploading...</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No photos yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload photos from your event to create memories!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                  onClick={() => setViewPhoto(photo.photo_url)}
                >
                  <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                  {user?.id === photo.user_id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Full-screen photo viewer */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={() => setViewPhoto(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X size={20} className="text-white" />
            </button>
            <img src={viewPhoto} alt="" className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
