import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Plus, MoreVertical, Pencil, Trash2, Pause, Play, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Listing {
  id: string; name: string; location: string; base_price: number;
  capacity: number; status: string; category: string; image_urls: string[];
  user_id: string; created_at: string;
}

const statusBadge: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  paused: "bg-amber-500/15 text-amber-400",
};

export default function AdminProperties() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("host_listings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setListings(data ?? []); setLoading(false); });
  }, []);

  const filtered = listings.filter(l =>
    (filter === "all" || l.status === filter) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "published" ? "paused" : "published";
    await supabase.from("host_listings").update({ status: next }).eq("id", id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
  };

  const deleteListing = async (id: string) => {
    await supabase.from("host_listings").delete().eq("id", id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const filters = ["all", "published", "draft", "paused"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 size={22} className="text-primary" /> Properties
          </h1>
          <p className="text-sm text-muted-foreground">{listings.length} total listings</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No properties found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4 flex gap-4"
            >
              <div className="w-20 h-20 rounded-lg bg-secondary shrink-0 overflow-hidden">
                {listing.image_urls?.[0] ? (
                  <img src={listing.image_urls[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={24} className="text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{listing.name}</h3>
                    <p className="text-xs text-muted-foreground">{listing.location} · {listing.category}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[listing.status] || statusBadge.draft}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-foreground font-medium tabular-nums">₹{listing.base_price.toLocaleString()}<span className="text-muted-foreground font-normal"> /2hr</span></p>
                  <div className="flex gap-1">
                    <button onClick={() => toggleStatus(listing.id, listing.status)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition" title={listing.status === "published" ? "Pause" : "Publish"}>
                      {listing.status === "published" ? <Pause size={14} className="text-amber-400" /> : <Play size={14} className="text-emerald-400" />}
                    </button>
                    <button onClick={() => deleteListing(listing.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
