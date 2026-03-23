import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, BookOpen, Layers, MapPin, Users, Palette, Database, History, Sparkles, Shield, Zap, Copy, Check, FileText, Target, Layout, PenTool, TrendingUp, AlertTriangle, Clock, Server } from "lucide-react";
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
  {
    version: "1.11",
    phase: "Curations & Mood Discovery",
    items: [
      "Mood Selector — emoji-based vibe picker (Romantic/Party/Chill/Work) filters entire feed",
      "Curated Experience Packs — 8 one-tap bookable packs (After Hours Chill, Just Us Night, Party Scene, BBQ Bonfire, Movie Night, Game Night, Work Escape, Team Work Day)",
      "Tonight Tags — quick discovery filters (Tonight at Hushh, Just Us Picks, Party Ready, Work Escape, Under ₹999)",
      "CuratedPackCard component — hero cards with gradient headers, savings badges, strikethrough pricing, 1-tap book CTA",
      "Mood-filtered property feed — selecting a mood filters all listings across the home tab",
      "Slot Intelligence — smart tags (Almost Full, Best Price, Trending, Couple Pick, Work Best) on time slots",
      "Dynamic Pricing — strikethrough original prices, savings badges, viewers-now microcopy ('5 people viewing')",
    ],
  },
  {
    version: "1.12",
    phase: "Monetization & Gamification (DB-Wired)",
    items: [
      "Live Service Ordering — Swiggy-style in-stay menu with 20 items, category filters, cart with quantity controls, veg/non-veg indicators, prep times",
      "Orders wired to DB — orders + order_items tables with authenticated RLS, saved per user on place order",
      "Privacy Mode — toggle in Settings to mask names & booking IDs, discreet notifications option, stored in localStorage",
      "Experience Builder Smart Nudges — 'People also added' section with contextual suggestions (beer+BBQ, candle+dinner combos), savings badges",
      "Spin Wheel — daily spin-to-win on Loyalty screen with weighted prizes (5-100 pts), SVG wheel with framer-motion rotation",
      "Spin history wired to DB — spin_history table, 1 spin/day enforced via DB query, prizes recorded server-side",
      "Milestone Rewards — 6 achievement milestones (First Booking, Explorer, Regular, Reviewer, Social Butterfly, VIP) with point rewards",
      "Milestones wired to DB — user_milestones table with unique(user_id, milestone_id), achievements persisted across sessions",
      "Curations wired to live database — curations table with public read RLS, 8 seeded packs, frontend fetches from DB with fallback",
      "PrivacyModeProvider — context provider wrapping the app for global privacy state",
      "LiveOrderingSheet — accessible from booking confirmation page via 'Order Food & Drinks' button",
      "New DB tables: orders, order_items, spin_history, user_milestones (total: 16 tables)",
      "Order History section on Trips screen — expandable cards showing past in-stay orders fetched from DB with item details",
      "Repeat Booking Engine — 'Your Last Vibe 🔁' card on home screen, reads from bookings table (DB-wired), 1-tap rebook CTA, guest fallback via localStorage",
    ],
  },
  {
    version: "1.13",
    phase: "Trip Management & Active Stay",
    items: [
      "Active Trip status — new 'active' booking status for checked-in users, live pulse indicator on trip cards",
      "ActiveTripCard on home — replaces Last Vibe card, shows ongoing trip with 'Order Food' CTA and 'View Trip' button",
      "Food ordering merged with extras — LiveOrderingSheet only accessible from active/checked-in trips (not all trips)",
      "Trips redesign — 5 filter tabs (All, Active, Upcoming, Past, Cancelled), sorted with active first",
      "Comprehensive demo trips — 8 mock bookings covering all statuses (1 active, 2 upcoming, 3 completed, 2 cancelled)",
      "Order Food button on active trip cards — opens LiveOrderingSheet directly from trip card footer",
      "Curated pack listings redesigned — tall vertical cards with autoplay video backgrounds, AccentFrame borders, AccentTag badges",
      "8 generated videos for curated packs — bonfire, romantic, party, BBQ, movie, gaming, work, team",
      "Mood selector removed from home — cleaner feed layout",
      "All trip data wired to DB via useBookings hook with localStorage guest fallback",
    ],
  },
  {
    version: "1.14",
    phase: "Loyalty & Rewards Redesign",
    items: [
      "Gamified Loyalty Screen with tabbed interface",
      "Enhanced Spin Wheel with sound effects",
    ],
  },
  {
    version: "1.15",
    phase: "Add-on Icons & Curated Listings",
    items: [
      "Per-item emoji icons, curated pack video backgrounds",
    ],
  },
  {
    version: "1.16",
    phase: "Admin Panel Foundation",
    items: [
      "Admin layout with collapsible sidebar (22 nav items)",
      "Command Palette (⌘K) with fuzzy search",
      "Command Center dashboard with KPI cards, live activity feed",
      "Role-based access control via user_roles table and has_role() function",
      "Admin pages: Properties, Bookings, Users, Analytics, Curations, Campaigns, Coupons, Tags, Orders, Exports, AI Assistant, Smart Alerts, Audit Trail, Earnings, Dynamic Pricing, Achievements, Loyalty & Referrals",
      "Floating Checklist widget",
      "Edge functions: admin-ai, auto-notifications, smart-alerts, weekly-digest, property-history-ai",
    ],
  },
  {
    version: "1.17",
    phase: "Admin CRM & Property History",
    items: [
      "Client Directory (CRM 2.0) — engagement scoring, journey timeline, stay/order/review aggregation",
      "Property History — calendar-based stay tracking, chronological timeline, AI-powered search",
      "AI search in Command Center, Client Directory, and Property History",
      "Live Orders widget (Zomato-style), Live Pending tracker",
      "Booking Heatmap visualization",
      "Weekly Digest preview, Auto-Actions panel",
      "Identity verification review queue in admin",
    ],
  },
  {
    version: "1.18",
    phase: "Database-Driven CRUD & Inventory",
    items: [
      "Properties fully database-driven — all 28+ properties migrated to host_listings table",
      "Full Property CRUD — admin can edit name, pricing, images, tags, amenities, slots, rules, status",
      "Inventory Management — food/drink/activity stock tracking with low-stock alerts",
      "host_listings schema expanded with 12 new columns",
      "Coupons and campaigns seeded in database",
      "Identity verification enforcement on booking flow",
    ],
  },
  {
    version: "1.19",
    phase: "Dynamic App Configuration",
    items: [
      "app_config table — centralized key-value store for all runtime settings",
      "Admin Settings page — 3-tab interface (General, Branding, Advanced)",
      "Admin Homepage Manager — 4-tab interface (Sections, Videos, Filters, Tags)",
      "Dynamic Branding — app_name, logo_url, app_tagline wired to SplashScreen and HomeScreen",
      "Dynamic Homepage Sections — visibility toggles and drag-to-reorder",
      "Dynamic Spotlight Videos — admin edits video URLs and overlay text",
      "Dynamic Filter Pills — category filters editable in admin",
      "Dynamic Support Contacts — support_phone, support_email, whatsapp_number wired to Messages",
      "Tags merged into Homepage Manager",
      "4 new hooks: useAppConfig, useHomepageSections, useHomepageFilters, useVideoCards",
    ],
  },
  {
    version: "1.20",
    phase: "Social, Legal & Performance",
    items: [
      "Social Media Links — Instagram, Facebook, YouTube, Twitter in ProfileScreen footer",
      "Terms & Privacy Sheet — dynamic legal links from branding config",
      "SEO & Performance — non-render-blocking fonts, preconnect hints, lazy-loaded routes",
      "All images converted to WebP format for optimal loading",
      "Network dependency tree flattened — fonts loaded via HTML preload pattern",
    ],
  },
  {
    version: "1.21",
    phase: "Product Planning & Documentation",
    items: [
      "Product Requirements Document (PRD) — full PRD with personas, KPIs, priority matrix, risks, roadmap",
      "App Blueprint — system architecture, data flow, module dependencies, state management, security layers",
      "Wireframes — screen layout map, booking flow, admin panel, home screen, profile, ER diagram",
      "Easter egg docs updated with PRD, Blueprint, and Wireframe sections",
    ],
  },
];

// Generate the full HUSHH.md content from the changeLog + app info
function generateFullDoc(): string {
  const header = `# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.21 | Internal Documentation & Blueprint

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

80+ components, 20+ hooks, 30+ database tables

---

## 🗄 Database Tables

profiles, bookings, wishlists, conversations, messages, notifications, reviews, review_responses, loyalty_transactions, referral_codes, referral_uses, host_listings, curations, orders, order_items, spin_history, user_milestones, user_roles, app_config, inventory, experience_packages, booking_photos, booking_splits, coupons, campaigns, expenses, budget_allocations, staff_members, staff_tasks, staff_attendance, staff_leaves, staff_salary_payments, audit_logs, client_notes, order_notes, identity_verifications, property_tags, tag_assignments

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
              <p className="text-[11px] text-muted-foreground">v1.21 · Internal Blueprint</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleCopyDoc}
              className="h-9 px-3 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5 text-xs font-medium text-primary"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <X size={18} className="text-foreground" />
            </motion.button>
          </div>
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
            <li>Loyalty: 5 pts per ₹100, tier progression, spin wheel</li>
            <li>Referrals: unique codes, point rewards</li>
            <li>Real-time messaging with unread counts</li>
            <li>Host Dashboard: create/edit listings, analytics</li>
            <li>Identity verification for bookings</li>
            <li>Split payment with friends</li>
            <li>Booking photos and receipts</li>
            <li>Live food/drink ordering during active stays</li>
          </ul>
        </DocSection>

        <DocSection
          title="Admin Panel"
          icon={<Zap size={15} className="text-primary" />}
        >
          <ul className="list-disc list-inside space-y-1">
            <li>Command Center — KPI dashboard, live activity feed</li>
            <li>Full Property CRUD — create, edit, duplicate, delete listings</li>
            <li>Booking Hub — manage all reservations</li>
            <li>Client CRM — engagement scores, journey timeline, notes</li>
            <li>Inventory Management — stock tracking, low-stock alerts</li>
            <li>Curations, Campaigns, Coupons management</li>
            <li>Dynamic Homepage — section ordering, video cards, filter pills</li>
            <li>App Settings — branding, support contacts, social links, legal</li>
            <li>Staff Management — directory, attendance, leaves, payroll</li>
            <li>Finance Hub — expenses, budget tracking</li>
            <li>AI Assistant, Smart Alerts, Audit Trail</li>
            <li>Role-based access: super_admin, ops_manager, host, staff</li>
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
              ["bookings", "Slot, date, guests, total, status, rooms, mattresses"],
              ["wishlists", "User ↔ property joins"],
              ["conversations", "Two-participant chat threads"],
              ["messages", "Chat messages with read state"],
              ["notifications", "Push-style alerts per user"],
              ["reviews", "Ratings, content, photos, verified flag"],
              ["review_responses", "Host responses to reviews"],
              ["loyalty_transactions", "Point earn/redeem ledger"],
              ["referral_codes", "User referral codes"],
              ["referral_uses", "Code usage tracking"],
              ["host_listings", "Full property CRUD with slots, rules, lat/lng"],
              ["curations", "Pre-built experience packs with mood tags"],
              ["orders", "In-stay service orders per booking"],
              ["order_items", "Line items with emoji, qty, price"],
              ["order_notes", "Staff/admin notes on orders"],
              ["spin_history", "Daily spin-to-win prize records"],
              ["user_milestones", "Achievement tracking per user"],
              ["user_roles", "RBAC roles (super_admin, ops_manager, host, staff)"],
              ["app_config", "Key-value runtime settings"],
              ["inventory", "Stock tracking with low-stock alerts"],
              ["experience_packages", "Bookable add-on packages"],
              ["coupons", "Discount codes with usage limits"],
              ["campaigns", "Marketing campaigns with targeting"],
              ["expenses", "Expense tracking with categories"],
              ["budget_allocations", "Monthly budget by category"],
              ["staff_members", "Staff directory with salary, dept"],
              ["staff_tasks", "Task assignment and tracking"],
              ["staff_attendance", "Check-in/out with overtime"],
              ["staff_leaves", "Leave requests with approval flow"],
              ["staff_salary_payments", "Payroll records"],
              ["audit_logs", "Action audit trail"],
              ["client_notes", "CRM notes per client"],
              ["booking_photos", "Guest photos per booking"],
              ["booking_splits", "Split payment tracking"],
              ["identity_verifications", "ID document verification queue"],
              ["property_tags", "Custom property tags with colors"],
              ["tag_assignments", "Tag ↔ entity joins"],
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

        {/* Full Raw Document */}
        <DocSection
          title="Full Document (Copy/Paste)"
          icon={<FileText size={15} className="text-primary" />}
        >
          <div className="space-y-3">
            <p className="text-xs">Tap the button below to view the full raw document, then copy it.</p>
            <button
              onClick={() => setShowRawDoc(!showRawDoc)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-primary"
              style={{
                background: "hsl(var(--primary) / 0.1)",
                border: "1px solid hsl(var(--primary) / 0.2)",
              }}
            >
              {showRawDoc ? "Hide Raw Document" : "Show Raw Document"}
            </button>
            {showRawDoc && (
              <div className="relative">
                <button
                  onClick={handleCopyDoc}
                  className="absolute top-2 right-2 z-10 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"
                  style={{
                    background: copied ? "hsl(var(--success))" : "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy All</>}
                </button>
                <pre
                  className="rounded-xl p-4 pt-10 text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto"
                  style={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {generateFullDoc()}
                </pre>
              </div>
            )}
          </div>
        </DocSection>

        <div className="text-center py-6">
          <p className="text-[11px] text-muted-foreground">
            <Sparkles size={12} className="inline text-primary mr-1" />
            Hushh v1.20 · Made in Jeypore ❤️
          </p>
        </div>
      </div>
    </motion.div>
  );
}
