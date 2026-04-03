import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserPlus, Search, Sparkles, Heart, MessageCircle, Star, Users, MapPin, Calendar } from "lucide-react";
import { useState } from "react";

interface ConnectionsScreenProps {
  onBack: () => void;
}

const mockConnections = [
  { id: "1", name: "Priya Sharma", avatar: "👩🏽", location: "Jeypore", trips: 5, mutual: 3, status: "online" as const, tagline: "Bonfire lover 🔥" },
  { id: "2", name: "Kiran Das", avatar: "👨🏽", location: "Koraput", trips: 8, mutual: 2, status: "offline" as const, tagline: "Adventure seeker 🏔️" },
  { id: "3", name: "Ananya Roy", avatar: "👩🏻", location: "Vizag", trips: 3, mutual: 5, status: "online" as const, tagline: "Foodie explorer 🍜" },
  { id: "4", name: "Sameer Patel", avatar: "👨🏻", location: "Bhubaneswar", trips: 12, mutual: 1, status: "offline" as const, tagline: "Party planner 🎉" },
  { id: "5", name: "Deepika Mohapatra", avatar: "👩🏽", location: "Jeypore", trips: 6, mutual: 4, status: "online" as const, tagline: "Stargazer ✨" },
];

const suggestedPeople = [
  { id: "s1", name: "Rohit Verma", avatar: "👨🏽", location: "Rayagada", trips: 4, reason: "Visited same venues" },
  { id: "s2", name: "Meera Kulkarni", avatar: "👩🏻", location: "Koraput", trips: 7, reason: "3 mutual friends" },
  { id: "s3", name: "Aditya Pradhan", avatar: "👨🏻", location: "Jeypore", trips: 9, reason: "Similar vibes" },
];

export default function ConnectionsScreen({ onBack }: ConnectionsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "discover">("friends");

  const filtered = mockConnections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="px-5 py-3 flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center"
            whileTap={{ scale: 0.85 }}
          >
            <ArrowLeft size={16} className="text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-foreground">Connections</h2>
            <p className="text-[11px] text-muted-foreground">{mockConnections.length} friends · {mockConnections.filter(c => c.status === "online").length} online</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <UserPlus size={16} className="text-primary" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full h-10 rounded-xl bg-muted/50 border border-border/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-2 flex gap-2">
          {(["friends", "discover"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {tab === "friends" ? "Friends" : "Discover"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "friends" ? (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Online now */}
              {filtered.some((c) => c.status === "online") && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Online Now</p>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                    {filtered
                      .filter((c) => c.status === "online")
                      .map((c, i) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex flex-col items-center shrink-0"
                        >
                          <div className="relative">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                              style={{
                                background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
                                border: "2px solid hsl(var(--primary) / 0.3)",
                                boxShadow: "0 0 16px hsl(var(--primary) / 0.15)",
                              }}
                            >
                              {c.avatar}
                            </div>
                            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                          </div>
                          <p className="text-[10px] font-medium text-foreground mt-1.5 text-center max-w-[64px] truncate">{c.name.split(" ")[0]}</p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* All connections */}
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">All Connections</p>
              {filtered.map((connection, i) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  style={{
                    background: "hsl(var(--foreground) / 0.02)",
                    border: "1px solid hsl(var(--foreground) / 0.06)",
                  }}
                >
                  <div className="p-4 flex items-center gap-3.5">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))",
                          border: "1.5px solid hsl(var(--primary) / 0.2)",
                        }}
                      >
                        {connection.avatar}
                      </div>
                      {connection.status === "online" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground truncate">{connection.name}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{connection.tagline}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin size={9} className="text-primary" /> {connection.location}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Calendar size={9} className="text-primary" /> {connection.trips} trips
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Users size={9} className="text-primary" /> {connection.mutual} mutual
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
                    >
                      <MessageCircle size={14} className="text-primary" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Users size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">No connections found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Discover header */}
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-foreground">People You May Know</h3>
                </div>
                <p className="text-xs text-muted-foreground">Based on your trips, venues, and shared experiences</p>
              </div>

              {suggestedPeople.map((person, i) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "hsl(var(--foreground) / 0.02)",
                    border: "1px solid hsl(var(--foreground) / 0.06)",
                  }}
                >
                  <div className="p-4 flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))",
                        border: "1.5px solid hsl(var(--primary) / 0.2)",
                      }}
                    >
                      {person.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{person.name}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin size={9} /> {person.location} · {person.trips} trips
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Sparkles size={9} className="text-primary" />
                        <span className="text-[10px] text-primary font-medium">{person.reason}</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold shrink-0"
                    >
                      Connect
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {/* Invite banner */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-5 mt-4 text-center"
                style={{
                  background: "linear-gradient(145deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.03))",
                  border: "1px solid hsl(var(--primary) / 0.12)",
                }}
              >
                <Heart size={28} className="text-primary mx-auto mb-2" />
                <h4 className="text-sm font-bold text-foreground">Invite Friends</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">Share the joy — invite your crew and earn rewards together</p>
                <button className="mt-3 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Share Invite Link
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
