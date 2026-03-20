import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, Plus, Trash2, Pause, Play, Pencil,
  X, Upload, Image, MapPin, DollarSign, Users, Tag, Star,
  Clock, ChevronDown, ChevronRight, Eye, Copy, MoreHorizontal,
  Sparkles, Filter, LayoutGrid, LayoutList, Hash
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
}

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Partial<Listing> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expandedSection, setExpandedSection] = useState<string>("basic");

  useEffect(() => {
    supabase.from("host_listings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setListings((data as Listing[]) ?? []); setLoading(false); });
  }, []);

  const filtered = listings.filter(l =>
    (filter === "all" || l.status === filter) &&
    (categoryFilter === "all" || l.primary_category === categoryFilter) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) ||
     l.location.toLowerCase().includes(search.toLowerCase()) ||
     (l.property_type || "").toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "published" ? "paused" : "published";
    await supabase.from("host_listings").update({ status: next }).eq("id", id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
    toast({ title: `Property ${next}`, description: `Status changed to ${next}` });
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this property permanently?")) return;
    await supabase.from("host_listings").delete().eq("id", id);
    setListings(prev => prev.filter(l => l.id !== id));
    toast({ title: "Property deleted" });
  };

  const duplicateListing = async (listing: Listing) => {
    const { id, created_at, ...rest } = listing;
    const { data } = await supabase.from("host_listings")
      .insert({ ...rest, name: `${rest.name} (Copy)`, status: "draft" })
      .select().single();
    if (data) {
      setListings(prev => [data as Listing, ...prev]);
      toast({ title: "Property duplicated" });
    }
  };

  const openCreate = () => {
    setEditingListing({ ...defaultListing });
    setIsCreating(true);
    setExpandedSection("basic");
  };

  const openEdit = (listing: Listing) => {
    setEditingListing({ ...listing });
    setIsCreating(false);
    setExpandedSection("basic");
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
      base_price: editingListing.base_price || 0,
      capacity: editingListing.capacity || 10,
      status: editingListing.status || "draft",
      category: editingListing.category || "Stays",
      image_urls: editingListing.image_urls || [],
      amenities: editingListing.amenities || [],
      tags: editingListing.tags || [],
      highlights: editingListing.highlights || [],
      property_type: editingListing.property_type || "",
      primary_category: editingListing.primary_category || "stay",
      host_name: editingListing.host_name || "",
      rating: editingListing.rating || 0,
      review_count: editingListing.review_count || 0,
      lat: editingListing.lat || 0,
      lng: editingListing.lng || 0,
      discount_label: editingListing.discount_label || "",
      entry_instructions: editingListing.entry_instructions || "",
      slots: editingListing.slots || [],
      rules: editingListing.rules || [],
    };

    if (isCreating) {
      const { data } = await supabase.from("host_listings")
        .insert({ ...payload, user_id: "00000000-0000-0000-0000-000000000001" })
        .select().single();
      if (data) {
        setListings(prev => [data as Listing, ...prev]);
        toast({ title: "Property created!" });
      }
    } else {
      await supabase.from("host_listings").update(payload).eq("id", editingListing.id!);
      setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...payload } : l));
      toast({ title: "Property updated!" });
    }
    setEditingListing(null);
  };

  const stats = {
    total: listings.length,
    published: listings.filter(l => l.status === "published").length,
    draft: listings.filter(l => l.status === "draft").length,
    paused: listings.filter(l => l.status === "paused").length,
  };

  const filters = ["all", "published", "draft", "paused"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 size={22} className="text-primary" /> Properties
          </h1>
          <p className="text-sm text-muted-foreground">{stats.total} total · {stats.published} live · {stats.draft} drafts</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition">
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Live", value: stats.published, color: "text-emerald-400" },
          { label: "Draft", value: stats.draft, color: "text-muted-foreground" },
          { label: "Paused", value: stats.paused, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search properties, types..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 items-center">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{f}</button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={() => setViewMode(v => v === "list" ? "grid" : "list")} className="p-1.5 rounded-lg hover:bg-secondary transition">
            {viewMode === "list" ? <LayoutGrid size={16} className="text-muted-foreground" /> : <LayoutList size={16} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {["all", ...primaryCategoryOptions].map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
              categoryFilter === c ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{c === "all" ? "All Types" : c}</button>
        ))}
      </div>

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
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((listing, i) => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 transition"
              onClick={() => openEdit(listing)}>
              <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                {listing.image_urls?.[0] ? (
                  <img src={listing.image_urls[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={28} className="text-muted-foreground/30" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border ${statusColors[listing.status] || statusColors.draft}`}>
                  {listing.status}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-xs text-foreground truncate">{listing.name}</h3>
                <p className="text-[10px] text-muted-foreground truncate">{listing.location}</p>
                {(() => {
                  const slots = Array.isArray(listing.slots) ? listing.slots : [];
                  if (slots.length > 0) {
                    const prices = slots.map((s: any) => Number(s.price || 0)).filter((p: number) => p > 0);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return <p className="text-xs font-medium text-foreground mt-1 tabular-nums">₹{min.toLocaleString()}{max !== min && <span className="text-muted-foreground"> – ₹{max.toLocaleString()}</span>}<span className="text-muted-foreground font-normal">/slot</span></p>;
                  }
                  return <p className="text-xs font-medium text-foreground mt-1 tabular-nums">₹{listing.base_price?.toLocaleString()}<span className="text-muted-foreground font-normal">/base</span></p>;
                })()}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((listing, i) => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-3 flex gap-3 cursor-pointer hover:border-primary/30 transition"
              onClick={() => openEdit(listing)}>
              <div className="w-16 h-16 rounded-lg bg-secondary shrink-0 overflow-hidden">
                {listing.image_urls?.[0] ? (
                  <img src={listing.image_urls[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={20} className="text-muted-foreground/30" />
                  </div>
                )}
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
            </motion.div>
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

              {/* Sheet Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{isCreating ? "New Property" : "Edit Property"}</h2>
                  <p className="text-xs text-muted-foreground">{isCreating ? "Fill in the details" : editingListing.name}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveListing}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition">
                    {isCreating ? "Create" : "Save"}
                  </button>
                  <button onClick={() => setEditingListing(null)} className="p-2 rounded-xl hover:bg-secondary transition">
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
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
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-ring"
                        placeholder="Detailed description..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Category">
                        <select value={editingListing.category || "Stays"} onChange={e => setEditingListing(p => ({ ...p!, category: e.target.value }))}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Primary Category">
                        <select value={editingListing.primary_category || "stay"} onChange={e => setEditingListing(p => ({ ...p!, primary_category: e.target.value }))}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                          {primaryCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Property Type">
                      <select value={editingListing.property_type || ""} onChange={e => setEditingListing(p => ({ ...p!, property_type: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select type</option>
                        {propertyTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Status">
                        <select value={editingListing.status || "draft"} onChange={e => setEditingListing(p => ({ ...p!, status: e.target.value }))}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
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

                {/* Pricing & Capacity */}
                <EditSection title="Pricing & Capacity" icon={<DollarSign size={16} />} id="pricing" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Base Price (₹)">
                        <Input type="number" value={editingListing.base_price || 0} onChange={e => setEditingListing(p => ({ ...p!, base_price: Number(e.target.value) }))} />
                      </Field>
                      <Field label="Capacity">
                        <Input type="number" value={editingListing.capacity || 0} onChange={e => setEditingListing(p => ({ ...p!, capacity: Number(e.target.value) }))} />
                      </Field>
                    </div>
                    <Field label="Discount Label">
                      <Input value={editingListing.discount_label || ""} onChange={e => setEditingListing(p => ({ ...p!, discount_label: e.target.value }))} placeholder="20% OFF this week" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Rating">
                        <Input type="number" step="0.1" min="0" max="5" value={editingListing.rating || 0} onChange={e => setEditingListing(p => ({ ...p!, rating: Number(e.target.value) }))} />
                      </Field>
                      <Field label="Review Count">
                        <Input type="number" value={editingListing.review_count || 0} onChange={e => setEditingListing(p => ({ ...p!, review_count: Number(e.target.value) }))} />
                      </Field>
                    </div>
                  </div>
                </EditSection>

                {/* Location */}
                <EditSection title="Location" icon={<MapPin size={16} />} id="location" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <Field label="Location">
                      <Input value={editingListing.location || ""} onChange={e => setEditingListing(p => ({ ...p!, location: e.target.value }))} placeholder="Jeypore, Odisha" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Latitude">
                        <Input type="number" step="0.001" value={editingListing.lat || 0} onChange={e => setEditingListing(p => ({ ...p!, lat: Number(e.target.value) }))} />
                      </Field>
                      <Field label="Longitude">
                        <Input type="number" step="0.001" value={editingListing.lng || 0} onChange={e => setEditingListing(p => ({ ...p!, lng: Number(e.target.value) }))} />
                      </Field>
                    </div>
                    <Field label="Entry Instructions">
                      <textarea value={editingListing.entry_instructions || ""} onChange={e => setEditingListing(p => ({ ...p!, entry_instructions: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px] focus:ring-2 focus:ring-ring"
                        placeholder="How to reach the property..." />
                    </Field>
                  </div>
                </EditSection>

                {/* Images */}
                <EditSection title="Images" icon={<Image size={16} />} id="images" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {(editingListing.image_urls || []).map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-secondary group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => {
                            const urls = [...(editingListing.image_urls || [])];
                            urls.splice(i, 1);
                            setEditingListing(p => ({ ...p!, image_urls: urls }));
                          }} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition">
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Field label="Add Image URL">
                      <div className="flex gap-2">
                        <Input id="new-image-url" placeholder="https://..." className="flex-1" />
                        <button onClick={() => {
                          const input = document.getElementById("new-image-url") as HTMLInputElement;
                          if (input.value) {
                            setEditingListing(p => ({ ...p!, image_urls: [...(p?.image_urls || []), input.value] }));
                            input.value = "";
                          }
                        }} className="px-3 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition">Add</button>
                      </div>
                    </Field>
                  </div>
                </EditSection>

                {/* Tags & Amenities */}
                <EditSection title="Tags & Amenities" icon={<Tag size={16} />} id="tags" expanded={expandedSection} onToggle={setExpandedSection}>
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
                    {(Array.isArray(editingListing.slots) ? editingListing.slots : []).map((slot: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl border border-border bg-secondary/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{slot.label || `Slot ${i + 1}`}</span>
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
                            }} className="p-1 hover:bg-destructive/10 rounded transition">
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
                            }} placeholder="Morning" className="text-xs" />
                          </Field>
                          <Field label="Time Range">
                            <Input value={slot.time || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], time: e.target.value };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="8 AM - 12 PM" className="text-xs" />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Price (₹)">
                            <Input type="number" value={slot.price ?? ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], price: Number(e.target.value) };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} className="text-xs" />
                          </Field>
                          <Field label="Original Price (₹)">
                            <Input type="number" value={slot.originalPrice || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], originalPrice: e.target.value ? Number(e.target.value) : undefined };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="Strikethrough" className="text-xs" />
                          </Field>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Field label="Tag">
                            <select value={slot.tag || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], tag: e.target.value || undefined };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs">
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
                            }} placeholder="0" className="text-xs" />
                          </Field>
                          <Field label="Viewers Now">
                            <Input type="number" min="0" value={slot.viewersNow || ""} onChange={e => {
                              const slots = [...(editingListing.slots || [])];
                              slots[i] = { ...slots[i], viewersNow: e.target.value ? Number(e.target.value) : undefined };
                              setEditingListing(p => ({ ...p!, slots }));
                            }} placeholder="0" className="text-xs" />
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
                      </div>
                    ))}
                    <button onClick={() => {
                      const slots = [...(editingListing.slots || []), { id: `s${Date.now()}`, label: "", time: "", price: 0, available: true, popular: false }];
                      setEditingListing(p => ({ ...p!, slots }));
                    }} className="w-full py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition">
                      + Add Time Slot
                    </button>
                  </div>
                </EditSection>

                {/* Rules */}
                <EditSection title="Rules" icon={<Hash size={16} />} id="rules" expanded={expandedSection} onToggle={setExpandedSection}>
                  <div className="space-y-2">
                    {(Array.isArray(editingListing.rules) ? editingListing.rules : []).map((rule: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input value={rule.icon || ""} onChange={e => {
                          const rules = [...(editingListing.rules || [])];
                          rules[i] = { ...rules[i], icon: e.target.value };
                          setEditingListing(p => ({ ...p!, rules }));
                        }} placeholder="🕐" className="w-12 text-center" />
                        <Input value={rule.text || ""} onChange={e => {
                          const rules = [...(editingListing.rules || [])];
                          rules[i] = { ...rules[i], text: e.target.value };
                          setEditingListing(p => ({ ...p!, rules }));
                        }} placeholder="Rule text" className="flex-1" />
                        <button onClick={() => {
                          const rules = [...(editingListing.rules || [])];
                          rules.splice(i, 1);
                          setEditingListing(p => ({ ...p!, rules }));
                        }} className="p-1 hover:bg-destructive/10 rounded transition">
                          <X size={12} className="text-destructive" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const rules = [...(editingListing.rules || []), { icon: "🕐", text: "" }];
                      setEditingListing(p => ({ ...p!, rules }));
                    }} className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition">
                      + Add Rule
                    </button>
                  </div>
                </EditSection>

                <div className="h-8" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Subcomponents ─── */

function EditSection({ title, icon, id, expanded, onToggle, children }: {
  title: string; icon: React.ReactNode; id: string; expanded: string; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <button onClick={() => onToggle(isOpen ? "" : id)} className="w-full flex items-center gap-2 p-3 text-sm font-medium text-foreground hover:bg-secondary/50 transition">
        <span className="text-primary">{icon}</span>
        {title}
        <ChevronRight size={14} className={`ml-auto text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-3 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">
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
