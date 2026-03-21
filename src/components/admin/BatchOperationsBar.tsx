import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Trash2, Play, Pause, X, AlertTriangle, Loader2 } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import PasswordConfirmDialog from "./PasswordConfirmDialog";

type BatchAction = "delete" | "publish" | "pause" | null;

interface BatchOperationsBarProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkStatusChange?: (ids: string[], status: string) => Promise<void>;
  entityName?: string;
}

export default function BatchOperationsBar({
  selectedIds, totalCount, onSelectAll, onDeselectAll,
  onBulkDelete, onBulkStatusChange, entityName = "items",
}: BatchOperationsBarProps) {
  const [pendingAction, setPendingAction] = useState<BatchAction>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const count = selectedIds.length;

  const handleActionClick = (action: BatchAction) => {
    if (action === "delete") {
      setShowDeleteWarning(true);
    } else {
      setPendingAction(action);
      executeStatusAction(action!);
    }
  };

  const handleDeleteWarningConfirm = () => {
    setShowDeleteWarning(false);
    setPendingAction("delete");
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirm = async () => {
    setLoading(true);
    try {
      await onBulkDelete(selectedIds);
    } finally {
      setLoading(false);
      setShowPasswordConfirm(false);
      setPendingAction(null);
    }
  };

  const executeStatusAction = async (action: string) => {
    if (!onBulkStatusChange) return;
    setLoading(true);
    try {
      const status = action === "publish" ? "published" : "paused";
      await onBulkStatusChange(selectedIds, status);
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="sticky bottom-4 z-30 mx-auto max-w-lg"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-3">
              <div className="flex items-center gap-2">
                {/* Selection info */}
                <div className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckSquare size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{count} selected</p>
                    <p className="text-[10px] text-muted-foreground">of {totalCount} {entityName}</p>
                  </div>
                </div>

                <div className="flex-1" />

                {/* Select all / deselect */}
                <button
                  onClick={count === totalCount ? onDeselectAll : onSelectAll}
                  className="text-[11px] font-medium text-primary hover:underline px-2"
                >
                  {count === totalCount ? "Deselect all" : "Select all"}
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-border" />

                {/* Actions */}
                {onBulkStatusChange && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleActionClick("publish")}
                      disabled={loading}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition disabled:opacity-50"
                      title="Publish selected"
                    >
                      <Play size={15} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleActionClick("pause")}
                      disabled={loading}
                      className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition disabled:opacity-50"
                      title="Pause selected"
                    >
                      <Pause size={15} />
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleActionClick("delete")}
                  disabled={loading}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition disabled:opacity-50"
                  title="Delete selected"
                >
                  <Trash2 size={15} />
                </motion.button>

                {/* Close */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onDeselectAll}
                  className="p-2 rounded-lg hover:bg-secondary transition text-muted-foreground"
                >
                  <X size={15} />
                </motion.button>
              </div>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-2 pt-2 border-t border-border"
                >
                  <Loader2 size={13} className="animate-spin text-primary" />
                  <span className="text-[11px] text-muted-foreground">Processing batch operation...</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Delete warning */}
      <DeleteConfirmDialog
        open={showDeleteWarning}
        onConfirm={handleDeleteWarningConfirm}
        onCancel={() => { setShowDeleteWarning(false); setPendingAction(null); }}
        title={`Delete ${count} ${entityName}?`}
        description={`This will permanently remove ${count} ${entityName}. You'll need to enter your password to confirm this destructive action.`}
      />

      {/* Step 2: Password confirmation */}
      <PasswordConfirmDialog
        open={showPasswordConfirm}
        onConfirm={handlePasswordConfirm}
        onCancel={() => { setShowPasswordConfirm(false); setPendingAction(null); }}
        title={`Confirm deletion of ${count} ${entityName}`}
        description="Enter your admin password to permanently delete the selected items. This cannot be undone."
        loading={loading}
      />
    </>
  );
}
