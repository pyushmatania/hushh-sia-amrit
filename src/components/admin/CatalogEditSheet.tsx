import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Save, Pencil } from "lucide-react";

interface CatalogEditSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  onSave: () => void;
  saveLabel?: string;
  previewMode?: boolean;
  onTogglePreview?: () => void;
  autoSaveStatus?: "idle" | "saving" | "saved" | "error";
  children: ReactNode;
  previewContent?: ReactNode;
  /** Optional hero image URL shown at the top of the drawer */
  heroImage?: string | null;
}

export default function CatalogEditSheet({
  open,
  onClose,
  title,
  icon,
  onSave,
  saveLabel = "Save & Close",
  previewMode,
  onTogglePreview,
  autoSaveStatus,
  children,
  previewContent,
  heroImage,
}: CatalogEditSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Image */}
            {heroImage && (
              <div className="relative h-44 shrink-0 overflow-hidden">
                <img src={heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>
            )}

            {/* Header - overlaps hero if present */}
            <div className={`shrink-0 px-5 py-4 flex items-center justify-between gap-3 ${heroImage ? "-mt-14 relative z-10" : "border-b border-border"}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {icon && (
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-foreground truncate">{title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {autoSaveStatus && autoSaveStatus !== "idle" && (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                      autoSaveStatus === "saving"
                        ? "bg-amber-500/15 text-amber-500"
                        : autoSaveStatus === "saved"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {autoSaveStatus === "saving"
                      ? "⏳ Saving..."
                      : autoSaveStatus === "saved"
                      ? "✓ Saved"
                      : "⚠ Error"}
                  </span>
                )}
                {onTogglePreview && (
                  <button
                    onClick={onTogglePreview}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition ${
                      previewMode
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {previewMode ? <Pencil size={12} /> : <Eye size={12} />}
                    {previewMode ? "Edit" : "Preview"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-secondary transition"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {previewMode && previewContent ? previewContent : children}
            </div>

            {/* Fixed Footer */}
            <div className="px-5 py-3 border-t border-border shrink-0 bg-card">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Save size={14} />
                {saveLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
