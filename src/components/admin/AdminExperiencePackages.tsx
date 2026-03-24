import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Search, Plus, Trash2, Pencil, X, Eye, GripVertical, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import SwipeableRow from "./SwipeableRow";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import BatchOperationsBar from "./BatchOperationsBar";
import MultiImageEditor from "./MultiImageEditor";
import VideoEditor from "./VideoEditor";

interface PackageRow {
  id: string;
  name: string;
  emoji: string;
  price: number;
  includes: string[];
  gradient: string;
  sort_order: number;
  active: boolean;
  image_url: string | null;
  image_urls: string[];
  video_url?: string | null;
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
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await supabase.from("experience_packages").delete().eq("id", id);
    }
    setPackages(prev => prev.filter(p => !ids.includes(p.id)));
    setSelectedIds([]);
    window.dispatchEvent(new Event("hushh:listings-updated"));
    toast({ title: `${ids.length} packages deleted` });
  };

  const loadPackages = async () => {
    const { data } = await supabase
      .from("experience_packages")
      .select("*")
      .order("sort_order", { ascending: true });
    setPackages((data as PackageRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadPackages(); }, []);

  const filtered = [...packages]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order);

  const openCreate = () => {
    setEditing({
      name: "", emoji: "🎉", price: 0,
      includes: [], gradient: GRADIENT_OPTIONS[0],
      sort_order: packages.length + 1, active: true,
      image_url: null, image_urls: [], video_url: null,
    });
    setIsCreating(true);
    setIncludeInput("");
    setPreviewMode(false);
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
      image_url: (editing.image_urls || [])[0] || editing.image_url || null,
      image_urls: editing.image_urls || [],
      video_url: editing.video_url || null,
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
    setDeleteTarget(id);
  };

  const confirmDeletePackage = async () => {
    if (!deleteTarget) return;
    await supabase.from("experience_packages").delete().eq("id", deleteTarget);
    setPackages(prev => prev.filter(p => p.id !== deleteTarget));
    toast({ title: "Package deleted" });
    window.dispatchEvent(new Event("hushh:listings-updated"));
    setDeleteTarget(null);
  };

  const toggleActive = async (pkg: PackageRow) => {
    const next = !pkg.active;
    await supabase.from("experience_packages").update({ active: next }).eq("id", pkg.id);
    setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, active: next } : p));
  };

  const { getDragHandleProps, getDragItemStyle, getDropTargetProps, handleDragEnd, isDragging, isDragOver } = useDragReorder({
    items: [...packages].sort((a, b) => a.sort_order - b.sort_order),
    getId: (p) => p.id,
    getA11yLabel: (p) => `Reorder ${p.name}`,
    onReorder: async (updates) => {
      setPackages(prev => prev.map(p => { const u = updates.find(u => u.id === p.id); return u ? { ...p, sort_order: u.sort_order } : p; }));
      for (const u of updates) { await supabase.from("experience_packages").update({ sort_order: u.sort_order }).eq("id", u.id); }
      toast({ title: "Order saved" });
      window.dispatchEvent(new Event("hushh:listings-updated"));
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-500/15 dark:to-rose-500/15 flex items-center justify-center">
              <Gift size={17} className="text-pink-600 dark:text-pink-400" />
            </div>
            Experience Packages
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 ml-[46px]">{packages.length} packages · Swipe or drag to reorder</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds([]); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              bulkMode ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}>
            <CheckSquare size={15} /> {bulkMode ? "Cancel" : "Bulk"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-md shadow-pink-200/50 dark:shadow-pink-900/30 hover:shadow-lg transition-shadow"
          >
            <Plus size={15} /> Add Package
          </motion.button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search packages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
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
          {filtered.map((pkg) => (
            <SwipeableRow
              key={pkg.id}
              showHint={pkg === filtered[0]}
              onEdit={() => { setEditing({ ...pkg, image_urls: pkg.image_urls || (pkg.image_url ? [pkg.image_url] : []), video_url: pkg.video_url || null }); setIsCreating(false); setIncludeInput(""); setPreviewMode(false); }}
              onDelete={() => deletePackage(pkg.id)}
            >
              <div
                {...getDropTargetProps(pkg)}
                onDragEnd={handleDragEnd}
                style={getDragItemStyle(pkg)}
                className={`rounded-xl border bg-card p-4 flex items-center gap-2 select-none ${
                  !pkg.active ? "opacity-50" : ""} ${selectedIds.includes(pkg.id) ? "border-primary/50 bg-primary/5" : "border-border"}`}
              >
                {bulkMode && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggleSelect(pkg.id); }}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      selectedIds.includes(pkg.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"
                    }`}
                  >
                    {selectedIds.includes(pkg.id) && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pkg.gradient} flex items-center justify-center text-2xl shadow-sm shrink-0 overflow-hidden`}>
                  {pkg.image_url ? <img src={pkg.image_url} alt="" className="w-full h-full object-cover" /> : pkg.emoji}
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
                    onClick={() => { setEditing({ ...pkg, image_urls: pkg.image_urls || (pkg.image_url ? [pkg.image_url] : []), video_url: pkg.video_url || null }); setIsCreating(false); setIncludeInput(""); setPreviewMode(false); }}
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
                <button
                  type="button"
                  {...getDragHandleProps(pkg)}
                  className="ml-1 h-10 w-10 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition shrink-0 cursor-grab active:cursor-grabbing touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <GripVertical size={20} />
                </button>
              </div>
            </SwipeableRow>
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewMode(!previewMode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${previewMode ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    <Eye size={12} /> {previewMode ? "Edit" : "Preview"}
                  </button>
                  <button onClick={() => setEditing(null)} className="p-1 rounded-lg hover:bg-secondary">
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {previewMode ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-border bg-background overflow-hidden">
                  {editing.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={editing.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`bg-gradient-to-br ${editing.gradient || "from-primary/80 to-primary/40"} p-6 text-center`}>
                    <span className="text-4xl">{editing.emoji || "✨"}</span>
                    <h3 className="text-lg font-bold text-white mt-2">{editing.name || "Package Name"}</h3>
                    <p className="text-2xl font-bold text-white mt-1 tabular-nums">₹{(editing.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {(editing.includes || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(editing.includes || []).map((inc, j) => (
                          <span key={j} className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground">{inc}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No inclusions added yet</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <>

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

              {/* Package Images */}
              <MultiImageEditor
                images={editing.image_urls || []}
                onChange={urls => setEditing(p => ({ ...p!, image_urls: urls, image_url: urls[0] || null }))}
                storagePath="packages"
                label="Package Images"
                maxImages={8}
                dimensionTip="Recommended: 800×800px (1:1 square) or 1200×800px (3:2), JPG/WebP, under 2MB"
              />

              {/* Package Video (for vertical video cards) */}
              <VideoEditor
                videoUrl={editing.video_url || null}
                onChange={url => setEditing(p => ({ ...p!, video_url: url }))}
                storagePath="package-videos"
                label="Vertical Video (for discovery cards)"
                dimensionTip="Recommended: 1080×1920px (9:16 vertical), MP4, under 15MB, 5-15 seconds"
              />

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

              </>
              )}

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

      <BatchOperationsBar
        selectedIds={selectedIds}
        totalCount={filtered.length}
        onSelectAll={() => setSelectedIds(filtered.map(p => p.id))}
        onDeselectAll={() => setSelectedIds([])}
        onBulkDelete={bulkDelete}
        entityName="packages"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete this package?"
        description="This experience package will be permanently removed."
        onConfirm={confirmDeletePackage}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
