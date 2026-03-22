import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Sparkles, Film, Tag, GripVertical, Plus, Trash2,
  X, Save, Eye, ChevronDown, ChevronUp, Pencil, Settings2,
  Layout, Layers, Video, Type, Palette, Zap, Star, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface HomepageSection {
  id: string;
  key: string;
  label: string;
  emoji: string;
  visible: boolean;
  sort_order: number;
  category: string; // which tab it belongs to: home, stay, experience, service, curation
}

interface VideoCardConfig {
  id: string;
  category: string; // home, stay, experience, service, curation
  video_url: string;
  overlay_text: string;
  tag_label: string;
  tag_color: string;
  sort_order: number;
  active: boolean;
}

interface PropertyTag {
  id: string; name: string; color: string; icon: string;
  assignmentCount?: number;
}

interface FilterPill {
  id: string;
  label: string;
  category: string;
  sort_order: number;
  active: boolean;
}

// ═══════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: "s1", key: "active_trip", label: "Active Trip Card", emoji: "🗺️", visible: true, sort_order: 0, category: "home" },
  { id: "s2", key: "spotlight", label: "Tonight's Vibe (Video Carousel)", emoji: "🔥", visible: true, sort_order: 1, category: "home" },
  { id: "s3", key: "packages", label: "Book Your Experience", emoji: "📦", visible: true, sort_order: 2, category: "home" },
  { id: "s4", key: "foodie", label: "Foodie Front Row", emoji: "🍽️", visible: true, sort_order: 3, category: "home" },
  { id: "s5", key: "curated_packs", label: "Curated Packs", emoji: "✨", visible: true, sort_order: 4, category: "home" },
  { id: "s6", key: "all_listings", label: "All Listings Grid", emoji: "🏘️", visible: true, sort_order: 5, category: "home" },
];

const DEFAULT_VIDEO_CARDS: VideoCardConfig[] = [
  { id: "v1", category: "home", video_url: "", overlay_text: "feel the vibe", tag_label: "TONIGHT'S PICK", tag_color: "from-red-500 to-orange-500", sort_order: 0, active: true },
  { id: "v2", category: "home", video_url: "", overlay_text: "dive in", tag_label: "CURATED", tag_color: "from-primary to-accent", sort_order: 1, active: true },
  { id: "v3", category: "home", video_url: "", overlay_text: "sizzle & smoke", tag_label: "HUSHH LIVE", tag_color: "from-purple-500 to-blue-500", sort_order: 2, active: true },
  { id: "v4", category: "home", video_url: "", overlay_text: "under the stars", tag_label: "LIMITED SLOTS", tag_color: "from-amber-500 to-orange-600", sort_order: 3, active: true },
  { id: "v5", category: "home", video_url: "", overlay_text: "into its groove", tag_label: "EDITOR'S PICK", tag_color: "from-violet-500 to-pink-500", sort_order: 4, active: true },
  { id: "v6", category: "home", video_url: "", overlay_text: "game on", tag_label: "TRENDING", tag_color: "from-primary to-accent", sort_order: 5, active: true },
];

const DEFAULT_FILTERS: Record<string, string[]> = {
  stay: ["All", "Private Villa", "Pool Villa", "Farmhouse", "Rooftop Space", "Work Pod", "Couple Room", "Open Lawn", "Camping"],
  experience: ["All", "Romantic", "Celebration", "Party", "Adventure", "Cultural", "Sports", "Workshop", "Walking Tour"],
  service: ["All", "Chef Service", "Decoration", "Transport", "Entertainment"],
  curation: ["All", "🔥 Popular", "💑 Romantic", "🎉 Party", "🍗 Foodie", "💻 Work", "🎬 Entertainment", "💸 Budget"],
};

const VIDEO_CATEGORIES = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "stay", label: "Stays", emoji: "🏡" },
  { id: "experience", label: "Experiences", emoji: "🎉" },
  { id: "service", label: "Services", emoji: "🛎️" },
  { id: "curation", label: "Curations", emoji: "✨" },
];

const TAG_PRESET_ICONS = ["🔥", "💑", "💰", "🎉", "🏖️", "🍺", "🎮", "💼", "🌙", "⚡", "🏷️", "🆕"];
const TAG_PRESET_COLORS = [
  "bg-primary/15 text-primary", "bg-amber-500/15 text-amber-600", "bg-emerald-500/15 text-emerald-600",
  "bg-blue-500/15 text-blue-600", "bg-rose-500/15 text-rose-600", "bg-purple-500/15 text-purple-600",
];

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

type ActiveTab = "sections" | "videos" | "tags" | "filters";

export default function AdminHomepage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("sections");

  // ── Sections State ──
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);

  // ── Video Cards State ──
  const [videoCards, setVideoCards] = useState<VideoCardConfig[]>(DEFAULT_VIDEO_CARDS);
  const [videoCat, setVideoCat] = useState("home");
  const [editingVideo, setEditingVideo] = useState<VideoCardConfig | null>(null);

  // ── Tags State ──
  const [tags, setTags] = useState<PropertyTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [showTagCreate, setShowTagCreate] = useState(false);
  const [tagForm, setTagForm] = useState({ name: "", icon: "🏷️", color: TAG_PRESET_COLORS[0] });

  // ── Filters State ──
  const [filters, setFilters] = useState<Record<string, string[]>>(DEFAULT_FILTERS);
  const [filterCat, setFilterCat] = useState("stay");
  const [newFilter, setNewFilter] = useState("");

  // ═══════ LOAD DATA ═══════
  useEffect(() => {
    loadConfig();
    loadTags();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from("app_config").select("*").like("key", "homepage_%");
    if (data && data.length > 0) {
      data.forEach((row: any) => {
        try {
          if (row.key === "homepage_sections") {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed) && parsed.length > 0) setSections(parsed);
          }
          if (row.key === "homepage_video_cards") {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed) && parsed.length > 0) setVideoCards(parsed);
          }
          if (row.key === "homepage_filters") {
            const parsed = JSON.parse(row.value);
            if (parsed && typeof parsed === "object") setFilters(parsed);
          }
        } catch {}
      });
    }
    setSectionsLoaded(true);
  };

  const loadTags = async () => {
    const { data: tagsData } = await supabase.from("property_tags").select("*").order("created_at", { ascending: false });
    const { data: assignments } = await supabase.from("tag_assignments").select("tag_id");
    const countMap = new Map<string, number>();
    (assignments ?? []).forEach((a: any) => countMap.set(a.tag_id, (countMap.get(a.tag_id) || 0) + 1));
    setTags(((tagsData as any) ?? []).map((t: any) => ({ ...t, assignmentCount: countMap.get(t.id) || 0 })));
    setTagsLoading(false);
  };

  // ═══════ SAVE HELPERS ═══════
  const saveConfig = async (key: string, value: any, label: string) => {
    const jsonStr = JSON.stringify(value);
    const { data: existing } = await supabase.from("app_config").select("id").eq("key", key).maybeSingle();
    if (existing) {
      await supabase.from("app_config").update({ value: jsonStr }).eq("key", key);
    } else {
      await supabase.from("app_config").insert({ key, value: jsonStr, label, category: "homepage", description: `Homepage ${label} configuration` });
    }
    toast({ title: `${label} saved!` });
  };

  // ═══════ SECTION HANDLERS ═══════
  const moveSectionUp = (i: number) => {
    if (i === 0) return;
    const arr = [...sections];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    arr.forEach((s, idx) => s.sort_order = idx);
    setSections(arr);
  };
  const moveSectionDown = (i: number) => {
    if (i >= sections.length - 1) return;
    const arr = [...sections];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    arr.forEach((s, idx) => s.sort_order = idx);
    setSections(arr);
  };
  const toggleSectionVisibility = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  // ═══════ TAG HANDLERS ═══════
  const createTag = async () => {
    if (!tagForm.name) return;
    const { data, error } = await supabase.from("property_tags").insert({ name: tagForm.name, icon: tagForm.icon, color: tagForm.color } as any).select().maybeSingle();
    if (!error && data) setTags(prev => [{ ...(data as any), assignmentCount: 0 }, ...prev]);
    setShowTagCreate(false);
    setTagForm({ name: "", icon: "🏷️", color: TAG_PRESET_COLORS[0] });
    toast({ title: "Tag created!" });
  };
  const deleteTag = async (id: string) => {
    await supabase.from("property_tags").delete().eq("id", id);
    setTags(prev => prev.filter(t => t.id !== id));
    toast({ title: "Tag deleted" });
  };

  // ═══════ FILTER HANDLERS ═══════
  const addFilter = () => {
    if (!newFilter.trim()) return;
    setFilters(prev => ({ ...prev, [filterCat]: [...(prev[filterCat] || []), newFilter.trim()] }));
    setNewFilter("");
  };
  const removeFilter = (cat: string, idx: number) => {
    setFilters(prev => ({ ...prev, [cat]: prev[cat].filter((_, i) => i !== idx) }));
  };

  // ═══════ VIDEO CARD HANDLERS ═══════
  const filteredVideos = videoCards.filter(v => v.category === videoCat);
  const addVideoCard = () => {
    const newCard: VideoCardConfig = {
      id: `v-${Date.now()}`,
      category: videoCat,
      video_url: "",
      overlay_text: "new vibe",
      tag_label: "NEW",
      tag_color: "from-primary to-accent",
      sort_order: filteredVideos.length,
      active: true,
    };
    setVideoCards(prev => [...prev, newCard]);
    setEditingVideo(newCard);
  };
  const updateVideoCard = (updated: VideoCardConfig) => {
    setVideoCards(prev => prev.map(v => v.id === updated.id ? updated : v));
    setEditingVideo(null);
  };
  const deleteVideoCard = (id: string) => {
    setVideoCards(prev => prev.filter(v => v.id !== id));
  };

  const tabs: { id: ActiveTab; label: string; icon: typeof Home; count?: number }[] = [
    { id: "sections", label: "Sections", icon: Layout, count: sections.length },
    { id: "videos", label: "Video Cards", icon: Video, count: videoCards.length },
    { id: "tags", label: "Tags", icon: Tag, count: tags.length },
    { id: "filters", label: "Filters", icon: Filter, count: Object.values(filters).flat().length },
  ];

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
              <Home size={20} className="text-violet-500" />
            </div>
            Homepage Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Control everything users see on the homepage</p>
        </div>
      </motion.div>

      {/* Tab bar */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ═══════ SECTIONS TAB ═══════ */}
      {activeTab === "sections" && (
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Drag to reorder · Toggle visibility · Changes saved to database</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => saveConfig("homepage_sections", sections, "Sections")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Save size={14} /> Save Order
            </motion.button>
          </div>

          <div className="space-y-2">
            {sections.sort((a, b) => a.sort_order - b.sort_order).map((section, i) => (
              <motion.div
                key={section.id}
                layout
                className={`rounded-xl border bg-card p-4 flex items-center gap-3 transition-all ${
                  !section.visible ? "opacity-50" : ""
                } ${section.visible ? "border-border" : "border-border/50"}`}
              >
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSectionUp(i)} disabled={i === 0}
                    className="p-0.5 rounded hover:bg-secondary disabled:opacity-20 transition">
                    <ChevronUp size={12} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => moveSectionDown(i)} disabled={i >= sections.length - 1}
                    className="p-0.5 rounded hover:bg-secondary disabled:opacity-20 transition">
                    <ChevronDown size={12} className="text-muted-foreground" />
                  </button>
                </div>
                <span className="text-2xl">{section.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
                  <p className="text-[10px] text-muted-foreground capitalize">Tab: {section.category}</p>
                </div>
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                    section.visible
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {section.visible ? "Visible" : "Hidden"}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══════ VIDEO CARDS TAB ═══════ */}
      {activeTab === "videos" && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {VIDEO_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setVideoCat(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    videoCat === cat.id ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <motion.button whileTap={{ scale: 0.97 }} onClick={addVideoCard}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                <Plus size={13} /> Add Card
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => saveConfig("homepage_video_cards", videoCards, "Video Cards")}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold">
                <Save size={13} /> Save
              </motion.button>
            </div>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Film size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No video cards for this tab</p>
              <button onClick={addVideoCard} className="text-xs text-primary font-medium mt-2">+ Add one</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVideos.sort((a, b) => a.sort_order - b.sort_order).map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  className={`rounded-xl border bg-card p-4 flex items-center gap-3 group transition-all ${
                    !card.active ? "opacity-50 border-border/50" : "border-border"
                  }`}
                >
                  <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {card.video_url ? (
                      <video src={card.video_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <Film size={16} className="text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${card.tag_color} text-white`}>
                        {card.tag_label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground italic">"{card.overlay_text}"</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {card.video_url ? card.video_url.split("/").pop() : "No video set"}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingVideo({ ...card })}
                      className="p-1.5 rounded-lg hover:bg-secondary transition"
                    >
                      <Pencil size={13} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        setVideoCards(prev => prev.map(v => v.id === card.id ? { ...v, active: !v.active } : v));
                      }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition"
                    >
                      <Eye size={13} className={card.active ? "text-emerald-500" : "text-muted-foreground"} />
                    </button>
                    <button
                      onClick={() => deleteVideoCard(card.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition"
                    >
                      <Trash2 size={13} className="text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Video Card Edit Modal */}
          <AnimatePresence>
            {editingVideo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingVideo(null)}>
                <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-card rounded-2xl border border-border p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Film size={16} className="text-primary" /> Edit Video Card
                    </h2>
                    <button onClick={() => setEditingVideo(null)} className="p-1.5 rounded-lg hover:bg-secondary">
                      <X size={16} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Overlay Text</label>
                    <Input value={editingVideo.overlay_text} onChange={e => setEditingVideo({ ...editingVideo, overlay_text: e.target.value })} placeholder="feel the vibe" className="italic" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tag Label</label>
                      <Input value={editingVideo.tag_label} onChange={e => setEditingVideo({ ...editingVideo, tag_label: e.target.value })} placeholder="TRENDING" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tag Gradient</label>
                      <select
                        value={editingVideo.tag_color}
                        onChange={e => setEditingVideo({ ...editingVideo, tag_color: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="from-red-500 to-orange-500">🔴 Red → Orange</option>
                        <option value="from-primary to-accent">🟣 Primary → Accent</option>
                        <option value="from-purple-500 to-blue-500">🟣 Purple → Blue</option>
                        <option value="from-amber-500 to-orange-600">🟡 Amber → Orange</option>
                        <option value="from-violet-500 to-pink-500">💜 Violet → Pink</option>
                        <option value="from-emerald-500 to-teal-500">🟢 Emerald → Teal</option>
                        <option value="from-rose-500 to-red-500">🌹 Rose → Red</option>
                        <option value="from-cyan-500 to-blue-500">🔵 Cyan → Blue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Video URL (optional)</label>
                    <Input value={editingVideo.video_url} onChange={e => setEditingVideo({ ...editingVideo, video_url: e.target.value })} placeholder="https://..." />
                    <p className="text-[10px] text-muted-foreground mt-1">Leave empty to use the default mapped video for this slot</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Category</label>
                    <select
                      value={editingVideo.category}
                      onChange={e => setEditingVideo({ ...editingVideo, category: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {VIDEO_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preview */}
                  <div className="rounded-xl border border-border overflow-hidden bg-foreground/5">
                    <div className="h-24 bg-gradient-to-br from-foreground/10 to-foreground/5 relative flex items-end p-3">
                      <span className={`absolute top-2 left-2 text-[8px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${editingVideo.tag_color} text-white`}>
                        {editingVideo.tag_label}
                      </span>
                      <p className="text-sm font-black italic text-foreground/80">"{editingVideo.overlay_text}"</p>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => updateVideoCard(editingVideo)}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                  >
                    💾 Save Card
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ═══════ TAGS TAB ═══════ */}
      {activeTab === "tags" && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{tags.length} tags · Assign to properties for filtering & discovery</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowTagCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              <Plus size={14} /> Create Tag
            </motion.button>
          </div>

          {/* Create form */}
          <AnimatePresence>
            {showTagCreate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2"><Sparkles size={14} className="text-primary" /> New Tag</h3>
                  <button onClick={() => setShowTagCreate(false)} className="p-1.5 rounded-lg hover:bg-secondary transition"><X size={16} className="text-muted-foreground" /></button>
                </div>
                <Input placeholder="Tag name (e.g. trending, couple_fav)" value={tagForm.name} onChange={e => setTagForm(f => ({ ...f, name: e.target.value }))} />
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_PRESET_ICONS.map(icon => (
                      <button key={icon} onClick={() => setTagForm(f => ({ ...f, icon }))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                          tagForm.icon === icon ? "bg-primary/15 ring-2 ring-primary shadow-sm" : "bg-secondary hover:bg-secondary/80"
                        }`}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_PRESET_COLORS.map(color => (
                      <button key={color} onClick={() => setTagForm(f => ({ ...f, color }))}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${color} ${
                          tagForm.color === color ? "ring-2 ring-primary shadow-sm" : ""
                        }`}>Sample</button>
                    ))}
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={createTag}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
                  🏷️ Create Tag
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tag Grid */}
          {tagsLoading ? (
            <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
          ) : tags.length === 0 ? (
            <div className="text-center py-16">
              <Tag size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No tags yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tags.map((tag) => (
                <motion.div key={tag.id}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 group hover:shadow-md transition-all">
                  <span className="text-2xl">{tag.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tag.color}`}>{tag.name}</span>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{tag.assignmentCount} properties</p>
                  </div>
                  <button onClick={() => deleteTag(tag.id)}
                    className="p-2 rounded-xl hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════ FILTERS TAB ═══════ */}
      {activeTab === "filters" && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {Object.keys(filters).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                    filterCat === cat ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {cat} ({filters[cat]?.length || 0})
                </button>
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => saveConfig("homepage_filters", filters, "Filters")}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shrink-0">
              <Save size={13} /> Save
            </motion.button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground capitalize">{filterCat} Filters</h3>
            <div className="flex flex-wrap gap-2">
              {(filters[filterCat] || []).map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium">
                  {f}
                  {f !== "All" && (
                    <button onClick={() => removeFilter(filterCat, i)} className="hover:text-destructive transition">
                      <X size={10} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newFilter}
                onChange={e => setNewFilter(e.target.value)}
                placeholder="Add filter pill..."
                className="flex-1"
                onKeyDown={e => e.key === "Enter" && addFilter()}
              />
              <button onClick={addFilter}
                className="px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition">
                Add
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Preview</h4>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(filters[filterCat] || []).map((f, i) => (
                <span
                  key={i}
                  className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                    i === 0
                      ? "bg-primary text-primary-foreground font-semibold shadow-md"
                      : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
