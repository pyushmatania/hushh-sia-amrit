import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Search, Plus, Save, X, Eye, Trash2,
  GripVertical, Loader2, ChevronDown, CheckSquare
} from "lucide-react";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SwipeableRow from "./SwipeableRow";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import BatchOperationsBar from "./BatchOperationsBar";

const MOOD_OPTIONS = ["Romantic", "Party", "Chill", "Adventure", "Work", "Celebration", "Family"];
const INCLUDE_OPTIONS = [
  "🏠 Private Stay", "🍕 Food & Drinks", "🎵 Music System", "🎬 Projector",
  "🏊 Pool Access", "🔥 Bonfire", "🎮 Gaming", "🍺 Bar Setup",
  "🎂 Cake & Decor", "🚗 Pickup & Drop", "👨‍🍳 Chef Service", "🧘 Wellness"
];

interface CurationDraft {
  name: string;
  emoji: string;
  tagline: string;
  price: number;
  original_price: number | null;
  slot: string;
  includes: string[];
  tags: string[];
  mood: string[];
  badge: string;
  property_id: string;
  active: boolean;
}

const emptyDraft: CurationDraft = {
  name: "", emoji: "✨", tagline: "", price: 0, original_price: null,
  slot: "", includes: [], tags: [], mood: [], badge: "", property_id: "", active: true,
};

export default function AdminCurations() {
  const { toast } = useToast();
  const [curations, setCurations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CurationDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await supabase.from("curations").delete().eq("id", id);
    }
    setCurations(prev => prev.filter(c => !ids.includes(c.id)));
    setSelectedIds([]);
    window.dispatchEvent(new Event("hushh:listings-updated"));
    toast({ title: `${ids.length} curations deleted` });
  };

  const loadCurations = () => {
    supabase.from("curations").select("*").order("sort_order")
      .then(({ data }) => { setCurations(data ?? []); setLoading(false); });
  };

  useEffect(() => { loadCurations(); }, []);

  const filtered = [...curations]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const { getDragHandleProps, getDragItemStyle, getDropTargetProps, handleDragEnd, isDragging, isDragOver } = useDragReorder({
    items: [...curations].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    getId: (c: any) => c.id,
    getA11yLabel: (c: any) => `Reorder ${c.name}`,
    onReorder: async (updates) => {
      setCurations(prev => prev.map(c => { const u = updates.find(u => u.id === c.id); return u ? { ...c, sort_order: u.sort_order } : c; }));
      for (const u of updates) { await supabase.from("curations").update({ sort_order: u.sort_order }).eq("id", u.id); }
      toast({ title: "Order saved" });
      window.dispatchEvent(new Event("hushh:listings-updated"));
    },
  });

  const startCreate = () => {
    setEditing({ ...emptyDraft });
    setEditingId(null);
    setPreviewMode(false);
  };

  const startEdit = (c: any) => {
    setEditing({
      name: c.name, emoji: c.emoji, tagline: c.tagline,
      price: Number(c.price), original_price: c.original_price ? Number(c.original_price) : null,
      slot: c.slot, includes: c.includes || [], tags: c.tags || [],
      mood: c.mood || [], badge: c.badge || "", property_id: c.property_id,
      active: c.active,
    });
    setEditingId(c.id);
    setPreviewMode(false);
  };

  const toggleInclude = (inc: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      includes: editing.includes.includes(inc)
        ? editing.includes.filter(i => i !== inc)
        : [...editing.includes, inc],
    });
  };

  const toggleMood = (m: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      mood: editing.mood.includes(m)
        ? editing.mood.filter(i => i !== m)
        : [...editing.mood, m],
    });
  };

  const saveCuration = async () => {
    if (!editing || !editing.name || !editing.property_id) return;
    setSaving(true);

    const payload = {
      name: editing.name, emoji: editing.emoji, tagline: editing.tagline,
      price: editing.price, original_price: editing.original_price,
      slot: editing.slot, includes: editing.includes, tags: editing.tags,
      mood: editing.mood, badge: editing.badge || null, property_id: editing.property_id,
      active: editing.active,
    };

    if (editingId) {
      await supabase.from("curations").update(payload).eq("id", editingId);
    } else {
      await supabase.from("curations").insert(payload);
    }

    setSaving(false);
    setEditing(null);
    setEditingId(null);
    loadCurations();
    window.dispatchEvent(new Event("hushh:listings-updated"));
  };

  // Builder UI
  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            {editingId ? "Edit Curation" : "Create Curation"}
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground flex items-center gap-1">
              <Eye size={12} /> {previewMode ? "Edit" : "Preview"}
            </button>
            <button onClick={() => { setEditing(null); setEditingId(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-muted-foreground">
              <X size={14} />
            </button>
          </div>
        </div>

        {previewMode ? (
          /* Preview card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-6 text-center">
              <span className="text-4xl">{editing.emoji}</span>
              <h3 className="text-lg font-bold text-foreground mt-2">{editing.name || "Untitled"}</h3>
              <p className="text-sm text-muted-foreground">{editing.tagline || "Add a tagline"}</p>
              {editing.badge && (
                <span className="inline-block mt-2 text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">
                  {editing.badge}
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-foreground">₹{editing.price.toLocaleString()}</span>
                {editing.original_price && (
                  <span className="text-sm text-muted-foreground line-through">₹{editing.original_price.toLocaleString()}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{editing.slot || "No slot set"}</p>
              <div className="flex flex-wrap gap-1.5">
                {editing.includes.map(inc => (
                  <span key={inc} className="text-[11px] bg-secondary text-foreground px-2 py-1 rounded-lg">{inc}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {editing.mood.map(m => (
                  <span key={m} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Editor form */
          <div className="space-y-4">
            <div className="grid grid-cols-[60px_1fr] gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Emoji</label>
                <Input value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} className="text-center text-xl" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Name</label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Experience name" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Tagline</label>
              <Input value={editing.tagline} onChange={e => setEditing({ ...editing, tagline: e.target.value })} placeholder="Short catchy tagline" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Price (₹)</label>
                <Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Original Price</label>
                <Input type="number" value={editing.original_price || ""} onChange={e => setEditing({ ...editing, original_price: e.target.value ? Number(e.target.value) : null })} placeholder="Optional" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Time Slot</label>
                <Input value={editing.slot} onChange={e => setEditing({ ...editing, slot: e.target.value })} placeholder="e.g. 7 PM – 11 PM" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Property ID</label>
                <Input value={editing.property_id} onChange={e => setEditing({ ...editing, property_id: e.target.value })} placeholder="property-id" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Badge (optional)</label>
              <Input value={editing.badge} onChange={e => setEditing({ ...editing, badge: e.target.value })} placeholder="e.g. Most Popular, New" />
            </div>

            {/* Includes selector */}
            <div>
              <label className="text-[10px] text-muted-foreground mb-2 block">What's Included</label>
              <div className="flex flex-wrap gap-2">
                {INCLUDE_OPTIONS.map(inc => (
                  <button
                    key={inc}
                    onClick={() => toggleInclude(inc)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      editing.includes.includes(inc)
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >{inc}</button>
                ))}
              </div>
            </div>

            {/* Mood selector */}
            <div>
              <label className="text-[10px] text-muted-foreground mb-2 block">Mood Tags</label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      editing.mood.includes(m)
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >{m}</button>
                ))}
              </div>
            </div>

            {/* Save */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveCuration}
              disabled={saving || !editing.name || !editing.property_id}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? "Update Curation" : "Create Curation"}
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/15 dark:to-orange-500/15 flex items-center justify-center">
              <Sparkles size={17} className="text-amber-600 dark:text-amber-400" />
            </div>
            Curations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 ml-[46px]">{curations.length} curated experiences · Swipe or drag to reorder</p>
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
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-200/50 dark:shadow-amber-900/30 hover:shadow-lg transition-shadow"
          >
            <Plus size={15} /> Create
          </motion.button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search curations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <SwipeableRow
              key={c.id}
              showHint={c === filtered[0]}
              onEdit={() => startEdit(c)}
              onDelete={() => setDeleteTarget({ id: c.id, name: c.name })}
            >
              <div
                {...getDropTargetProps(c)}
                onDragEnd={handleDragEnd}
                style={getDragItemStyle(c)}
                className={`rounded-xl border bg-card p-4 hover:border-primary/30 select-none ${selectedIds.includes(c.id) ? "border-primary/50 bg-primary/5" : "border-border"}`}
                onClick={() => startEdit(c)}
              >
                <div className="flex items-start gap-2">
                  {bulkMode && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleSelect(c.id); }}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                        selectedIds.includes(c.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"
                      }`}
                    >
                      {selectedIds.includes(c.id) && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                  )}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
                      {c.badge && <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">{c.badge}</span>}
                      <div className="ml-auto flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(c); setPreviewMode(true); }}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ id: c.id, name: c.name });
                          }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.tagline}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm font-bold text-foreground tabular-nums">₹{Number(c.price).toLocaleString()}</p>
                      {c.original_price && (
                        <p className="text-xs text-muted-foreground line-through tabular-nums">₹{Number(c.original_price).toLocaleString()}</p>
                      )}
                      <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(c.includes || []).slice(0, 4).map((inc: string) => (
                        <span key={inc} className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{inc}</span>
                      ))}
                      {(c.includes || []).length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{c.includes.length - 4}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    {...getDragHandleProps(c)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition shrink-0 cursor-grab active:cursor-grabbing touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <GripVertical size={20} />
                  </button>
                </div>
              </div>
            </SwipeableRow>
          ))}
        </div>
      )}

      <BatchOperationsBar
        selectedIds={selectedIds}
        totalCount={filtered.length}
        onSelectAll={() => setSelectedIds(filtered.map(c => c.id))}
        onDeselectAll={() => setSelectedIds([])}
        onBulkDelete={bulkDelete}
        entityName="curations"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This curation will be permanently removed."
        onConfirm={async () => {
          if (!deleteTarget) return;
          const { error } = await supabase.from("curations").delete().eq("id", deleteTarget.id);
          if (error) {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
          } else {
            setCurations(prev => prev.filter(x => x.id !== deleteTarget.id));
            toast({ title: "Curation deleted" });
            window.dispatchEvent(new Event("hushh:listings-updated"));
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
