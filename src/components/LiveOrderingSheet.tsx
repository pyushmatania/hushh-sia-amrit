import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Search, Clock, Flame, Zap, ChevronRight } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { hapticSelection, hapticSuccess } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: string;
  tag?: "bestseller" | "new" | "quick";
  prepTime: string;
  veg: boolean;
}

const menuCategories = [
  { id: "all", label: "All", emoji: "🔥" },
  { id: "food", label: "Food", emoji: "🍛" },
  { id: "drinks", label: "Drinks", emoji: "🍹" },
  { id: "entertainment", label: "Fun", emoji: "🎮" },
  { id: "comfort", label: "Comfort", emoji: "🛋️" },
];

// Map DB inventory rows to MenuItem shape
function mapInventoryToMenu(rows: any[]): MenuItem[] {
  return rows
    .filter((r: any) => r.available && ["food", "drinks"].includes(r.category))
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji || "🍽️",
      price: Number(r.unit_price),
      category: r.category,
      prepTime: "10 min",
      veg: true,
    }));
}

interface LiveOrderingSheetProps {
  open: boolean;
  onClose: () => void;
  propertyName: string;
  propertyId?: string;
  bookingId?: string;
}

export default function LiveOrderingSheet({ open, onClose, propertyName, propertyId, bookingId }: LiveOrderingSheetProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  // Fetch menu from inventory DB
  useEffect(() => {
    if (!open) return;
    supabase.from("inventory").select("*").eq("available", true).order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDbMenuItems(mapInventoryToMenu(data));
        }
        setMenuLoaded(true);
      });
  }, [open]);

  const updateCart = useCallback((id: string, delta: number) => {
    hapticSelection();
    setCart(prev => {
      const next = { ...prev };
      const val = (next[id] || 0) + delta;
      if (val <= 0) delete next[id];
      else next[id] = val;
      return next;
    });
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCat !== "all") items = items.filter(i => i.category === activeCat);
    if (search.trim()) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [activeCat, search]);

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const item = menuItems.find(i => i.id === id)!;
      return { ...item, qty };
    });
  }, [cart]);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);
    hapticSuccess();

    if (user) {
      // Save to DB
      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          property_id: propertyId || "unknown",
          booking_id: bookingId || null,
          total: cartTotal,
          status: "pending",
        })
        .select()
        .single();

      if (order) {
        const items = cartItems.map(ci => ({
          order_id: order.id,
          item_name: ci.name,
          item_emoji: ci.emoji,
          quantity: ci.qty,
          unit_price: ci.price,
        }));
        await supabase.from("order_items").insert(items);
      }
    }

    toast({ title: "🎉 Order Placed!", description: `₹${cartTotal} · Preparing your items now` });
    setCart({});
    setShowCart(false);
    setPlacing(false);
    onClose();
  };

  const tagColors: Record<string, string> = {
    bestseller: "bg-amber-500/20 text-amber-400",
    new: "bg-emerald-500/20 text-emerald-400",
    quick: "bg-sky-500/20 text-sky-400",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "92vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Order In-Stay</h2>
                <p className="text-[11px] text-muted-foreground">{propertyName} · Live menu</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu…"
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm bg-foreground/[0.04] border border-foreground/[0.06] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
              {menuCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { hapticSelection(); setActiveCat(cat.id); }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCat === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/[0.04] text-muted-foreground border border-foreground/[0.06]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Menu items */}
            <div className="overflow-y-auto px-5 pb-28" style={{ maxHeight: "55vh" }}>
              <div className="space-y-2">
                {filteredItems.map((item, i) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 rounded-2xl p-3 transition-all"
                      style={{
                        background: qty > 0 ? "hsl(var(--primary) / 0.06)" : "hsl(var(--foreground) / 0.02)",
                        border: `1px solid ${qty > 0 ? "hsl(var(--primary) / 0.2)" : "hsl(var(--foreground) / 0.06)"}`,
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-foreground/[0.04] flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-sm border ${item.veg ? "border-emerald-500" : "border-red-500"}`}>
                            <span className={`block w-1.5 h-1.5 rounded-full m-[1px] ${item.veg ? "bg-emerald-500" : "bg-red-500"}`} />
                          </span>
                          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                          {item.tag && (
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${tagColors[item.tag]}`}>
                              {item.tag === "bestseller" ? "⭐ Best" : item.tag === "new" ? "✨ New" : "⚡ Quick"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-foreground">{item.price === 0 ? "Free" : `₹${item.price}`}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock size={9} /> {item.prepTime}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {qty === 0 ? (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCart(item.id, 1)}
                            className="px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-xs font-bold text-primary"
                          >
                            ADD
                          </motion.button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateCart(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Minus size={14} className="text-primary" />
                            </motion.button>
                            <motion.span key={qty} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-sm font-bold text-foreground w-4 text-center">
                              {qty}
                            </motion.span>
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateCart(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                              <Plus size={14} className="text-primary-foreground" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Cart bar */}
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="absolute bottom-0 inset-x-0 p-4 pb-[max(16px,env(safe-area-inset-bottom))]"
                  style={{ background: "linear-gradient(to top, hsl(var(--background)) 60%, transparent)" }}
                >
                  {showCart && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 rounded-2xl border border-foreground/[0.08] p-4 space-y-2"
                      style={{ background: "hsl(var(--card))" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-foreground">Your Order</h4>
                        <button onClick={() => setShowCart(false)} className="text-muted-foreground">
                          <X size={14} />
                        </button>
                      </div>
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{item.emoji} {item.name} × {item.qty}</span>
                          <span className="text-foreground font-semibold">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                      <div className="border-t border-foreground/[0.06] pt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Total</span>
                        <span className="text-sm font-bold text-primary">₹{cartTotal}</span>
                      </div>
                    </motion.div>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={showCart ? handlePlaceOrder : () => setShowCart(true)}
                    className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-4"
                    style={{ boxShadow: "0 -4px 24px hsl(var(--primary) / 0.3)" }}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={18} />
                      <span className="text-sm font-bold">{cartCount} item{cartCount > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">₹{cartTotal}</span>
                      <span className="text-xs opacity-80">{showCart ? "Place Order" : "View Cart"}</span>
                      <ChevronRight size={14} />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
