import { useEffect, useState, useCallback } from "react";
import { useAutoSave } from "@/hooks/use-auto-save";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, Plus, Trash2, Pause, Play, Pencil,
  X, Upload, Image, MapPin, DollarSign, Users, Tag, Star,
  Clock, ChevronDown, ChevronRight, Eye, Copy, MoreHorizontal,
  Sparkles, Filter, LayoutGrid, LayoutList, Hash, GripVertical, CheckSquare,
  Shield, Zap, Globe, Camera, Layers, BarChart3, Info, Save
} from "lucide-react";
import CatalogEditSheet from "./CatalogEditSheet";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SwipeableRow from "./SwipeableRow";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import BatchOperationsBar from "./BatchOperationsBar";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import MultiImageEditor from "./MultiImageEditor";

interface Listing {
  id: string;
  name: string;
  description: string;
  full_description: string;
  location: string;
  base_price: number;
  capacity: number;
  status: string;
  category: string;
  image_urls: string[];
  user_id: string;
  created_at: string;
  amenities: string[];
  tags: string[];
  highlights: string[];
  property_type: string;
  primary_category: string;
  host_name: string;
  rating: number;
  review_count: number;
  lat: number;
  lng: number;
  discount_label: string;
  entry_instructions: string;
  slots: any;
  rules: any;
  sort_order: number;
}

const parseNumberInput = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const notifyListingsUpdated = () => {
  window.dispatchEvent(new Event("hushh:listings-updated"));
};

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const categoryOptions = ["Stays", "Experiences", "Services", "Food"];
const primaryCategoryOptions = ["stay", "experience", "service", "curation"];
const propertyTypeOptions = [
  "Private Villa", "Pool Villa", "Farmhouse", "Rooftop Space", "Work Pod",
  "Couple Room", "Open Lawn", "Camping", "Sports Arena", "Party Hall",
  "Garden Space", "Workshop", "Cultural", "Adventure", "Walking Tour", "Observatory"
];

const defaultListing: Partial<Listing> = {
  name: "", description: "", full_description: "", location: "Jeypore, Odisha",
  base_price: 0, capacity: 10, status: "draft", category: "Stays",
  image_urls: [], amenities: [], tags: [], highlights: [],
  property_type: "Private Villa", primary_category: "stay",
  host_name: "", rating: 0, review_count: 0, lat: 18.856, lng: 82.571,
  discount_label: "", entry_instructions: "", slots: [], rules: [],
};

export default function AdminProperties() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [curationCount, setCurationCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Partial<Listing> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expandedSection, setExpandedSection] = useState<string>("basic");
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [listingsRes, curationsRes] = await Promise.all([
        supabase
          .from("host_listings")
          .select("*")
          .order("sort_order")
          .order("created_at", { ascending: false }),
        supabase.from("curations").select("id", { count: "exact", head: true }),
      ]);

      setListings((listingsRes.data as Listing[]) ?? []);
      setCurationCount(curationsRes.count ?? 0);
      setLoading(false);
    };

    load();
    const onRefresh = () => {
      load();
    };
    window.addEventListener("hushh:listings-updated", onRefresh);
    return () => window.removeEventListener("hushh:listings-updated", onRefresh);
  }, []);

  const filtered = listings
    .filter(l =>
      (filter === "all" || l.status === filter) &&
      (categoryFilter === "all" || l.primary_category === categoryFilter) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) ||
       l.location.toLowerCase().includes(search.toLowerCase()) ||
       (l.property_type || "").toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "published" ? "paused" : "published";
    const { error } = await supabase.from("host_listings").update({ status: next }).eq("id", id);
    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }

    setListings(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
    notifyListingsUpdated();
    toast({ title: `Property ${next}`, description: `Status changed to ${next}` });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("host_listings").delete().eq("id", deleteTarget);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setListings(prev => prev.filter(l => l.id !== deleteTarget));
      notifyListingsUpdated();
      toast({ title: "Property deleted" });
    }
    setDeleteTarget(null);
  };

  const deleteListing = (id: string) => {
    setDeleteTarget(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await supabase.from("host_listings").delete().eq("id", id);
    }
    setListings(prev => prev.filter(l => !ids.includes(l.id)));
    setSelectedIds([]);
    notifyListingsUpdated();
    toast({ title: `${ids.length} properties deleted` });
  };

  const bulkStatusChange = async (ids: string[], status: string) => {
    for (const id of ids) {
      await supabase.from("host_listings").update({ status }).eq("id", id);
    }
    setListings(prev => prev.map(l => ids.includes(l.id) ? { ...l, status } : l));
    setSelectedIds([]);
    notifyListingsUpdated();
    toast({ title: `${ids.length} properties set to ${status}` });
  };

  const duplicateListing = async (listing: Listing) => {
    const { id, created_at, ...rest } = listing;
    const { data, error } = await supabase.from("host_listings")
      .insert({ ...rest, name: `${rest.name} (Copy)`, status: "draft" })
      .select().single();

    if (error) {
      toast({ title: "Duplicate failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      setListings(prev => [data as Listing, ...prev]);
      notifyListingsUpdated();
      toast({ title: "Property duplicated" });
    }
  };

  const openCreate = () => {
    setEditingListing({ ...defaultListing });
    setIsCreating(true);
    setExpandedSection("basic");
    setPreviewMode(false);
  };

  const openEdit = (listing: Listing) => {
    // Use only real DB images — never inject fallback thumbnails into image_urls,
    // or they will get auto-saved back to the DB and overwrite the images column.
    const resolvedImages = Array.isArray(listing.image_urls) && listing.image_urls.length > 0
      ? listing.image_urls
      : [];

    setEditingListing({ ...listing, image_urls: resolvedImages });
    setIsCreating(false);
    setExpandedSection(resolvedImages.length > 0 ? "images" : "basic");
    setPreviewMode(false);
  };

  const saveListing = async () => {
    if (!editingListing?.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const payload = {
      name: editingListing.name,
      description: editingListing.description || "",
      full_description: editingListing.full_description || "",
      location: editingListing.location || "Jeypore, Odisha",
      base_price: editingListing.base_price ?? 0,
      capacity: editingListing.capacity ?? 10,
      status: editingListing.status || "draft",
      category: editingListing.category || "Stays",
      image_urls: editingListing.image_urls || [],
      amenities: editingListing.amenities || [],
      tags: editingListing.tags || [],
      highlights: editingListing.highlights || [],
      property_type: editingListing.property_type || "",
      primary_category: editingListing.primary_category || "stay",
      host_name: editingListing.host_name || "",
      rating: editingListing.rating ?? 0,
      review_count: editingListing.review_count ?? 0,
      lat: editingListing.lat ?? 0,
      lng: editingListing.lng ?? 0,
      discount_label: editingListing.discount_label || "",
      entry_instructions: editingListing.entry_instructions || "",
      slots: editingListing.slots || [],
      rules: editingListing.rules || [],
    };

    if (isCreating) {
      const { data, error } = await supabase.from("host_listings")
        .insert({ ...payload, user_id: "00000000-0000-0000-0000-000000000001" })
        .select().maybeSingle();

      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
        return;
      }

      if (data) {
        setListings(prev => [data as Listing, ...prev]);
        notifyListingsUpdated();
        toast({ title: "Property created!" });
      }
    } else {
      const { data, error } = await supabase.from("host_listings")
        .update(payload)
        .eq("id", editingListing.id!)
        .select();

      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        return;
      }

      if (data && data.length > 0) {
        setListings(prev => prev.map(l => l.id === editingListing.id ? (data[0] as Listing) : l));
      } else {
        // RLS may block returning rows — update local state optimistically
        setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...payload } as Listing : l));
      }

      notifyListingsUpdated();
      toast({ title: "Property updated!" });
    }
    setEditingListing(null);
  };

  // Auto-save for existing listings (not new ones)
  const autoSaveProperty = useCallback(async (data: Partial<Listing>) => {
    if (!data.id || !data.name) return false;
    const payload = {
      name: data.name, description: data.description || "", full_description: data.full_description || "",
      location: data.location || "Jeypore, Odisha", base_price: data.base_price ?? 0, capacity: data.capacity ?? 10,
      status: data.status || "draft", category: data.category || "Stays", image_urls: data.image_urls || [],
      amenities: data.amenities || [], tags: data.tags || [], highlights: data.highlights || [],
      property_type: data.property_type || "", primary_category: data.primary_category || "stay",
      host_name: data.host_name || "", rating: data.rating ?? 0, review_count: data.review_count ?? 0,
      lat: data.lat ?? 0, lng: data.lng ?? 0, discount_label: data.discount_label || "",
      entry_instructions: data.entry_instructions || "", slots: data.slots || [], rules: data.rules || [],
    };
    const { error } = await supabase.from("host_listings").update(payload).eq("id", data.id);
    if (error) {
      console.error("Auto-save failed:", error.message, error);
      return false;
    }
    setListings(prev => prev.map(l => l.id === data.id ? { ...l, ...payload } as Listing : l));
    notifyListingsUpdated();
    return true;
  }, []);

  const { status: autoSaveStatus } = useAutoSave({
    data: editingListing,
    onSave: autoSaveProperty,
    enabled: !isCreating && !!editingListing?.id,
    debounceMs: 2000,
  });

  const statsBase = categoryFilter === "all" ? listings : listings.filter(l => l.primary_category === categoryFilter);
  const stats = {
    total: statsBase.length,
    published: statsBase.filter(l => l.status === "published").length,
    draft: statsBase.filter(l => l.status === "draft").length,
    paused: statsBase.filter(l => l.status === "paused").length,
  };

  const filters = ["all", "published", "draft", "paused"];

  const { getDragHandleProps, getDragItemStyle, getDropTargetProps, handleDragEnd, isDragging, isDragOver } = useDragReorder({
    items: filtered,
    getId: (l) => l.id,
    getA11yLabel: (l) => `Reorder ${l.name}`,
    onReorder: async (updates) => {
      setListings(prev => prev.map(l => { const u = updates.find(u => u.id === l.id); return u ? { ...l, sort_order: u.sort_order } : l; }));
      for (const u of updates) { await supabase.from("host_listings").update({ sort_order: u.sort_order }).eq("id", u.id); }
      toast({ title: "Order saved" });
      notifyListingsUpdated();
    },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/15 dark:to-violet-500/15 flex items-center justify-center">
              <Building2 size={17} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            Properties
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 ml-[46px]">
            {stats.total} total · {stats.published} live
            {categoryFilter !== "all" && ` · ${filtered.length} ${categoryFilter}`}
            {" · Swipe rows or drag ⠿ to reorder"}
          </p>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-lg transition-shadow">
            <Plus size={15} /> Add Property
          </motion.button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", bg: "bg-card" },
          { label: "Live", value: stats.published, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Draft", value: stats.draft, color: "text-muted-foreground", bg: "bg-card" },
          { label: "Paused", value: stats.paused, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -2 }} className={`rounded-xl border border-border ${s.bg} p-2.5 text-center transition-shadow hover:shadow-sm`}>
            <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search properties, types..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-border focus:border-primary/30" />
        </div>
        <div className="flex gap-1.5 items-center">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition-all ${
                filter === f ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 shadow-sm" : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}>{f}</button>
          ))}
          <div className="w-px h-5 bg-border mx-0.5" />
          <button onClick={() => setViewMode(v => v === "list" ? "grid" : "list")}
            className="p-2 rounded-xl bg-card border border-border hover:border-primary/30 transition">
            {viewMode === "list" ? <LayoutGrid size={14} className="text-muted-foreground" /> : <LayoutList size={14} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Category pills with counts */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
        {["all", ...primaryCategoryOptions].map(c => {
          const count = c === "all"
            ? listings.length
            : c === "curation"
            ? curationCount
            : listings.filter(l => l.primary_category === c).length;

          return (
            <button
              key={c}
              onClick={() => {
                if (c === "curation") {
                  window.dispatchEvent(new Event("hushh:open-curations"));
                  return;
                }
                setCategoryFilter(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold capitalize whitespace-nowrap transition-all flex items-center gap-1.5 ${
                categoryFilter === c
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}>
              {c === "all" ? "All Types" : c === "curation" ? "Curations" : c}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                categoryFilter === c ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300" : "bg-secondary text-muted-foreground"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground -mt-1">
        Curations are managed in the Curated tab ({curationCount}).
      </p>

      {/* Listings */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No properties found</p>
          <button onClick={openCreate} className="mt-3 text-sm text-primary font-medium">Create one →</button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((listing, i) => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all group"
              onClick={() => openEdit(listing)}>
              <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                {(() => {
                  const thumb = getListingThumbnail(listing.name, listing.image_urls);
                  return thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/5 dark:to-violet-500/5">
                      <Building2 size={28} className="text-muted-foreground/30" />
                    </div>
                  );
                })()}
                <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border backdrop-blur-sm ${statusColors[listing.status] || statusColors.draft}`}>
                  {listing.status}
                </span>
                {listing.rating > 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                    <Star size={9} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-semibold text-white">{listing.rating}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-xs text-foreground truncate">{listing.name}</h3>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1"><MapPin size={8} />{listing.location}</p>
                <div className="flex items-center justify-between mt-1.5">
                  {(() => {
                    const slots = Array.isArray(listing.slots) ? listing.slots : [];
                    if (slots.length > 0) {
                      const prices = slots.map((s: any) => Number(s.price || 0)).filter((p: number) => p > 0);
                      const min = Math.min(...prices);
                      return <p className="text-xs font-bold text-foreground tabular-nums">₹{min.toLocaleString()}<span className="text-muted-foreground font-normal text-[10px]">/slot</span></p>;
                    }
                    return <p className="text-xs font-bold text-foreground tabular-nums">₹{listing.base_price?.toLocaleString()}</p>;
                  })()}
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Users size={9} />{listing.capacity}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {filtered.map((listing) => (
            <SwipeableRow
              key={listing.id}
              showHint={listing === filtered[0]}
              onEdit={() => openEdit(listing)}
              onDelete={() => deleteListing(listing.id)}
            >
              <div
                {...getDropTargetProps(listing)}
                onDragEnd={handleDragEnd}
                style={getDragItemStyle(listing)}
                className={`rounded-xl border bg-card p-3 flex gap-2 cursor-pointer hover:border-primary/30 select-none ${selectedIds.includes(listing.id) ? "border-primary/50 bg-primary/5" : "border-border"}`}
                onClick={() => openEdit(listing)}
              >
                {bulkMode && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); toggleSelect(listing.id); }}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 self-center transition-all ${
                      selectedIds.includes(listing.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"
                    }`}
                  >
                    {selectedIds.includes(listing.id) && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                )}
                <div className="w-[72px] h-[72px] rounded-xl bg-secondary shrink-0 overflow-hidden shadow-sm">
                  {(() => {
                    const thumb = getListingThumbnail(listing.name, listing.image_urls);
                    return thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/15 dark:to-violet-500/10">
                        <Building2 size={24} className="text-indigo-400/60" />
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{listing.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{listing.location} · {listing.property_type || listing.category}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 border ${statusColors[listing.status] || statusColors.draft}`}>
                      {listing.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {(() => {
                        const slots = Array.isArray(listing.slots) ? listing.slots : [];
                        if (slots.length > 0) {
                          const prices = slots.map((s: any) => Number(s.price || 0)).filter((p: number) => p > 0);
                          const min = Math.min(...prices);
                          return <span className="font-medium text-foreground tabular-nums">₹{min.toLocaleString()}+ <span className="text-muted-foreground">({slots.length} slots)</span></span>;
                        }
                        return <span className="font-medium text-foreground tabular-nums">₹{listing.base_price?.toLocaleString()}</span>;
                      })()}
                      <span className="flex items-center gap-0.5"><Users size={10} />{listing.capacity}</span>
                      {listing.rating > 0 && <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400" />{listing.rating}</span>}
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleStatus(listing.id, listing.status)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition" title={listing.status === "published" ? "Pause" : "Publish"}>
                        {listing.status === "published" ? <Pause size={13} className="text-amber-400" /> : <Play size={13} className="text-emerald-400" />}
                      </button>
                      <button onClick={() => duplicateListing(listing)} className="p-1.5 rounded-lg hover:bg-secondary transition" title="Duplicate">
                        <Copy size={13} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteListing(listing.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                        <Trash2 size={13} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  {...getDragHandleProps(listing)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition shrink-0 cursor-grab active:cursor-grabbing self-center touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        {editingListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setEditingListing(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Hero Header with Image */}
              <div className="relative">
                {(() => {
                  const thumb = getListingThumbnail(editingListing.name || "", editingListing.image_urls);
                  return thumb ? (
                    <div className="h-48 overflow-hidden relative">
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                  );
                })()}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{isCreating ? "New Property" : "Edit Property"}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{isCreating ? "Fill in all the details below" : editingListing.name}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          previewMode ? "bg-primary/15 text-primary border border-primary/30" : "bg-card/80 backdrop-blur-sm text-foreground border border-border"
                        }`}>
                        <Eye size={13} /> Preview
                      </motion.button>
                      {!isCreating && autoSaveStatus !== "idle" && (
                        <span className={`px-2.5 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-1 ${
                          autoSaveStatus === "saving" ? "bg-amber-500/15 text-amber-500" :
                          autoSaveStatus === "saved" ? "bg-emerald-500/15 text-emerald-500" :
                          "bg-destructive/15 text-destructive"
                        }`}>
                          {autoSaveStatus === "saving" ? "⏳ Saving..." : autoSaveStatus === "saved" ? "✓ Saved" : "⚠ Error"}
                        </span>
                      )}
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={saveListing}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/30">
                        {isCreating ? "Create" : "Save & Close"}
                      </motion.button>
                      <button onClick={() => { setEditingListing(null); setPreviewMode(false); }}
                        className="p-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border hover:bg-secondary transition">
                        <X size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              {!isCreating && (
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border ${statusColors[editingListing.status || "draft"] || statusColors.draft}`}>
                    {editingListing.status || "draft"}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {editingListing.rating ? <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-400 fill-amber-400" /> {editingListing.rating}</span> : null}
                    <span className="flex items-center gap-0.5"><Users size={10} /> {editingListing.capacity || 0}</span>
                    <span className="flex items-center gap-0.5"><MapPin size={10} /> {editingListing.location || "—"}</span>
                  </div>
                  <span className="ml-auto text-[10px] text-muted-foreground/60 capitalize">{editingListing.property_type || editingListing.category}</span>
                </div>
              )}

              {previewMode ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 space-y-4">
                  <div className="rounded-2xl border border-border bg-background overflow-hidden">
                    <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
                      {(() => {
                        const thumb = getListingThumbnail(editingListing.name || "", editingListing.image_urls);
                        return thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={40} className="text-muted-foreground/30" />
                            <p className="absolute bottom-3 text-xs text-muted-foreground">No images added yet</p>
                          </div>
                        );
                      })()}
                      {editingListing.discount_label && (
                        <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {editingListing.discount_label}
                        </span>
                      )}
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[editingListing.status || "draft"] || statusColors.draft}`}>
                        {editingListing.status || "draft"}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{editingListing.name || "Property Name"}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {editingListing.location || "Location"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{editingListing.description || "No description"}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-foreground tabular-nums">₹{(editingListing.base_price || 0).toLocaleString()}</span>
                        <span className="text-muted-foreground flex items-center gap-1"><Users size={12} /> {editingListing.capacity || 0} guests</span>
                        {(editingListing.rating || 0) > 0 && (
                          <span className="text-muted-foreground flex items-center gap-1"><Star size={12} className="text-amber-400" /> {editingListing.rating}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{editingListing.property_type || "Type"}</span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{editingListing.category || "Category"}</span>
                        {editingListing.host_name && <span>by {editingListing.host_name}</span>}
                      </div>
                      {(editingListing.amenities || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {editingListing.amenities!.slice(0, 6).map(a => (
                            <span key={a} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                          {editingListing.amenities!.length > 6 && <span className="text-[10px] text-muted-foreground">+{editingListing.amenities!.length - 6}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
              <div className="p-4 space-y-3">

                {/* Quick Stats (edit mode) */}
                {!isCreating && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Price", value: `₹${(editingListing.base_price || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
                      { label: "Capacity", value: editingListing.capacity || 0, icon: Users, color: "text-blue-500" },
                      { label: "Rating", value: editingListing.rating || "—", icon: Star, color: "text-amber-500" },
                      { label: "Slots", value: (Array.isArray(editingListing.slots) ? editingListing.slots : []).length, icon: Clock, color: "text-violet-500" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl bg-secondary/50 border border-border/50 p-2.5 text-center">
                        <s.icon size={14} className={`mx-auto mb-1 ${s.color}`} />
                        <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Basic Info */}
                <EditSection title="Basic Info" icon={<Building2 size={16} />} id="basic" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <Field label="Property Name" required>
                      <Input value={editingListing.name || ""} onChange={e => setEditingListing(p => ({ ...p!, name: e.target.value }))} placeholder="The Firefly Villa" />
                    </Field>
                    <Field label="Short Description">
                      <Input value={editingListing.description || ""} onChange={e => setEditingListing(p => ({ ...p!, description: e.target.value }))} placeholder="Private pool villa · Bonfire · Sound system" />
                    </Field>
                    <Field label="Full Description">
                      <textarea value={editingListing.full_description || ""} onChange={e => setEditingListing(p => ({ ...p!, full_description: e.target.value }))}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm min-h-[100px] focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Detailed description of the property..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Category">
                        <select value={editingListing.category || "Stays"} onChange={e => setEditingListing(p => ({ ...p!, category: e.target.value }))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Primary Category">
                        <select value={editingListing.primary_category || "stay"} onChange={e => setEditingListing(p => ({ ...p!, primary_category: e.target.value }))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
                          {primaryCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Property Type">
                      <select value={editingListing.property_type || ""} onChange={e => setEditingListing(p => ({ ...p!, property_type: e.target.value }))}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
                        <option value="">Select type</option>
                        {propertyTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Status">
                        <select value={editingListing.status || "draft"} onChange={e => setEditingListing(p => ({ ...p!, status: e.target.value }))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="paused">Paused</option>
                        </select>
                      </Field>
                      <Field label="Host Name">
                        <Input value={editingListing.host_name || ""} onChange={e => setEditingListing(p => ({ ...p!, host_name: e.target.value }))} placeholder="Rahul M." />
                      </Field>
                    </div>
                  </div>
                </EditSection>

                {/* Media Gallery */}
                {(() => {
                  const dbImages = editingListing.image_urls || [];
                  const fallbackThumb = dbImages.length === 0 ? getListingThumbnail(editingListing.name || "", []) : null;
                  const displayCount = dbImages.length > 0 ? dbImages.length : (fallbackThumb ? 1 : 0);
                  const badgeText = dbImages.length > 0 ? `${dbImages.length} photos` : (fallbackThumb ? "1 fallback" : "0 photos");
                  const collapsedPreviews = dbImages.length > 0 ? dbImages : (fallbackThumb ? [fallbackThumb] : []);
                  return (
                    <EditSection title="Media Gallery" icon={<Camera size={16} />} id="images" expanded={expandedSection} onToggle={setExpandedSection} badge={badgeText} collapsedImages={collapsedPreviews}>
                      {dbImages.length === 0 && fallbackThumb && (
                        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mb-2">📷 Currently showing a default image on the listing page:</p>
                          <div className="w-24 h-16 rounded-lg overflow-hidden">
                            <img src={fallbackThumb} alt="Fallback" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1.5">Upload custom photos below to replace it.</p>
                        </div>
                      )}
                      <MultiImageEditor
                        images={dbImages}
                        onChange={urls => setEditingListing(p => ({ ...p!, image_urls: urls }))}
                        storagePath="properties"
                        label="Property Images"
                        maxImages={15}
                        dimensionTip="Recommended: 1200×800px (3:2), JPG/WebP, under 2MB. First image is the cover."
                      />
                    </EditSection>
                  );
                })()}

                {/* Pricing & Capacity */}
                <EditSection title="Pricing & Capacity" icon={<DollarSign size={16} />} id="pricing" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Base Price (₹)">
                        <Input type="number" value={editingListing.base_price ?? ""} onChange={e => setEditingListing(p => ({ ...p!, base_price: parseNumberInput(e.target.value) }))} className="rounded-xl" />
                      </Field>
                      <Field label="Capacity">
                        <Input type="number" value={editingListing.capacity ?? ""} onChange={e => setEditingListing(p => ({ ...p!, capacity: parseNumberInput(e.target.value) }))} className="rounded-xl" />
                      </Field>
                    </div>
                    <Field label="Discount Label">
                      <Input value={editingListing.discount_label || ""} onChange={e => setEditingListing(p => ({ ...p!, discount_label: e.target.value }))} placeholder="20% OFF this week" className="rounded-xl" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Rating">
                        <Input type="number" step="0.1" min="0" max="5" value={editingListing.rating ?? ""} onChange={e => setEditingListing(p => ({ ...p!, rating: parseNumberInput(e.target.value) }))} className="rounded-xl" />
                      </Field>
                      <Field label="Review Count">
                        <Input type="number" value={editingListing.review_count ?? ""} onChange={e => setEditingListing(p => ({ ...p!, review_count: parseNumberInput(e.target.value) }))} className="rounded-xl" />
                      </Field>
                    </div>
                  </div>
                </EditSection>

                {/* Location & Access */}
                <EditSection title="Location & Access" icon={<Globe size={16} />} id="location" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <Field label="Location">
                      <Input value={editingListing.location || ""} onChange={e => setEditingListing(p => ({ ...p!, location: e.target.value }))} placeholder="Jeypore, Odisha" className="rounded-xl" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Latitude">
                        <Input type="number" step="0.001" value={editingListing.lat ?? ""} onChange={e => setEditingListing(p => ({ ...p!, lat: parseNumberInput(e.target.value) }))} className="rounded-xl" />
                      </Field>
                      <Field label="Longitude">
                        <Input type="number" step="0.001" value={editingListing.lng ?? ""} onChange={e => setEditingListing(p => ({ ...p!, lng: parseNumberInput(e.target.value) }))} className="rounded-xl" />
                      </Field>
                    </div>
                    {/* Mini map placeholder */}
                    <div className="rounded-xl bg-secondary/50 border border-border p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin size={16} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{editingListing.location || "No location set"}</p>
                        <p className="text-[10px] text-muted-foreground tabular-nums">{editingListing.lat || 0}°N, {editingListing.lng || 0}°E</p>
                      </div>
                    </div>
                    <Field label="Entry Instructions">
                      <textarea value={editingListing.entry_instructions || ""} onChange={e => setEditingListing(p => ({ ...p!, entry_instructions: e.target.value }))}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm min-h-[60px] focus:ring-2 focus:ring-ring resize-none"
                        placeholder="How to reach the property, gate code, parking..." />
                    </Field>
                  </div>
                </EditSection>

                {/* Tags & Amenities */}
                <EditSection title="Tags & Amenities" icon={<Layers size={16} />} id="tags" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <TagEditor label="Tags" items={editingListing.tags || []} onChange={tags => setEditingListing(p => ({ ...p!, tags }))}
                      suggestions={["🔥 Hot Today", "💑 Couple Friendly", "🎉 Party Venue", "⭐ Top Rated", "🌌 Stargazer's Pick", "🏕️ Adventure", "💻 Work Friendly", "💸 Budget"]} />
                    <TagEditor label="Amenities" items={editingListing.amenities || []} onChange={amenities => setEditingListing(p => ({ ...p!, amenities }))}
                      suggestions={["Private Pool", "Bonfire Pit", "Sound System", "WiFi", "Parking", "BBQ Area", "Fairy Lights", "DJ Booth", "Bar Counter", "Dance Floor", "Outdoor Dining"]} />
                    <TagEditor label="Highlights" items={editingListing.highlights || []} onChange={highlights => setEditingListing(p => ({ ...p!, highlights }))}
                      suggestions={[]} />
                  </div>
                </EditSection>

                {/* Time Slots */}
                <EditSection title="Time Slots" icon={<Clock size={16} />} id="slots" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    {/* Slots summary */}
                    {(Array.isArray(editingListing.slots) ? editingListing.slots : []).length > 0 && (
                      <div className="rounded-xl bg-secondary/50 border border-border p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <BarChart3 size={16} className="text-violet-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{(editingListing.slots as any[]).length} time slots configured</p>
                          <p className="text-[10px] text-muted-foreground">
                            Price range: ₹{Math.min(...(editingListing.slots as any[]).map((s: any) => Number(s.price || 0)).filter(p => p > 0) || [0]).toLocaleString()} – ₹{Math.max(...(editingListing.slots as any[]).map((s: any) => Number(s.price || 0)) || [0]).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {(Array.isArray(editingListing.slots) ? editingListing.slots : []).map((slot: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl border border-border bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Clock size={11} className="text-violet-500" />
                            {slot.label || `Slot ${i + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], available: !slots[i].available };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${slot.available !== false ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                              {slot.available !== false ? "Available" : "Unavailable"}
                            </button>
                            <button onClick={() => {
                              const slots = [...(editingListing.slots || [])];
                              slots.splice(i, 1);
                              setEditingListing(p => ({ ...p!, slots }));
                            }} className="p-1 hover:bg-destructive/10 rounded-lg transition">
                              <X size={12} className="text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Label">
                            <Input value={slot.label || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], label: e.target.value };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="Morning" className="text-xs rounded-xl" />
                          </Field>
                          <Field label="Time Range">
                            <Input value={slot.time || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], time: e.target.value };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="8 AM - 12 PM" className="text-xs rounded-xl" />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Price (₹)">
                            <Input type="number" value={slot.price ?? ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], price: parseNumberInput(e.target.value) };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} className="text-xs rounded-xl" />
                          </Field>
                          <Field label="Original Price (₹)">
                            <Input type="number" value={slot.originalPrice ?? ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], originalPrice: parseNumberInput(e.target.value) };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="Strikethrough" className="text-xs rounded-xl" />
                          </Field>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Field label="Tag">
                            <select value={slot.tag || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], tag: e.target.value || undefined };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} className="w-full rounded-xl border border-input bg-background px-2 py-1.5 text-xs">
                              <option value="">None</option>
                              <option value="Best Price">Best Price</option>
                              <option value="Work Best">Work Best</option>
                              <option value="Almost Full">Almost Full</option>
                              <option value="Trending">Trending</option>
                              <option value="Couple Pick">Couple Pick</option>
                              <option value="Popular">Popular</option>
                              <option value="New">New</option>
                            </select>
                          </Field>
                          <Field label="Demand (0-100)">
                            <Input type="number" min="0" max="100" value={slot.demandScore || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], demandScore: e.target.value ? Number(e.target.value) : undefined };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="0" className="text-xs rounded-xl" />
                          </Field>
                          <Field label="Viewers Now">
                            <Input type="number" min="0" value={slot.viewersNow || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], viewersNow: e.target.value ? Number(e.target.value) : undefined };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="0" className="text-xs rounded-xl" />
                          </Field>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={slot.popular || false} onChange={e => {
                            const slots = [...(editingListing.slots || [])];
                            slots[i] = { ...slots[i], popular: e.target.checked };
                            setEditingListing(p => ({ ...p!, slots }));
                          }} className="rounded border-border" />
                          <span className="text-[11px] text-muted-foreground">Mark as Popular</span>
                        </label>
                      </motion.div>
                    ))}
                    <button onClick={() => {
                      const slots = [...(editingListing.slots || []), { id: `s${Date.now()}`, label: "", time: "", price: 0, available: true, popular: false }];
                      setEditingListing(p => ({ ...p!, slots }));
                    }} className="w-full py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1.5">
                      <Plus size={13} /> Add Time Slot
                    </button>
                  </div>
                </EditSection>

                {/* Rules */}
                <EditSection title="House Rules" icon={<Shield size={16} />} id="rules" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-2">
                    {(Array.isArray(editingListing.rules) ? editingListing.rules : []).map((rule: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2">
                        <Input value={rule.icon || ""} onChange={e => {
                          const rules = [...(editingListing.rules || [])];
                          rules[i] = { ...rules[i], icon: e.target.value };
                          setEditingListing(p => ({ ...p!, rules }));
                        }} placeholder="🕐" className="w-12 text-center rounded-xl" />
                        <Input value={rule.text || ""} onChange={e => {
                          const rules = [...(editingListing.rules || [])];
                          rules[i] = { ...rules[i], text: e.target.value };
                          setEditingListing(p => ({ ...p!, rules }));
                        }} placeholder="Rule text" className="flex-1 rounded-xl" />
                        <button onClick={() => {
                          const rules = [...(editingListing.rules || [])];
                          rules.splice(i, 1);
                          setEditingListing(p => ({ ...p!, rules }));
                        }} className="p-1.5 hover:bg-destructive/10 rounded-lg transition">
                          <X size={12} className="text-destructive" />
                        </button>
                      </motion.div>
                    ))}
                    <button onClick={() => {
                      const rules = [...(editingListing.rules || []), { icon: "🕐", text: "" }];
                      setEditingListing(p => ({ ...p!, rules }));
                    }} className="w-full py-2.5 rounded-xl border border-dashed border-primary/30 text-xs text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1.5">
                      <Plus size={13} /> Add Rule
                    </button>
                  </div>
                </EditSection>

                <div className="h-8" />
              </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BatchOperationsBar
        selectedIds={selectedIds}
        totalCount={filtered.length}
        onSelectAll={() => setSelectedIds(filtered.map(l => l.id))}
        onDeselectAll={() => setSelectedIds([])}
        onBulkDelete={bulkDelete}
        onBulkStatusChange={bulkStatusChange}
        entityName="properties"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete this property?"
        description="This property and all its data will be permanently removed. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─── Subcomponents ─── */

function EditSection({ title, icon, id, expanded, onToggle, children, badge, collapsedImages }: {
  title: string; icon: React.ReactNode; id: string; expanded: string; onToggle: (id: string) => void; children: React.ReactNode; badge?: string; collapsedImages?: string[];
}) {
  const isOpen = expanded === id;
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? "border-primary/20 bg-card shadow-sm" : "border-border bg-card/50"}`}>
      <button onClick={() => onToggle(isOpen ? "" : id)} className="w-full flex items-center gap-2.5 p-3.5 text-sm font-semibold text-foreground hover:bg-secondary/30 transition">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isOpen ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
        {title}
        {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{badge}</span>}
        <ChevronDown size={14} className={`ml-auto text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Collapsed thumbnail strip */}
      {!isOpen && collapsedImages && collapsedImages.length > 0 && (
        <div className="px-3.5 pb-3 flex gap-1.5 overflow-x-auto hide-scrollbar">
          {collapsedImages.slice(0, 6).map((url, i) => (
            <div key={i} className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {collapsedImages.length > 6 && (
            <div className="shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-bold">
              +{collapsedImages.length - 6}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-primary/80 mb-1.5 block uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TagEditor({ label, items, onChange, suggestions }: {
  label: string; items: string[]; onChange: (items: string[]) => void; suggestions: string[];
}) {
  const [input, setInput] = useState("");

  const addItem = (item: string) => {
    if (item && !items.includes(item)) onChange([...items, item]);
    setInput("");
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {item}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="hover:text-destructive">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder={`Add ${label.toLowerCase()}...`}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem(input); } }} className="flex-1 text-xs" />
        <button onClick={() => addItem(input)} className="px-2 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium">Add</button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {suggestions.filter(s => !items.includes(s)).slice(0, 6).map(s => (
            <button key={s} onClick={() => addItem(s)} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
