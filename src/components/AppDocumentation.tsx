import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, BookOpen, Layers, MapPin, Users, Palette, Database, History, Sparkles, Shield, Zap, Copy, Check, FileText, Target, Layout, PenTool, TrendingUp, AlertTriangle, Clock, Server, Download } from "lucide-react";
import { useState, useCallback, useRef } from "react";

// Mermaid diagram rendered via iframe
function MermaidDiagram({ chart, title }: { chart: string; title: string }) {
  const [expanded, setExpanded] = useState(false);
  const escaped = chart.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script><style>body{margin:0;padding:12px;background:#0c0b1d;display:flex;justify-content:center;overflow:auto;}svg{max-width:100%;height:auto;}</style></head><body><pre class="mermaid">${escaped}</pre><script>mermaid.initialize({startOnLoad:true,theme:'dark',themeVariables:{primaryColor:'#7c3aed',primaryTextColor:'#e2e8f0',primaryBorderColor:'#7c3aed',lineColor:'#a78bfa',secondaryColor:'#1e1b4b',tertiaryColor:'#312e81',background:'#0c0b1d',mainBkg:'#1e1b4b',nodeBorder:'#7c3aed',clusterBkg:'#1e1b4b33',clusterBorder:'#7c3aed55',titleColor:'#e2e8f0',edgeLabelBackground:'#1e1b4b',fontSize:'11px'}});<\/script></body></html>`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="font-bold text-foreground text-xs">{title}</p>
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-primary font-medium">
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className="rounded-lg overflow-hidden transition-all duration-300" style={{ height: expanded ? "500px" : "280px", border: "1px solid hsl(var(--border))" }}>
        <iframe srcDoc={html} className="w-full h-full border-0" sandbox="allow-scripts" title={title} />
      </div>
    </div>
  );
}

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
  {
    version: "1.22",
    phase: "Schema Hardening & Audit Resolution",
    items: [
      "7 new DB tables: payments, refunds, invoices, property_slots, slot_availability, notification_preferences, push_tokens (45 total)",
      "Payment foundation — Razorpay-ready schema with gateway fields, refund tracking, invoice generation with JSONB line items",
      "Slot management — dedicated property_slots + slot_availability tables for per-date booking & dynamic pricing",
      "Booking schema hardened — payment_status + payment_id on bookings, split payment tracking enhanced",
      "Conversations enhanced — type (direct/support/group), property_id, metadata fields",
      "Config audit trail — updated_by added to app_config",
      "FCM readiness — push_tokens table with platform tracking",
      "Notification preferences — per-type per-channel opt-out table",
      "Documentation audit — 8 critical issues resolved, 20+ warnings addressed, ER diagram updated, hooks reference expanded",
      "Realtime enabled for payments and slot_availability tables",
    ],
  },
  {
    version: "1.23",
    phase: "Complete Wireframes & Onboarding",
    items: [
      "8 new wireframes: Experience Builder, Checkout, Live Ordering, Search, Map View, Loyalty & Spin, Auth/Onboarding, Notifications",
      "Wireframes now cover all revenue-critical screens (Experience Builder, Checkout, Live Ordering)",
      "Auth/Onboarding wireframe with sign-in, sign-up, guest mode, and email verification flows",
      "Search wireframe with category chips, recent searches, results grid, and empty state",
      "Map View wireframe with pin markers, preview card overlay, and list toggle",
      "Loyalty wireframe with tier card, spin wheel, transaction history, and milestones",
      "Notifications wireframe with filter tabs, read/unread states, grouped by day, empty state",
      "Updated ER diagram with full payment flow relationships (payments → refunds → invoices)",
      "Documentation and easter egg UI synced with all 16 wireframes (8 user + 8 admin)",
    ],
  },
  {
    version: "1.24",
    phase: "Resilience & Performance",
    items: [
      "React Error Boundaries — global + per-route crash recovery with 'Try Again' UI",
      "Offline Detection — useOnlineStatus hook + animated OfflineBanner when device goes offline",
      "Query Retry Strategy — React Query configured: 2× retry with exponential backoff (1s→4s), 30s stale time",
      "Mutation Retry — single retry on failed mutations for resilience",
      "Rate Limiting Documented — Auth (30/hr), Spin Wheel (1/day), Edge Functions (100/s), Search (300ms debounce)",
      "Video & Asset Strategy — lazy loading via IntersectionObserver, CDN-backed storage, font preconnect",
      "Architecture updated — ErrorBoundary, OfflineBanner, useOnlineStatus reflected in component tree",
    ],
  },
  {
    version: "1.25",
    phase: "v2.0 Hooks",
    items: [
      "usePayments — Payment CRUD, create payment, get by booking, auto-refresh",
      "useSlotAvailability — Property slots + per-date availability, remaining capacity, dynamic pricing",
      "useInvoices — Invoice retrieval by user/booking, PDF URL access",
      "useOrders — Order CRUD with nested items, active order tracking, create with items",
      "useSearch — Debounced (300ms) full-text search across properties + curations with category filtering",
      "Total hooks: 27 (up from 22)",
    ],
  },
];

// Generate the COMPLETE documentation including PRD, Blueprint, Wireframes
function generateFullDoc(): string {
  const header = `# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.23 | Internal Documentation & Blueprint

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

| Segment | Use Case | Key Features |
|---------|----------|-------------|
| Young couples | Date nights, anniversaries | Couple Specials, romantic venues |
| Friend groups | House parties, game nights | Group bookings, experience builder |
| Remote workers | Weekday work sessions | Work Pods, Quiet Rooms, Wi-Fi |
| Families | Birthday parties, gatherings | Birthday halls, catering, decor |
| Corporate | Team retreats, offsites | Package deals, analytics, bulk booking |
| Hosts | Monetizing spaces | Dashboard, analytics, listing management |
| Admins | Operations managers | Full CRM, CRUD, analytics, AI assistant |

---

## 🗺 User Flow

### Primary Flow (Booking)
Splash → Home → Browse/Search/Map → Property Card → Detail → Select Slot + Date + Guests → Book Now → Experience Builder (add-ons) → Checkout (coupon, summary) → Confirm (confetti + loyalty pts) → View Trips

### Secondary Flows
- Wishlists Tab → Grid of saved properties → Detail → Book
- Trips Tab → Active/Upcoming/Past/Cancelled → Detail → Cancel/Rebook/Order Food
- Messages Tab → Conversation list → Chat thread (real-time)
- Profile Tab → Loyalty, Referrals, Host Dashboard, Settings, Theme
- Active Trip → Order Food (live ordering) / Add Extras

### Admin Flow
/admin → Auth → Admin Layout (sidebar + ⌘K) → 22 pages: Command Center, Properties CRUD, Inventory, Bookings, Client CRM, Property History, Live Orders, Curations, Campaigns, Coupons, Analytics, Earnings, AI Assistant, Smart Alerts, Dynamic Pricing, Homepage Manager, Users CRM, Calendar, Achievements, Loyalty & Referrals, Exports, Settings, Audit Trail

---

## 📱 Screen-by-Screen Documentation

### 1. Splash Screen — Animated brand logo, auto-transitions to Home (~2s), dynamic branding from app_config
### 2. Home / Explore — Search bar, Active Trip, Category Bar, Spotlight Carousel, Property Cards, Sports, Foodie, Couples, Services, Curations, Events
### 3. Property Detail — Gallery, info, slot picker, guest counter, date picker, reviews, sticky book bar
### 4. Experience Builder — Add-on categories (Food, Decor, Entertainment, Transport), qty selectors, running total
### 5. Checkout — Booking summary, add-ons, coupon, price breakdown, confirm CTA
### 6. Booking Confirmation — Confetti, booking ID, loyalty points badge
### 7. Search — Full-screen, real-time filtering, category chips
### 8. Map View — Pin markers, tap → preview → detail
### 9. Wishlists — Grid of saved properties
### 10. Trips — Tabs (Active/Upcoming/Past/Cancelled), identity verification, booking cards
### 11. Booking Detail — Status banner, property card, Order Food, Add Extras, Cancel/Rebook
### 12. Messages — Conversation list, chat thread, dynamic support contacts
### 13. Profile — Hero card, membership badge, stats, achievements, recent activity, host CTA, theme, social links, terms
### 14. Public Profile — User info, stats, achievements
### 15-24. Supporting — Edit Profile, Settings, Loyalty, Referral, Notifications, Host Dashboard, Create Listing, Host Analytics, Auth, App Docs

---

## 🛡️ Admin Panel (22 Pages)

| Page | Description |
|------|-------------|
| Command Center | KPI dashboard, live activity feed, pending items |
| AI Assistant | Natural language queries across all data |
| Smart Alerts | Low stock, overdue tasks, booking anomalies |
| Dynamic Pricing | Demand-based pricing rules |
| Calendar | Monthly view with booking overlays |
| Booking Requests | Pending approval queue |
| Properties | Full CRUD — name, pricing, images, tags, amenities, slots, rules, status |
| Bookings | All bookings, status management |
| Live Orders | Real-time food/service order tracking |
| Inventory | Stock levels, low-stock alerts, pricing, availability |
| Client Directory | CRM 2.0 — engagement scoring (0-100), journey timeline |
| Property History | Calendar-based stay tracking, AI search |
| Users CRM | User management (admin-only) |
| Analytics | Charts, trends, revenue breakdowns |
| Earnings | Revenue tracking, payout summaries |
| Curations | Curated pack CRUD |
| Campaigns | Marketing campaign studio |
| Coupons | Discount code engine |
| Homepage Manager | Sections, Videos, Filters, Tags |
| Settings | General, Branding, Advanced |
| Exports | CSV/data export tools |
| Audit Trail | Full activity log (admin-only) |

### Admin Features
- Command Palette (⌘K) — fuzzy search across 17 commands
- AI-Powered Search — natural language queries via edge functions
- Client Engagement Scoring — automated 0-100 score
- Role-based access: super_admin, ops_manager, host, staff

### Edge Functions
| Function | Purpose |
|----------|---------|
| admin-ai | Natural language admin queries |
| auto-notifications | Automated notification triggers |
| property-history-ai | AI search over property stay history |
| smart-alerts | Automated alert generation |
| weekly-digest | Weekly summary email |
| staff-report | Staff attendance & performance |

---

## ✨ Features — Guest Mode

| Feature | Mock Behavior |
|---------|--------------|
| Property browsing | Full catalog with video thumbnails |
| Wishlists | 5 demo properties, session-persistent |
| Trips | 12 demo bookings across all statuses |
| Messages | Mock conversations |
| Notifications | 4 sample notifications |
| Loyalty | 320 pts, Gold tier, mock transactions |
| Profile | "Guest Explorer" with mock stats |
| Search & Map | Full functionality |

---

## 🔐 Features — Authenticated

| Feature | Database Table | Details |
|---------|---------------|---------|
| Auth | auth.users | Email/password, verification, reset |
| Profile | profiles | Display name, avatar, bio, loyalty pts, tier |
| Identity Verification | identity_verifications | Aadhaar/PAN upload, admin review |
| Wishlists | wishlists | Real-time sync |
| Bookings | bookings | Full CRUD, status management |
| Messages | conversations + messages | Real-time chat, unread counts |
| Notifications | notifications | Read/unread, action URLs |
| Reviews | reviews + review_responses | Ratings, photos, host responses |
| Loyalty | loyalty_transactions | 5 pts/₹100, tier progression |
| Referrals | referral_codes + referral_uses | Unique codes, rewards |
| Curations | curations | 8 experience packs |
| Orders | orders + order_items | Live ordering |
| Spin Wheel | spin_history | Daily spin, 1/day enforced |
| Milestones | user_milestones | Achievement tracking |
| Split Payment | booking_splits | Split with friends |
| Booking Photos | booking_photos | Guest photos per booking |

---

## 🎨 Design System

**Fonts**: Space Grotesk (primary), Playfair Display (editorial), Plus Jakarta Sans, DM Sans
**Colors**: Deep navy base (260 20% 6%), vibrant purple primary (270 80% 65%)
**Effects**: Glassmorphism, ambient glows, AccentFrame, AccentTag, gradient borders
**Animation**: Framer Motion springs, staggered reveals, haptic feedback

---

## 🏗 Architecture

80+ components, 27 hooks, 45 database tables, 6 edge functions

React 18 · TypeScript · Vite 8 · Tailwind CSS 3 · shadcn/ui · Framer Motion 12 · React Query · React Router v6 · Lovable Cloud · Recharts · React Hook Form + Zod

### 🛡️ Resilience & Error Handling

**Error Boundaries**: Every route wrapped in ErrorBoundary — global fallback + per-route crash recovery with "Try Again" UI.

| Boundary | Scope | Fallback |
|---|---|---|
| Global | Entire BrowserRouter | "App crashed unexpectedly" |
| Home | Index page | "Failed to load home" |
| Admin | Admin panel | "Admin panel error" |
| Staff | Staff dashboard | "Staff panel error" |

**Offline Detection**: useOnlineStatus hook + OfflineBanner — animated top bar when device goes offline.

**Query Retry**: Queries retry 2× (exponential backoff 1s→4s, max 10s). Mutations retry 1×. Stale time 30s.

**Rate Limiting**: Auth 30/hr per IP, Spin Wheel 1/day/user, Edge Functions 100 req/s, Search 300ms debounce.

---

## 🪝 Hooks Reference

| Hook | Purpose |
|------|---------|
| useAuth | Auth context |
| useAdmin | Role-based admin access |
| useBookings | Booking CRUD |
| useWishlists | Wishlist management |
| useMessages | Chat conversations |
| useNotifications | Notifications (mock fallback) |
| useLoyalty | Points, tier, transactions (mock fallback) |
| useReferrals | Referral codes |
| useReviews | Reviews + responses |
| useHostListings | Host listing CRUD |
| useHostAnalytics | Analytics data |
| useImageUpload | Storage upload |
| useTheme | Theme management |
| usePrivacyMode | Privacy toggle |
| useCurations | Curated packs (static fallback) |
| useUnreadCount | Unread message count |
| useAppConfig | Dynamic app config (defaults fallback) |
| useHomepageSections | Section visibility & ordering |
| useHomepageFilters | Dynamic category filter pills |
| useVideoCards | Spotlight video card config |

---

## 🗄 Database Schema (45 Tables)

| Table | Key Columns | Purpose |
|-------|------------|---------|
| profiles | user_id, display_name, avatar_url, loyalty_points, tier | User profiles |
| bookings | user_id, property_id, date, slot, guests, total, status, payment_status, payment_id | Booking records |
| wishlists | user_id, property_id | Saved properties |
| conversations | participant_1, participant_2, type, property_id, metadata | Chat threads (direct/support/group) |
| messages | conversation_id, sender_id, content, read | Chat messages |
| notifications | user_id, title, body, type, read | Alerts |
| reviews | user_id, property_id, rating, content, photo_urls | Reviews |
| review_responses | review_id, host_id, content | Host replies |
| loyalty_transactions | user_id, title, points, type | Point ledger |
| referral_codes | user_id, code, uses, reward_points | Referral codes |
| referral_uses | code_id, referrer_user_id, referred_user_id | Usage tracking |
| host_listings | user_id, name, category, base_price, capacity, amenities, tags, image_urls, slots (JSONB), rules (JSONB), status | Property listings |
| curations | name, tagline, emoji, slot, includes[], tags[], mood[], price, property_id | Experience packs |
| orders | user_id, property_id, booking_id, total, status | In-stay orders |
| order_items | order_id, item_name, item_emoji, quantity, unit_price | Order line items |
| order_notes | order_id, content, author_name, author_role | Staff notes on orders |
| spin_history | user_id, points_won, prize_label | Daily spin results |
| user_milestones | user_id, milestone_id | Achievement tracking |
| user_roles | user_id, role (enum) | RBAC |
| audit_logs | user_id, entity_type, action, details (JSONB) | Activity audit |
| campaigns | title, type, discount_type, target_properties[], target_audience[] | Marketing |
| coupons | code, discount_type, discount_value, max_uses, expires_at | Discount codes |
| property_tags | name, icon, color | Tag definitions |
| tag_assignments | tag_id, target_id, target_type | Tag mappings |
| identity_verifications | user_id, document_type, document_url, status | ID verification |
| inventory | name, emoji, category, unit_price, stock, low_stock_threshold | Stock mgmt |
| experience_packages | name, emoji, gradient, includes[], price | Add-on packages |
| app_config | key, value, label, category | Runtime settings |
| budget_allocations | category, month, year, allocated, spent | Budget tracking |
| expenses | title, amount, category, vendor, date | Expense mgmt |
| staff_members | name, role, department, salary, status | Staff directory |
| staff_tasks | title, description, priority, status, assigned_to | Task tracking |
| staff_attendance | staff_id, date, check_in, check_out, hours_worked | Attendance |
| staff_leaves | staff_id, leave_type, start_date, end_date, status | Leave requests |
| staff_salary_payments | staff_id, amount, month, year, status | Payroll |
| client_notes | client_user_id, content, author_name, note_type | CRM notes |
| booking_photos | booking_id, photo_url, caption | Guest photos |
| booking_splits | booking_id, friend_name, friend_email, amount, status, payment_status, payment_id | Split payments |
| **payments** | booking_id, user_id, amount, currency, status, gateway, gateway_order_id | **Payment tracking (v1.22)** |
| **refunds** | payment_id, booking_id, amount, reason, status, gateway_refund_id | **Refund management (v1.22)** |
| **invoices** | booking_id, payment_id, user_id, invoice_number, amount, line_items JSONB | **Invoice generation (v1.22)** |
| **property_slots** | property_id, label, start_time, end_time, base_price, capacity | **Slot management (v1.22)** |
| **slot_availability** | slot_id, date, booked_count, is_available, price_override | **Per-date availability (v1.22)** |
| **notification_preferences** | user_id, notification_type, channel, enabled | **Notification opt-out (v1.22)** |
| **push_tokens** | user_id, token, platform, active | **FCM push tokens (v1.22)** |

### Database Functions
| Function | Purpose |
|----------|---------|
| award_loyalty_points(user_id, points, title) | Add points + transaction |
| redeem_loyalty_points(user_id, points, title) | Deduct points if sufficient |
| create_notification(user_id, title, body, type) | Insert notification |
| has_role(user_id, role) | Check role (security definer) |

### Enums
| Enum | Values |
|------|--------|
| app_role | super_admin, ops_manager, host, staff |

---

## 🔒 Security & RLS

- All tables have Row-Level Security enabled
- Users can only read/write their own data
- Public READ on listings, curations
- Admin access via has_role() security definer function
- User roles in dedicated user_roles table
- No secrets in client code; edge functions for sensitive ops
- 4-layer security: Auth → RBAC → RLS → Application

---

## 📋 Product Requirements Document (PRD)

### 1. Product Overview
**Product Name**: Hushh | **Tagline**: "Your Private Getaway" | **Platform**: Mobile-first PWA | **Market**: Jeypore, Odisha → tier-2/3 cities

### 2. Problem Statement
No unified platform in tier-2/3 cities for discovering private venues. Customers rely on WhatsApp groups and phone calls. Property owners manage bookings with notebooks. No bundled experience discovery.

### 3. Solution
A marketplace connecting experience seekers with private venue owners:
- One-tap discovery of curated stays, experiences, and services
- Bundled experience packs (curations) eliminating decision fatigue
- Real-time operations for hosts (inventory, orders, staff management)
- Gamified loyalty to drive repeat bookings

### 4. Success Metrics (KPIs)
| Metric | Target |
|--------|--------|
| Monthly Active Users (MAU) | 5,000+ |
| Booking Conversion Rate | 8-12% |
| Average Order Value (AOV) | ₹3,500+ |
| Repeat Booking Rate | 40%+ |
| Host Onboarding | 50+ properties |
| NPS Score | 60+ |
| App Rating | 4.5+ |

### 5. User Personas

**Persona 1: Priya (The Planner)** — Age 26, Marketing Executive
- Goal: Plan memorable anniversary dinners
- Pain: Can't find unique venues beyond restaurants
- Behavior: Researches 3-4 days ahead, budget-conscious but splurges for quality
- Needs: Curations, reviews, split payments, photos

**Persona 2: Rahul (The Spontaneous One)** — Age 24, Software Developer
- Goal: Find a chill spot tonight with friends
- Pain: Last-minute planning always falls apart
- Behavior: Decides same-day, values speed over perfection
- Needs: Tonight tags, active trip ordering, quick checkout

**Persona 3: Sunita (The Host)** — Age 42, Farmhouse Owner
- Goal: Monetize her property during weekdays
- Pain: Manages bookings via phone calls and notebooks
- Behavior: Not tech-savvy, needs simple tools
- Needs: Dashboard, calendar, inventory, staff management

**Persona 4: Vikram (The Corporate Booker)** — Age 35, HR Manager
- Goal: Book team outing venue with activities
- Pain: Coordinating venue + food + activities separately is exhausting
- Behavior: Books 2-4 weeks ahead, needs invoices and receipts
- Needs: Experience builder, bulk booking, receipts, curations

### 6. Feature Priority Matrix

| Priority | Feature | Status | Impact | Effort |
|----------|---------|--------|--------|--------|
| P0 (Must) | Property discovery & booking | ✅ Done | High | High |
| P0 (Must) | Authentication & profiles | ✅ Done | High | Medium |
| P0 (Must) | Admin property CRUD | ✅ Done | High | High |
| P1 (Should) | Experience Builder | ✅ Done | High | Medium |
| P1 (Should) | Curated experience packs | ✅ Done | High | Medium |
| P1 (Should) | Live in-stay ordering | ✅ Done | Medium | Medium |
| P1 (Should) | Loyalty & gamification | ✅ Done | Medium | Medium |
| P1 (Should) | Admin CRM & analytics | ✅ Done | Medium | High |
| P2 (Nice) | Payment gateway (Razorpay) | 🔜 Planned | High | Medium |
| P2 (Nice) | Push notifications (FCM) | 🔜 Planned | Medium | Medium |
| P2 (Nice) | Multi-language support | 🔜 Planned | Medium | Low |
| P2 (Nice) | AI-powered recommendations | 🔜 Planned | Medium | High |
| P3 (Later) | Native mobile apps | 📋 Backlog | High | Very High |
| P3 (Later) | Multi-city expansion | 📋 Backlog | Very High | Very High |
| P3 (Later) | Vendor marketplace | 📋 Backlog | High | High |

### 7. Non-Functional Requirements
| Requirement | Specification |
|-------------|--------------|
| Performance | FCP < 1.5s, LCP < 2.5s, TTI < 3.5s |
| Availability | 99.5% uptime |
| Security | RLS on all tables, RBAC, email verification |
| Scalability | Serverless edge functions, CDN-delivered assets |
| Accessibility | WCAG 2.1 AA compliance target |
| Browser Support | Chrome 90+, Safari 15+, Firefox 90+, Edge 90+ |

### 8. Release Roadmap
| Phase | Version | Status | Key Deliverables |
|-------|---------|--------|-----------------|
| Foundation | v1.0–1.3 | ✅ Complete | Core UI, booking flow, profiles |
| Backend | v1.4–1.6 | ✅ Complete | Auth, DB, real-time, host tools |
| Polish | v1.7–1.10 | ✅ Complete | Design system, feed, guest mode, docs |
| Monetization | v1.11–1.13 | ✅ Complete | Curations, ordering, gamification |
| Operations | v1.14–1.20 | ✅ Complete | Admin panel, CRM, CRUD, config, SEO |
| Payments | v2.0 | 🔜 Planned | Razorpay/UPI integration, invoicing |
| Growth | v2.1 | 🔜 Planned | Push notifications, referral 2.0, AI recs |
| Scale | v3.0 | 📋 Backlog | Multi-city, vendor marketplace, native apps |

### 9. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low host adoption | High | Hands-on onboarding, zero listing fees |
| Payment fraud | High | UPI verification, booking limits, admin review |
| Seasonal demand | Medium | Work-from-resort push, weekday pricing, corporate packages |
| Data loss | Critical | Automated backups, RLS, audit logs |
| OTA competition | Medium | Hyper-local focus, curated packs, personal touch |

### 10. User App — Detailed Feature Specification

#### 10.1 Discovery & Browse
- Rotating search bar with contextual placeholders
- 6 primary categories: Home, Stays, Experiences, Services, Curations, Work
- Dynamic sub-filters per category (admin-configurable)
- Spotlight video carousel with autoplay
- Property cards with video thumbnails, ratings, pricing, AccentFrame
- Sports activity cards (horizontal scroll)
- Foodie carousel (video cards)
- Couple specials grid
- Curated pack listings (tall video cards with savings badges)

#### 10.2 Booking Flow
- Step 1: Property Detail — gallery, info, reviews, slot picker (Morning/Afternoon/Evening/Night/Full Day), guest counter, date picker
- Step 2: Experience Builder — 4 category tabs (Food, Decor, Entertainment, Transport), per-item emoji icons, quantity selectors, smart nudges ("People also added..."), running total
- Step 3: Checkout — booking summary, add-on line items, coupon input with validation, price breakdown (base + add-ons - discount = total)
- Step 4: Confirmation — confetti animation, booking ID (HUSHH-XXXXXX), loyalty points earned (5 pts/₹100)

#### 10.3 Trip Management
- 5 filter tabs: All, Active, Upcoming, Past, Cancelled
- Active trips: green pulse indicator, "Order Food" CTA, "Add Extras" button
- LiveOrderingSheet: Swiggy-style menu with 20+ items, category filters, cart, veg/non-veg indicators, prep times
- Cancel with confirmation dialog, rebook flow
- Order history with expandable item details
- Identity verification prompt for unverified users

#### 10.4 Social & Communication
- Real-time messaging with unread counts
- Review system with star ratings, photo reviews, host responses
- Public profile viewing (works with mock profiles for guests)
- Share property via Web Share API / clipboard fallback
- WhatsApp and Twitter share URLs

#### 10.5 Loyalty & Gamification
- Earn 5 points per ₹100 spent
- Tier progression: Bronze (0) → Silver (200) → Gold (500) → Platinum (1000)
- Spin Wheel: daily spin with weighted prizes (5-100 pts), sound effects, framer-motion animation
- 6 achievement milestones: First Booking, Explorer, Regular, Reviewer, Social Butterfly, VIP
- Referral system: unique codes, 100 pts reward for both parties

#### 10.6 Profile & Settings
- Hero card with ambient glow, verified badge, stats row
- Membership badge with tier and cashback percentage
- Quick stats: Bookings, Wishlisted, Total Spent
- Achievements: horizontal scroll gradient cards
- Recent activity: last 3 bookings
- Settings: notifications, security, language, accessibility, privacy mode
- Theme: Light/Dark/Auto animated toggle
- Social media footer (dynamic from config)
- Terms & Privacy with dynamic legal links

### 11. Admin App — Detailed Feature Specification

#### 11.1 Command Center (Dashboard)
- 4 KPI cards: Revenue, Bookings, Active Guests, Average Rating
- Live Activity Feed: real-time stream of bookings, orders, reviews
- Pending Items Widget: actionable counts (bookings to confirm, reviews to respond, verifications)
- Quick Navigation: icon grid to all admin sections

#### 11.2 Property Management (Full CRUD)
- List view with search, category filter, status filter
- Create/Edit form: name, description, full_description, location, lat/lng, base_price, capacity, category, property_type, primary_category, tags[], amenities[], highlights[], image_urls[], slots (JSONB time windows), rules (JSONB house rules), entry_instructions, host_name, discount_label
- Status management: Published / Draft / Paused
- Actions: Duplicate, Delete (with confirmation), Toggle Status
- Multi-image editor with drag-to-reorder

#### 11.3 Inventory Management
- Categories: Food, Drinks, Activities, Equipment, Supplies
- Per-item fields: name, emoji, unit_price, stock, low_stock_threshold, available toggle, property assignment
- Low-stock alerts (amber when stock ≤ threshold)
- Bulk operations: enable/disable, price update

#### 11.4 Booking Hub
- All bookings across all users with filters (date range, status, property)
- Status flow: pending → confirmed → active → completed / cancelled
- Booking detail: guest info, property, slot, add-ons, total, notes
- Heatmap visualization of booking density

#### 11.5 Client Directory (CRM 2.0)
- Profile cards with engagement score (0-100)
- Score formula: booking frequency + order count + review count + loyalty points
- Segments: VIP (80+), Frequent (50+), Returning (20+), New (<20)
- Journey timeline: chronological view of all interactions
- Aggregation from 9+ tables: bookings, orders, reviews, loyalty, wishlists, messages, referrals, milestones, identity
- Client notes with pinning and type categorization
- AI-powered search: "Show me VIP clients", "Who booked most in March?"

#### 11.6 Property History
- Calendar view with color-coded booking density per property
- Chronological timeline of all stays at a property
- AI search: "Who stayed in Villa last Sunday?", "How many bonfires this month?"
- Drill-down to client profile from any stay record

#### 11.7 Finance Hub
- Revenue dashboard with daily/weekly/monthly views
- Expense tracking with categories, vendors, payment methods
- Budget allocations by category and month
- Recurring expense management
- Receipt upload and storage

#### 11.8 Staff Management
- Staff directory: name, role, department, salary, joining date, status
- Attendance tracking: check-in/out, hours worked, overtime
- Leave management: request → approve/reject flow with reason
- Payroll: monthly salary payments with bonus/deductions tracking
- Task assignment with priority levels and due dates

#### 11.9 Marketing Tools
- Campaign Studio: flash deals, seasonal offers, percentage/flat discounts, target audiences/properties
- Coupon Engine: unique codes, percentage/flat discount, min order, max uses, expiry, user-specific
- Dynamic Pricing: demand-based rules, peak/off-peak multipliers

#### 11.10 Homepage Manager
- Sections Tab: toggle visibility and drag-to-reorder all homepage sections
- Videos Tab: edit spotlight video URLs, overlay text, property links
- Filters Tab: manage category filter pills per category
- Tags Tab: CRUD for property tags with icons and colors

#### 11.11 Settings
- General: base pricing, service fees, min guests, max guests, support phone, email, WhatsApp
- Branding: app name, logo URL, tagline, social media links (Instagram, Facebook, YouTube, Twitter), legal URLs (terms, privacy, refund policy)
- Advanced: map center coordinates, spin wheel config, notification preferences

---

## 🗺 App Blueprint

### System Architecture
\`\`\`
CLIENT (Browser)
  ├── React Router · React Query · Framer Motion
  └── Supabase JS Client (Auth · Realtime · Storage)
       │ HTTPS
LOVABLE CLOUD
  ├── Edge Functions (6): admin-ai, smart-alerts, auto-notifications, property-history-ai, weekly-digest, staff-report
  ├── PostgreSQL (45 tables + RLS + Triggers + Functions)
  ├── Storage (listing-images, identity-docs, booking-photos)
  └── Auth (GoTrue): Email/Password, verification, reset
\`\`\`

### Data Flow
- Guest → Mock Data (localStorage + static)
- Auth User → Supabase Queries (React Query with cache, 2× retry, 30s stale)
- Admin → Admin Panel (22 pages + sidebar)
- Offline → OfflineBanner shown, cached data available, mutations fail gracefully

### State Management
- Global: AuthProvider, ThemeProvider, PrivacyModeProvider, PropertiesProvider, QueryClient
- Local: Screen state machine (Index.tsx), component useState, localStorage fallbacks
- Online Status: useOnlineStatus hook (navigator.onLine + event listeners)

### Module Map
\`\`\`
App.tsx
  ├── Index.tsx (SPA shell + 15 screens)
  │   ├── HomeScreen (10+ sub-components)
  │   ├── PropertyDetail → Builder → Checkout → Confirmation
  │   ├── Trips → BookingDetail → LiveOrdering
  │   └── Profile → Loyalty, Referrals, Host Dashboard
  ├── Admin.tsx (22 pages + sidebar)
  └── Staff.tsx (orders, tasks, checkin)
\`\`\`

### Security Layers
1. Auth — email/password, JWT, email verification
2. RBAC — user_roles table, has_role() function
3. RLS — every table, per-user data isolation
4. App — no secrets in client, edge functions for ops

### API & Edge Functions
- POST /admin-ai → AI interprets natural language → {answer, data[], suggestions[]}
- POST /smart-alerts → Check low stock, overdue tasks → Creates admin notifications
- POST /auto-notifications → Database webhook → User notification + optional email
- POST /property-history-ai → AI search booking + order history → {results[], summary}
- POST /weekly-digest → Aggregate weekly data → Email digest to admin
- POST /staff-report → Staff attendance & performance → Summary report

---

## 📐 Wireframes

### User App — Screen Hierarchy (5 Tabs)
\`\`\`
Tab 1: EXPLORE
  Search → ActiveTrip → Categories → Spotlight
  → Properties → Sports → Foodie → Packs

Tab 2: WISHLISTS — 2-col grid of saved properties

Tab 3: TRIPS — Filter tabs → Cards → Detail → Order/Cancel

Tab 4: MESSAGES — Conversations → Chat thread

Tab 5: PROFILE — Hero → Stats → Achievements → Settings
\`\`\`

### User App — Home Screen (Mobile)
\`\`\`
┌─────────────────────────┐
│ [👤]  Jeypore  [🔔·3]  │  Header
│ [🔍 Search farmhouses...]│  Rotating placeholder
│ ┌─────────────────────┐ │
│ │ 🟢 Active Trip      │ │  Only when checked-in
│ │ Villa · Eve · [Order]│ │
│ └─────────────────────┘ │
│ 🏠 Stays 🎭 Exp ✨ Cur │  Category bar
│ ╔═══ VIDEO SPOTLIGHT ═╗ │  Autoplay
│ ╚═════════════════════╝ │
│ ┌──────┐ ┌──────┐      │  Property cards
│ │Villa │ │Farm  │      │
│ │₹2.5K │ │₹1.8K │      │
│ └──────┘ └──────┘      │
│ [🏸][🎯][🏊][🏓]       │  Sports
│ [🍽 Thali][🕯 Candle]  │  Foodie
│ ┌═══ Pack Card ═══════┐ │  Curations
│ │ "Date Night" ₹3,999 │ │
│ │ [Book Now]          │ │
│ └═════════════════════┘ │
│ 🏠  ❤️  ✈️  💬  👤    │  Bottom nav
└─────────────────────────┘
\`\`\`

### User App — Booking Flow
\`\`\`
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ DETAIL  │→│ BUILDER │→│CHECKOUT │→│ CONFIRM │
│ Gallery │  │ Food tab│  │ Summary │  │ 🎊      │
│ Slots   │  │ Decor   │  │ Add-ons │  │HUSHH-XX │
│ Date    │  │ DJ tab  │  │ Coupon  │  │ +50 pts │
│ Guests  │  │ [-] [+] │  │ Total   │  │         │
│ Reviews │  │ Running │  │         │  │ [View   │
│ [Book→] │  │ [Next→] │  │ [Pay→]  │  │  Trips] │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
\`\`\`

### User App — Profile Screen
\`\`\`
┌─────────────────────────┐
│         Profile          │
│      ┌──────────┐       │
│      │  Avatar  │       │  Glow effect
│      │ (badge)  │       │
│      └──────────┘       │
│     Priya Sharma         │
│     📍 Jeypore           │
│  ┌─────┬─────┬────────┐ │
│  │ 12  │  8  │ 2 yrs  │ │  Stats
│  │Trips│Revws│Member  │ │
│  └─────┴─────┴────────┘ │
│ ┌─ 🥇 Gold · 1,240 pts ┐│  Membership
│ ┌──────┬──────┬──────┐  │  Quick stats
│ │Books │Saved │Spent │  │
│ [🌟Early][⭐5Star]→    │  Achievements
│ ┌─ Recent Activity ────┐│
│ │Villa · ₹3.2K         ││
│ [🏠 Become a Host]     │
│ [☀️ Light][🌙 Dark]    │  Theme
│ [📸][📘][▶][🐦]        │  Social
│ Terms · Privacy · v1.23 │  Easter egg (5-tap)
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
\`\`\`

### Admin App — Panel Layout
\`\`\`
┌─────────┬───────────────────────────────────────────┐
│ SIDEBAR │          MAIN CONTENT AREA                 │
│ ┌─────┐ │  COMMAND CENTER                            │
│ │ 🏠  │ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │Home │ │  │ ₹42K │ │  28  │ │  12  │ │ 4.8★ │    │
│ │ 🤖  │ │  │Rev.  │ │Books │ │Active│ │Rating│    │
│ │AI   │ │  └──────┘ └──────┘ └──────┘ └──────┘    │
│ │ 🔔  │ │  ┌─ Live Feed ──┐ ┌─ Pending ──────┐    │
│ │Alert│ │  │ ● New booking│ │ □ 3 bookings   │    │
│ │ 🏠  │ │  │ ● Food order │ │ □ 2 reviews    │    │
│ │Prop │ │  │ ● Review     │ │ □ 1 verification│   │
│ │ 📦  │ │  └──────────────┘ └────────────────┘    │
│ │Inv  │ │                                          │
│ │ 👥  │ │  PROPERTIES                      [+ New] │
│ │Users│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 📊  │ │  │ Villa    │ │Farmhouse │ │ Work Pod │ │
│ │Stats│ │  │ ₹2,500   │ │ ₹1,800   │ │ ₹999     │ │
│ │ (+) │ │  │ [Edit]   │ │ [Edit]   │ │ [Edit]   │ │
│ │more │ │  └──────────┘ └──────────┘ └──────────┘ │
│ └─────┘ │                                          │
└─────────┴──────────────────────────────────────────┘
\`\`\`

### Admin App — Property CRUD Form
\`\`\`
┌─────────────────────────────────────────────┐
│ Edit Property                        [Save] │
├─────────────────────────────────────────────┤
│ Name: [Villa Sunset Evening________]        │
│ Location: [Jeypore, Odisha_________]        │
│ Category: [Stays ▼]  Type: [Villa ▼]       │
│ Price: [₹ 2,500___]  Capacity: [- 20 +]   │
│ Status: ○ Published ● Draft ○ Paused       │
│                                             │
│ Images: [📷][📷][📷][📷] [+ Add]          │
│                                             │
│ Tags: [🏷 Romantic] [🏷 Pool] [+ Add]     │
│ Amenities: [WiFi] [AC] [Pool] [+ Add]     │
│                                             │
│ Slots (JSONB):                             │
│ ┌──────────┬──────┬──────┬────────┐        │
│ │ Slot     │ From │  To  │ Price  │        │
│ │ Morning  │ 9AM  │ 12PM │ ₹1,500 │        │
│ │ Evening  │ 5PM  │ 10PM │ ₹2,500 │        │
│ │ Night    │10PM  │ 8AM  │ ₹3,000 │        │
│ └──────────┴──────┴──────┴────────┘        │
│                                             │
│ Rules: [No smoking] [No pets] [+ Add]      │
│ Entry Instructions: [Gate code: 1234__]    │
│ Description: [__________________________]  │
│                                             │
│ [Delete Property]  [Duplicate]  [Save →]   │
└─────────────────────────────────────────────┘
\`\`\`

### Admin App — Client CRM Detail
\`\`\`
┌─────────────────────────────────────────────┐
│ Client: Priya Sharma           Score: 85/100│
│ Segment: VIP                    [Add Note]  │
├─────────────────────────────────────────────┤
│ Summary                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │  12  │ │  8   │ │ ₹42K │ │ Gold │       │
│ │Stays │ │Orders│ │Spent │ │ Tier │       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
│ Journey Timeline                            │
│ ● Mar 15 — Booked Villa Sunset (₹3,200)    │
│ ● Mar 15 — Ordered: 2x Maggie, 1x Chai    │
│ ● Mar 16 — Left 5★ review                  │
│ ● Feb 28 — Booked Farmhouse (₹1,800)       │
│ ● Feb 28 — Used coupon HUSHH10             │
│ ● Jan 15 — First booking (milestone)       │
│                                             │
│ Notes                                       │
│ 📌 "Prefers evening slots, vegetarian"     │
│ 📝 "Anniversary next month — suggest pack" │
└─────────────────────────────────────────────┘
\`\`\`

### Admin App — Inventory Management
\`\`\`
┌─────────────────────────────────────────────┐
│ Inventory                    [Low Stock ⚠] │
│ Category: [All ▼]  Search: [_____________] │
├─────────────────────────────────────────────┤
│ ┌──────┬────────┬──────┬──────┬──────────┐ │
│ │ Item │ Price  │Stock │Status│  Action   │ │
│ ├──────┼────────┼──────┼──────┼──────────┤ │
│ │🍔Burg│ ₹250  │   8  │  ✅  │ [Edit]   │ │
│ │🍕Pizza│₹350  │   3⚠│  ✅  │ [Edit]   │ │
│ │🍺Beer│ ₹200  │  24  │  ✅  │ [Edit]   │ │
│ │🎸DJ  │₹2,000 │   2  │  ✅  │ [Edit]   │ │
│ │🕯Decor│₹500  │   1⚠│  ⛔  │ [Edit]   │ │
│ └──────┴────────┴──────┴──────┴──────────┘ │
└─────────────────────────────────────────────┘
\`\`\`

### User App — Experience Builder
\`\`\`
┌─────────────────────────┐
│ ← Experience Builder    │
│ ┌─────────────────────┐ │
│ │🍽 Food│🎨Decor│🎵DJ │ │  Category tabs
│ └─────────────────────┘ │
│ Running Total: ₹1,200   │  Sticky header
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 🍕 Pizza Margherita│   │
│ │ ₹350   [- 1 +]   │   │  Item card
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 🍔 Veg Burger     │   │
│ │ ₹250   [- 0 +]   │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 🍺 Craft Beer     │   │
│ │ ₹200   [- 2 +]   │   │
│ └───────────────────┘   │
│ ─── Decor ───           │
│ ┌───────────────────┐   │
│ │ 🕯 Candle Setup   │   │
│ │ ₹500   [- 1 +]   │   │
│ └───────────────────┘   │
│ ─── Entertainment ───   │
│ ┌───────────────────┐   │
│ │ 🎸 DJ + Lights    │   │
│ │ ₹2,000 [- 0 +]   │   │
│ └───────────────────┘   │
│ ─── Transport ───       │
│ ┌───────────────────┐   │
│ │ 🚗 Pickup & Drop  │   │
│ │ ₹800   [- 0 +]   │   │
│ └───────────────────┘   │
│                         │
│ ┌═══════════════════┐   │
│ │ 4 items · ₹1,550  │   │  Running total bar
│ │   [Continue →]    │   │
│ └═══════════════════┘   │
└─────────────────────────┘
\`\`\`

### User App — Checkout Screen
\`\`\`
┌─────────────────────────┐
│ ← Checkout              │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 📸 Villa Sunset     │ │  Property card
│ │ Mar 25 · Evening    │ │
│ │ 4 Guests · 2 Rooms  │ │
│ └─────────────────────┘ │
│                         │
│ ── Price Breakdown ──   │
│ Base (Evening Slot) ₹2,500│
│ Extra Room        ₹1,000│
│ Extra Mattress      ₹300│
│ ── Add-ons ──           │
│ 🍕 Pizza ×1        ₹350│
│ 🕯 Candles ×1      ₹500│
│ 🍺 Beer ×2         ₹400│
│ ─────────────────       │
│ Subtotal          ₹5,050│
│ GST (18%)           ₹909│
│ ─────────────────       │
│                         │
│ ┌─────────────────────┐ │
│ │ 🎟 [Enter Coupon___]│ │  Coupon input
│ │      [Apply]        │ │
│ └─────────────────────┘ │
│ Discount          -₹500 │
│                         │
│ ╔═════════════════════╗ │
│ ║ TOTAL       ₹5,459  ║ │  Bold total
│ ║  [Confirm Booking →]║ │
│ ╚═════════════════════╝ │
│                         │
│ ⚠️ Conflict: 1 existing │  Optional warning
│    booking on this date │
└─────────────────────────┘
\`\`\`

### User App — Live Ordering Sheet
\`\`\`
┌─────────────────────────┐
│ ══╸  ╺══                │  Drag handle
│ 🍽 Order Food     [×]   │
│ Active Trip · Villa Eve │
├─────────────────────────┤
│ [All][🍕Food][🍺Drinks] │  Category chips
│ [🍿Snacks][🍨Desserts]  │
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 🍕 Margherita     │   │
│ │ ₹350  ⭐4.5      │   │
│ │ [Add to Cart]     │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 🍔 Smash Burger   │   │
│ │ ₹250  ⭐4.8      │   │
│ │ [- 1 +]           │   │  Already in cart
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ 🍺 Craft IPA      │   │
│ │ ₹200  ⭐4.2      │   │
│ │ [Add to Cart]     │   │
│ └───────────────────┘   │
│                         │
│ ╔═════════════════════╗ │
│ ║ 🛒 2 items · ₹500  ║ │  Cart bar
│ ║   [Place Order →]  ║ │
│ ╚═════════════════════╝ │
│                         │
│ ── Order History ──     │
│ #ORD-001 · ₹750 · ✅   │  Previous orders
│ #ORD-002 · ₹350 · 🔄   │  In progress
└─────────────────────────┘
\`\`\`

### User App — Search Screen
\`\`\`
┌─────────────────────────┐
│ [🔍 Search_________] [×]│  Auto-focus input
├─────────────────────────┤
│ [🏠All][🏡Stay][🎭Exp] │  Category chips
│ [✨Cur][🛎Svc][💼Work]  │
├─────────────────────────┤
│ Recent Searches         │
│ 🕐 "farmhouse"         │
│ 🕐 "candlelight dinner"│
│ 🕐 "pool party"        │
├─────────────────────────┤
│ ── Results (3) ──       │  Real-time filter
│ ┌──────┐ ┌──────┐      │
│ │Villa │ │Farm  │      │  Property cards
│ │₹2.5K │ │₹1.8K │      │
│ │⭐4.8 │ │⭐4.6 │      │
│ └──────┘ └──────┘      │
│ ┌──────┐               │
│ │Work  │               │
│ │₹999  │               │
│ │⭐4.9 │               │
│ └──────┘               │
│                         │
│ ── No results? ──       │  Empty state
│ 😴 "Try a different     │
│     search term"        │
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
\`\`\`

### User App — Map View
\`\`\`
┌─────────────────────────┐
│ ← Map View    [List 📋]│
├─────────────────────────┤
│                         │
│   ┌─ JEYPORE MAP ─────┐│  Leaflet map
│   │                    ││
│   │    📍Villa         ││  Pin markers
│   │         📍Farm     ││
│   │  📍WorkPod         ││
│   │              📍Roof││
│   │    📍Pool          ││
│   │                    ││
│   └────────────────────┘│
│                         │
│ ┌═══════════════════════┐│  Preview card
│ │ 📸  Villa Sunset Eve  ││  (on pin tap)
│ │ ⭐4.8 · ₹2,500/slot  ││
│ │ 📍 2.3 km away       ││
│ │ [View Details →]      ││
│ └═══════════════════════┘│
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
\`\`\`

### User App — Loyalty & Spin Wheel
\`\`\`
┌─────────────────────────┐
│ ← Loyalty       ₹1,240 │  Points balance
├─────────────────────────┤
│ ╔═════════════════════╗ │
│ ║ 🥇 GOLD MEMBER     ║ │  Tier card
│ ║ 1,240 / 2,000 pts  ║ │
│ ║ ████████░░░░ 62%    ║ │  Progress bar
│ ║ Next: Platinum      ║ │
│ ╚═════════════════════╝ │
│                         │
│ ── Daily Spin ──        │
│ ┌───────────────────┐   │
│ │    ╱ 50 ╲         │   │
│ │   / 100 ╲ 25      │   │  Spin wheel
│ │  │ 200 │ 10       │   │
│ │   ╲ 75 ╱ 150      │   │
│ │    ╲__╱           │   │
│ │   [🎰 SPIN!]     │   │
│ └───────────────────┘   │
│                         │
│ ── Transaction History ─│
│ +50  🎫 Booking pts     │
│ +25  🎰 Daily spin      │
│ -100 🎁 Redeemed coupon │
│ +10  ⭐ Review bonus    │
│                         │
│ ── Milestones ──        │
│ 🌟 First Booking ✅     │
│ ⭐ 5-Star Reviewer ✅   │
│ 🎉 Party Animal (3/5)  │
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
\`\`\`

### User App — Auth / Onboarding
\`\`\`
┌─────────────────────────┐
│                         │
│         🤫 HUSHH        │  Logo animation
│                         │
│  ── Welcome ──          │
│  "Private experiences,  │
│   curated for you"      │
│                         │
│ ┌─────────────────────┐ │
│ │ 📧 [Email_________] │ │
│ │ 🔒 [Password______] │ │
│ │                     │ │
│ │   [Sign In →]       │ │  Primary CTA
│ │                     │ │
│ │   ── or ──          │ │
│ │                     │ │
│ │   [Create Account]  │ │  Secondary
│ │                     │ │
│ │ [Forgot Password?]  │ │
│ └─────────────────────┘ │
│                         │
│   [Continue as Guest →] │  Skip auth
│                         │
│ ── Sign Up Variant ──   │
│ ┌─────────────────────┐ │
│ │ 👤 [Full Name_____] │ │
│ │ 📧 [Email_________] │ │
│ │ 🔒 [Password______] │ │
│ │ 🔒 [Confirm_______] │ │
│ │   [Create Account →]│ │
│ │ ✉️ Verify your email │ │
│ └─────────────────────┘ │
└─────────────────────────┘
\`\`\`

### User App — Notifications Screen
\`\`\`
┌─────────────────────────┐
│ ← Notifications [Clear] │
├─────────────────────────┤
│ [All][Bookings][Orders] │  Filter tabs
│ [Reviews][System]       │
├─────────────────────────┤
│ ── Today ──             │
│ ┌───────────────────┐   │
│ │🎫 Booking Confirmed│   │
│ │ HUSHH-UP0025 for  │   │  Unread (bold)
│ │ Mar 25 · 2m ago   │   │
│ │               [●] │   │  Blue dot
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │🍽 Order Ready      │   │
│ │ Your order #ORD-01│   │  Read (muted)
│ │ is ready · 1h ago │   │
│ └───────────────────┘   │
│                         │
│ ── Yesterday ──         │
│ ┌───────────────────┐   │
│ │⭐ New Review       │   │
│ │ Priya left a 5★   │   │
│ │ review · 1d ago   │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │🎰 Spin & Win!     │   │
│ │ You won 50 pts!   │   │
│ │ · 1d ago          │   │
│ └───────────────────┘   │
│                         │
│ ── Empty State ──       │
│ 🔔 "All caught up!     │
│    No new notifications"│
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
\`\`\`

### Database ER Diagram
\`\`\`
auth.users ─┬─ profiles (1:1)
            ├─ bookings → payments → refunds
            │         → invoices
            │         → orders → order_items
            │         → booking_splits
            │         → booking_photos
            ├─ wishlists → host_listings
            ├─ reviews → review_responses
            ├─ conversations → messages
            ├─ notifications
            ├─ notification_preferences
            ├─ push_tokens
            ├─ loyalty_transactions
            ├─ referral_codes → referral_uses
            ├─ user_roles
            ├─ user_milestones
            └─ identity_verifications

host_listings ── curations · inventory · property_tags (via tag_assignments)
             └─ property_slots → slot_availability
staff_members ── staff_attendance · staff_leaves · staff_salary_payments
standalone: campaigns · coupons · expenses · budget_allocations · app_config · audit_logs · client_notes · experience_packages · order_notes · staff_tasks
\`\`\`

---

## 📋 Change History
`;

  const changes = changeLog
    .map(
      (phase) =>
        `### v${phase.version} — ${phase.phase}\n${phase.items.map((item) => `- ${item}`).join("\n")}`
    )
    .join("\n\n");

  const footer = `\n\n---

## 📐 Conventions & Guidelines

### Adding Features
1. Implement the feature
2. Add changelog entry to HUSHH.md under the appropriate version
3. Add entry to src/components/AppDocumentation.tsx changeLog array
4. Document new screens in Screen-by-Screen section

### Code Style
- Semantic design tokens only — never raw colors
- All colors in HSL
- Framer Motion for animations
- Refactor components >400 lines
- Mock fallbacks in hooks for guest mode

### File Naming
- Components: PascalCase.tsx | Hooks: use-kebab.tsx | Data: kebab.ts | Lib: kebab.ts

### Admin Development
- All admin components in src/components/admin/
- Admin page type must be added to AdminPage union in AdminLayout.tsx
- New pages must be added to: AdminLayout nav items, CommandPalette commands, Admin.tsx switch/case
- Always use useAdmin() hook for role checks — never client-side storage

---

## 🥚 Easter Eggs

| Trigger | Location | Result |
|---------|----------|--------|
| Tap version text 5× within 2s | Profile tab, bottom | Full in-app documentation overlay |

---

📄 **License**: Private — All rights reserved.
`;

  return header + changes + footer;
}

// Mermaid chart data
const ARCHITECTURE_CHART = `graph TB
    subgraph CLIENT["CLIENT Browser"]
        direction TB
        RR["React Router v6"]
        RQ["React Query"]
        FM["Framer Motion"]
        SC["Supabase JS Client"]
    end
    subgraph SCREENS["App Screens"]
        direction LR
        USER["User App 15 screens"]
        ADMIN["Admin Panel 22 pages"]
        STAFF["Staff Portal 4 pages"]
    end
    subgraph CLOUD["LOVABLE CLOUD"]
        direction TB
        EF["Edge Functions x6"]
        PG["PostgreSQL 45 tables + RLS"]
        ST["Storage images docs photos"]
        AU["Auth GoTrue"]
    end
    SCREENS --> CLIENT
    CLIENT -->|"HTTPS + JWT"| CLOUD
    EF --> PG
    AU --> PG`;

const ER_CHART = `erDiagram
    users ||--|| profiles : "1-to-1"
    users ||--o{ bookings : "has many"
    users ||--o{ wishlists : "saves"
    users ||--o{ reviews : "writes"
    users ||--o{ conversations : "chats"
    users ||--o{ notifications : "receives"
    users ||--o{ notification_preferences : "configures"
    users ||--o{ push_tokens : "registers"
    users ||--o{ loyalty_transactions : "earns"
    users ||--o{ referral_codes : "creates"
    users ||--o{ user_roles : "assigned"
    users ||--o{ user_milestones : "achieves"
    users ||--o{ host_listings : "hosts"
    users ||--o{ payments : "makes"
    bookings ||--o{ orders : "has"
    bookings ||--o{ booking_splits : "split"
    bookings ||--o{ booking_photos : "has"
    bookings ||--o{ payments : "paid by"
    payments ||--o{ refunds : "refunded"
    payments ||--o{ invoices : "invoiced"
    orders ||--o{ order_items : "contains"
    orders ||--o{ order_notes : "noted"
    conversations ||--o{ messages : "contains"
    reviews ||--o{ review_responses : "responded"
    referral_codes ||--o{ referral_uses : "used"
    host_listings ||--o{ curations : "packs"
    host_listings ||--o{ inventory : "stocks"
    host_listings ||--o{ property_slots : "has"
    property_slots ||--o{ slot_availability : "available"
    property_tags ||--o{ tag_assignments : "assigned"
    staff_members ||--o{ staff_attendance : "tracks"
    staff_members ||--o{ staff_leaves : "requests"
    staff_members ||--o{ staff_salary_payments : "paid"`;
const BOOKING_FLOW_CHART = `graph LR
    A["Browse / Search"] --> B["Property Detail"]
    B --> C{"Select Slot + Date + Guests"}
    C --> D["Experience Builder"]
    D --> E["Food Tab"]
    D --> F["Decor Tab"]
    D --> G["Entertainment Tab"]
    D --> H["Transport Tab"]
    D --> I["Checkout"]
    I --> J{"Apply Coupon?"}
    J -->|Yes| K["Validate Coupon"]
    K --> L["Price Summary"]
    J -->|No| L
    L --> M{"Conflict Check"}
    M -->|Clear| N["Confirm Booking"]
    M -->|Overlap| O["Show Warning"]
    O --> C
    N --> P["Confetti + Booking ID"]
    P --> Q["Award Loyalty Points"]
    Q --> R["View Trips"]`;

const USER_JOURNEY_CHART = `graph TB
    SPLASH["Splash Screen"] --> HOME["Home / Explore"]
    HOME --> SEARCH["Search"]
    HOME --> MAP["Map View"]
    HOME --> PROPERTY["Property Detail"]
    HOME --> ACTIVE["Active Trip Card"]
    PROPERTY --> BOOK["Book Now"]
    BOOK --> BUILDER["Experience Builder"]
    BUILDER --> CHECKOUT["Checkout"]
    CHECKOUT --> CONFIRM["Booking Confirmed"]
    CONFIRM --> TRIPS["Trips Screen"]
    ACTIVE --> ORDER["Live Food Ordering"]
    ACTIVE --> TRIPS
    HOME --> WISH["Wishlists"]
    WISH --> PROPERTY
    TRIPS --> DETAIL["Booking Detail"]
    DETAIL --> CANCEL["Cancel / Rebook"]
    DETAIL --> ORDER
    DETAIL --> PHOTOS["Booking Photos"]
    DETAIL --> SPLIT["Split Payment"]
    HOME --> MSG["Messages"]
    MSG --> CHAT["Chat Thread"]
    HOME --> PROFILE["Profile"]
    PROFILE --> LOYALTY["Loyalty + Spin"]
    PROFILE --> REFERRAL["Referrals"]
    PROFILE --> HOST["Host Dashboard"]
    HOST --> CREATE["Create Listing"]
    HOST --> ANALYTICS["Host Analytics"]
    PROFILE --> SETTINGS["Settings"]
    PROFILE --> DOCS["Easter Egg Docs"]`;

const ADMIN_JOURNEY_CHART = `graph TB
    LOGIN["Admin Login"] --> CMD["Command Center"]
    CMD --> PROP["Properties CRUD"]
    CMD --> BOOK["Bookings"]
    CMD --> INV["Inventory"]
    CMD --> CRM["Client CRM"]
    CMD --> ORD["Live Orders"]
    CMD --> AI["AI Assistant"]
    CMD --> ALERT["Smart Alerts"]
    PROP --> EDIT["Edit Property"]
    PROP --> DUP["Duplicate"]
    PROP --> HIST["Property History"]
    CRM --> NOTES["Client Notes"]
    CRM --> TIMELINE["Journey Timeline"]
    CRM --> SCORE["Engagement Score"]
    CMD --> FIN["Finance Hub"]
    FIN --> EARN["Earnings"]
    FIN --> EXP["Expenses"]
    FIN --> BUDGET["Budget"]
    CMD --> STAFF["Staff Management"]
    STAFF --> ATTEND["Attendance"]
    STAFF --> LEAVE["Leaves"]
    STAFF --> PAY["Payroll"]
    CMD --> MKT["Marketing"]
    MKT --> CAMP["Campaigns"]
    MKT --> COUP["Coupons"]
    MKT --> PRICE["Dynamic Pricing"]
    CMD --> HOMEPAGE["Homepage Manager"]
    CMD --> SETTINGS["Settings"]
    CMD --> AUDIT["Audit Trail"]`;

export default function AppDocumentation({ open, onClose }: AppDocumentationProps) {
  const [copied, setCopied] = useState(false);
  const [showRawDoc, setShowRawDoc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopyDoc = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateFullDoc());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const handleExportPDF = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const docText = generateFullDoc();
    const htmlContent = docText
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Hushh Documentation v1.23</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',system-ui,sans-serif;padding:40px;color:#1a1a2e;line-height:1.7;font-size:13px;max-width:900px;margin:0 auto}
      h1{font-size:24px;margin:24px 0 12px;color:#7c3aed}
      h2{font-size:18px;margin:28px 0 8px;color:#1a1a2e;border-bottom:2px solid #7c3aed;padding-bottom:4px}
      h3{font-size:14px;margin:16px 0 4px;color:#4c1d95}
      li{margin:2px 0;margin-left:20px}
      pre{background:#f5f3ff;padding:12px;border-radius:8px;font-size:11px;white-space:pre-wrap;margin:8px 0}
      .footer{margin-top:40px;text-align:center;color:#888;font-size:11px;border-top:1px solid #ddd;padding-top:16px}
      @media print{body{padding:20px}h2{page-break-before:auto}}
    </style></head><body><div>${htmlContent}</div><div class="footer">Hushh v1.23 | Made in Jeypore | Generated ${new Date().toLocaleDateString()}</div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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
              <p className="text-[11px] text-muted-foreground">v1.23 · Internal Blueprint</p>
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
              onClick={handleExportPDF}
              className="h-9 px-3 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5 text-xs font-medium text-primary"
            >
              <Download size={14} />
              PDF
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

        {/* PRD Section */}
        <DocSection
          title="Product Requirements (PRD)"
          icon={<Target size={15} className="text-primary" />}
        >
          <div className="space-y-3">
            <div>
              <p className="font-bold text-foreground text-xs mb-1">1. Product Overview</p>
              <p><strong className="text-foreground">Hushh</strong> · "Your Private Getaway" · Mobile-first PWA · Jeypore → tier-2/3 cities</p>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">2. Problem Statement</p>
              <p>No unified platform in tier-2/3 cities for private venues. Customers rely on WhatsApp and phone calls. Hosts use notebooks.</p>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">3. User Personas</p>
              <div className="space-y-2">
                {[
                  { name: "Priya (26) — The Planner", desc: "Marketing Exec · Anniversary dinners · Researches 3-4 days ahead", pain: "Can't find unique venues beyond restaurants", needs: "Curations, reviews, split payments, photos" },
                  { name: "Rahul (24) — The Spontaneous One", desc: "Software Dev · Chill spot tonight · Same-day decisions", pain: "Last-minute planning falls apart", needs: "Tonight tags, active ordering, quick checkout" },
                  { name: "Sunita (42) — The Host", desc: "Farmhouse Owner · Monetize weekdays · Not tech-savvy", pain: "Manages via phone calls and notebooks", needs: "Dashboard, calendar, inventory, staff mgmt" },
                  { name: "Vikram (35) — The Corporate Booker", desc: "HR Manager · Team outings · Books 2-4 weeks ahead", pain: "Coordinating venue + food + activities separately", needs: "Experience builder, bulk booking, receipts" },
                ].map((p) => (
                  <div key={p.name} className="p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                    <p className="font-bold text-foreground text-[11px]">{p.name}</p>
                    <p className="text-[10px]">{p.desc}</p>
                    <p className="text-[10px]">Pain: {p.pain}</p>
                    <p className="text-[10px]">Needs: {p.needs}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">4. Success Metrics</p>
              <div className="space-y-0.5 font-mono text-[11px]">
                <p>MAU: 5,000+ · Conversion: 8-12% · AOV: ₹3,500+</p>
                <p>Repeat: 40%+ · Properties: 50+ · NPS: 60+ · Rating: 4.5+</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">5. Priority Matrix</p>
              <div className="space-y-0.5 text-[11px]">
                <p><span className="text-green-400">P0 ✅</span> Discovery, booking, auth, admin CRUD</p>
                <p><span className="text-green-400">P1 ✅</span> Builder, curations, ordering, loyalty, CRM</p>
                <p><span className="text-yellow-400">P2 🔜</span> Razorpay, push notifs, multi-lang, AI recs</p>
                <p><span className="text-muted-foreground">P3 📋</span> Native apps, multi-city, vendor marketplace</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">6. Non-Functional Requirements</p>
              <div className="space-y-0.5 text-[11px]">
                <p>FCP {"<"} 1.5s · LCP {"<"} 2.5s · TTI {"<"} 3.5s · 99.5% uptime</p>
                <p>RLS + RBAC · WCAG 2.1 AA · Chrome/Safari/Firefox 90+</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">7. Roadmap</p>
              <div className="space-y-0.5 text-[11px]">
                <p><span className="text-green-400">✅</span> v1.x — Core UI, backend, admin, CRM, CRUD, config, SEO</p>
                <p><span className="text-yellow-400">🔜</span> v2.0 — Razorpay/UPI, invoicing</p>
                <p><span className="text-yellow-400">🔜</span> v2.1 — Push notifs, referral 2.0, AI recs</p>
                <p><span className="text-muted-foreground">📋</span> v3.0 — Multi-city, vendor marketplace, native apps</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">8. Risks & Mitigations</p>
              <div className="space-y-0.5 text-[11px]">
                <p>⚠️ Low host adoption → Zero fees, hands-on onboarding</p>
                <p>⚠️ Seasonal demand → Work-from-resort, corporate packages</p>
                <p>⚠️ Payment fraud → UPI verification, booking limits</p>
                <p>⚠️ OTA competition → Hyper-local, curated packs</p>
                <p>⚠️ Data loss → Backups, RLS, audit logs</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">9. User App — Feature Spec</p>
              <div className="space-y-1.5 text-[11px]">
                <p><strong className="text-foreground">Discovery</strong>: Rotating search, 6 categories, sub-filters, spotlight videos, property cards, sports/foodie/couple/curation carousels</p>
                <p><strong className="text-foreground">Booking</strong>: Detail → Builder (4 tabs, nudges) → Checkout (coupon) → Confirm (confetti, ID, +pts)</p>
                <p><strong className="text-foreground">Trips</strong>: 5 tabs, active ordering (Swiggy-style), cancel/rebook, order history, identity verification</p>
                <p><strong className="text-foreground">Social</strong>: Real-time messaging, reviews with photos, public profiles, Web Share API</p>
                <p><strong className="text-foreground">Loyalty</strong>: 5 pts/₹100, 4 tiers, daily spin, 6 milestones, referrals</p>
                <p><strong className="text-foreground">Profile</strong>: Hero card, membership, stats, achievements, settings, theme, social, terms</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">10. Admin App — Feature Spec</p>
              <div className="space-y-1.5 text-[11px]">
                <p><strong className="text-foreground">Dashboard</strong>: 4 KPI cards, live feed, pending items, quick nav</p>
                <p><strong className="text-foreground">Properties</strong>: Full CRUD (name, pricing, images, tags, slots JSONB, rules, status, dup, delete)</p>
                <p><strong className="text-foreground">Inventory</strong>: 5 categories, stock tracking, low-stock alerts</p>
                <p><strong className="text-foreground">Bookings</strong>: Status flow, heatmap · <strong className="text-foreground">CRM</strong>: Score 0-100, segments, timeline, AI search</p>
                <p><strong className="text-foreground">Finance</strong>: Revenue, expenses, budgets · <strong className="text-foreground">Staff</strong>: Directory, attendance, leaves, payroll</p>
                <p><strong className="text-foreground">Marketing</strong>: Campaigns, coupons, pricing · <strong className="text-foreground">Settings</strong>: Branding, support, legal</p>
              </div>
            </div>
          </div>
        </DocSection>

        {/* Blueprint Section */}
        <DocSection
          title="App Blueprint"
          icon={<Server size={15} className="text-primary" />}
        >
          <div className="space-y-3">
            <MermaidDiagram chart={ARCHITECTURE_CHART} title="System Architecture" />
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Data Flow</p>
              <div className="space-y-0.5 text-[11px]">
                <p><strong className="text-foreground">Guest</strong> → Mock Data (localStorage + static)</p>
                <p><strong className="text-foreground">Auth User</strong> → Supabase Queries (React Query cache)</p>
                <p><strong className="text-foreground">Admin</strong> → Admin Panel (22 pages + sidebar)</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">State Management</p>
              <div className="space-y-0.5 text-[11px]">
                <p><strong className="text-foreground">Global</strong> — AuthProvider, ThemeProvider, PrivacyMode, Properties, QueryClient</p>
                <p><strong className="text-foreground">Local</strong> — Screen state machine, component useState, localStorage fallbacks</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Module Map</p>
              <div className="font-mono text-[10px] space-y-0.5 p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>App.tsx</p>
                <p className="pl-2">├ Index.tsx (SPA shell + 15 screens)</p>
                <p className="pl-4">├ HomeScreen (10+ sub-components)</p>
                <p className="pl-4">├ PropertyDetail → Builder → Checkout</p>
                <p className="pl-4">├ Trips → BookingDetail → LiveOrdering</p>
                <p className="pl-4">└ Profile → Loyalty, Referrals, Host</p>
                <p className="pl-2">├ Admin.tsx (22 pages + sidebar)</p>
                <p className="pl-2">└ Staff.tsx (orders, tasks, checkin)</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Security Layers</p>
              <div className="space-y-0.5 text-[11px]">
                <p>1️⃣ Auth — email/password, JWT, email verification</p>
                <p>2️⃣ RBAC — user_roles table, has_role() function</p>
                <p>3️⃣ RLS — every table, per-user data isolation</p>
                <p>4️⃣ App — no secrets in client, edge functions for ops</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Edge Functions API</p>
              <div className="space-y-1 text-[11px]">
                <p><strong className="text-foreground">POST /admin-ai</strong> — AI queries → answer, data, suggestions</p>
                <p><strong className="text-foreground">POST /smart-alerts</strong> — Low stock, overdue → notifications</p>
                <p><strong className="text-foreground">POST /auto-notifications</strong> — DB webhook → user alerts</p>
                <p><strong className="text-foreground">POST /property-history-ai</strong> — AI search → results</p>
                <p><strong className="text-foreground">POST /weekly-digest</strong> — Weekly data → email digest</p>
                <p><strong className="text-foreground">POST /staff-report</strong> — Attendance → summary</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Hooks Architecture (20+)</p>
              <div className="font-mono text-[10px] space-y-0.5 p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>Auth: useAuth · Admin: useAdmin</p>
                <p>Data: useBookings · useWishlists · useMessages</p>
                <p>      useNotifications · useLoyalty · useReferrals</p>
                <p>      useReviews · useCurations</p>
                <p>Host: useHostListings · useHostAnalytics</p>
                <p>Config: useAppConfig · useHomepageSections</p>
                <p>        useHomepageFilters · useVideoCards</p>
                <p>UI: useTheme · usePrivacyMode · useUnreadCount</p>
                <p>Net: useOnlineStatus</p>
                <p>v2: usePayments · useSlotAvailability</p>
                <p>    useInvoices · useOrders · useSearch</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">🛡️ Resilience</p>
              <div className="font-mono text-[10px] space-y-0.5 p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p><strong className="text-foreground">Error Boundaries</strong> — Global + per-route crash recovery</p>
                <p><strong className="text-foreground">Offline Banner</strong> — Animated top bar when navigator.onLine = false</p>
                <p><strong className="text-foreground">Query Retry</strong> — 2× exponential backoff (1s→4s), 30s stale</p>
                <p><strong className="text-foreground">Mutation Retry</strong> — 1× retry on failure</p>
                <p><strong className="text-foreground">Rate Limits</strong> — Auth 30/hr · Spin 1/day · Edge 100/s</p>
              </div>
            </div>
            <MermaidDiagram chart={BOOKING_FLOW_CHART} title="Booking Flow" />
          </div>
        </DocSection>

        {/* Wireframes Section */}
        <DocSection
          title="Wireframes"
          icon={<PenTool size={15} className="text-primary" />}
        >
          <div className="space-y-3">
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Screen Hierarchy (5 Tabs)</p>
              <div className="font-mono text-[10px] space-y-0.5 p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>Tab 1: EXPLORE</p>
                <p className="pl-2">Search → ActiveTrip → Categories → Spotlight</p>
                <p className="pl-2">→ Properties → Sports → Foodie → Packs</p>
                <p>Tab 2: WISHLISTS — 2-col grid</p>
                <p>Tab 3: TRIPS — Filter tabs → Cards → Detail</p>
                <p>Tab 4: MESSAGES — Conversations → Chat</p>
                <p>Tab 5: PROFILE — Hero → Stats → Achievements</p>
              </div>
            </div>
            <MermaidDiagram chart={USER_JOURNEY_CHART} title="User App Journey Map" />
            <MermaidDiagram chart={ADMIN_JOURNEY_CHART} title="Admin Panel Journey Map" />
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Home Screen (Mobile)</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌───────────────────┐</p>
                <p>│ [👤] Jeypore [🔔] │</p>
                <p>│ [🔍 Search...]    │</p>
                <p>│ ┌─ Active Trip ─┐ │</p>
                <p>│ │ 🟢 Villa Eve  │ │</p>
                <p>│ │ [Order][View] │ │</p>
                <p>│ └───────────────┘ │</p>
                <p>│ 🏠 🎭 ✨ 🛎 📦   │</p>
                <p>│ ╔═══ VIDEO ═════╗ │</p>
                <p>│ ╚═══════════════╝ │</p>
                <p>│ [Card] [Card]     │</p>
                <p>│ [🏸][🎯][🏊]     │</p>
                <p>│ [🍽 Thali][🕯]   │</p>
                <p>│ ┌═ Pack ════════┐ │</p>
                <p>│ │ ₹3,999 [Book] │ │</p>
                <p>│ └═══════════════┘ │</p>
                <p>│ 🏠 ❤️ ✈️ 💬 👤  │</p>
                <p>└───────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Booking Flow</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐</p>
                <p>│DETAIL  │→│BUILDER │→│CHECKOUT│→│CONFIRM │</p>
                <p>│Gallery │ │Food tab│ │Summary │ │🎊      │</p>
                <p>│Slots   │ │Decor   │ │Add-ons │ │HUSHH-XX│</p>
                <p>│Date    │ │DJ tab  │ │Coupon  │ │+50 pts │</p>
                <p>│Guests  │ │[-] [+] │ │Total   │ │        │</p>
                <p>│Reviews │ │Running │ │        │ │[View   │</p>
                <p>│[Book→] │ │[Next→] │ │[Pay →] │ │ Trips] │</p>
                <p>└────────┘ └────────┘ └────────┘ └────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Profile Screen</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌───────────────────┐</p>
                <p>│     [Avatar]      │</p>
                <p>│   Priya Sharma    │</p>
                <p>│   📍 Jeypore      │</p>
                <p>│ ┌────┬────┬─────┐ │</p>
                <p>│ │ 12 │ 8  │2 yr │ │</p>
                <p>│ │Trip│Revw│Membr│ │</p>
                <p>│ └────┴────┴─────┘ │</p>
                <p>│ 🥇 Gold · 1,240pt │</p>
                <p>│ [🌟][⭐][🎉]→    │</p>
                <p>│ Recent: Villa...  │</p>
                <p>│ [Become a Host]   │</p>
                <p>│ [☀️][🌙] Theme   │</p>
                <p>│ [📸][📘][▶][🐦] │</p>
                <p>│ Terms · v1.23     │</p>
                <p>│ 🏠 ❤️ ✈️ 💬 👤  │</p>
                <p>└───────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Admin Panel Layout</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌────────┬─────────────────┐</p>
                <p>│SIDEBAR │ COMMAND CENTER   │</p>
                <p>│ 🏠Home │ ┌──┐┌──┐┌──┐   │</p>
                <p>│ 🤖AI   │ │₹K││28││4★│   │</p>
                <p>│ 🔔Alert│ └──┘└──┘└──┘   │</p>
                <p>│ 🏠Prop │ ┌─────┐┌─────┐ │</p>
                <p>│ 📦Inv  │ │Feed ││Pend.│ │</p>
                <p>│ 👥Users│ └─────┘└─────┘ │</p>
                <p>│ 📊Stats│                 │</p>
                <p>│ (+14)  │                 │</p>
                <p>└────────┴─────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Admin — Property CRUD</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────────┐</p>
                <p>│ Edit Property     [Save]│</p>
                <p>│ Name: [Villa____]       │</p>
                <p>│ Location: [Jeypore]     │</p>
                <p>│ Cat: [Stays▼] ₹[2,500]  │</p>
                <p>│ Capacity: [- 20 +]      │</p>
                <p>│ Status: ○Pub ●Draft     │</p>
                <p>│ Images: [📷][📷][+Add]  │</p>
                <p>│ Tags: [Romantic][Pool]   │</p>
                <p>│ Slots: Morn ₹1.5K       │</p>
                <p>│        Eve  ₹2.5K       │</p>
                <p>│        Night ₹3K        │</p>
                <p>│ Rules: [No smoking]     │</p>
                <p>│ [Delete] [Dup] [Save→]  │</p>
                <p>└─────────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Admin — Client CRM</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────────┐</p>
                <p>│ Priya Sharma    85/100  │</p>
                <p>│ Segment: VIP  [AddNote] │</p>
                <p>│ ┌────┬────┬────┬─────┐  │</p>
                <p>│ │ 12 │ 8  │₹42K│Gold │  │</p>
                <p>│ │Stay│Ordr│Spnt│Tier │  │</p>
                <p>│ └────┴────┴────┴─────┘  │</p>
                <p>│ ● Mar15 Villa ₹3,200    │</p>
                <p>│ ● Mar15 Ordered Maggie  │</p>
                <p>│ ● Mar16 Left 5★ review  │</p>
                <p>│ 📌 Prefers eve, veg     │</p>
                <p>│ 📝 Anniversary next mo  │</p>
                <p>└─────────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Admin — Inventory</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────────┐</p>
                <p>│ Inventory  [LowStock⚠] │</p>
                <p>│ [All▼] [Search___]      │</p>
                <p>│ ┌────┬─────┬───┬──┬───┐ │</p>
                <p>│ │Item│Price│Stk│St│Act│ │</p>
                <p>│ │🍔  │₹250 │ 8 │✅│Edt│ │</p>
                <p>│ │🍕  │₹350 │ 3⚠│✅│Edt│ │</p>
                <p>│ │🍺  │₹200 │24 │✅│Edt│ │</p>
                <p>│ │🕯  │₹500 │ 1⚠│⛔│Edt│ │</p>
                <p>│ └────┴─────┴───┴──┴───┘ │</p>
                <p>└─────────────────────────┘</p>
              </div>
            </div>
            {/* New wireframes — Phase 3 */}
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Experience Builder</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ ← Experience Builder│</p>
                <p>│ 🍽Food│🎨Decor│🎵DJ │</p>
                <p>│ Running: ₹1,200     │</p>
                <p>├─────────────────────┤</p>
                <p>│ 🍕 Pizza     ₹350   │</p>
                <p>│         [- 1 +]     │</p>
                <p>│ 🍔 Burger    ₹250   │</p>
                <p>│         [- 0 +]     │</p>
                <p>│ 🍺 Beer      ₹200   │</p>
                <p>│         [- 2 +]     │</p>
                <p>│ ── Decor ──         │</p>
                <p>│ 🕯 Candles   ₹500   │</p>
                <p>│         [- 1 +]     │</p>
                <p>│ ── Entertainment ── │</p>
                <p>│ 🎸 DJ+Lights ₹2,000 │</p>
                <p>│         [- 0 +]     │</p>
                <p>│ ── Transport ──     │</p>
                <p>│ 🚗 Pickup    ₹800   │</p>
                <p>│         [- 0 +]     │</p>
                <p>│ ╔══4 items ₹1,550══╗│</p>
                <p>│ ║  [Continue →]    ║│</p>
                <p>│ ╚═════════════════╝│</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Checkout Screen</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ ← Checkout          │</p>
                <p>│ 📸 Villa Sunset     │</p>
                <p>│ Mar 25·Eve·4 Guests │</p>
                <p>│ ── Breakdown ──     │</p>
                <p>│ Base Slot    ₹2,500 │</p>
                <p>│ Extra Room   ₹1,000 │</p>
                <p>│ 🍕 Pizza ×1   ₹350 │</p>
                <p>│ 🕯 Candles     ₹500 │</p>
                <p>│ 🍺 Beer ×2    ₹400 │</p>
                <p>│ ─────────────       │</p>
                <p>│ Subtotal     ₹5,050 │</p>
                <p>│ GST 18%        ₹909 │</p>
                <p>│ 🎟 [Coupon___] [Go] │</p>
                <p>│ Discount      -₹500 │</p>
                <p>│ ╔══TOTAL ₹5,459═══╗│</p>
                <p>│ ║ [Confirm Book →]║│</p>
                <p>│ ╚═════════════════╝│</p>
                <p>│ ⚠️ 1 conflict found │</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Live Ordering Sheet</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ ══╸  ╺══            │</p>
                <p>│ 🍽 Order Food   [×] │</p>
                <p>│ Villa · Active Trip │</p>
                <p>│ [All][🍕][🍺][🍿]  │</p>
                <p>├─────────────────────┤</p>
                <p>│ 🍕 Margherita  ₹350 │</p>
                <p>│     [Add to Cart]   │</p>
                <p>│ 🍔 Burger      ₹250 │</p>
                <p>│     [- 1 +]         │</p>
                <p>│ 🍺 Craft IPA   ₹200 │</p>
                <p>│     [Add to Cart]   │</p>
                <p>│ ╔══🛒 2·₹500══════╗│</p>
                <p>│ ║  [Place Order →] ║│</p>
                <p>│ ╚═════════════════╝│</p>
                <p>│ ── History ──       │</p>
                <p>│ #ORD-001 ₹750 ✅   │</p>
                <p>│ #ORD-002 ₹350 🔄   │</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Search Screen</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ [🔍 Search____] [×] │</p>
                <p>│ [🏠All][🏡Stay][🎭] │</p>
                <p>│ [✨Cur][🛎Svc][💼]  │</p>
                <p>│ ── Recent ──        │</p>
                <p>│ 🕐 "farmhouse"      │</p>
                <p>│ 🕐 "pool party"     │</p>
                <p>│ ── Results (3) ──   │</p>
                <p>│ ┌─────┐ ┌─────┐    │</p>
                <p>│ │Villa│ │Farm │    │</p>
                <p>│ │₹2.5K│ │₹1.8K│    │</p>
                <p>│ └─────┘ └─────┘    │</p>
                <p>│ 😴 No results?      │</p>
                <p>│ "Try another term"  │</p>
                <p>│ 🏠 ❤️ ✈️ 💬 👤    │</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Map View</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ ← Map View  [List📋]│</p>
                <p>│ ┌─ JEYPORE MAP ───┐ │</p>
                <p>│ │  📍Villa        │ │</p>
                <p>│ │      📍Farm     │ │</p>
                <p>│ │ 📍Pod      📍Rf │ │</p>
                <p>│ │     📍Pool      │ │</p>
                <p>│ └────────────────┘  │</p>
                <p>│ ┌══ Preview ══════┐ │</p>
                <p>│ │📸 Villa Sunset  │ │</p>
                <p>│ │⭐4.8 · ₹2,500  │ │</p>
                <p>│ │[View Details →] │ │</p>
                <p>│ └════════════════┘  │</p>
                <p>│ 🏠 ❤️ ✈️ 💬 👤    │</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Loyalty & Spin Wheel</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ ← Loyalty    1,240pt│</p>
                <p>│ ╔═══ 🥇 GOLD ═════╗│</p>
                <p>│ ║ 1,240/2,000 pts  ║│</p>
                <p>│ ║ ████████░░ 62%   ║│</p>
                <p>│ ║ Next: Platinum   ║│</p>
                <p>│ ╚═════════════════╝│</p>
                <p>│ ── Daily Spin ──    │</p>
                <p>│  ╱50╲100╲25╲       │</p>
                <p>│ │200│ 75│150│       │</p>
                <p>│  ╲10╱───╱───╱       │</p>
                <p>│   [🎰 SPIN!]       │</p>
                <p>│ ── History ──       │</p>
                <p>│ +50 🎫 Booking      │</p>
                <p>│ +25 🎰 Spin         │</p>
                <p>│ -100 🎁 Redeemed    │</p>
                <p>│ ── Milestones ──    │</p>
                <p>│ 🌟 First Book ✅    │</p>
                <p>│ ⭐ 5★ Reviewer ✅   │</p>
                <p>│ 🎉 Party (3/5)     │</p>
                <p>│ 🏠 ❤️ ✈️ 💬 👤    │</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Auth / Onboarding</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│       🤫 HUSHH      │</p>
                <p>│ "Private experiences │</p>
                <p>│  curated for you"   │</p>
                <p>│ ┌─────────────────┐ │</p>
                <p>│ │📧 [Email______] │ │</p>
                <p>│ │🔒 [Password___] │ │</p>
                <p>│ │  [Sign In →]    │ │</p>
                <p>│ │    ── or ──     │ │</p>
                <p>│ │ [Create Account]│ │</p>
                <p>│ │ [Forgot Pass?]  │ │</p>
                <p>│ └─────────────────┘ │</p>
                <p>│ [Continue as Guest] │</p>
                <p>│ ── Sign Up ──       │</p>
                <p>│ 👤[Name] 📧[Email]  │</p>
                <p>│ 🔒[Pass] 🔒[Confirm]│</p>
                <p>│ [Create Account →]  │</p>
                <p>│ ✉️ Verify your email│</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">Notifications Screen</p>
              <div className="font-mono text-[10px] p-2 rounded-lg" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <p>┌─────────────────────┐</p>
                <p>│ ← Notifications [Clr]│</p>
                <p>│ [All][Book][Order]   │</p>
                <p>│ [Reviews][System]    │</p>
                <p>│ ── Today ──          │</p>
                <p>│ 🎫 Booking Confirmed│</p>
                <p>│ HUSHH-UP0025  2m [●]│</p>
                <p>│ 🍽 Order Ready       │</p>
                <p>│ #ORD-01 ready  1h   │</p>
                <p>│ ── Yesterday ──      │</p>
                <p>│ ⭐ New 5★ Review     │</p>
                <p>│ from Priya · 1d     │</p>
                <p>│ 🎰 Won 50 pts! · 1d │</p>
                <p>│ ── Empty State ──    │</p>
                <p>│ 🔔 "All caught up!" │</p>
                <p>│ 🏠 ❤️ ✈️ 💬 👤    │</p>
                <p>└─────────────────────┘</p>
              </div>
            </div>
            <MermaidDiagram chart={ER_CHART} title="Entity Relationships (ER)" />
          </div>
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
              ["bookings", "Slot, date, guests, total, status, rooms, mattresses, payment_status"],
              ["wishlists", "User ↔ property joins"],
              ["conversations", "Chat threads (direct/support/group) with metadata"],
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
              ["app_config", "Key-value runtime settings + updated_by audit"],
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
              ["booking_splits", "Split payment tracking + payment_status"],
              ["identity_verifications", "ID document verification queue"],
              ["property_tags", "Custom property tags with colors"],
              ["tag_assignments", "Tag ↔ entity joins"],
              ["payments", "Payment gateway tracking (Razorpay-ready) — v1.22"],
              ["refunds", "Refund management with gateway IDs — v1.22"],
              ["invoices", "Invoice generation with JSONB line items — v1.22"],
              ["property_slots", "Dedicated slot management per property — v1.22"],
              ["slot_availability", "Per-date availability + dynamic pricing — v1.22"],
              ["notification_preferences", "Per-type per-channel opt-out — v1.22"],
              ["push_tokens", "FCM push notification tokens — v1.22"],
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
            Hushh v1.23 · Made in Jeypore ❤️
          </p>
        </div>
      </div>
    </motion.div>
  );
}
