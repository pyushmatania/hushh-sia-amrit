import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, X, Check, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CheckItem {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = "hushh_admin_checklist";

export default function FloatingChecklist() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CheckItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [
        { id: "1", text: "Check pending orders", done: false },
        { id: "2", text: "Review new bookings", done: false },
        { id: "3", text: "Approve ID verifications", done: false },
        { id: "4", text: "Update inventory stock", done: false },
      ];
    } catch { return []; }
  });
  const [newText, setNewText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newText.trim()) return;
    setItems(prev => [...prev, { id: Date.now().toString(), text: newText.trim(), done: false }]);
    setNewText("");
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const doneCount = items.filter(i => i.done).length;
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <CheckSquare size={22} />
          {items.length > 0 && doneCount < items.length && (
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-black flex items-center justify-center">
              {items.length - doneCount}
            </span>
          )}
        </div>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:bg-transparent bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-80 max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckSquare size={16} className="text-primary" /> My Checklist
                  </h3>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
                {/* Progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{doneCount}/{items.length}</span>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, height: 0 }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl group transition-colors ${
                        item.done ? "bg-emerald-500/5" : "hover:bg-secondary/50"
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          item.done
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {item.done && <Check size={12} className="text-white" />}
                      </button>
                      <span className={`flex-1 text-xs transition-all ${
                        item.done ? "line-through text-muted-foreground" : "text-foreground"
                      }`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition"
                      >
                        <Trash2 size={12} className="text-destructive" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">All clear! Add a new task ✨</p>
                )}
              </div>

              {/* Add new */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem()}
                    placeholder="Add a task..."
                    className="text-xs h-9"
                  />
                  <button
                    onClick={addItem}
                    disabled={!newText.trim()}
                    className="px-3 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 hover:opacity-90 transition shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
