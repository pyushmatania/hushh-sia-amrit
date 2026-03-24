import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search, Plus, Save, X, Eye, Trash2,
  GripVertical, Loader2, CheckSquare, Filter,
  IndianRupee, MapPin, Clock, TrendingUp, Star,
  Tag, Zap, Users, BarChart3, Heart, ChevronRight
} from "lucide-react";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SwipeableRow from "./SwipeableRow";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import BatchOperationsBar from "./BatchOperationsBar";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import MultiImageEditor from "./MultiImageEditor";
import { useAutoSave } from "@/hooks/use-auto-save";

const MOOD_OPTIONS = ["Romantic", "Party", "Chill", "Adventure", "Work", "Celebration", "Family"];
const INCLUDE_OPTIONS = [
  "🏠 Private Stay", "🍕 Food & Drinks", "🎵 Music System", "🎬 Projector",
  "🏊 Pool Access", "🔥 Bonfire", "🎮 Gaming", "🍺 Bar Setup",
  "🎂 Cake & Decor", "🚗 Pickup & Drop", "👨‍🍳 Chef Service", "🧘 Wellness"
];

interface CurationDraft {
  name: string; emoji: string; tagline: string; price: number;
  original_price: number | null; slot: string; includes: string[];
  tags: string[]; mood: string[]; badge: string; property_id: string; active: boolean;
  image_urls: string[];
}

const emptyDraft: CurationDraft = {
  name: "", emoji: "✨", tagline: "", price: 0, original_price: null,
  slot: "", includes: [], tags: [], mood: [], badge: "", property_id: "", active: true,
  image_urls: [],
};

interface PropertyInfo { name: string; imageUrls: string[]; location: string; rating: number | null }

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

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
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyMap, setPropertyMap] = useState(new Map<string, PropertyInfo>());
  const [bookingCounts, setBookingCounts] = useState(new Map<string, number>());
  const [revenueMap, setRevenueMap] = useState(new Map<string, { bookingRev: number; orderRev: number; totalBookings: number }>());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) await supabase.from("curations").delete().eq("id", id);
    setCurations(prev => prev.filter(c => !ids.includes(c.id)));
    setSelectedIds([]);
    window.dispatchEvent(new Event("hushh:listings-updated"));
    toast({ title: `${ids.length} curations deleted` });
  };

  const loadCurations = async () => {
    try {
      const [curRes, listRes, bookRes, orderRes] = await Promise.all([
        supabase.from("curations").select("*").order("sort_order"),
        supabase.from("host_listings").select("id, name, image_urls, location, rating"),
        supabase.from("bookings").select("property_id, total"),
        supabase.from("orders").select("property_id, total"),
      ]);

      if (curRes.error) {
        console.error("Curations fetch error:", curRes.error);
        toast({ title: "Failed to load curations", description: curRes.error.message, variant: "destructive" });
      }

      setCurations(curRes.data ?? []);

      const pMap = new Map<string, PropertyInfo>();
      (listRes.data ?? []).forEach(l => pMap.set(l.id, { name: l.name, imageUrls: l.image_urls || [], location: l.location, rating: l.rating }));
      setPropertyMap(pMap);

      const bMap = new Map<string, number>();
      const rMap = new Map<string, { bookingRev: number; orderRev: number; totalBookings: number }>();
      (bookRes.data ?? []).forEach(b => {
        bMap.set(b.property_id, (bMap.get(b.property_id) || 0) + 1);
        const prev = rMap.get(b.property_id) || { bookingRev: 0, orderRev: 0, totalBookings: 0 };
        prev.bookingRev += Number(b.total);
        prev.totalBookings += 1;
        rMap.set(b.property_id, prev);
      });
      (orderRes.data ?? []).forEach(o => {
        const prev = rMap.get(o.property_id) || { bookingRev: 0, orderRev: 0, totalBookings: 0 };
        prev.orderRev += Number(o.total);
        rMap.set(o.property_id, prev);
      });
      setBookingCounts(bMap);
      setRevenueMap(rMap);
    } catch (err) {
      console.error("Curations load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCurations(); }, []);

  // Stats
  const totalCurations = curations.length;
  const activeCurations = curations.filter(c => c.active).length;
  const avgPrice = totalCurations ? Math.round(curations.reduce((s, c) => s + Number(c.price), 0) / totalCurations) : 0;
  const uniqueMoods = new Set(curations.flatMap(c => c.mood || []));
  const discountedCount = curations.filter(c => c.original_price && c.original_price > c.price).length;
  const totalEarned = curations.reduce((s, c) => {
    const r = revenueMap.get(c.property_id);
    return s + (r ? r.bookingRev + r.orderRev : 0);
  }, 0);

  // Filtering
  const filtered = [...curations]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.tagline || "").toLowerCase().includes(search.toLowerCase()))
    .filter(c => moodFilter === "all" || (c.mood || []).includes(moodFilter))
    .filter(c => statusFilter === "all" || (statusFilter === "active" ? c.active : !c.active))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const { getDragHandleProps, getDragItemStyle, getDropTargetProps, handleDragEnd } = useDragReorder({
    items: [...curations].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    getId: (c: any) => c.id,
    getA11yLabel: (c: any) => `Reorder ${c.name}`,
    onReorder: async (updates) => {
      setCurations(prev => prev.map(c => { const u = updates.find(u => u.id === c.id); return u ? { ...c, sort_order: u.sort_order } : c; }));
      for (const u of updates) await supabase.from("curations").update({ sort_order: u.sort_order }).eq("id", u.id);
      toast({ title: "Order saved" });
      window.dispatchEvent(new Event("hushh:listings-updated"));
    },
  });

  const startCreate = () => { setEditing({ ...emptyDraft }); setEditingId(null); setPreviewMode(false); };
  const startEdit = (c: any) => {
    setEditing({
      name: c.name, emoji: c.emoji, tagline: c.tagline,
      price: Number(c.price), original_price: c.original_price ? Number(c.original_price) : null,
      slot: c.slot, includes: c.includes || [], tags: c.tags || [],
      mood: c.mood || [], badge: c.badge || "", property_id: c.property_id, active: c.active,
      image_urls: c.image_urls || [],
    });
    setEditingId(c.id);
    setPreviewMode(false);
  };

  const toggleInclude = (inc: string) => {
    if (!editing) return;
    setEditing({ ...editing, includes: editing.includes.includes(inc) ? editing.includes.filter(i => i !== inc) : [...editing.includes, inc] });
  };
  const toggleMood = (m: string) => {
    if (!editing) return;
    setEditing({ ...editing, mood: editing.mood.includes(m) ? editing.mood.filter(i => i !== m) : [...editing.mood, m] });
  };

  const saveCuration = async () => {
    if (!editing || !editing.name || !editing.property_id) return;
    setSaving(true);
    const payload = {
      name: editing.name, emoji: editing.emoji, tagline: editing.tagline,
      price: editing.price, original_price: editing.original_price,
      slot: editing.slot, includes: editing.includes, tags: editing.tags,
      mood: editing.mood, badge: editing.badge || null, property_id: editing.property_id, active: editing.active,
      image_urls: editing.image_urls || [],
    };
    if (editingId) await supabase.from("curations").update(payload).eq("id", editingId);
    else await supabase.from("curations").insert(payload);
    setSaving(false); setEditing(null); setEditingId(null);
    loadCurations();
    window.dispatchEvent(new Event("hushh:listings-updated"));
  };

  // Auto-save for existing curations
  const autoSaveCuration = useCallback(async (data: CurationDraft & { _editingId?: string }) => {
    const id = (data as any)._editingId;
    if (!id || !data.name || !data.property_id) return false;
    const payload = {
      name: data.name, emoji: data.emoji, tagline: data.tagline,
      price: data.price, original_price: data.original_price,
      slot: data.slot, includes: data.includes, tags: data.tags,
      mood: data.mood, badge: data.badge || null, property_id: data.property_id, active: data.active,
      image_urls: data.image_urls || [],
    };
    const { error } = await supabase.from("curations").update(payload).eq("id", id);
    if (!error) {
      setCurations(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
      window.dispatchEvent(new Event("hushh:listings-updated"));
    }
    return !error;
  }, []);

  const autoSaveData = editing && editingId ? { ...editing, _editingId: editingId } : null;
  const { status: autoSaveStatus } = useAutoSave({
    data: autoSaveData,
    onSave: autoSaveCuration,
    enabled: !!editingId,
    debounceMs: 2000,
  });

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("curations").update({ active: !current }).eq("id", id);
    setCurations(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
    window.dispatchEvent(new Event("hushh:listings-updated"));
    toast({ title: !current ? "Curation activated" : "Curation paused" });
  };

  // ── Editor View ──
  if (editing) {
    const propInfo = propertyMap.get(editing.property_id);
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            {editingId ? "Edit Curation" : "Create Curation"}
          </h1>
          <div className="flex gap-2 items-center">
            {editingId && autoSaveStatus !== "idle" && (
              <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${
                autoSaveStatus === "saving" ? "bg-amber-500/15 text-amber-500" :
                autoSaveStatus === "saved" ? "bg-emerald-500/15 text-emerald-500" :
                "bg-destructive/15 text-destructive"
              }`}>
                {autoSaveStatus === "saving" ? "⏳ Saving..." : autoSaveStatus === "saved" ? "✓ Saved" : "⚠ Error"}
              </span>
            )}
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
            {/* Hero with property image */}
            <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
              {propInfo?.imageUrls?.[0] && (
                <img src={propInfo.imageUrls[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{editing.emoji}</span>
                  {editing.badge && (
                    <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{editing.badge}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{editing.name || "Untitled"}</h3>
                <p className="text-xs text-muted-foreground">{editing.tagline || "Add a tagline"}</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-foreground">₹{editing.price.toLocaleString()}</span>
                  {editing.original_price && (
                    <span className="text-sm text-muted-foreground line-through ml-2">₹{editing.original_price.toLocaleString()}</span>
                  )}
                </div>
                {editing.original_price && editing.original_price > editing.price && (
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full">
                    {Math.round(((editing.original_price - editing.price) / editing.original_price) * 100)}% OFF
                  </span>
                )}
              </div>
              {editing.slot && (
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} /> {editing.slot}</p>
              )}
              {propInfo && (
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2.5">
                  {(() => {
                    const thumb = getListingThumbnail(propInfo.name, propInfo.imageUrls, { preferMapped: true });
                    return thumb ? (
                      <img src={thumb} alt={propInfo.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{propInfo.name[0]}</div>
                    );
                  })()}
                  <div>
                    <p className="text-xs font-medium text-foreground">{propInfo.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin size={8} /> {propInfo.location}</p>
                  </div>
                </div>
              )}
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
          <div className="space-y-4">
            {/* Curation Images */}
            <MultiImageEditor
              images={editing.image_urls || []}
              onChange={urls => setEditing({ ...editing, image_urls: urls })}
              storagePath="curations"
              label="Curation Images"
              maxImages={8}
              dimensionTip="Recommended: 1200×800px (3:2) or 800×800px (1:1), JPG/WebP, under 2MB"
            />

            {/* Linked Property Images (read-only preview) */}
            {propInfo && propInfo.imageUrls.length > 0 && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-2 block font-semibold uppercase tracking-wider">Linked Property Images (from {propInfo.name})</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {propInfo.imageUrls.slice(0, 4).map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {propInfo.imageUrls.length > 4 && (
                    <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground font-medium">
                      +{propInfo.imageUrls.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                <label className="text-[10px] text-muted-foreground mb-1 block">Property</label>
                <select value={editing.property_id} onChange={e => setEditing({ ...editing, property_id: e.target.value })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                  <option value="">Select property</option>
                  {Array.from(propertyMap).map(([id, info]) => (
                    <option key={id} value={id}>{info.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Badge (optional)</label>
                <Input value={editing.badge} onChange={e => setEditing({ ...editing, badge: e.target.value })} placeholder="e.g. Most Popular" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.active} onChange={() => setEditing({ ...editing, active: !editing.active })}
                    className="w-4 h-4 rounded border-border accent-primary" />
                  <span className="text-xs text-foreground">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-2 block">What's Included</label>
              <div className="flex flex-wrap gap-2">
                {INCLUDE_OPTIONS.map(inc => (
                  <button key={inc} onClick={() => toggleInclude(inc)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      editing.includes.includes(inc) ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"
                    }`}>{inc}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-2 block">Mood Tags</label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map(m => (
                  <button key={m} onClick={() => toggleMood(m)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      editing.mood.includes(m) ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"
                    }`}>{m}</button>
                ))}
              </div>
            </div>

            {editingId && autoSaveStatus !== "idle" && (
              <div className={`text-center py-1.5 rounded-xl text-[11px] font-semibold ${
                autoSaveStatus === "saving" ? "bg-amber-500/15 text-amber-500" :
                autoSaveStatus === "saved" ? "bg-emerald-500/15 text-emerald-500" :
                "bg-destructive/15 text-destructive"
              }`}>
                {autoSaveStatus === "saving" ? "⏳ Auto-saving..." : autoSaveStatus === "saved" ? "✓ Auto-saved" : "⚠ Save error"}
              </div>
            )}
            <motion.button whileTap={{ scale: 0.97 }} onClick={saveCuration}
              disabled={saving || !editing.name || !editing.property_id}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? "Save & Close" : "Create Curation"}
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  // ── List View ──
  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {/* Hero Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center">
                <Sparkles size={20} className="text-amber-500" />
              </div>
              Curations
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 ml-[50px]">{totalCurations} total · {activeCurations} active · {filtered.length} shown · Swipe or drag</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds([]); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                bulkMode ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground"
              }`}>
              <CheckSquare size={14} /> {bulkMode ? "Cancel" : "Bulk"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={startCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md">
              <Plus size={15} /> Create
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-5 gap-2">
        {[
          { label: "Active", value: activeCurations, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Avg Price", value: `₹${avgPrice.toLocaleString()}`, icon: IndianRupee, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Revenue", value: `₹${totalEarned >= 1000 ? `${(totalEarned / 1000).toFixed(1)}k` : totalEarned.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Deals", value: discountedCount, icon: Tag, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Moods", value: uniqueMoods.size, icon: Heart, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-2.5 text-center">
            <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1`}>
              <s.icon size={12} className={s.color} />
            </div>
            <p className="text-xs font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search curations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="flex gap-1.5 shrink-0">
            {["all", "active", "inactive"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize whitespace-nowrap transition ${
                  statusFilter === s ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}>{s}</button>
            ))}
          </div>
          <div className="w-px bg-border shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto">
            <button onClick={() => setMoodFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                moodFilter === "all" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}>All moods</button>
            {MOOD_OPTIONS.map(m => (
              <button key={m} onClick={() => setMoodFilter(m)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  moodFilter === m ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}>{m}</button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Sparkles size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No curations match your filters</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const propInfo = propertyMap.get(c.property_id);
            const thumb = propInfo ? getListingThumbnail(propInfo.name, propInfo.imageUrls, { preferMapped: true }) : null;
            const bookings = bookingCounts.get(c.property_id) || 0;
            const rev = revenueMap.get(c.property_id);
            const curationRevenue = rev ? rev.bookingRev + rev.orderRev : 0;
            const discount = c.original_price && c.original_price > c.price
              ? Math.round(((c.original_price - c.price) / c.original_price) * 100)
              : 0;
            const isExpanded = expandedId === c.id;

            return (
              <SwipeableRow key={c.id} showHint={c === filtered[0]}
                onEdit={() => startEdit(c)}
                onDelete={() => setDeleteTarget({ id: c.id, name: c.name })}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  {...getDropTargetProps(c)}
                  onDragEnd={handleDragEnd}
                  style={getDragItemStyle(c)}
                  className={`rounded-2xl border bg-card overflow-hidden transition-all ${
                    selectedIds.includes(c.id) ? "border-primary/50 bg-primary/5" : "border-border"
                  } ${!c.active ? "opacity-60" : ""}`}
                >
                  {/* Card Header with property image */}
                  <div className="flex items-start gap-3 p-4 pb-2" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    {bulkMode && (
                      <button type="button" onClick={e => { e.stopPropagation(); toggleSelect(c.id); }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                          selectedIds.includes(c.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                        }`}>
                        {selectedIds.includes(c.id) && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    )}

                    {/* Emoji + Property thumbnail */}
                    <div className="relative shrink-0">
                      {thumb ? (
                        <img src={thumb} alt={propInfo?.name} className="w-14 h-14 rounded-xl object-cover ring-1 ring-border/30" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-2xl">
                          {c.emoji}
                        </div>
                      )}
                      {thumb && (
                        <span className="absolute -bottom-1 -right-1 text-lg">{c.emoji}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">{c.name}</h3>
                        {c.badge && <span className="text-[9px] bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">{c.badge}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.tagline}</p>

                      {/* Property + Location */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin size={9} /> {propInfo?.name || c.property_id.slice(0, 12)}
                        </span>
                        {propInfo?.rating && propInfo.rating > 0 && (
                          <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><Star size={9} /> {propInfo.rating}</span>
                        )}
                      </div>

                      {/* Price + Status Row */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-foreground tabular-nums">₹{Number(c.price).toLocaleString()}</span>
                        {c.original_price && (
                          <span className="text-[11px] text-muted-foreground line-through tabular-nums">₹{Number(c.original_price).toLocaleString()}</span>
                        )}
                        {discount > 0 && (
                          <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full">{discount}% OFF</span>
                        )}
                        <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                          {c.active ? "Active" : "Paused"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button type="button" {...getDragHandleProps(c)} onClick={e => e.stopPropagation()}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition cursor-grab active:cursor-grabbing touch-none">
                        <GripVertical size={16} />
                      </button>
                      <ChevronRight size={12} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="flex items-center gap-3 px-4 pb-2">
                    {c.slot && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={9} /> {c.slot}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users size={9} /> {bookings} bookings</span>
                    <span className="text-[10px] font-medium text-primary flex items-center gap-1">
                      <TrendingUp size={9} /> ₹{curationRevenue >= 1000 ? `${(curationRevenue / 1000).toFixed(1)}k` : curationRevenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{(c.includes || []).length} items</span>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
                          {/* Revenue breakdown */}
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1.5">Revenue Analytics</p>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-lg bg-primary/5 p-2 text-center">
                                <p className="text-xs font-bold text-foreground tabular-nums">₹{(rev?.bookingRev || 0).toLocaleString()}</p>
                                <p className="text-[8px] text-muted-foreground">Bookings</p>
                              </div>
                              <div className="rounded-lg bg-blue-500/5 p-2 text-center">
                                <p className="text-xs font-bold text-foreground tabular-nums">₹{(rev?.orderRev || 0).toLocaleString()}</p>
                                <p className="text-[8px] text-muted-foreground">Food Orders</p>
                              </div>
                              <div className="rounded-lg bg-emerald-500/5 p-2 text-center">
                                <p className="text-xs font-bold text-foreground tabular-nums">₹{curationRevenue.toLocaleString()}</p>
                                <p className="text-[8px] text-muted-foreground">Total</p>
                              </div>
                            </div>
                            {bookings > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                                  <span>Avg per booking</span>
                                  <span className="font-semibold text-foreground tabular-nums">₹{Math.round(curationRevenue / bookings).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                                    style={{ width: `${Math.min(100, (curationRevenue / (totalEarned || 1)) * 100)}%` }} />
                                </div>
                                <p className="text-[8px] text-muted-foreground mt-0.5">{((curationRevenue / (totalEarned || 1)) * 100).toFixed(1)}% of total revenue</p>
                              </div>
                            )}
                          </div>
                          {/* Includes */}
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1.5">What's Included</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(c.includes || []).map((inc: string) => (
                                <span key={inc} className="text-[10px] bg-secondary text-foreground px-2 py-1 rounded-lg">{inc}</span>
                              ))}
                            </div>
                          </div>

                          {/* Moods */}
                          {(c.mood || []).length > 0 && (
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1.5">Mood Tags</p>
                              <div className="flex flex-wrap gap-1">
                                {c.mood.map((m: string) => (
                                  <span key={m} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => startEdit(c)}
                              className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1.5">
                              <Eye size={12} /> Edit
                            </button>
                            <button onClick={() => toggleActive(c.id, c.active)}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                                c.active ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                              }`}>
                              {c.active ? "⏸ Pause" : "▶ Activate"}
                            </button>
                            <button onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                              className="py-2 px-4 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-center gap-1.5">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </SwipeableRow>
            );
          })}
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
          await supabase.from("curations").delete().eq("id", deleteTarget.id);
          setCurations(prev => prev.filter(x => x.id !== deleteTarget.id));
          toast({ title: "Curation deleted" });
          window.dispatchEvent(new Event("hushh:listings-updated"));
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
}
