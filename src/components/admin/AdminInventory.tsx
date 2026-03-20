import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Plus, Trash2, Pencil, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unit_price: number;
  stock: number;
  low_stock_threshold: number;
  available: boolean;
  property_id: string | null;
  created_at: string;
}

const categoryOptions = ["food", "drinks", "decoration", "entertainment", "activity", "comfort", "work", "staff", "decor", "equipment"];

const foodDrinksCategories = ["food", "drinks"];
const addonsCategories = ["decoration", "decor", "entertainment", "activity", "comfort", "work", "staff", "equipment"];

interface AdminInventoryProps {
  filterCategory?: "food-drinks" | "addons";
}

export default function AdminInventory({ filterCategory }: AdminInventoryProps = {}) {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<InventoryItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    supabase.from("inventory").select("*").order("category").order("name")
      .then(({ data }) => { setItems((data as InventoryItem[]) ?? []); setLoading(false); });
  }, []);

  // Apply external filter from Catalog tabs
  const scopedItems = filterCategory === "food-drinks"
    ? items.filter(i => foodDrinksCategories.includes(i.category))
    : filterCategory === "addons"
    ? items.filter(i => addonsCategories.includes(i.category))
    : items;

  const availableCats = filterCategory === "food-drinks"
    ? foodDrinksCategories
    : filterCategory === "addons"
    ? addonsCategories
    : categoryOptions;

  const filtered = scopedItems.filter(i =>
    (catFilter === "all" || i.category === catFilter) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, InventoryItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const openCreate = () => {
    setEditing({ name: "", emoji: "🍽️", category: "food", unit_price: 0, stock: 100, low_stock_threshold: 10, available: true, property_id: null });
    setIsCreating(true);
  };

  const save = async () => {
    if (!editing?.name) { toast({ title: "Name required", variant: "destructive" }); return; }

    const payload = {
      name: editing.name,
      emoji: editing.emoji || "🍽️",
      category: editing.category || "food",
      unit_price: editing.unit_price || 0,
      stock: editing.stock || 100,
      low_stock_threshold: editing.low_stock_threshold || 10,
      available: editing.available ?? true,
      property_id: editing.property_id || null,
    };

    if (isCreating) {
      const { data, error } = await supabase.from("inventory").insert(payload).select().maybeSingle();
      if (error) { toast({ title: "Failed to add", description: error.message, variant: "destructive" }); return; }
      if (data) { setItems(prev => [...prev, data as InventoryItem]); }
      toast({ title: "Item added!" });
    } else {
      const { error } = await supabase.from("inventory").update(payload).eq("id", editing.id!);
      if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i));
      toast({ title: "Item updated!" });
    }
    setEditing(null);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("inventory").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: "Item deleted" });
  };

  const toggleAvailability = async (item: InventoryItem) => {
    const next = !item.available;
    await supabase.from("inventory").update({ available: next }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: next } : i));
  };

  const lowStock = items.filter(i => i.stock <= i.low_stock_threshold && i.available);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package size={22} className="text-primary" /> Inventory
          </h1>
          <p className="text-sm text-muted-foreground">{items.length} items · {lowStock.length} low stock</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Low Stock Alert</p>
            <p className="text-xs text-muted-foreground">{lowStock.map(i => `${i.emoji} ${i.name} (${i.stock})`).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {["all", ...categoryOptions].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
                catFilter === c ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Items grouped */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No items found</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 capitalize">{cat}</h3>
            <div className="space-y-1.5">
              {catItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={`rounded-xl border bg-card p-3 flex items-center gap-3 transition ${
                    item.stock <= item.low_stock_threshold ? "border-amber-500/30" : "border-border"
                  } ${!item.available ? "opacity-50" : ""}`}>
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground tabular-nums">₹{item.unit_price} · Stock: {item.stock}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleAvailability(item)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                        item.available ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}>{item.available ? "Available" : "Unavailable"}</button>
                    <button onClick={() => { setEditing({ ...item }); setIsCreating(false); }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition"><Pencil size={13} className="text-muted-foreground" /></button>
                    <button onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition"><Trash2 size={13} className="text-destructive" /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Edit/Create Sheet */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setEditing(null)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border p-5 space-y-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{isCreating ? "Add Item" : "Edit Item"}</h2>
                <button onClick={() => setEditing(null)} className="p-1 rounded-lg hover:bg-secondary"><X size={18} className="text-muted-foreground" /></button>
              </div>

              <div className="grid grid-cols-[60px_1fr] gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Emoji</label>
                  <Input value={editing.emoji || ""} onChange={e => setEditing(p => ({ ...p!, emoji: e.target.value }))} className="text-center text-lg" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <Input value={editing.name || ""} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} placeholder="Tribal Thali" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select value={editing.category || "food"} onChange={e => setEditing(p => ({ ...p!, category: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Unit Price (₹)</label>
                  <Input type="number" value={editing.unit_price || 0} onChange={e => setEditing(p => ({ ...p!, unit_price: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stock</label>
                  <Input type="number" value={editing.stock || 0} onChange={e => setEditing(p => ({ ...p!, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Low Stock Threshold</label>
                  <Input type="number" value={editing.low_stock_threshold || 0} onChange={e => setEditing(p => ({ ...p!, low_stock_threshold: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.available ?? true} onChange={e => setEditing(p => ({ ...p!, available: e.target.checked }))}
                  className="rounded border-input" id="avail" />
                <label htmlFor="avail" className="text-sm text-foreground">Available for ordering</label>
              </div>

              <button onClick={save}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition">
                {isCreating ? "Add Item" : "Save Changes"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
