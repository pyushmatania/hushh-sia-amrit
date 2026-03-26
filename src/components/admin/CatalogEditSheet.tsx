import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Save } from "lucide-react";

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
}: CatalogEditSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                {icon}
                {title}
              </h2>
              <div className="flex items-center gap-1.5">
                {autoSaveStatus && autoSaveStatus !== "idle" && (
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${
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
                    <Eye size={12} /> {previewMode ? "Edit" : "Preview"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-secondary transition"
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
            <div className="px-5 py-3 border-t border-border shrink-0">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-200/30 dark:shadow-indigo-900/20 hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
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
