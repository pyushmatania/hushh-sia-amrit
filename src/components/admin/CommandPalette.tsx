import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, CalendarCheck, Users, BarChart3,
  Sparkles, Tag, Megaphone, Ticket, ShoppingCart, FileSpreadsheet,
  Bot, Bell, ScrollText, Wallet, Zap, Trophy, Search, Command
} from "lucide-react";
import type { AdminPage } from "./AdminLayout";

interface Props {
  onNavigate: (page: AdminPage) => void;
}

const commands: { id: AdminPage; label: string; icon: typeof LayoutDashboard; keywords: string[] }[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard, keywords: ["home", "overview", "main"] },
  { id: "ai", label: "AI Assistant", icon: Bot, keywords: ["chat", "ask", "query", "intelligence"] },
  { id: "alerts", label: "Smart Alerts", icon: Bell, keywords: ["notifications", "warnings"] },
  { id: "pricing", label: "Dynamic Pricing", icon: Zap, keywords: ["price", "rates", "demand"] },
  { id: "properties", label: "Properties", icon: Building2, keywords: ["listings", "venues", "stays"] },
  { id: "bookings", label: "Bookings", icon: CalendarCheck, keywords: ["reservations", "schedule"] },
  { id: "users", label: "Users (CRM)", icon: Users, keywords: ["customers", "clients", "people"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, keywords: ["stats", "metrics", "data"] },
  { id: "earnings", label: "Earnings", icon: Wallet, keywords: ["revenue", "money", "income"] },
  { id: "curations", label: "Curations", icon: Sparkles, keywords: ["experiences", "bundles", "packs"] },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, keywords: ["marketing", "deals", "promotions"] },
  { id: "coupons", label: "Coupons", icon: Ticket, keywords: ["discount", "codes", "offers"] },
  { id: "tags", label: "Tags", icon: Tag, keywords: ["labels", "categories"] },
  { id: "orders", label: "Live Orders", icon: ShoppingCart, keywords: ["food", "services", "kitchen"] },
  { id: "exports", label: "Exports", icon: FileSpreadsheet, keywords: ["download", "csv", "report"] },
  { id: "achievements", label: "Achievements", icon: Trophy, keywords: ["milestones", "badges", "goals"] },
  { id: "audit", label: "Audit Trail", icon: ScrollText, keywords: ["logs", "history", "activity"] },
];

export default function CommandPalette({ onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(c => {
    const q = query.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.keywords.some(k => k.includes(q));
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(o => !o);
      setQuery("");
      setSelectedIndex(0);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const select = (page: AdminPage) => {
    onNavigate(page);
    setOpen(false);
    setQuery("");
  };

  const handleInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      select(filtered[selectedIndex].id);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-lg z-[61] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleInputKey}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-mono">
                ESC
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">No results found</p>
              )}
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => select(cmd.id)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                    i === selectedIndex
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <cmd.icon size={16} className={i === selectedIndex ? "text-primary" : "text-muted-foreground"} />
                  <span className="font-medium">{cmd.label}</span>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary font-mono">↵</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary font-mono">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
