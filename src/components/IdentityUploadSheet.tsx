import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Upload, CheckCircle2, Clock, X, Camera, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const docTypes = [
  { id: "aadhaar", label: "Aadhaar Card", icon: "🪪" },
  { id: "pan", label: "PAN Card", icon: "💳" },
  { id: "passport", label: "Passport", icon: "📕" },
  { id: "driving_license", label: "Driving License", icon: "🚗" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function IdentityUploadSheet({ open, onClose }: Props) {
  const { user } = useAuth();
  const [docType, setDocType] = useState("aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select a document"); return; }
    setUploading(true);

    const userId = user?.id || "guest-" + Date.now();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${docType}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("identity-docs")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("identity-docs").getPublicUrl(path);

    const { error: dbError } = await supabase.from("identity_verifications" as any).insert({
      user_id: user?.id || "00000000-0000-0000-0000-000000000000",
      document_type: docType,
      document_url: urlData.publicUrl || path,
      status: "pending",
    } as any);

    if (dbError) {
      toast.error("Submission failed");
      setUploading(false);
      return;
    }

    setUploading(false);
    setSubmitted(true);
    toast.success("ID submitted for verification!");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border p-6 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Verify Identity</h2>
                <p className="text-xs text-muted-foreground">Upload a govt. ID for verification</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary"><X size={18} /></button>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Submitted!</h3>
              <p className="text-sm text-muted-foreground mb-1">Your ID is under review</p>
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs">
                <Clock size={12} /> Usually verified within 24 hours
              </div>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm">Done</button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Document Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {docTypes.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDocType(d.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        docType === d.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{d.icon}</span> {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Upload Document</p>
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <FileText size={12} /> {file?.name}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 cursor-pointer transition-colors">
                    <Camera size={28} className="text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">Tap to upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG or PDF · Max 5MB</p>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                  </label>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Upload size={16} /></motion.div>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Upload size={16} /> Submit for Verification</span>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                🔒 Your document is encrypted and stored securely
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
