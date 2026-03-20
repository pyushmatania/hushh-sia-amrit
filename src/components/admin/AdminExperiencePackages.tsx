import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Search, Plus, Trash2, Pencil, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PackageRow {
  id: string;
  name: string;
  emoji: string;
  price: number;
  includes: string[];
  gradient: string;
  sort_order: number;
  active: boolean;
}

const GRADIENT_OPTIONS = [
  "from-primary/80 to-primary/40",
  "from-tertiary/80 to-tertiary/40",
  "from-accent/60 to-accent/20",
  "from-primary/60 to-tertiary/40",
  "from-accent/80 to-primary/30",
  "from-tertiary/60 to-accent/40",
  "from-rose-500/70 to-pink-600/40",
  "from-amber-500/70 to-orange-600/40",
  "from-emerald-500/70 to-teal-600/40",
  "from-violet-500/70 to-purple-600/40",
];

export default function AdminExperiencePackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PackageRow> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [includeInput, setIncludeInput] = useState("");

  const loadPackages = async () => {
    const { data } = await supabase
      .from("experience_packages")
      .select("*")
      .order("sort_order", { ascending: true });
    setPackages((data as PackageRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadPackages(); }, []);

  const filtered = packages.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing({
      name: "", emoji: "🎉", price: 0,
      includes: [], gradient: GRADIENT_OPTIONS[0],
      sort_order: packages.length + 1, active: true,
    });
    setIsCreating(true);
    setIncludeInput("");
  };

  const addInclude = () => {
    if (!includeInput.trim() || !editing) return;
    setEditing({ ...editing, includes: [...(editing.includes || []), includeInput.trim()] });
    setIncludeInput("");
  };

  const removeInclude = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, includes: editing.includes?.filter((_, i) => i !== idx) });
  };

  const save = async () => {
    if (!editing?.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    const payload = {
      name: editing.name,
      emoji: editing.emoji || "✨",
      price: editing.price || 0,
      includes: editing.includes || [],
      gradient: editing.gradient || GRADIENT_OPTIONS[0],
      sort_order: editing.sort_order || 0,
      active: editing.active ?? true,
    };

    if (isCreating) {
      const { data, error } = await supabase
        .from("experience_packages")
        .insert(payload)
        .select()
        .maybeSingle();
      if (error) {
        toast({ title: "Failed to add", description: error.message, variant: "destructive" });
        return;
      }
      if (data) setPackages(prev => [...prev, data as PackageRow]);
      toast({ title: "Package added!" });
    } else {
      const { error } = await supabase
        .from("experience_packages")
        .update(payload)
        .eq("id", editing.id!);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      setPackages(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
      toast({ title: "Package updated!" });
    }
    setEditing(null);
    window.dispatchEvent(new Event("hushh:listings-updated"));
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await supabase.from("experience_packages").delete().eq("id", id);
    setPackages(prev => prev.filter(p => p.id !== id));
    toast({ title: "Package deleted" });
    window.dispatchEvent(new Event("hushh:listings-updated"));
  };

  const toggleActive = async (pkg: PackageRow) => {
    const next = !pkg.active;
    await supabase.from("experience_packages").update({ active: next }).eq("id", pkg.id);
    setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, active: next } : p));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Gift size={18} className="text-primary" /> Experience Packages
          </h2>
          <p className="text-sm text-muted-foreground">{packages.length} packages</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition"
        >
          <Plus size={16} /> Add Package
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search packages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Gift size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No packages found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border bg-card p-4 flex items-center gap-3 transition ${
                !pkg.active ? "opacity-50" : ""
              } border-border`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pkg.gradient} flex items-center justify-center text-lg`}>
                {pkg.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{pkg.name}</h4>
                <p className="text-xs text-muted-foreground tabular-nums">₹{pkg.price} · {pkg.includes.length} items</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pkg.includes.slice(0, 3).map((inc, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{inc}</span>
                  ))}
                  {pkg.includes.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">+{pkg.includes.length - 3}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleActive(pkg)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                    pkg.active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pkg.active ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => { setEditing({ ...pkg }); setIsCreating(false); setIncludeInput(""); }}
                  className="p-1.5 rounded-lg hover:bg-secondary transition"
                >
                  <Pencil size={13} className="text-muted-foreground" />
                </button>
                <button
                  onClick={() => deletePackage(pkg.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition"
                >
                  <Trash2 size={13} className="text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit/Create Sheet */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border p-5 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  {isCreating ? "Add Package" : "Edit Package"}
                </h2>
                <button onClick={() => setEditing(null)} className="p-1 rounded-lg hover:bg-secondary">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-[60px_1fr] gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Emoji</label>
                  <Input
                    value={editing.emoji || ""}
                    onChange={e => setEditing(p => ({ ...p!, emoji: e.target.value }))}
                    className="text-center text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <Input
                    value={editing.name || ""}
                    onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))}
                    placeholder="Romantic Date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Price (₹)</label>
                  <Input
                    type="number"
                    value={editing.price ?? ""}
                    onChange={e => setEditing(p => ({ ...p!, price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? ""}
                    onChange={e => setEditing(p => ({ ...p!, sort_order: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Gradient picker */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Card Gradient</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_OPTIONS.map(g => (
                    <button
                      key={g}
                      onClick={() => setEditing(p => ({ ...p!, gradient: g }))}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} border-2 transition ${
                        editing.gradient === g ? "border-primary scale-110" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Includes */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Includes</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editing.includes || []).map((inc, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground flex items-center gap-1"
                    >
                      {inc}
                      <button onClick={() => removeInclude(idx)}>
                        <X size={10} className="text-muted-foreground" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={includeInput}
                    onChange={e => setIncludeInput(e.target.value)}
                    placeholder="e.g. Dinner, DJ, Pool"
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInclude())}
                    className="flex-1"
                  />
                  <button
                    onClick={addInclude}
                    className="px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={e => setEditing(p => ({ ...p!, active: e.target.checked }))}
                  className="rounded border-input"
                  id="pkg-active"
                />
                <label htmlFor="pkg-active" className="text-sm text-foreground">Active</label>
              </div>

              <button
                onClick={save}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition"
              >
                {isCreating ? "Add Package" : "Save Changes"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
