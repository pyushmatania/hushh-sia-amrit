import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Minus, AlertTriangle, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface InventoryItem {
  id: string; name: string; category: string; emoji: string;
  unit_price: number; stock: number; low_stock_threshold: number;
  available: boolean; property_id: string | null;
}

const categoryEmojis: Record<string, string> = {
  food: "🍔", drinks: "🍺", decor: "🎨", activities: "🎮", supplies: "📦",
};

export default function StaffInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "food", emoji: "🍔", unit_price: 0, stock: 100 });

  const loadInventory = () => {
    supabase.from("inventory").select("*").order("sort_order", { ascending: true }).order("category").order("name")
      .then(({ data }) => { setItems((data as any) ?? []); setLoading(false); });
  };

  useEffect(() => {
    loadInventory();

    const channel = supabase
      .channel('staff-inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        loadInventory();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addItem = async () => {
    if (!form.name) return;
    const { data } = await supabase.from("inventory").insert({
      name: form.name, category: form.category, emoji: form.emoji,
      unit_price: form.unit_price, stock: form.stock,
    } as any).select().maybeSingle();
    if (data) setItems(prev => [...prev, data as any]);
    setShowAdd(false);
    setForm({ name: "", category: "food", emoji: "🍔", unit_price: 0, stock: 100 });
  };

  const updateStock = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    const available = newStock > 0;
    await supabase.from("inventory").update({ stock: newStock, available } as any).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock: newStock, available } : i));
  };

  const categories = ["all", ...new Set(items.map(i => i.category))];
  const filtered = items.filter(i =>
    (filter === "all" || i.category === filter) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter(i => i.stock <= i.low_stock_threshold && i.stock > 0);
  const outOfStock = items.filter(i => i.stock === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Package size={20} className="text-primary" /> Inventory
        </h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStock.length > 0) && (
        <div className="flex gap-2">
          {lowStockItems.length > 0 && (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle size={12} /> {lowStockItems.length} low stock
            </span>
          )}
          {outOfStock.length > 0 && (
            <span className="text-[11px] font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle size={12} /> {outOfStock.length} out of stock
            </span>
          )}
        </div>
      )}

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Add Item</h3>
            <button onClick={() => setShowAdd(false)}><X size={16} className="text-muted-foreground" /></button>
          </div>
          <Input placeholder="Item name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, emoji: categoryEmojis[e.target.value] || "📦" }))}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              {Object.entries(categoryEmojis).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
            </select>
            <Input type="number" placeholder="Price" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: Number(e.target.value) }))} />
          </div>
          <Input type="number" placeholder="Initial stock" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
          <button onClick={addItem} className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">Add Item</button>
        </motion.div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
              filter === c ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border bg-card p-3 flex items-center gap-3 ${
                item.stock === 0 ? "border-destructive/30 opacity-60" :
                item.stock <= item.low_stock_threshold ? "border-amber-500/30" : "border-border"
              }`}>
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{item.category} · ₹{item.unit_price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateStock(item.id, -1)}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-destructive/20 transition">
                  <Minus size={12} className="text-foreground" />
                </button>
                <span className={`text-sm font-bold tabular-nums min-w-[2rem] text-center ${
                  item.stock === 0 ? "text-destructive" : item.stock <= item.low_stock_threshold ? "text-amber-400" : "text-foreground"
                }`}>{item.stock}</span>
                <button onClick={() => updateStock(item.id, 1)}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-emerald-500/20 transition">
                  <Plus size={12} className="text-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
