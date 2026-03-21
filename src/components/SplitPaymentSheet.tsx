import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Users, Trash2, Share2, Check, Loader2, Split } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface SplitEntry {
  id?: string;
  friend_name: string;
  friend_email: string;
  amount: number;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  totalAmount: number;
  propertyName: string;
}

export default function SplitPaymentSheet({ open, onClose, bookingId, totalAmount, propertyName }: Props) {
  const { user } = useAuth();
  const [splits, setSplits] = useState<SplitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("booking_splits")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at");
    if (data && data.length > 0) {
      setSplits(data.map(d => ({
        id: d.id,
        friend_name: d.friend_name,
        friend_email: d.friend_email,
        amount: Number(d.amount),
        status: d.status,
      })));
    } else {
      // Default: just the user
      setSplits([]);
    }
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const addSplit = () => {
    setSplits(prev => [...prev, { friend_name: "", friend_email: "", amount: 0, status: "pending" }]);
  };

  const removeSplit = (index: number) => {
    setSplits(prev => prev.filter((_, i) => i !== index));
  };

  const updateSplit = (index: number, field: keyof SplitEntry, value: string | number) => {
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const splitEvenly = () => {
    if (splits.length === 0) return;
    const perPerson = Math.round(totalAmount / (splits.length + 1)); // +1 for the user
    setSplits(prev => prev.map(s => ({ ...s, amount: perPerson })));
  };

  const yourShare = totalAmount - splits.reduce((s, sp) => s + sp.amount, 0);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Delete existing splits for this booking
    await supabase.from("booking_splits").delete().eq("booking_id", bookingId);

    // Insert new splits
    if (splits.length > 0) {
      const inserts = splits.map(s => ({
        booking_id: bookingId,
        created_by: user.id,
        friend_name: s.friend_name,
        friend_email: s.friend_email,
        amount: s.amount,
        status: s.status,
      }));
      await supabase.from("booking_splits").insert(inserts);
    }

    toast.success("Split saved!");
    setSaving(false);
  };

  const handleShareSplit = async () => {
    const text = splits
      .map(s => `${s.friend_name || "Friend"}: ₹${s.amount.toLocaleString()}`)
      .join("\n");

    const shareText = `💰 Split Payment for ${propertyName}\n\nYour share: ₹${yourShare.toLocaleString()}\n${text}\n\nTotal: ₹${totalAmount.toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Split Payment", text: shareText });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    }
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
                <Split size={16} className="text-primary" /> Split Payment
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{propertyName} · ₹{totalAmount.toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Your share */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">You</span>
                </div>
                <span className="text-sm font-semibold text-foreground">Your Share</span>
              </div>
              <span className={`text-lg font-bold ${yourShare < 0 ? "text-destructive" : "text-foreground"}`}>
                ₹{yourShare.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Split entries */}
          <AnimatePresence>
            {splits.map((split, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Friend {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      split.status === "paid" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                    }`}>
                      {split.status}
                    </span>
                    <button onClick={() => removeSplit(i)} className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Trash2 size={10} className="text-destructive" />
                    </button>
                  </div>
                </div>
                <Input
                  placeholder="Friend's name"
                  value={split.friend_name}
                  onChange={e => updateSplit(i, "friend_name", e.target.value)}
                  className="h-9 text-sm rounded-xl"
                />
                <Input
                  placeholder="Email or phone"
                  value={split.friend_email}
                  onChange={e => updateSplit(i, "friend_email", e.target.value)}
                  className="h-9 text-sm rounded-xl"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Amount:</span>
                  <Input
                    type="number"
                    value={split.amount || ""}
                    onChange={e => updateSplit(i, "amount", Number(e.target.value))}
                    className="h-9 text-sm rounded-xl flex-1"
                    placeholder="0"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={addSplit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Plus size={14} /> Add Friend
            </button>
            {splits.length > 0 && (
              <button
                onClick={splitEvenly}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-xs font-semibold text-foreground"
              >
                <Users size={14} /> Split Evenly
              </button>
            )}
          </div>

          {splits.length > 0 && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Split
              </button>
              <button
                onClick={handleShareSplit}
                className="w-12 flex items-center justify-center rounded-xl bg-secondary border border-border"
              >
                <Share2 size={16} className="text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
