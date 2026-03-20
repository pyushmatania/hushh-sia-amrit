import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, BookOpen, Layers, MapPin, Users, Palette, Database, History, Sparkles, Shield, Zap, Copy, Check, FileText } from "lucide-react";
import { useState, useCallback } from "react";

interface AppDocumentationProps {
  open: boolean;
  onClose: () => void;
}

interface DocSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function DocSection({ title, icon, children, defaultOpen = false }: DocSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{
        background: "hsl(var(--primary) / 0.05)",
        border: "1px solid hsl(var(--primary) / 0.1)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "hsl(var(--primary) / 0.12)" }}
        >
          {icon}
        </div>
        <span className="flex-1 text-sm font-bold text-foreground">{title}</span>
        {open ? (
          <ChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-[13px] text-muted-foreground leading-relaxed space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CHANGE LOG ──────────────────────────────────────────────
// When adding features or making changes, add an entry here.
// Format: { version: "x.x", date: "YYYY-MM-DD", items: string[] }
export const changeLog = [
  {
    version: "1.0",
    phase: "Foundation",
    items: [
      "Project scaffolding — React + Vite + Tailwind + TypeScript + shadcn/ui",
      "Animated splash screen with logo reveal",
      "Home screen with category bar, property cards, rotating search bar",
      "20+ mock properties with slots, pricing, amenities, tags",
      "Property detail — gallery, slot picker, guest counter, booking CTA",
      "Bottom navigation — 5 tabs (Explore, Wishlists, Trips, Messages, Profile)",
    ],
  },
  {
    version: "1.1",
    phase: "Booking Flow",
    items: [
      "Experience Builder — add-on selection between detail and checkout",
      "Checkout screen with payment summary and coupon support",
      "Booking confirmation with confetti animation + booking ID",
      "Trips screen — upcoming / completed / cancelled tabs",
      "Booking detail — full info with cancel and rebook actions",
    ],
  },
  {
    version: "1.2",
    phase: "Social & Discovery",
    items: [
      "Full-text search with category filters",
      "Map view with pin-based property browsing",
      "Wishlist screen — grid layout of saved properties",
      "Messages screen — conversation list and chat UI",
      "Review section — star ratings, photo reviews, host responses",
    ],
  },
  {
    version: "1.3",
    phase: "Profile & Personalization",
    items: [
      "Profile screen — avatar, stats, bio, achievements, settings",
      "Edit profile sheet — update name, location, bio",
      "Settings sheet — notifications, security, language, accessibility",
      "Theme switcher — Light / Dark / Auto with animated toggle",
      "Public profile screen — view other users",
    ],
  },
  {
    version: "1.4",
    phase: "Backend Integration",
    items: [
      "Authentication — email/password with email verification",
      "Database tables — profiles, bookings, wishlists, conversations, messages, notifications, reviews, loyalty, referrals, host_listings",
      "Row-level security on all tables",
      "Real-time wishlists synced across sessions",
      "Real-time bookings and messages with unread counts",
    ],
  },
  {
    version: "1.5",
    phase: "Loyalty & Growth",
    items: [
      "Loyalty system — earn 5 pts per ₹100, tier progression (Bronze → Gold → Platinum)",
      "Referral system — unique codes, point rewards, usage tracking",
      "Notification center with bell icon, read/unread states",
      "In-app toast alerts and push permission banner",
    ],
  },
  {
    version: "1.6",
    phase: "Host Features",
    items: [
      "Host dashboard — listing management with status toggles",
      "Create / edit listing — multi-step form with image upload",
      "Host analytics — charts and metrics",
    ],
  },
  {
    version: "1.7",
    phase: "Visual Identity & Polish",
    items: [
      "Design system overhaul — Space Grotesk + Playfair Display fonts",
      "Deep navy/purple-black theme (#0C0B1D → #111028)",
      "AccentFrame — L-shaped corner accents on cards",
      "AccentTag — asymmetric status badges with clip-path",
      "Glassmorphism utility class for frosted panels",
      "Video thumbnails (MP4 assets) for property cards",
      "Haptic feedback via Web Vibration API",
      "Pull-to-refresh on home feed",
    ],
  },
  {
    version: "1.8",
    phase: "Home Feed Enrichment",
    items: [
      "Spotlight carousel, Sports cards, Foodie carousel",
      "Couple specials, What's Hot grid, Upcoming events",
      "Blockbuster banner, Curated combo cards",
      "Experience cards, Service grid, Curation grid/hero",
      "Sticky tab bar and back-to-top button",
    ],
  },
  {
    version: "1.9",
    phase: "Mock Data & Guest Experience",
    items: [
      "Mock user profiles — tap reviewer names to see profiles without login",
      "Mock notifications and loyalty (320 pts / Gold tier) for guests",
      "End-to-end guest mode — all features work with mock data",
    ],
  },
  {
    version: "1.10",
    phase: "Profile Redesign & Docs",
    items: [
      "Profile hero card redesign — centered layout, ambient glows, animated stats",
      "Membership badge polish with gradient background",
      "Achievements & Recent Activity redesign — gradient cards, staggered animations",
      "README.md — comprehensive project documentation",
      "In-app documentation — hidden easter egg (tap version 5×)",
      "Change history convention — all changes logged in README + in-app docs",
    ],
  },
];

// Generate the full HUSHH.md content from the changeLog + app info
function generateFullDoc(): string {
  const header = `# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.0 | Internal Documentation & Blueprint

Hushh is a premium mobile-first marketplace for booking private experiences, stays, and curated lifestyle services in Jeypore, India.

---

## 🏛 Core Concept — Four Pillars

| Pillar | What it means | Examples |
|--------|--------------|----------|
| **Stays** | Private spaces by time slot | Farmhouses, Work Pods, Rooftops, Villas |
| **Experiences** | What happens at the space | Candlelight Dinner, House Party, Bonfire Night |
| **Services** | On-demand add-ons | Chef-on-Call, Decor Setup, DJ & Lights, Rides |
| **Curations** | Pre-built combos | "Date Night Deluxe", "Birthday Bash Package" |

Strategic focus: **"Work-from-resort"** for weekday monetization.

---

## 🎯 Target Audience

- Young couples — date nights, anniversaries, weekend getaways
- Friend groups — house parties, game nights, celebrations
- Remote workers — weekday work sessions, Work Pods, Quiet Rooms
- Families — birthday parties, family gatherings
- Corporate — team retreats, offsites
- Hosts — property owners monetizing spaces

---

## 🗺 User Flow

Splash → Home (Explore) → Category Bar → Property Card → Detail → Book → Experience Builder → Checkout → Confirmation

Bottom Nav: Explore | Wishlists | Trips | Messages | Profile

Profile → Loyalty, Referrals, Host Dashboard, Settings, Theme, Auth

---

## ✨ Features

### Guest Mode (no login)
- Full property browsing with video thumbnails & accent frames
- Mock wishlists, trips, messages, notifications, loyalty (320 pts / Gold)
- Mock public profiles for all reviewers
- Search, map view, theme switching, pull-to-refresh, haptic feedback

### Authenticated
- Email/password auth with email verification & password reset
- Real wishlists, bookings, messages, notifications, loyalty (database-backed)
- Booking flow: Slot → Builder → Checkout → Confirm (earn 5 pts/₹100)
- Referral system, real-time messaging, notification center

### Host Features
- Dashboard with listing management, create/edit/delete/toggle
- Host analytics with charts

---

## 🎨 Design System

**Fonts**: Space Grotesk (primary), Playfair Display (editorial), Plus Jakarta Sans, DM Sans
**Colors**: Deep navy base (260 20% 6%), vibrant purple primary (270 80% 65%)
**Effects**: Glassmorphism, ambient glows, AccentFrame (L-shaped corners), AccentTag (clip-path)
**Animation**: Framer Motion springs, staggered reveals, haptic feedback

---

## 🏗 Architecture

React 18 · TypeScript · Vite 8 · Tailwind CSS 3 · shadcn/ui · Framer Motion 12 · React Query · React Router v6 · Lovable Cloud · Recharts · React Hook Form + Zod

40+ components, 15 hooks, 12 database tables

---

## 🗄 Database Tables

profiles, bookings, wishlists, conversations, messages, notifications, reviews, review_responses, loyalty_transactions, referral_codes, referral_uses, host_listings

---

## 📋 Change History
`;

  const changes = changeLog
    .map(
      (phase) =>
        `### v${phase.version} — ${phase.phase}\n${phase.items.map((item) => `- ${item}`).join("\n")}`
    )
    .join("\n\n");

  const footer = `\n\n---\n\n## 🥚 Easter Eggs\n\nTap version text 5× on Profile tab → Full in-app documentation\n\n---\n\n📄 **License**: Private — All rights reserved.\n`;

  return header + changes + footer;
}

export default function AppDocumentation({ open, onClose }: AppDocumentationProps) {
  const [copied, setCopied] = useState(false);
  const [showRawDoc, setShowRawDoc] = useState(false);

  const handleCopyDoc = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateFullDoc());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select all in a textarea
      const ta = document.createElement("textarea");
      ta.value = generateFullDoc();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/90 border-b border-border">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(var(--primary) / 0.15)" }}
            >
              <BookOpen size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Hushh Docs</h1>
              <p className="text-[11px] text-muted-foreground">v1.0 · Internal Blueprint</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <X size={18} className="text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-72px)] px-5 py-4 pb-20">
        {/* Hero */}
        <div
          className="rounded-2xl p-5 mb-5 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
            border: "1px solid hsl(var(--primary) / 0.2)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)" }} />
          <p className="text-3xl mb-2">🏡</p>
          <h2 className="text-xl font-bold text-foreground">Hushh</h2>
          <p className="text-sm text-muted-foreground mt-1">Private Experience Marketplace</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-[280px] mx-auto">
            Book private stays, curated experiences, and on-demand services — all in one app. Made in Jeypore.
          </p>
        </div>

        {/* Sections */}
        <DocSection
          title="Core Concept — Four Pillars"
          icon={<Layers size={15} className="text-primary" />}
          defaultOpen
        >
          <div className="space-y-2">
            <p><strong className="text-foreground">🏠 Stays</strong> — Private spaces booked by time slot: Farmhouses, Work Pods, Rooftops, Villas, Pool Houses</p>
            <p><strong className="text-foreground">🎭 Experiences</strong> — What happens at the space: Candlelight Dinners, House Parties, Bonfire Nights, Heritage Walks</p>
            <p><strong className="text-foreground">🛎 Services</strong> — On-demand add-ons: Chef-on-Call, Decor Setup, DJ & Lights, Rides, Staff</p>
            <p><strong className="text-foreground">✨ Curations</strong> — Pre-built combos: "Date Night Deluxe", "Birthday Bash", "Corporate Retreat"</p>
            <p className="pt-1 text-xs border-t border-border mt-2">Strategic focus: <strong className="text-foreground">"Work-from-resort"</strong> for weekday monetization with Work Pods and Quiet Rooms.</p>
          </div>
        </DocSection>

        <DocSection
          title="User Flow"
          icon={<MapPin size={15} className="text-primary" />}
        >
          <div className="space-y-1.5 font-mono text-[11px]">
            <p>Splash → Home (Explore)</p>
            <p className="pl-3">├ Category filter (Home, Stays, Experiences, Services...)</p>
            <p className="pl-3">├ Search → Full-text search with filters</p>
            <p className="pl-3">├ Map View → Pin-based browsing</p>
            <p className="pl-3">├ Property Card → Detail</p>
            <p className="pl-6">├ Book → Experience Builder (add-ons)</p>
            <p className="pl-9">└ Checkout → Confirmation + loyalty pts</p>
            <p className="pl-6">└ Reviewer tap → Public Profile</p>
            <p className="pl-3">└ Carousels: Spotlight, Sports, Foodie, Couples...</p>
            <p className="pt-1">Bottom Nav: Explore | Wishlists | Trips | Messages | Profile</p>
            <p className="pt-1">Profile → Loyalty, Referrals, Host Dashboard, Settings</p>
          </div>
        </DocSection>

        <DocSection
          title="Features — Guest Mode"
          icon={<Users size={15} className="text-primary" />}
        >
          <ul className="list-disc list-inside space-y-1">
            <li>Full property browsing with video thumbnails & accent frames</li>
            <li>Property detail with gallery, slots, reviews</li>
            <li>Mock wishlists, trips, messages, notifications</li>
            <li>Mock loyalty — 320 pts, Gold tier</li>
            <li>Mock public profiles for all reviewers</li>
            <li>Search, map view, theme switching</li>
            <li>Pull-to-refresh, haptic feedback, back-to-top</li>
          </ul>
        </DocSection>

        <DocSection
          title="Features — Authenticated"
          icon={<Shield size={15} className="text-primary" />}
        >
          <ul className="list-disc list-inside space-y-1">
            <li>Email/password auth with email verification</li>
            <li>Password reset flow</li>
            <li>Real wishlists, bookings, messages, notifications (database)</li>
            <li>Booking: Select slot → Builder → Checkout → Confirm</li>
            <li>Loyalty: 5 pts per ₹100, tier progression</li>
            <li>Referrals: unique codes, point rewards</li>
            <li>Real-time messaging with unread counts</li>
            <li>Host Dashboard: create/edit listings, analytics</li>
          </ul>
        </DocSection>

        <DocSection
          title="Design System"
          icon={<Palette size={15} className="text-primary" />}
        >
          <div className="space-y-2">
            <p><strong className="text-foreground">Fonts:</strong> Space Grotesk (primary), Playfair Display (editorial), Plus Jakarta Sans, DM Sans</p>
            <p><strong className="text-foreground">Base:</strong> Deep navy/purple-black (#0C0B1D → #111028)</p>
            <p><strong className="text-foreground">Primary:</strong> Vibrant purple (270° 80% 65%)</p>
            <p><strong className="text-foreground">Effects:</strong> Glassmorphism, ambient radial glows, gradient borders</p>
            <p><strong className="text-foreground">Identity:</strong> L-shaped corner accents, asymmetric status tags</p>
            <p><strong className="text-foreground">Motion:</strong> Framer Motion springs, staggered reveals, layout animations</p>
          </div>
        </DocSection>

        <DocSection
          title="Database Schema"
          icon={<Database size={15} className="text-primary" />}
        >
          <div className="space-y-1 font-mono text-[11px]">
            {[
              ["profiles", "Display name, avatar, bio, location, loyalty pts, tier"],
              ["bookings", "Slot, date, guests, total, status"],
              ["wishlists", "User ↔ property joins"],
              ["conversations", "Two-participant chat threads"],
              ["messages", "Chat messages with read state"],
              ["notifications", "Push-style alerts per user"],
              ["reviews", "Ratings, content, photos, verified flag"],
              ["review_responses", "Host responses to reviews"],
              ["loyalty_transactions", "Point earn/redeem ledger"],
              ["referral_codes", "User referral codes"],
              ["referral_uses", "Code usage tracking"],
              ["host_listings", "User-created venue listings"],
            ].map(([table, desc]) => (
              <p key={table}>
                <strong className="text-foreground">{table}</strong> — {desc}
              </p>
            ))}
          </div>
        </DocSection>

        <DocSection
          title="Tech Stack"
          icon={<Zap size={15} className="text-primary" />}
        >
          <div className="space-y-1">
            <p><strong className="text-foreground">Frontend:</strong> React 18, TypeScript, Vite 8</p>
            <p><strong className="text-foreground">Styling:</strong> Tailwind CSS 3, shadcn/ui, CVA</p>
            <p><strong className="text-foreground">Animation:</strong> Framer Motion 12</p>
            <p><strong className="text-foreground">State:</strong> React Query, React Context</p>
            <p><strong className="text-foreground">Routing:</strong> React Router v6</p>
            <p><strong className="text-foreground">Backend:</strong> Lovable Cloud</p>
            <p><strong className="text-foreground">Charts:</strong> Recharts</p>
            <p><strong className="text-foreground">Forms:</strong> React Hook Form + Zod</p>
          </div>
        </DocSection>

        {/* Change History */}
        <DocSection
          title="Change History"
          icon={<History size={15} className="text-primary" />}
          defaultOpen
        >
          <div className="space-y-4">
            {changeLog.map((phase) => (
              <div key={phase.version}>
                <p className="font-bold text-foreground text-xs mb-1.5 flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[10px]"
                    style={{
                      background: "hsl(var(--primary) / 0.15)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    v{phase.version}
                  </span>
                  {phase.phase}
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[12px]">
                  {phase.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DocSection>

        <div className="text-center py-6">
          <p className="text-[11px] text-muted-foreground">
            <Sparkles size={12} className="inline text-primary mr-1" />
            Hushh v1.0 · Made in Jeypore ❤️
          </p>
        </div>
      </div>
    </motion.div>
  );
}
