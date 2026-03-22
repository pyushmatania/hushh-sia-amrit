import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Plus, Trash2, Pencil, X, AlertTriangle, Eye, GripVertical, Sparkles, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import SwipeableRow from "./SwipeableRow";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import BatchOperationsBar from "./BatchOperationsBar";
import MultiImageEditor from "./MultiImageEditor";

interface InventoryItem {
  id: string; name: string; emoji: string; category: string; unit_price: number;
  stock: number; low_stock_threshold: number; available: boolean;
  property_id: string | null; sort_order: number; created_at: string;
  image_url: string | null;
  image_urls: string[];
}

const categoryOptions = ["food", "drinks", "decoration", "entertainment", "activity", "comfort", "work", "staff", "decor", "equipment"];
const foodDrinksCategories = ["food", "drinks"];
const addonsCategories = ["decoration", "decor", "entertainment", "activity", "comfort", "work", "staff", "equipment"];
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

interface AdminInventoryProps { filterCategory?: "food-drinks" | "addons"; }

export default function AdminInventory({ filterCategory }: AdminInventoryProps = {}) {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<InventoryItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await supabase.from("inventory").delete().eq("id", id);
    }
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    setSelectedIds([]);
    window.dispatchEvent(new Event("hushh:listings-updated"));
    toast({ title: `${ids.length} items deleted` });
  };

  const loadInventory = () => {
    supabase.from("inventory").select("*").order("sort_order").order("name")
      .then(({ data }) => { setItems((data as InventoryItem[]) ?? []); setLoading(false); });
  };

  useEffect(() => {
    loadInventory();
    const onRefresh = () => loadInventory();
    window.addEventListener("hushh:listings-updated", onRefresh);
    return () => window.removeEventListener("hushh:listings-updated", onRefresh);
  }, []);

  const scopedItems = filterCategory === "food-drinks" ? items.filter(i => foodDrinksCategories.includes(i.category)) : filterCategory === "addons" ? items.filter(i => addonsCategories.includes(i.category)) : items;
  const availableCats = filterCategory === "food-drinks" ? foodDrinksCategories : filterCategory === "addons" ? addonsCategories : categoryOptions;
  const filtered = scopedItems.filter(i => (catFilter === "all" || i.category === catFilter) && i.name.toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce<Record<string, InventoryItem[]>>((acc, item) => { (acc[item.category] = acc[item.category] || []).push(item); return acc; }, {});
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.sort_order - b.sort_order));

  const { getDragHandleProps, getDragItemStyle, getDropTargetProps, handleDragEnd } = useDragReorder({
    items: [...scopedItems].sort((a, b) => a.sort_order - b.sort_order),
    getId: (i) => i.id, getCategory: (i) => i.category, getA11yLabel: (i) => `Reorder ${i.name}`,
    onReorder: async (updates) => {
      setItems(prev => prev.map(i => { const u = updates.find(u => u.id === i.id); return u ? { ...i, sort_order: u.sort_order } : i; }));
      for (const u of updates) await supabase.from("inventory").update({ sort_order: u.sort_order }).eq("id", u.id);
      toast({ title: "Order saved" });
      window.dispatchEvent(new Event("hushh:listings-updated"));
    },
  });

  const openCreate = () => {
    const defaultCat = filterCategory === "food-drinks" ? "food" : filterCategory === "addons" ? "decoration" : "food";
    setEditing({ name: "", emoji: filterCategory === "addons" ? "🎉" : "🍽️", category: defaultCat, unit_price: 0, stock: 100, low_stock_threshold: 10, available: true, property_id: null, sort_order: 0, image_url: null, image_urls: [] });
    setIsCreating(true); setPreviewMode(false);
  };

  const save = async () => {
    if (!editing?.name) { toast({ title: "Name required", variant: "destructive" }); return; }
    const payload = { name: editing.name, emoji: editing.emoji || "🍽️", category: editing.category || "food", unit_price: editing.unit_price || 0, stock: editing.stock || 100, low_stock_threshold: editing.low_stock_threshold || 10, available: editing.available ?? true, property_id: editing.property_id || null, sort_order: editing.sort_order || 0, image_url: (editing.image_urls || [])[0] || editing.image_url || null, image_urls: editing.image_urls || [] };
    if (isCreating) {
      const { data, error } = await supabase.from("inventory").insert(payload).select().maybeSingle();
      if (error) { toast({ title: "Failed to add", description: error.message, variant: "destructive" }); return; }
      if (data) setItems(prev => [...prev, data as InventoryItem]);
      toast({ title: "Item added!" });
    } else {
      const { error } = await supabase.from("inventory").update(payload).eq("id", editing.id!);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i));
      toast({ title: "Item updated!" });
    }
    setEditing(null);
    window.dispatchEvent(new Event("hushh:listings-updated"));
  };

  const deleteItem = async (id: string) => { setDeleteTarget(id); };
  const confirmDeleteItem = async () => { if (!deleteTarget) return; await supabase.from("inventory").delete().eq("id", deleteTarget); setItems(prev => prev.filter(i => i.id !== deleteTarget)); toast({ title: "Deleted" }); window.dispatchEvent(new Event("hushh:listings-updated")); setDeleteTarget(null); };
  const toggleAvailability = async (item: InventoryItem) => { const next = !item.available; await supabase.from("inventory").update({ available: next }).eq("id", item.id); setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: next } : i)); };

  const lowStock = scopedItems.filter(i => i.stock <= i.low_stock_threshold && i.available);
  const sectionTitle = filterCategory === "food-drinks" ? "Food & Drinks" : filterCategory === "addons" ? "Add-ons & Services" : "Inventory";

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center shadow-sm">
              <Package size={20} className="text-amber-600" />
            </div>
            {sectionTitle}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">{scopedItems.length} items · {lowStock.length} low stock · Drag ⠿ to reorder</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds([]); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              bulkMode ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}>
            <CheckSquare size={15} /> {bulkMode ? "Cancel" : "Bulk"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/30">
            <Plus size={16} /> Add Item
          </motion.button>
        </div>
      </motion.div>

      {lowStock.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-500/5 dark:to-yellow-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0 shadow-sm"><AlertTriangle size={16} className="text-amber-600" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Low Stock Alert</p>
              <p className="text-xs text-muted-foreground mt-0.5">{lowStock.map(i => `${i.emoji} ${i.name} (${i.stock})`).join(", ")}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              let created = 0;
              for (const item of lowStock) {
                const { error } = await supabase.from("staff_tasks").insert({
                  title: `Restock: ${item.emoji} ${item.name}`,
                  description: `Stock is at ${item.stock} (threshold: ${item.low_stock_threshold}). Please reorder immediately.`,
                  priority: item.stock === 0 ? "urgent" : "high",
                  status: "pending",
                  property_id: item.property_id || null,
                });
                if (!error) created++;
              }
              if (created > 0) {
                toast({ title: `Created ${created} restock tasks for staff` });
              }
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-500/25 transition-colors"
          >
            <Sparkles size={14} /> Auto-Create Restock Tasks for Staff
          </button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {["all", ...availableCats].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize whitespace-nowrap transition-all ${
                catFilter === c ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border border-indigo-100 dark:border-indigo-500/20 shadow-sm" : "bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700"
              }`}>{c}</button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Package size={28} className="text-amber-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No items found</p>
          <p className="text-zinc-400 text-xs mt-1">Add inventory items to get started</p>
        </motion.div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 capitalize">{cat}</h3>
            <div className="space-y-1.5">
              {catItems.map((item) => (
                <SwipeableRow
                  key={item.id}
                  showHint={item === catItems[0]}
                  onEdit={() => { setEditing({ ...item }); setIsCreating(false); setPreviewMode(false); }}
                  onDelete={() => deleteItem(item.id)}
                >
                  <motion.div
                    whileHover={{ x: 3, transition: { duration: 0.15 } }}
                    {...getDropTargetProps(item)} onDragEnd={handleDragEnd} style={getDragItemStyle(item)}
                    className={`rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border p-3.5 flex items-center gap-3 select-none transition-all hover:shadow-md group ${
                      item.stock <= item.low_stock_threshold ? "border-amber-200/60 dark:border-amber-500/20" : selectedIds.includes(item.id) ? "border-primary/50 bg-primary/5" : "border-zinc-100/80 dark:border-zinc-800/80"
                    } ${!item.available ? "opacity-50" : ""}`}>
                    {bulkMode && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggleSelect(item.id); }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedIds.includes(item.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"
                        }`}
                      >
                        {selectedIds.includes(item.id) && <span className="text-[10px] font-bold">✓</span>}
                      </button>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/10 flex items-center justify-center text-xl shadow-sm shrink-0 overflow-hidden">
                      {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{item.name}</h4>
                      <p className="text-[11px] text-zinc-400 tabular-nums">₹{item.unit_price} · Stock: {item.stock}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleAvailability(item)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${item.available ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        {item.available ? "Available" : "Unavailable"}
                      </button>
                      <button onClick={() => { setEditing({ ...item }); setIsCreating(false); setPreviewMode(false); }} className="p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"><Pencil size={13} className="text-zinc-400" /></button>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"><Trash2 size={13} className="text-rose-400" /></button>
                    </div>
                    <button type="button" {...getDragHandleProps(item)}
                      className="ml-1 h-10 w-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shrink-0 cursor-grab active:cursor-grabbing touch-none">
                      <GripVertical size={18} />
                    </button>
                  </motion.div>
                </SwipeableRow>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Edit/Create Sheet */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setEditing(null)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" /> {isCreating ? "Add Item" : "Edit Item"}</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewMode(!previewMode)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 transition ${previewMode ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                    <Eye size={12} /> {previewMode ? "Edit" : "Preview"}
                  </button>
                  <button onClick={() => setEditing(null)} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"><X size={16} className="text-zinc-400" /></button>
                </div>
              </div>
              {previewMode ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden">
                  {editing.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={editing.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex items-center gap-3">
                    <span className="text-3xl">{editing.emoji || "🍽️"}</span>
                    <div className="flex-1"><h4 className="text-base font-bold text-zinc-800 dark:text-zinc-100">{editing.name || "Item Name"}</h4><p className="text-sm text-zinc-400 capitalize">{editing.category || "food"}</p><p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-1 tabular-nums">₹{editing.unit_price || 0}</p></div>
                    <div className="text-right"><span className={`px-2 py-1 rounded-xl text-[10px] font-semibold ${editing.available ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>{editing.available ? "Available" : "Unavailable"}</span><p className="text-[11px] text-zinc-400 mt-1 tabular-nums">Stock: {editing.stock || 0}</p></div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-[60px_1fr] gap-3">
                    <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Emoji</label><Input value={editing.emoji || ""} onChange={e => setEditing(p => ({ ...p!, emoji: e.target.value }))} className="text-center text-lg rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
                    <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Name</label><Input value={editing.name || ""} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} placeholder="Tribal Thali" className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Category</label><select value={editing.category || "food"} onChange={e => setEditing(p => ({ ...p!, category: e.target.value }))} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200">{categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Unit Price (₹)</label><Input type="number" value={editing.unit_price || 0} onChange={e => setEditing(p => ({ ...p!, unit_price: Number(e.target.value) }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Stock</label><Input type="number" value={editing.stock || 0} onChange={e => setEditing(p => ({ ...p!, stock: Number(e.target.value) }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
                    <div><label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Low Threshold</label><Input type="number" value={editing.low_stock_threshold || 0} onChange={e => setEditing(p => ({ ...p!, low_stock_threshold: Number(e.target.value) }))} className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" /></div>
                  </div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={editing.available ?? true} onChange={e => setEditing(p => ({ ...p!, available: e.target.checked }))} className="rounded border-zinc-300" id="avail" /><label htmlFor="avail" className="text-sm text-zinc-700 dark:text-zinc-200">Available for ordering</label></div>
                  {/* Image section */}
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Item Image</label>
                    {editing.image_url ? (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-video group">
                        <img src={editing.image_url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setEditing(p => ({ ...p!, image_url: null }))}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full py-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-xs text-zinc-500 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                        <Upload size={18} className="text-zinc-400" />
                        <span>Upload image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const ext = file.name.split('.').pop();
                          const path = `inventory/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                          const { supabase } = await import("@/integrations/supabase/client");
                          const { error } = await supabase.storage.from("listing-images").upload(path, file);
                          if (error) return;
                          const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
                          if (urlData?.publicUrl) setEditing(p => ({ ...p!, image_url: urlData.publicUrl }));
                        }} />
                      </label>
                    )}
                    {!editing.image_url && (
                      <div className="mt-2 flex gap-2">
                        <Input placeholder="Or paste image URL..." className="flex-1 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                          onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLInputElement).value) { setEditing(p => ({ ...p!, image_url: (e.target as HTMLInputElement).value })); (e.target as HTMLInputElement).value = ""; } }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              <motion.button whileTap={{ scale: 0.97 }} onClick={save}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-md">
                {isCreating ? "✨ Add Item" : "💾 Save Changes"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BatchOperationsBar
        selectedIds={selectedIds}
        totalCount={filtered.length}
        onSelectAll={() => setSelectedIds(filtered.map(i => i.id))}
        onDeselectAll={() => setSelectedIds([])}
        onBulkDelete={bulkDelete}
        entityName="items"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete this item?"
        description="This inventory item will be permanently removed."
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
}
