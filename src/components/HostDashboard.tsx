import { motion } from "framer-motion";
import {
  Plus, Home, TrendingUp, Eye, IndianRupee,
  MoreVertical, Pencil, Trash2, Pause, Play, ArrowLeft, BarChart3
} from "lucide-react";
import { useState } from "react";
import type { HostListing } from "@/hooks/use-host-listings";

interface HostDashboardProps {
  listings: HostListing[];
  onCreateListing: () => void;
  onEditListing: (listing: HostListing) => void;
  onDeleteListing: (id: string) => void;
  onToggleStatus: (id: string, status: "published" | "paused") => void;
  onBack: () => void;
  onAnalytics: () => void;
}

const stats = [
  { label: "Total Views", value: "1,240", icon: Eye, color: "text-blue-500" },
  { label: "Bookings", value: "28", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Earnings", value: "₹42K", icon: IndianRupee, color: "text-primary" },
];

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export default function HostDashboard({
  listings, onCreateListing, onEditListing, onDeleteListing, onToggleStatus, onBack, onAnalytics
}: HostDashboardProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-foreground"
            >
              Host Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
              Manage your properties
            </motion.p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCreateListing}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          <Plus size={20} className="text-primary-foreground" />
        </motion.button>
      </div>

      {/* Stats */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass rounded-2xl p-3 text-center"
          >
            <stat.icon size={20} className={`${stat.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Listings */}
      <div className="px-5">
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Home size={16} className="text-primary" />
          Your Listings ({listings.length})
        </h3>

        {listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
              <Home size={36} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center">No listings yet</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-[260px]">
              Create your first property listing and start earning from bookings.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCreateListing}
              className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm shadow-lg"
            >
              Create your first listing
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border overflow-hidden"
              >
                {/* Image or placeholder */}
                <div className="relative aspect-[16/9] bg-secondary">
                  {listing.imageUrls.length > 0 ? (
                    <img src={listing.imageUrls[0]} alt={listing.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={40} className="text-muted-foreground/40" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[11px] font-semibold px-3 py-1 rounded-full capitalize ${statusColors[listing.status]}`}>
                    {listing.status}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center"
                      style={{ position: "absolute", top: "-100%", right: "12px", transform: "translateY(-200%)" }}
                    >
                      <MoreVertical size={16} className="text-foreground" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-[15px] text-foreground">{listing.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{listing.location}</p>
                    </div>
                    <button
                      onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                      className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center shrink-0"
                    >
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm">
                      <span className="font-semibold text-foreground">₹{listing.basePrice.toLocaleString()}</span>
                      <span className="text-muted-foreground"> / 2 hours</span>
                    </p>
                    <span className="text-xs text-muted-foreground">Cap: {listing.capacity}</span>
                  </div>

                  {/* Dropdown actions */}
                  {menuOpen === listing.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 border-t border-border flex gap-2"
                    >
                      <button
                        onClick={() => { setMenuOpen(null); onEditListing(listing); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-sm font-medium text-foreground"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(null);
                          onToggleStatus(listing.id, listing.status === "published" ? "paused" : "published");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-sm font-medium text-foreground"
                      >
                        {listing.status === "published" ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Publish</>}
                      </button>
                      <button
                        onClick={() => { setMenuOpen(null); onDeleteListing(listing.id); }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-destructive/10 text-sm font-medium text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
