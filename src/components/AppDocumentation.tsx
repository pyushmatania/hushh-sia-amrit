import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, BookOpen, Layers, MapPin, Users, Palette, Database, History, Sparkles, Shield, Zap, Copy, Check, FileText, Target, Layout, PenTool, TrendingUp, AlertTriangle, Clock, Server, Download, Home, Settings, BarChart3, Package, Globe, Cpu, Lock, Code, Monitor, Smartphone, Star, Heart, MessageSquare, Bell, CreditCard, Gift, Award, Search, Map, ShoppingCart, Calendar, UserCheck, Briefcase, Megaphone, Tag, Eye, Wifi, Activity, Boxes, ChevronUp, Image as ImageIcon } from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import { wallpapers, appIconAsset, type WallpaperItem } from "@/data/wallpapers";

// ─── MERMAID DIAGRAM ─────────────────────────────────────────
function MermaidDiagram({ chart, title }: { chart: string; title: string }) {
  const [expanded, setExpanded] = useState(false);
  const escaped = chart.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script><style>body{margin:0;padding:16px;background:#0c0b1d;display:flex;justify-content:center;overflow:auto;}svg{max-width:100%;height:auto;}</style></head><body><pre class="mermaid">${escaped}</pre><script>mermaid.initialize({startOnLoad:true,theme:'dark',themeVariables:{primaryColor:'#7c3aed',primaryTextColor:'#e2e8f0',primaryBorderColor:'#7c3aed',lineColor:'#a78bfa',secondaryColor:'#1e1b4b',tertiaryColor:'#312e81',background:'#0c0b1d',mainBkg:'#1e1b4b',nodeBorder:'#7c3aed',clusterBkg:'#1e1b4b33',clusterBorder:'#7c3aed55',titleColor:'#e2e8f0',edgeLabelBackground:'#1e1b4b',fontSize:'11px'}});<\/script></body></html>`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--primary) / 0.15)", background: "hsl(var(--primary) / 0.03)" }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="font-bold text-foreground text-xs">{title}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-primary font-semibold px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)" }}>
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className="transition-all duration-300" style={{ height: expanded ? "500px" : "280px" }}>
        <iframe srcDoc={html} className="w-full h-full border-0" sandbox="allow-scripts" title={title} />
      </div>
    </motion.div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({ value, label, icon, color }: { value: string; label: string; icon: React.ReactNode; color: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -2 }} className="rounded-2xl p-3.5 relative overflow-hidden" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>{icon}</div>
      </div>
      <p className="text-xl font-black text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{label}</p>
    </motion.div>
  );
}

// ─── FEATURE ROW ─────────────────────────────────────────────
function FeatureRow({ icon, title, desc, badge }: { icon: React.ReactNode; title: string; desc: string; badge?: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--primary) / 0.03)", border: "1px solid hsl(var(--border) / 0.5)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.1)" }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-foreground text-xs">{title}</p>
          {badge && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>{badge}</span>}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-black text-foreground tracking-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="h-0.5 w-12 rounded-full bg-primary mt-2 opacity-60" />
    </div>
  );
}

// ─── TABLE COMPONENT ─────────────────────────────────────────
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border) / 0.5)" }}>
      <div className="grid text-[10px] font-bold text-primary uppercase tracking-wider" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)`, background: "hsl(var(--primary) / 0.06)" }}>
        {headers.map(h => <div key={h} className="px-3 py-2">{h}</div>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid text-[11px] text-muted-foreground" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)`, borderTop: "1px solid hsl(var(--border) / 0.3)", background: i % 2 === 0 ? "transparent" : "hsl(var(--primary) / 0.02)" }}>
          {row.map((cell, j) => <div key={j} className="px-3 py-2 truncate">{cell}</div>)}
        </div>
      ))}
    </div>
  );
}

// ─── COLLAPSIBLE SECTION ─────────────────────────────────────
function DocSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div layout className="rounded-2xl overflow-hidden mb-3" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--primary) / 0.08)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.12)" }}>{icon}</div>
        <span className="flex-1 text-sm font-bold text-foreground">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 text-[13px] text-muted-foreground leading-relaxed space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── WIREFRAME BLOCK ─────────────────────────────────────────
function Wireframe({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div>
      <p className="font-bold text-foreground text-xs mb-1.5 flex items-center gap-1.5">
        <Monitor size={11} className="text-primary" /> {title}
      </p>
      <div className="font-mono text-[9px] p-3 rounded-xl leading-relaxed whitespace-pre" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.5)", color: "hsl(var(--muted-foreground))", overflowX: "auto" }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

// ─── CHANGE LOG ──────────────────────────────────────────────
export const changeLog = [
  { version: "1.0", phase: "Foundation", items: ["Project scaffolding — React + Vite + Tailwind + TypeScript + shadcn/ui", "Animated splash screen with logo reveal", "Home screen with category bar, property cards, rotating search bar", "20+ mock properties with slots, pricing, amenities, tags", "Property detail — gallery, slot picker, guest counter, booking CTA", "Bottom navigation — 5 tabs (Explore, Wishlists, Trips, Messages, Profile)"] },
  { version: "1.1", phase: "Booking Flow", items: ["Experience Builder — add-on selection", "Checkout screen with payment summary and coupon support", "Booking confirmation with confetti animation + booking ID", "Trips screen — upcoming / completed / cancelled tabs", "Booking detail — full info with cancel and rebook actions"] },
  { version: "1.2", phase: "Social & Discovery", items: ["Full-text search with category filters", "Map view with pin-based browsing", "Wishlist screen — grid layout", "Messages screen — conversation list and chat UI", "Review section — star ratings, photo reviews, host responses"] },
  { version: "1.3", phase: "Profile & Personalization", items: ["Profile screen — avatar, stats, bio, achievements", "Edit profile sheet", "Settings sheet — notifications, security, language, accessibility", "Theme switcher — Light / Dark / Auto", "Public profile screen"] },
  { version: "1.4", phase: "Backend Integration", items: ["Authentication — email/password with email verification", "Database tables — profiles, bookings, wishlists, conversations, messages, notifications, reviews, loyalty, referrals, host_listings", "Row-level security on all tables", "Real-time wishlists synced across sessions", "Real-time bookings and messages with unread counts"] },
  { version: "1.5", phase: "Loyalty & Growth", items: ["Loyalty system — earn 5 pts per ₹100, tier progression", "Referral system — unique codes, point rewards", "Notification center with bell icon, read/unread states", "In-app toast alerts and push permission banner"] },
  { version: "1.6", phase: "Host Features", items: ["Host dashboard — listing management with status toggles", "Create / edit listing — multi-step form with image upload", "Host analytics — charts and metrics"] },
  { version: "1.7", phase: "Visual Identity & Polish", items: ["Design system overhaul — Space Grotesk + Playfair Display fonts", "Deep navy/purple-black theme", "AccentFrame / AccentTag / Glassmorphism", "Video thumbnails, haptic feedback, pull-to-refresh"] },
  { version: "1.8", phase: "Home Feed Enrichment", items: ["Spotlight carousel, Sports cards, Foodie carousel", "Couple specials, What's Hot grid, Upcoming events", "Curated combo cards, service grid, curation grid"] },
  { version: "1.9", phase: "Mock Data & Guest Experience", items: ["Mock user profiles, notifications, loyalty for guests", "End-to-end guest mode — all features work with mock data"] },
  { version: "1.10", phase: "Profile Redesign & Docs", items: ["Profile hero card redesign", "Achievements & Recent Activity redesign", "In-app documentation easter egg (tap version 5×)"] },
  { version: "1.11", phase: "Curations & Mood Discovery", items: ["Curated Experience Packs (8 packs)", "Slot Intelligence — smart tags on time slots", "Dynamic Pricing — strikethrough original prices"] },
  { version: "1.12", phase: "Monetization & Gamification", items: ["Live Service Ordering — Swiggy-style in-stay menu", "Spin Wheel — daily spin-to-win", "Milestone Rewards — 6 achievement milestones", "Curations wired to live database", "Repeat Booking Engine — 'Your Last Vibe' card"] },
  { version: "1.13", phase: "Trip Management & Active Stay", items: ["Active Trip status with live pulse indicator", "ActiveTripCard on home with food ordering CTA", "Curated pack listings with autoplay video backgrounds", "8 generated videos for curated packs"] },
  { version: "1.14", phase: "Loyalty & Rewards Redesign", items: ["Gamified Loyalty Screen with tabbed interface", "Enhanced Spin Wheel with sound effects"] },
  { version: "1.15", phase: "Add-on Icons & Curated Listings", items: ["Per-item emoji icons, curated pack video backgrounds"] },
  { version: "1.16", phase: "Admin Panel Foundation", items: ["Admin layout with collapsible sidebar (22 nav items)", "Command Palette (⌘K)", "Command Center dashboard", "Role-based access control", "17 admin pages + 6 edge functions"] },
  { version: "1.17", phase: "Admin CRM & Property History", items: ["Client Directory (CRM 2.0)", "Property History with AI search", "Live Orders widget, Booking Heatmap", "Weekly Digest, Auto-Actions panel"] },
  { version: "1.18", phase: "Database-Driven CRUD & Inventory", items: ["Properties fully database-driven (28+ listings)", "Full Property CRUD in admin", "Inventory Management with low-stock alerts"] },
  { version: "1.19", phase: "Dynamic App Configuration", items: ["app_config table — centralized runtime settings", "Admin Settings & Homepage Manager (4-tab interface)", "Dynamic Branding, Sections, Videos, Filters"] },
  { version: "1.20", phase: "Social, Legal & Performance", items: ["Social media links, Terms & Privacy Sheet", "SEO & Performance optimizations", "Network dependency tree flattened"] },
  { version: "1.21", phase: "Product Planning & Documentation", items: ["PRD with personas, KPIs, priority matrix, risks, roadmap", "App Blueprint — architecture, data flow, modules", "16 wireframes for core screens"] },
  { version: "1.22", phase: "Schema Hardening", items: ["7 new DB tables: payments, refunds, invoices, property_slots, slot_availability, notification_preferences, push_tokens", "Payment foundation — Razorpay-ready schema", "Slot management — per-date availability + dynamic pricing"] },
  { version: "1.23", phase: "Complete Wireframes & Onboarding", items: ["8 new wireframes covering all revenue-critical screens", "Auth/Onboarding wireframe", "Updated ER diagram with full payment flow"] },
  { version: "1.24", phase: "Resilience & Performance", items: ["React Error Boundaries — per-route crash recovery", "Offline Detection + animated OfflineBanner", "Query Retry Strategy — 2× with exponential backoff"] },
  { version: "1.25", phase: "v2.0 Hooks", items: ["usePayments, useSlotAvailability, useInvoices, useOrders, useSearch", "Total hooks: 27"] },
  { version: "1.26", phase: "Staff Portal Enhancement", items: ["StaffAttendance, StaffLeaves, StaffSalary", "Staff profile linking, 7 scrollable tabs"] },
  { version: "1.27", phase: "Wire Hooks into UI", items: ["SearchScreen wired to useSearch", "PropertyDetail wired to useSlotAvailability", "LiveOrderingSheet awards loyalty points"] },
  { version: "1.28", phase: "Mobile Blueprint & Documentation", items: ["Mobile & Responsive tab in easter egg docs — full mobile architecture reference", "Distribution strategy: PWA + Capacitor + GitHub Actions CI/CD", "Viewport, layout, touch, typography, aspect ratio, theme documentation", "AI prompts section for converting mobile-first design to desktop/web version", "PDF export includes Mobile & Responsive section"] },
  { version: "1.29", phase: "Native Android Distribution", items: ["Capacitor 8 Android integration — WebView loads live published URL", "GitHub Actions CI/CD pipeline — auto-build debug APK on push to main", "Java 21 + Gradle 8.14 build config", "App ID: com.hushh.jeypore, loads live URL for instant web updates without APK rebuild", "capacitor.config.ts with server.url pointing to published domain"] },
  { version: "1.30", phase: "Dark & Light Theme Polish", items: ["Light mode fixes — removed blur/white overlay on Trips property images", "Theme contrast improvements across both dark and light modes", "Refined card backgrounds, borders, and shadow tokens for light theme", "Ensured all screens render correctly in both themes"] },
  { version: "1.31", phase: "Home Performance Optimization", items: ["Replaced framer-motion AnimatePresence with instant CSS renders on category tabs", "PullToRefresh rebuilt with native CSS transforms — eliminated layout thrashing", "Video carousel rootMargin reduced (400px→50px) to prevent GPU memory bloat", "LazySection uses content-visibility:auto + contain-intrinsic-size for off-screen sections", "SettingRow rebuilt without framer-motion — pure CSS transitions", "Removed will-change:transform from video cards to reduce composited layers", "Native @keyframes spin in CSS replacing JS-driven animation"] },
  { version: "1.32", phase: "Scroll Fix — Capacitor WebView", items: ["Removed PullToRefresh wrapper from HomeScreen and TripsScreen — was calling e.preventDefault() blocking native scroll in Capacitor WebView", "Changed horizontal carousel touchAction from pan-x to pan-x pan-y — allows vertical scroll passthrough", "Video cards: only active card plays, others pause — reduces concurrent decode pressure", "Video preload reduced to only first visible card with requestIdleCallback for deferred warmups"] },
  { version: "1.33", phase: "Native Capacitor Integration", items: ["Custom app icon generated (1024px, purple-gold 'h' lettermark) with all Android density sizes (mdpi→xxxhdpi)", "Domain updated to hushh-jeypore.lovable.app (published URL)", "Capacitor plugins: @capacitor/push-notifications, camera, geolocation, haptics, local-notifications, status-bar, splash-screen, app", "Native haptics: hapticLight/Medium/Heavy/Success/Error/Selection use @capacitor/haptics ImpactStyle when in native shell, Web Vibration API fallback", "Push notifications: native registration via @capacitor/push-notifications with token storage, PWA service worker fallback", "Status bar: dark style with #050505 background, non-overlay mode on Android", "NotificationPermissionBanner: auto-detects native vs web and uses correct API", "GitHub Actions: icon copying step generates all mipmap densities from source icon", "src/lib/native.ts: centralized platform detection (isNative, isAndroid, isIOS) and plugin initialization"] },
  { version: "1.34", phase: "Full Native Capabilities", items: ["@capacitor/share — native share sheet for properties, referral codes, bookings", "@capacitor/clipboard — native clipboard for copy referral code, booking IDs", "@capacitor/network — native network status detection with connection type (WiFi/cellular/none)", "@capacitor/browser — in-app browser for external links (payment pages, social links)", "@capacitor/preferences — native key-value storage replacing localStorage for persistent data", "@capacitor/screen-orientation — locked to portrait mode on native", "@capacitor/keyboard — iOS keyboard resize mode (Body) with scroll enabled", "Android back button handler — navigates back or minimizes app via @capacitor/app", "Deep link handler — appUrlOpen listener routes URLs to correct screen", "Native share bridge (src/lib/native-share.ts) — Capacitor Share → Web Share API → clipboard fallback chain", "Native network bridge (src/lib/native-network.ts) — exposes isOnline + connectionType with real-time listener", "Native browser bridge (src/lib/native-browser.ts) — in-app browser with popover presentation", "Native preferences bridge (src/lib/native-preferences.ts) — async get/set/remove with localStorage fallback", "OfflineBanner upgraded to use native network detection", "ReferralScreen uses native clipboard for copy", "share.ts re-exports from native-share for backward compatibility", "useOnlineStatus hook now delegates to native network detection"] },
  { version: "1.35", phase: "Native-Grade Caching & WebView Tuning", items: ["Native data cache layer (src/lib/native-cache.ts) — cacheSet/cacheGet/cacheRemove with TTL + stale-while-revalidate pattern", "Prefetch critical data on native launch — listings, curations, packages, app_config cached in @capacitor/preferences", "capacitor.config.ts: androidScheme:'https', allowMixedContent:true, captureInput:true for native-like WebView", "Android backgroundColor:#050505 — eliminates white flash on cold start", "Keyboard plugin config: resize:'body' with resizeOnFullScreen for proper input handling", "CapacitorHttp enabled — uses native HTTP stack bypassing WebView CORS, faster API calls", "SplashScreen androidScaleType:'CENTER_CROP' for edge-to-edge splash", "App startup flow: initNativePlugins → prefetchCriticalData → React render with cached data available instantly", "Messages screen: swipe-to-pin and swipe-to-archive with full archive/unarchive lifecycle"] },
  { version: "1.36", phase: "Desktop & Wallpaper Gallery", items: ["Cinematic splash screen — time-of-day island villa backgrounds (dawn/day/dusk/night) with fireflies, stars, birds, lanterns", "Desktop 16:9 variants of all cinematic splash backgrounds (expanded from mobile art)", "Pacifico curvy script typography for splash brand name", "Wallpaper gallery Easter egg — downloadable phone + desktop wallpapers", "Asset catalog (src/data/wallpapers.ts) — organized Classic + Cinematic assets", "Admin Branding toggle: Classic vs Cinematic splash variant", "Desktop splash screen support with responsive background selection", "/wallpapers route + Profile 7-tap Easter egg access", "Desktop tab in documentation with full responsive architecture reference"] },
];

// ─── TAB DEFINITIONS ─────────────────────────────────────────
type TabId = "overview" | "features" | "architecture" | "database" | "wireframes" | "desktop" | "mobile" | "wallpapers" | "changelog";
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Home size={14} /> },
  { id: "features", label: "Features", icon: <Star size={14} /> },
  { id: "architecture", label: "Arch", icon: <Cpu size={14} /> },
  { id: "database", label: "DB", icon: <Database size={14} /> },
  { id: "wireframes", label: "Wireframes", icon: <Monitor size={14} /> },
  { id: "desktop", label: "Desktop", icon: <Monitor size={14} /> },
  { id: "mobile", label: "Mobile", icon: <Smartphone size={14} /> },
  { id: "wallpapers", label: "Walls", icon: <ImageIcon size={14} /> },
  { id: "changelog", label: "Log", icon: <History size={14} /> },
];

// ─── MERMAID CHARTS ──────────────────────────────────────────
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
        STAFF["Staff Portal 7 tabs"]
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
    host_listings ||--o{ property_slots : "has"
    property_slots ||--o{ slot_availability : "available"
    property_tags ||--o{ tag_assignments : "assigned"
    staff_members ||--o{ staff_attendance : "tracks"
    staff_members ||--o{ staff_leaves : "requests"
    staff_members ||--o{ staff_salary_payments : "paid"`;

const BOOKING_FLOW = `graph LR
    A["Browse"] --> B["Property Detail"]
    B --> C{"Select Slot + Date"}
    C --> D["Experience Builder"]
    D --> I["Checkout"]
    I --> J{"Apply Coupon?"}
    J -->|Yes| K["Validate"]
    K --> L["Summary"]
    J -->|No| L
    L --> N["Confirm Booking"]
    N --> P["Confetti + ID"]
    P --> Q["Award Points"]
    Q --> R["View Trips"]`;

const USER_JOURNEY = `graph TB
    SPLASH["Splash"] --> HOME["Home"]
    HOME --> SEARCH["Search"]
    HOME --> MAP["Map View"]
    HOME --> PROPERTY["Property Detail"]
    PROPERTY --> BOOK["Book Now"]
    BOOK --> BUILDER["Experience Builder"]
    BUILDER --> CHECKOUT["Checkout"]
    CHECKOUT --> CONFIRM["Confirmed"]
    HOME --> WISH["Wishlists"]
    HOME --> MSG["Messages"]
    HOME --> PROFILE["Profile"]
    PROFILE --> LOYALTY["Loyalty"]
    PROFILE --> HOST["Host Dashboard"]`;

const ADMIN_JOURNEY = `graph TB
    LOGIN["Admin Login"] --> CMD["Command Center"]
    CMD --> PROP["Properties CRUD"]
    CMD --> BOOK["Bookings"]
    CMD --> INV["Inventory"]
    CMD --> CRM["Client CRM"]
    CMD --> ORD["Live Orders"]
    CMD --> AI["AI Assistant"]
    CMD --> FIN["Finance Hub"]
    CMD --> STAFF["Staff Mgmt"]
    CMD --> MKT["Marketing"]
    CMD --> SETTINGS["Settings"]
    CMD --> AUDIT["Audit Trail"]`;

// ─── MAIN COMPONENT ─────────────────────────────────────────
interface AppDocumentationProps { open: boolean; onClose: () => void; }

export default function AppDocumentation({ open, onClose }: AppDocumentationProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopyDoc = useCallback(async () => {
    const doc = generateFullDoc();
    try { await navigator.clipboard.writeText(doc); } catch { const ta = document.createElement("textarea"); ta.value = doc; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleExportPDF = useCallback(() => {
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(generatePDFHtml());
    pw.document.close();
    setTimeout(() => { pw.print(); }, 800);
  }, []);

  if (!open) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)", background: "hsl(var(--background) / 0.95)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))" }}>
            <BookOpen size={14} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground tracking-tight">Hushh Docs</p>
            <p className="text-[9px] text-muted-foreground font-medium">v1.35 · Internal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyDoc} className="h-8 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5" style={{ background: copied ? "hsl(160 60% 42% / 0.15)" : "hsl(var(--primary) / 0.1)", color: copied ? "hsl(160 60% 42%)" : "hsl(var(--primary))" }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleExportPDF} className="h-8 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
            <Download size={12} /> PDF
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <X size={16} className="text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="shrink-0 px-2 py-2 flex gap-1 overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid hsl(var(--border) / 0.2)" }}>
        {TABS.map(tab => (
          <motion.button key={tab.id} whileTap={{ scale: 0.95 }} onClick={() => { setActiveTab(tab.id); contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? "hsl(var(--primary) / 0.15)" : "transparent",
              color: activeTab === tab.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              border: activeTab === tab.id ? "1px solid hsl(var(--primary) / 0.2)" : "1px solid transparent",
            }}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-5 pb-24">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "features" && <FeaturesTab />}
            {activeTab === "architecture" && <ArchitectureTab />}
            {activeTab === "database" && <DatabaseTab />}
            {activeTab === "wireframes" && <WireframesTab />}
            {activeTab === "desktop" && <DesktopTab />}
            {activeTab === "mobile" && <MobileTab />}
            {activeTab === "wallpapers" && <WallpapersTab />}
            {activeTab === "changelog" && <ChangelogTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════════
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.03) 60%, hsl(270 60% 50% / 0.08) 100%)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.5), transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(270 60% 50% / 0.5), transparent 70%)" }} />
        <p className="text-4xl mb-3">🏡</p>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Hushh</h1>
        <p className="text-xs text-primary font-bold mt-1 uppercase tracking-widest">Private Experience Marketplace</p>
        <p className="text-[11px] text-muted-foreground mt-3 max-w-[280px] mx-auto leading-relaxed">Book private stays, curated experiences, and on-demand services — all in one app. Made in Jeypore, India.</p>
        <div className="flex justify-center gap-2 mt-4">
          {["Mobile-First", "Real-Time", "AI-Powered"].map(tag => (
            <span key={tag} className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.15)" }}>{tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard value="80+" label="Components" icon={<Boxes size={14} style={{ color: "#7c3aed" }} />} color="#7c3aed" />
        <StatCard value="27" label="Custom Hooks" icon={<Code size={14} style={{ color: "#06b6d4" }} />} color="#06b6d4" />
        <StatCard value="45" label="DB Tables" icon={<Database size={14} style={{ color: "#f59e0b" }} />} color="#f59e0b" />
        <StatCard value="6" label="Edge Functions" icon={<Zap size={14} style={{ color: "#10b981" }} />} color="#10b981" />
        <StatCard value="15" label="User Screens" icon={<Smartphone size={14} style={{ color: "#ec4899" }} />} color="#ec4899" />
        <StatCard value="22" label="Admin Pages" icon={<Settings size={14} style={{ color: "#8b5cf6" }} />} color="#8b5cf6" />
      </div>

      {/* Four Pillars */}
      <div>
        <SectionHeader title="Four Pillars" subtitle="The foundation of every Hushh experience" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: "🏠", title: "Stays", desc: "Farmhouses, Villas, Work Pods, Rooftops, Pool Houses", gradient: "from-blue-500/10 to-cyan-500/5" },
            { emoji: "🎭", title: "Experiences", desc: "Candlelight Dinners, Parties, Bonfires, Heritage Walks", gradient: "from-purple-500/10 to-pink-500/5" },
            { emoji: "🛎", title: "Services", desc: "Chef-on-Call, Decor, DJ & Lights, Rides, Staff", gradient: "from-amber-500/10 to-orange-500/5" },
            { emoji: "✨", title: "Curations", desc: "Date Night Deluxe, Birthday Bash, Corporate Retreat", gradient: "from-emerald-500/10 to-teal-500/5" },
          ].map(p => (
            <motion.div key={p.title} whileHover={{ scale: 1.02 }} className={`rounded-2xl p-3.5 bg-gradient-to-br ${p.gradient}`} style={{ border: "1px solid hsl(var(--border) / 0.3)" }}>
              <p className="text-2xl mb-1">{p.emoji}</p>
              <p className="font-bold text-foreground text-xs">{p.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <SectionHeader title="Target Audience" subtitle="Who uses Hushh?" />
        <div className="space-y-2">
          {[
            { icon: <Heart size={13} className="text-pink-400" />, title: "Young Couples", desc: "Date nights, anniversaries, romantic getaways", badge: "Primary" },
            { icon: <Users size={13} className="text-blue-400" />, title: "Friend Groups", desc: "House parties, game nights, celebrations" },
            { icon: <Briefcase size={13} className="text-amber-400" />, title: "Remote Workers", desc: "Weekday work sessions, change of scenery", badge: "Strategic" },
            { icon: <Award size={13} className="text-purple-400" />, title: "Corporate", desc: "Team retreats, offsites, brainstorming sessions" },
            { icon: <Home size={13} className="text-emerald-400" />, title: "Hosts", desc: "Property owners monetizing idle spaces" },
            { icon: <Shield size={13} className="text-red-400" />, title: "Admins", desc: "Operations, CRM, analytics, AI assistant" },
          ].map(a => <FeatureRow key={a.title} icon={a.icon} title={a.title} desc={a.desc} badge={a.badge} />)}
        </div>
      </div>

      {/* PRD Summary */}
      <div>
        <SectionHeader title="Product Requirements" subtitle="Key metrics & roadmap" />
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--primary) / 0.1)" }}>
            <p className="font-bold text-foreground text-xs mb-2">Success Metrics</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[["MAU", "5,000+"], ["Conversion", "8-12%"], ["AOV", "₹3,500+"], ["Repeat Rate", "40%+"], ["Properties", "50+"], ["NPS", "60+"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-bold text-foreground">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--primary) / 0.1)" }}>
            <p className="font-bold text-foreground text-xs mb-2">Priority Matrix</p>
            <div className="space-y-1.5 text-[11px]">
              <p><span className="text-green-400 font-bold">P0 ✅</span> Discovery, booking, auth, admin CRUD</p>
              <p><span className="text-green-400 font-bold">P1 ✅</span> Builder, curations, ordering, loyalty, CRM</p>
              <p><span className="text-yellow-400 font-bold">P2 🔜</span> Razorpay, push notifs, multi-lang, AI recs</p>
              <p><span className="text-muted-foreground font-bold">P3 📋</span> Native apps, multi-city, vendor marketplace</p>
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--primary) / 0.1)" }}>
            <p className="font-bold text-foreground text-xs mb-2">User Personas</p>
            <div className="space-y-2">
              {[
                { name: "Priya (26)", role: "The Planner", pain: "Can't find unique venues", needs: "Curations, reviews, split payments" },
                { name: "Rahul (24)", role: "Spontaneous", pain: "Last-minute planning fails", needs: "Tonight tags, quick checkout" },
                { name: "Sunita (42)", role: "The Host", pain: "Manages via phone calls", needs: "Dashboard, calendar, inventory" },
                { name: "Vikram (35)", role: "Corporate Booker", pain: "Coordinating venue + food", needs: "Bulk booking, receipts" },
              ].map(p => (
                <div key={p.name} className="flex gap-2 p-2 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0" style={{ background: "hsl(var(--primary) / 0.1)" }}>👤</div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground">{p.name} · <span className="text-primary">{p.role}</span></p>
                    <p className="text-[10px] text-muted-foreground">Pain: {p.pain}</p>
                    <p className="text-[10px] text-muted-foreground">Needs: {p.needs}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--primary) / 0.1)" }}>
            <p className="font-bold text-foreground text-xs mb-2">⚠️ Risks & Mitigations</p>
            <div className="space-y-1 text-[11px]">
              <p><span className="text-yellow-400">⚠</span> Low host adoption → Zero fees, hands-on onboarding</p>
              <p><span className="text-yellow-400">⚠</span> Seasonal demand → Work-from-resort, corporate packages</p>
              <p><span className="text-yellow-400">⚠</span> Payment fraud → UPI verification, booking limits</p>
              <p><span className="text-yellow-400">⚠</span> OTA competition → Hyper-local, curated packs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <SectionHeader title="Tech Stack" />
        <div className="grid grid-cols-2 gap-2">
          {[
            ["React 18", "TypeScript"], ["Vite 8", "Tailwind CSS 3"],
            ["Framer Motion", "React Query"], ["React Router v6", "shadcn/ui"],
            ["Recharts", "React Hook Form"], ["Zod", "Lovable Cloud"],
          ].map(([a, b], i) => (
            <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <p className="text-[11px] font-bold text-foreground">{a}</p>
              <p className="text-[10px] text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground"><Sparkles size={10} className="inline text-primary mr-1" />Hushh v1.35 · Made in Jeypore ❤️</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: FEATURES
// ═══════════════════════════════════════════════════════════════
function FeaturesTab() {
  return (
    <div className="space-y-6">
      {/* User App Screens */}
      <div>
        <SectionHeader title="User App — 15 Screens" subtitle="Every screen in the consumer app" />
        <div className="space-y-2">
          {[
            { icon: <Sparkles size={13} className="text-purple-400" />, title: "Splash Screen", desc: "Animated brand logo with spring physics, dynamic branding from app_config" },
            { icon: <Home size={13} className="text-blue-400" />, title: "Home / Explore", desc: "Rotating search, Active Trip card, Category Bar, Spotlight Carousel, Property Cards, Sports, Foodie, Couples, Curations, Events, Pull-to-refresh" },
            { icon: <Eye size={13} className="text-cyan-400" />, title: "Property Detail", desc: "Gallery carousel, slot picker (5 options), guest counter, date picker, reviews, sticky bottom bar, wishlist toggle" },
            { icon: <Package size={13} className="text-amber-400" />, title: "Experience Builder", desc: "4 category tabs (Food, Decor, Entertainment, Transport), quantity selectors, smart nudges, running total" },
            { icon: <CreditCard size={13} className="text-green-400" />, title: "Checkout", desc: "Booking summary, add-on line items, coupon input, GST 18%, price breakdown, confirm CTA" },
            { icon: <Award size={13} className="text-yellow-400" />, title: "Booking Confirmation", desc: "Full-screen success, confetti animation, booking ID (HUSHH-XXXXXX), loyalty points badge" },
            { icon: <Search size={13} className="text-indigo-400" />, title: "Search", desc: "Full-screen overlay, real-time DB-powered filtering, category chips, recent searches" },
            { icon: <Map size={13} className="text-teal-400" />, title: "Map View", desc: "Leaflet map with pin markers, tap → preview card → detail" },
            { icon: <Heart size={13} className="text-red-400" />, title: "Wishlists", desc: "Grid of wishlisted properties, real-time sync, empty state" },
            { icon: <Calendar size={13} className="text-orange-400" />, title: "Trips", desc: "5 tabs (All/Active/Upcoming/Past/Cancelled), identity verification, order food, cancel/rebook" },
            { icon: <FileText size={13} className="text-slate-400" />, title: "Booking Detail", desc: "Status banner, property card, Order Food, Add Extras, Split Payment, Photos, Cancel/Rebook" },
            { icon: <MessageSquare size={13} className="text-sky-400" />, title: "Messages", desc: "Conversation list, chat thread, dynamic support contacts from config" },
            { icon: <Users size={13} className="text-violet-400" />, title: "Profile", desc: "Hero card, membership badge, stats, achievements, host CTA, theme, social links, terms" },
            { icon: <Gift size={13} className="text-pink-400" />, title: "Loyalty & Spin", desc: "Tier card, daily spin wheel with sound, milestones, transaction history, referrals" },
            { icon: <Bell size={13} className="text-emerald-400" />, title: "Notifications", desc: "Filter tabs, grouped by day, read/unread states, action URLs" },
          ].map(s => <FeatureRow key={s.title} icon={s.icon} title={s.title} desc={s.desc} />)}
        </div>
      </div>

      {/* Guest Mode */}
      <DocSection title="Guest Mode (No Login Required)" icon={<Users size={15} className="text-primary" />}>
        <ul className="list-disc list-inside space-y-1 text-[12px]">
          <li>Full property browsing with video thumbnails & accent frames</li>
          <li>Mock wishlists (5 properties), trips (12 bookings), messages, notifications</li>
          <li>Mock loyalty — 320 pts, Gold tier, spin wheel</li>
          <li>Mock public profiles for all reviewers</li>
          <li>Search, map view, theme switching all functional</li>
        </ul>
      </DocSection>

      {/* Authenticated */}
      <DocSection title="Authenticated Features (16 DB-Wired)" icon={<Shield size={15} className="text-primary" />}>
        <DataTable headers={["Feature", "Table", "Details"]} rows={[
          ["Auth", "auth.users", "Email/password, verification, reset"],
          ["Profile", "profiles", "Name, avatar, bio, points, tier"],
          ["Identity", "identity_verifications", "Aadhaar/PAN, admin review"],
          ["Wishlists", "wishlists", "Real-time cross-device sync"],
          ["Bookings", "bookings", "CRUD, status management"],
          ["Messages", "conversations + messages", "Real-time chat, unread counts"],
          ["Reviews", "reviews + responses", "Ratings, photos, host replies"],
          ["Loyalty", "loyalty_transactions", "5pts/₹100, tier progression"],
          ["Referrals", "referral_codes + uses", "Unique codes, rewards"],
          ["Orders", "orders + items", "In-stay Swiggy-style ordering"],
          ["Spin Wheel", "spin_history", "1/day enforced via DB"],
          ["Milestones", "user_milestones", "6 achievement badges"],
          ["Split Pay", "booking_splits", "Split with friends"],
          ["Photos", "booking_photos", "Per-booking gallery"],
        ]} />
      </DocSection>

      {/* Admin Panel */}
      <div>
        <SectionHeader title="Admin Panel — 22 Pages" subtitle="Full operations dashboard at /admin" />
        <div className="space-y-2">
          {[
            { icon: <Activity size={13} className="text-red-400" />, title: "Command Center", desc: "4 KPI cards, live activity feed, pending items, quick nav" },
            { icon: <Cpu size={13} className="text-purple-400" />, title: "AI Assistant", desc: "Natural language queries across all data via edge function" },
            { icon: <Bell size={13} className="text-yellow-400" />, title: "Smart Alerts", desc: "Low stock, overdue tasks, booking anomalies" },
            { icon: <TrendingUp size={13} className="text-green-400" />, title: "Dynamic Pricing", desc: "Demand-based rules, peak/off-peak multipliers" },
            { icon: <Home size={13} className="text-blue-400" />, title: "Properties", desc: "Full CRUD — name, pricing, images, tags, slots, rules, status", badge: "CRUD" },
            { icon: <Boxes size={13} className="text-amber-400" />, title: "Inventory", desc: "5 categories, stock tracking, low-stock alerts, pricing" },
            { icon: <Calendar size={13} className="text-cyan-400" />, title: "Bookings + Calendar", desc: "Status flow, heatmap, monthly view, booking requests" },
            { icon: <Users size={13} className="text-violet-400" />, title: "Client Directory", desc: "CRM 2.0 — engagement score 0-100, journey timeline, AI search", badge: "CRM" },
            { icon: <ShoppingCart size={13} className="text-orange-400" />, title: "Live Orders", desc: "Real-time Zomato-style order tracking" },
            { icon: <BarChart3 size={13} className="text-indigo-400" />, title: "Analytics + Earnings", desc: "Charts, trends, revenue tracking, payout summaries" },
            { icon: <Package size={13} className="text-teal-400" />, title: "Curations", desc: "Curated pack CRUD with mood tags and gradients" },
            { icon: <Megaphone size={13} className="text-pink-400" />, title: "Campaigns + Coupons", desc: "Marketing campaigns, discount code engine" },
            { icon: <UserCheck size={13} className="text-emerald-400" />, title: "Staff Management", desc: "Directory, attendance, leaves (quota-based), payroll" },
            { icon: <CreditCard size={13} className="text-slate-400" />, title: "Finance Hub", desc: "Expenses, budgets, recurring payments, receipts" },
            { icon: <Layout size={13} className="text-sky-400" />, title: "Homepage Manager", desc: "4-tab: Sections, Videos, Filters, Tags" },
            { icon: <Settings size={13} className="text-gray-400" />, title: "Settings", desc: "3-tab: General, Branding, Advanced" },
            { icon: <FileText size={13} className="text-rose-400" />, title: "Exports + Audit Trail", desc: "CSV exports, full activity log" },
          ].map(p => <FeatureRow key={p.title} icon={p.icon} title={p.title} desc={p.desc} badge={p.badge} />)}
        </div>
      </div>

      {/* Staff Portal */}
      <DocSection title="Staff Portal — 7 Tabs" icon={<Briefcase size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "Orders", desc: "Zomato-style queue with identity mapping and real-time status" },
            { title: "Check-In", desc: "QR-based guest check-in" },
            { title: "Tasks", desc: "Service and maintenance task management" },
            { title: "Clock", desc: "Self-service attendance with overtime detection" },
            { title: "Leave", desc: "Request system with yearly quotas (Casual 12, Sick 10, Earned 15)" },
            { title: "Pay", desc: "Personal salary dashboard with bonuses and deductions" },
            { title: "Stock", desc: "Inventory management" },
          ].map(t => (
            <div key={t.title} className="flex items-center gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="font-bold text-foreground">{t.title}</span>
              <span className="text-muted-foreground">— {t.desc}</span>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Design System */}
      <DocSection title="Design System" icon={<Palette size={15} className="text-primary" />}>
        <div className="space-y-3">
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Typography</p>
            <DataTable headers={["Font", "Usage", "Weight"]} rows={[
              ["Space Grotesk", "Primary UI", "300–700"],
              ["Playfair Display", "Editorial overlays", "400–900"],
              ["Plus Jakarta Sans", "Secondary body", "200–800"],
              ["DM Sans", "Compact labels", "100–1000"],
            ]} />
          </div>
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Color Palette (HSL)</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { name: "BG", hsl: "260 20% 6%", hex: "#0C0B1D" },
                { name: "Primary", hsl: "270 80% 65%", hex: "#9B5DE5" },
                { name: "Accent", hsl: "270 60% 50%", hex: "#7C3AED" },
                { name: "Muted", hsl: "260 12% 16%", hex: "#26243A" },
                { name: "Success", hsl: "160 60% 42%", hex: "#22A366" },
                { name: "Gold", hsl: "43 96% 56%", hex: "#F5A623" },
              ].map(c => (
                <div key={c.name} className="rounded-xl p-2 text-center" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
                  <div className="w-full h-4 rounded-lg mb-1" style={{ background: c.hex }} />
                  <p className="text-[9px] font-bold text-foreground">{c.name}</p>
                  <p className="text-[8px] text-muted-foreground">{c.hsl}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-foreground text-xs mb-1">Visual Effects</p>
            <div className="flex flex-wrap gap-1.5">
              {["Glassmorphism", "AccentFrame", "AccentTag", "Ambient Glows", "Gradient Borders", "Framer Motion", "Haptic Feedback", "Video Thumbnails"].map(e => (
                <span key={e} className="text-[9px] px-2 py-1 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </DocSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: ARCHITECTURE
// ═══════════════════════════════════════════════════════════════
function ArchitectureTab() {
  return (
    <div className="space-y-6">
      <SectionHeader title="System Architecture" subtitle="How Hushh is built" />
      <MermaidDiagram chart={ARCHITECTURE_CHART} title="System Architecture" />
      <MermaidDiagram chart={BOOKING_FLOW} title="Booking Flow" />
      <MermaidDiagram chart={USER_JOURNEY} title="User Journey Map" />
      <MermaidDiagram chart={ADMIN_JOURNEY} title="Admin Journey Map" />
      <MermaidDiagram chart={ER_CHART} title="Entity Relationship Diagram" />

      {/* Data Flow */}
      <DocSection title="Data Flow" icon={<Activity size={15} className="text-primary" />} defaultOpen>
        <div className="space-y-2">
          {[
            { mode: "Guest", flow: "Mock Data (localStorage + static arrays) → Components", color: "text-amber-400" },
            { mode: "Auth User", flow: "Supabase Queries → React Query (cache, 2× retry, 30s stale) → Components", color: "text-green-400" },
            { mode: "Admin", flow: "Admin Panel (22 pages + sidebar + ⌘K) → Edge Functions → DB", color: "text-purple-400" },
            { mode: "Offline", flow: "OfflineBanner shown, cached data available, mutations fail gracefully", color: "text-red-400" },
          ].map(d => (
            <div key={d.mode} className="p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <span className={`font-bold text-xs ${d.color}`}>{d.mode}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{d.flow}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* State Management */}
      <DocSection title="State Management" icon={<Layers size={15} className="text-primary" />}>
        <div className="space-y-1.5 text-[11px]">
          <p><strong className="text-foreground">Global Providers:</strong> AuthProvider, ThemeProvider, PrivacyModeProvider, PropertiesProvider, QueryClient</p>
          <p><strong className="text-foreground">Local State:</strong> Screen state machine (Index.tsx), component useState, localStorage fallbacks</p>
          <p><strong className="text-foreground">Online Status:</strong> useOnlineStatus hook (navigator.onLine + event listeners)</p>
        </div>
      </DocSection>

      {/* Module Map */}
      <DocSection title="Module Map" icon={<Code size={15} className="text-primary" />}>
        <div className="font-mono text-[10px] space-y-0.5 p-3 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
          <p className="text-primary font-bold">App.tsx</p>
          <p className="pl-3">├ Index.tsx (SPA shell + 15 screens)</p>
          <p className="pl-6">├ HomeScreen (10+ sub-components)</p>
          <p className="pl-6">├ PropertyDetail → Builder → Checkout → Confirmation</p>
          <p className="pl-6">├ Trips → BookingDetail → LiveOrdering</p>
          <p className="pl-6">└ Profile → Loyalty, Referrals, Host Dashboard</p>
          <p className="pl-3">├ Admin.tsx (22 pages + sidebar + ⌘K)</p>
          <p className="pl-3">└ Staff.tsx (7 tabs: Orders, Check-In, Tasks, Clock, Leave, Pay, Stock)</p>
        </div>
      </DocSection>

      {/* Security */}
      <DocSection title="Security Layers" icon={<Lock size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { layer: "1", title: "Authentication", desc: "Email/password, JWT tokens, email verification, password reset" },
            { layer: "2", title: "RBAC", desc: "user_roles table with has_role() security definer function. Roles: super_admin, ops_manager, host, staff" },
            { layer: "3", title: "Row-Level Security", desc: "Every table has RLS enabled — per-user data isolation, public READ on listings/curations" },
            { layer: "4", title: "Client-Side", desc: "No secrets in client code, edge functions for all server-side operations" },
          ].map(s => (
            <div key={s.layer} className="flex gap-3 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-primary shrink-0" style={{ background: "hsl(var(--primary) / 0.1)" }}>{s.layer}</div>
              <div>
                <p className="font-bold text-foreground text-xs">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Edge Functions */}
      <DocSection title="Edge Functions API" icon={<Zap size={15} className="text-primary" />}>
        <DataTable headers={["Function", "Purpose"]} rows={[
          ["admin-ai", "Natural language admin queries → answer, data, suggestions"],
          ["smart-alerts", "Low stock, overdue tasks → admin notifications"],
          ["auto-notifications", "DB webhook → user notification + optional email"],
          ["property-history-ai", "AI search booking + order history → results"],
          ["weekly-digest", "Aggregate weekly data → email digest"],
          ["staff-report", "Staff attendance & performance → summary"],
        ]} />
      </DocSection>

      {/* Hooks */}
      <DocSection title="Hooks Reference (27)" icon={<Code size={15} className="text-primary" />}>
        <DataTable headers={["Hook", "Purpose"]} rows={[
          ["useAuth", "Auth context + session"],
          ["useAdmin", "Role-based admin access"],
          ["useBookings", "Booking CRUD"],
          ["useWishlists", "Wishlist management"],
          ["useMessages", "Chat conversations"],
          ["useNotifications", "Notifications (mock fallback)"],
          ["useLoyalty", "Points, tier, transactions"],
          ["useReferrals", "Referral codes"],
          ["useReviews", "Reviews + responses"],
          ["useHostListings", "Host listing CRUD"],
          ["useHostAnalytics", "Analytics data"],
          ["useImageUpload", "Storage upload"],
          ["useTheme", "Theme management"],
          ["usePrivacyMode", "Privacy toggle"],
          ["useCurations", "Curated packs"],
          ["useUnreadCount", "Unread message count"],
          ["useAppConfig", "Dynamic app config"],
          ["useHomepageSections", "Section visibility/ordering"],
          ["useHomepageFilters", "Category filter pills"],
          ["useVideoCards", "Spotlight video config"],
          ["useDragReorder", "Drag-and-drop reordering"],
          ["useMobile", "Viewport detection"],
          ["useOnlineStatus", "Offline/online detection"],
          ["usePayments", "Payment CRUD"],
          ["useSlotAvailability", "Slots + per-date availability"],
          ["useInvoices", "Invoice retrieval"],
          ["useOrders", "Order CRUD with items"],
          ["useSearch", "Debounced DB search"],
        ]} />
      </DocSection>

      {/* Resilience */}
      <DocSection title="Resilience & Error Handling" icon={<Shield size={15} className="text-primary" />}>
        <div className="space-y-2 text-[11px]">
          <p><strong className="text-foreground">Error Boundaries:</strong> Global + per-route (Home, Admin, Staff) crash recovery with "Try Again" UI</p>
          <p><strong className="text-foreground">Offline Detection:</strong> useOnlineStatus hook + animated OfflineBanner</p>
          <p><strong className="text-foreground">Query Retry:</strong> Queries 2× (exponential 1s→4s), Mutations 1×, Stale time 30s</p>
          <p><strong className="text-foreground">Rate Limiting:</strong> Auth 30/hr, Spin 1/day, Edge Functions 100/s, Search 300ms debounce</p>
        </div>
      </DocSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: DATABASE
// ═══════════════════════════════════════════════════════════════
function DatabaseTab() {
  const tables: [string, string, string][] = [
    ["profiles", "user_id, display_name, avatar_url, loyalty_points, tier", "User profiles"],
    ["bookings", "user_id, property_id, date, slot, guests, total, status, payment_status", "Booking records"],
    ["wishlists", "user_id, property_id", "Saved properties"],
    ["conversations", "participant_1, participant_2, type, property_id, metadata", "Chat threads"],
    ["messages", "conversation_id, sender_id, content, read", "Chat messages"],
    ["notifications", "user_id, title, body, type, read, action_url", "Push alerts"],
    ["notification_preferences", "user_id, notification_type, channel, enabled", "Opt-out control"],
    ["push_tokens", "user_id, token, platform, active", "FCM tokens"],
    ["reviews", "user_id, property_id, rating, content, photo_urls, verified", "Reviews"],
    ["review_responses", "review_id, host_id, content", "Host replies"],
    ["loyalty_transactions", "user_id, title, points, type, icon", "Point ledger"],
    ["referral_codes", "user_id, code, uses, reward_points", "Referral codes"],
    ["referral_uses", "code_id, referrer_user_id, referred_user_id, credited", "Code usage"],
    ["host_listings", "user_id, name, category, base_price, capacity, amenities, image_urls, slots, rules, status", "Property listings (28+)"],
    ["curations", "name, tagline, emoji, slot, includes[], tags[], mood[], price, property_id", "Experience packs (8)"],
    ["orders", "user_id, property_id, booking_id, total, status, assigned_to", "In-stay orders"],
    ["order_items", "order_id, item_name, item_emoji, quantity, unit_price", "Order line items"],
    ["order_notes", "order_id, content, author_name, author_role", "Staff notes"],
    ["spin_history", "user_id, points_won, prize_label, prize_emoji", "Daily spin results"],
    ["user_milestones", "user_id, milestone_id", "Achievement tracking"],
    ["user_roles", "user_id, role (enum)", "RBAC roles"],
    ["app_config", "key, value, label, category, updated_by", "Runtime settings"],
    ["inventory", "name, emoji, category, unit_price, stock, low_stock_threshold, property_id", "Stock management"],
    ["experience_packages", "name, emoji, gradient, includes[], price", "Add-on packages"],
    ["coupons", "code, discount_type, discount_value, max_uses, expires_at", "Discount codes"],
    ["campaigns", "title, type, discount_type, target_properties[], target_audience[]", "Marketing campaigns"],
    ["expenses", "title, amount, category, vendor, date, payment_method, recurring", "Expense tracking"],
    ["budget_allocations", "category, month, year, allocated, spent", "Budget planning"],
    ["staff_members", "name, role, department, salary, status, user_id", "Staff directory"],
    ["staff_tasks", "title, description, priority, status, assigned_to, due_date", "Task tracking"],
    ["staff_attendance", "staff_id, date, check_in, check_out, hours_worked, overtime_hours", "Attendance"],
    ["staff_leaves", "staff_id, leave_type, start_date, end_date, status, days", "Leave requests"],
    ["staff_salary_payments", "staff_id, amount, month, year, bonus, deductions, status", "Payroll"],
    ["audit_logs", "user_id, entity_type, action, details (JSONB)", "Activity audit"],
    ["client_notes", "client_user_id, content, author_name, note_type, pinned", "CRM notes"],
    ["booking_photos", "booking_id, photo_url, caption, user_id", "Guest photos"],
    ["booking_splits", "booking_id, friend_name, friend_email, amount, payment_status", "Split payments"],
    ["identity_verifications", "user_id, document_type, document_url, status", "ID verification"],
    ["property_tags", "name, icon, color", "Tag definitions"],
    ["tag_assignments", "tag_id, target_id, target_type", "Tag mappings"],
    ["payments", "booking_id, user_id, amount, currency, status, gateway, gateway_order_id", "Payment tracking"],
    ["refunds", "payment_id, booking_id, amount, reason, status, gateway_refund_id", "Refund management"],
    ["invoices", "booking_id, payment_id, user_id, invoice_number, amount, line_items (JSONB)", "Invoice generation"],
    ["property_slots", "property_id, label, start_time, end_time, base_price, capacity", "Slot management"],
    ["slot_availability", "slot_id, date, booked_count, is_available, price_override", "Per-date availability"],
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Database Schema" subtitle={`${tables.length} tables across PostgreSQL`} />
      
      {/* ER Diagram */}
      <MermaidDiagram chart={ER_CHART} title="Entity Relationship Diagram" />

      {/* Table Groups */}
      {[
        { title: "👤 User & Auth", filter: ["profiles", "user_roles", "user_milestones", "identity_verifications"] },
        { title: "🏠 Properties & Listings", filter: ["host_listings", "curations", "inventory", "experience_packages", "property_tags", "tag_assignments", "property_slots", "slot_availability"] },
        { title: "📋 Bookings & Orders", filter: ["bookings", "orders", "order_items", "order_notes", "booking_photos", "booking_splits"] },
        { title: "💳 Payments & Finance", filter: ["payments", "refunds", "invoices", "expenses", "budget_allocations", "coupons", "campaigns"] },
        { title: "💬 Communication", filter: ["conversations", "messages", "notifications", "notification_preferences", "push_tokens"] },
        { title: "⭐ Engagement", filter: ["reviews", "review_responses", "loyalty_transactions", "referral_codes", "referral_uses", "spin_history", "wishlists"] },
        { title: "👷 Staff & Operations", filter: ["staff_members", "staff_tasks", "staff_attendance", "staff_leaves", "staff_salary_payments"] },
        { title: "⚙️ System", filter: ["app_config", "audit_logs", "client_notes"] },
      ].map(group => (
        <DocSection key={group.title} title={group.title} icon={<Database size={15} className="text-primary" />}>
          <div className="space-y-1.5">
            {tables.filter(([name]) => group.filter.includes(name)).map(([name, cols, desc]) => (
              <div key={name} className="p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono font-bold text-primary text-[11px]">{name}</span>
                  <span className="text-[9px] text-muted-foreground">— {desc}</span>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono">{cols}</p>
              </div>
            ))}
          </div>
        </DocSection>
      ))}

      {/* DB Functions */}
      <DocSection title="Database Functions" icon={<Code size={15} className="text-primary" />}>
        <DataTable headers={["Function", "Purpose"]} rows={[
          ["award_loyalty_points(user_id, points, title)", "Add points + transaction record"],
          ["redeem_loyalty_points(user_id, points, title)", "Deduct points if sufficient balance"],
          ["create_notification(user_id, title, body, type)", "Insert notification"],
          ["has_role(user_id, role)", "Check role (SECURITY DEFINER)"],
        ]} />
      </DocSection>

      {/* Enums */}
      <DocSection title="Enums" icon={<Tag size={15} className="text-primary" />}>
        <div className="flex gap-2 flex-wrap">
          {["super_admin", "ops_manager", "host", "staff"].map(r => (
            <span key={r} className="font-mono text-[10px] px-2.5 py-1 rounded-lg" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.15)" }}>{r}</span>
          ))}
        </div>
      </DocSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: WIREFRAMES
// ═══════════════════════════════════════════════════════════════
function WireframesTab() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Screen Wireframes" subtitle="Layout blueprints for every major screen" />

      {/* Screen Hierarchy */}
      <DocSection title="Screen Hierarchy — 5 Tabs" icon={<Layout size={15} className="text-primary" />} defaultOpen>
        <div className="font-mono text-[10px] space-y-0.5 p-3 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
          <p className="text-primary font-bold">Tab 1: EXPLORE</p>
          <p className="pl-3">Search → ActiveTrip → Categories → Spotlight → Properties → Sports → Foodie → Packs</p>
          <p className="text-primary font-bold mt-1">Tab 2: WISHLISTS</p>
          <p className="pl-3">2-col grid of saved properties</p>
          <p className="text-primary font-bold mt-1">Tab 3: TRIPS</p>
          <p className="pl-3">Filter tabs → Cards → Detail → Order/Cancel</p>
          <p className="text-primary font-bold mt-1">Tab 4: MESSAGES</p>
          <p className="pl-3">Conversations → Chat thread</p>
          <p className="text-primary font-bold mt-1">Tab 5: PROFILE</p>
          <p className="pl-3">Hero → Stats → Achievements → Settings</p>
        </div>
      </DocSection>

      {/* User Wireframes */}
      <Wireframe title="Home Screen" lines={[
        "┌─────────────────────────┐",
        "│ [👤]  Jeypore  [🔔·3]  │",
        "│ [🔍 Search farmhouses...]│",
        "│ ┌─────────────────────┐ │",
        "│ │ 🟢 Active Trip      │ │",
        "│ │ Villa · Eve · [Order]│ │",
        "│ └─────────────────────┘ │",
        "│ 🏠 Stays 🎭 Exp ✨ Cur │",
        "│ ╔═══ VIDEO SPOTLIGHT ═╗ │",
        "│ ╚═════════════════════╝ │",
        "│ ┌──────┐ ┌──────┐      │",
        "│ │Villa │ │Farm  │      │",
        "│ │₹2.5K │ │₹1.8K │      │",
        "│ └──────┘ └──────┘      │",
        "│ [🏸][🎯][🏊][🏓]       │",
        "│ [🍽 Thali][🕯 Candle]  │",
        "│ ┌═══ Pack Card ═══════┐ │",
        "│ │ 'Date Night' ₹3,999 │ │",
        "│ │ [Book Now]          │ │",
        "│ └═════════════════════┘ │",
        "│ 🏠  ❤️  ✈️  💬  👤    │",
        "└─────────────────────────┘",
      ]} />

      <Wireframe title="Booking Flow (4 Steps)" lines={[
        "┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐",
        "│ DETAIL  │→│ BUILDER │→│CHECKOUT │→│ CONFIRM │",
        "│ Gallery │  │ Food tab│  │ Summary │  │ 🎊      │",
        "│ Slots   │  │ Decor   │  │ Add-ons │  │HUSHH-XX │",
        "│ Date    │  │ DJ tab  │  │ Coupon  │  │ +50 pts │",
        "│ Guests  │  │ [-] [+] │  │ GST 18% │  │         │",
        "│ Reviews │  │ Running │  │ Total   │  │ [View   │",
        "│ [Book→] │  │ [Next→] │  │ [Pay→]  │  │  Trips] │",
        "└─────────┘  └─────────┘  └─────────┘  └─────────┘",
      ]} />

      <Wireframe title="Profile Screen" lines={[
        "┌─────────────────────────┐",
        "│         Profile          │",
        "│      ┌──────────┐       │",
        "│      │  Avatar  │       │",
        "│      │ (badge)  │       │",
        "│      └──────────┘       │",
        "│     Priya Sharma         │",
        "│  ┌─────┬─────┬────────┐ │",
        "│  │ 12  │  8  │ 2 yrs  │ │",
        "│  │Trips│Revws│Member  │ │",
        "│  └─────┴─────┴────────┘ │",
        "│ ┌─ 🥇 Gold · 1,240 pts ┐│",
        "│ [🌟Early][⭐5Star]→    │",
        "│ [🏠 Become a Host]     │",
        "│ [☀️ Light][🌙 Dark]    │",
        "│ 🏠  ❤️  ✈️  💬  👤    │",
        "└─────────────────────────┘",
      ]} />

      <Wireframe title="Experience Builder" lines={[
        "┌─────────────────────┐",
        "│ ← Experience Builder│",
        "│ 🍽Food│🎨Decor│🎵DJ │",
        "│ Running: ₹1,200     │",
        "├─────────────────────┤",
        "│ 🍕 Pizza     ₹350   │",
        "│         [- 1 +]     │",
        "│ 🍔 Burger    ₹250   │",
        "│         [- 0 +]     │",
        "│ 🍺 Beer      ₹200   │",
        "│         [- 2 +]     │",
        "│ 🕯 Candles   ₹500   │",
        "│         [- 1 +]     │",
        "│ ╔══4 items ₹1,550══╗│",
        "│ ║  [Continue →]    ║│",
        "│ ╚═════════════════╝│",
        "└─────────────────────┘",
      ]} />

      <Wireframe title="Checkout Screen" lines={[
        "┌─────────────────────┐",
        "│ ← Checkout          │",
        "│ 📸 Villa Sunset     │",
        "│ Mar 25·Eve·4 Guests │",
        "│ ── Breakdown ──     │",
        "│ Base Slot    ₹2,500 │",
        "│ 🍕 Pizza ×1   ₹350 │",
        "│ 🕯 Candles     ₹500 │",
        "│ Subtotal     ₹3,350 │",
        "│ GST 18%        ₹603 │",
        "│ 🎟 [Coupon___] [Go] │",
        "│ Discount      -₹500 │",
        "│ ╔══TOTAL ₹3,453═══╗│",
        "│ ║ [Confirm Book →]║│",
        "│ ╚═════════════════╝│",
        "└─────────────────────┘",
      ]} />

      <Wireframe title="Search Screen" lines={[
        "┌─────────────────────┐",
        "│ [🔍 Search____] [×] │",
        "│ [🏠All][🏡Stay][🎭] │",
        "│ [✨Cur][🛎Svc][💼]  │",
        "│ ── Recent ──        │",
        "│ 🕐 'farmhouse'      │",
        "│ 🕐 'pool party'     │",
        "│ ── Results (3) ──   │",
        "│ ┌─────┐ ┌─────┐    │",
        "│ │Villa│ │Farm │    │",
        "│ │₹2.5K│ │₹1.8K│    │",
        "│ └─────┘ └─────┘    │",
        "│ 🏠 ❤️ ✈️ 💬 👤    │",
        "└─────────────────────┘",
      ]} />

      <Wireframe title="Map View" lines={[
        "┌─────────────────────┐",
        "│ ← Map View  [List📋]│",
        "│ ┌─ JEYPORE MAP ───┐ │",
        "│ │  📍Villa        │ │",
        "│ │      📍Farm     │ │",
        "│ │ 📍Pod      📍Rf │ │",
        "│ │     📍Pool      │ │",
        "│ └────────────────┘  │",
        "│ ┌══ Preview ══════┐ │",
        "│ │📸 Villa Sunset  │ │",
        "│ │⭐4.8 · ₹2,500  │ │",
        "│ │[View Details →] │ │",
        "│ └════════════════┘  │",
        "│ 🏠 ❤️ ✈️ 💬 👤    │",
        "└─────────────────────┘",
      ]} />

      <Wireframe title="Live Ordering Sheet" lines={[
        "┌─────────────────────┐",
        "│ ══╸  ╺══            │",
        "│ 🍽 Order Food   [×] │",
        "│ Villa · Active Trip │",
        "│ [All][🍕][🍺][🍿]  │",
        "├─────────────────────┤",
        "│ 🍕 Margherita  ₹350 │",
        "│     [Add to Cart]   │",
        "│ 🍔 Burger      ₹250 │",
        "│     [- 1 +]         │",
        "│ 🍺 Craft IPA   ₹200 │",
        "│     [Add to Cart]   │",
        "│ ╔══🛒 2·₹500══════╗│",
        "│ ║  [Place Order →] ║│",
        "│ ╚═════════════════╝│",
        "│ ── History ──       │",
        "│ #ORD-001 ₹750 ✅   │",
        "└─────────────────────┘",
      ]} />

      <Wireframe title="Loyalty & Spin Wheel" lines={[
        "┌─────────────────────┐",
        "│ ← Loyalty    1,240pt│",
        "│ ╔═══ 🥇 GOLD ═════╗│",
        "│ ║ 1,240/2,000 pts  ║│",
        "│ ║ ████████░░ 62%   ║│",
        "│ ║ Next: Platinum   ║│",
        "│ ╚═════════════════╝│",
        "│ ── Daily Spin ──    │",
        "│   [🎰 SPIN!]       │",
        "│ ── History ──       │",
        "│ +50 🎫 Booking      │",
        "│ +25 🎰 Spin         │",
        "│ -100 🎁 Redeemed    │",
        "│ ── Milestones ──    │",
        "│ 🌟 First Book ✅    │",
        "│ ⭐ 5★ Reviewer ✅   │",
        "│ 🏠 ❤️ ✈️ 💬 👤    │",
        "└─────────────────────┘",
      ]} />

      <Wireframe title="Admin Panel Layout" lines={[
        "┌─────────┬──────────────────────────┐",
        "│ SIDEBAR │    MAIN CONTENT AREA      │",
        "│ ┌─────┐ │  COMMAND CENTER           │",
        "│ │ 🏠  │ │  ┌────┐ ┌────┐ ┌────┐   │",
        "│ │Home │ │  │₹42K│ │ 28 │ │4.8★│   │",
        "│ │ 🤖  │ │  │Rev.│ │Book│ │Rate│   │",
        "│ │AI   │ │  └────┘ └────┘ └────┘   │",
        "│ │ 🔔  │ │  ┌─ Live Feed ────────┐  │",
        "│ │Alert│ │  │ ● New booking       │  │",
        "│ │ 🏠  │ │  │ ● Food order        │  │",
        "│ │Prop │ │  │ ● Review received   │  │",
        "│ │ 📦  │ │  └────────────────────┘  │",
        "│ │Inv  │ │                           │",
        "│ │ 👥  │ │  PROPERTIES       [+New] │",
        "│ │Users│ │  ┌──────┐ ┌──────┐      │",
        "│ │ 📊  │ │  │Villa │ │Farm  │      │",
        "│ │Stats│ │  │[Edit]│ │[Edit]│      │",
        "│ └─────┘ │  └──────┘ └──────┘      │",
        "└─────────┴──────────────────────────┘",
      ]} />

      <Wireframe title="Admin Client CRM" lines={[
        "┌─────────────────────────┐",
        "│ Priya Sharma    85/100  │",
        "│ Segment: VIP  [AddNote] │",
        "│ ┌────┬────┬────┬─────┐  │",
        "│ │ 12 │ 8  │₹42K│Gold │  │",
        "│ │Stay│Ordr│Spnt│Tier │  │",
        "│ └────┴────┴────┴─────┘  │",
        "│ ● Mar15 Villa ₹3,200    │",
        "│ ● Mar15 Ordered Maggie  │",
        "│ ● Mar16 Left 5★ review  │",
        "│ 📌 Prefers eve, veg     │",
        "│ 📝 Anniversary next mo  │",
        "└─────────────────────────┘",
      ]} />

      {/* ER Diagram */}
      <DocSection title="Database ER Diagram" icon={<Database size={15} className="text-primary" />}>
        <div className="font-mono text-[9px] space-y-0.5 p-3 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
          <p className="text-primary">auth.users ─┬─ profiles (1:1)</p>
          <p className="pl-10">├─ bookings → payments → refunds</p>
          <p className="pl-10">│         → invoices</p>
          <p className="pl-10">│         → orders → order_items</p>
          <p className="pl-10">│         → booking_splits, booking_photos</p>
          <p className="pl-10">├─ wishlists → host_listings</p>
          <p className="pl-10">├─ reviews → review_responses</p>
          <p className="pl-10">├─ conversations → messages</p>
          <p className="pl-10">├─ notifications, push_tokens, prefs</p>
          <p className="pl-10">├─ loyalty_transactions</p>
          <p className="pl-10">├─ referral_codes → referral_uses</p>
          <p className="pl-10">├─ user_roles, user_milestones</p>
          <p className="pl-10">└─ identity_verifications</p>
          <p className="text-primary mt-1">host_listings ─── curations · inventory · property_tags</p>
          <p className="pl-14">└─ property_slots → slot_availability</p>
          <p className="text-primary mt-1">staff_members ─── attendance · leaves · salary_payments</p>
        </div>
      </DocSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: DESKTOP & WEB
// ═══════════════════════════════════════════════════════════════
function DesktopTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(var(--primary) / 0.12) 0%, hsl(270 60% 50% / 0.08) 100%)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <p className="text-4xl mb-3">🖥️</p>
        <h2 className="text-xl font-black text-foreground tracking-tight">Desktop & Web Blueprint</h2>
        <p className="text-[11px] text-muted-foreground mt-2 max-w-[300px] mx-auto leading-relaxed">Desktop-specific features, responsive adaptations, and web platform capabilities built on top of the mobile-first foundation.</p>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {["Responsive", "Desktop Nav", "Widescreen", "Keyboard-First", "Multi-Panel"].map(tag => (
            <span key={tag} className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.15)" }}>{tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Desktop Navigation */}
      <div>
        <SectionHeader title="Desktop Navigation" subtitle="How navigation adapts for larger screens" />
        <div className="space-y-2">
          <FeatureRow icon={<Monitor size={13} className="text-blue-400" />} title="Top Navigation Bar (DesktopTopNav)" desc="Persistent horizontal nav replaces BottomNav at md+ breakpoint. Logo, search, category links, user avatar dropdown." badge="md+" />
          <FeatureRow icon={<Layout size={13} className="text-green-400" />} title="Multi-Panel Layouts" desc="Property detail uses side-by-side gallery + booking panel. Messages use split-pane (conversation list + chat thread)." badge="lg+" />
          <FeatureRow icon={<Layers size={13} className="text-amber-400" />} title="Admin Sidebar" desc="Collapsible sidebar with 22+ nav items, grouped into sections. Command Palette (⌘K) for instant navigation." />
          <FeatureRow icon={<Search size={13} className="text-cyan-400" />} title="Search Upgrade" desc="On desktop, search opens inline panel instead of full-screen overlay. Filter bar stays visible alongside results." />
        </div>
      </div>

      {/* Responsive Breakpoints */}
      <DocSection title="Responsive Breakpoints" icon={<Layout size={15} className="text-primary" />} defaultOpen>
        <DataTable headers={["Breakpoint", "Width", "Layout Changes"]} rows={[
          ["sm", "640px", "2-col grids, larger touch targets"],
          ["md", "768px", "DesktopTopNav replaces BottomNav, wider cards"],
          ["lg", "1024px", "3-col property grids, split-view panels"],
          ["xl", "1280px", "4-col grids, max-width containers, sidebar expand"],
          ["2xl", "1536px", "Max content width, generous whitespace"],
        ]} />
        <div className="mt-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
          <p className="text-[10px] text-muted-foreground"><strong className="text-foreground">Container strategy:</strong> <code className="text-primary">max-w-7xl mx-auto</code> on desktop. Pages use <code className="text-primary">px-4 md:px-8 lg:px-12</code> progressive padding.</p>
        </div>
      </DocSection>

      {/* Desktop Typography */}
      <DocSection title="Desktop Typography Scale" icon={<PenTool size={15} className="text-primary" />}>
        <DataTable headers={["Element", "Mobile", "Desktop (md+)", "Font"]} rows={[
          ["Page titles", "text-2xl", "text-3xl lg:text-4xl", "Space Grotesk"],
          ["Section headers", "text-base", "text-lg lg:text-xl", "Space Grotesk"],
          ["Card titles", "text-sm", "text-base", "Space Grotesk"],
          ["Body text", "text-[13px]", "text-sm", "Space Grotesk"],
          ["Splash brand", "text-[58px]", "md:text-[84px] lg:text-[104px] xl:text-[124px]", "Pacifico (cursive)"],
          ["Splash greeting", "text-[32px]", "md:text-5xl lg:text-6xl xl:text-7xl", "Playfair Display"],
        ]} />
      </DocSection>

      {/* Splash Screen */}
      <DocSection title="Cinematic Splash Screen" icon={<Sparkles size={15} className="text-primary" />} defaultOpen>
        <div className="space-y-3">
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Two Variants (Admin Toggle)</p>
            <DataTable headers={["Variant", "Style", "Backgrounds"]} rows={[
              ["1 — Classic", "3D metallic typography, spring letter flip", "4 time-of-day photos (mobile + desktop)"],
              ["2 — Cinematic (default)", "Island villa with H silhouette, underwater typography", "4 time-of-day illustrations (mobile 9:16 + desktop 16:9)"],
            ]} />
          </div>
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Time-of-Day Assets</p>
            <DataTable headers={["Time", "Hours", "Mobile Asset", "Desktop Asset"]} rows={[
              ["Dawn ☀️", "05:00–11:59", "splash2-dawn-v2.jpg", "splash2-dawn-v2-desktop.jpg"],
              ["Day 🌤️", "12:00–16:59", "splash2-day-v2.jpg", "splash2-day-v2-desktop.jpg"],
              ["Dusk 🌅", "17:00–20:59", "splash2-dusk-v2.jpg", "splash2-dusk-v2-desktop.jpg"],
              ["Night 🌙", "21:00–04:59", "splash2-night-v2.jpg", "splash2-night-v2-desktop.jpg"],
            ]} />
          </div>
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Atmospheric Animations</p>
            <div className="flex flex-wrap gap-1.5">
              {["Fireflies (16-20 particles)", "Shooting Stars (3×)", "Flying Birds (5 SVG)", "Floating Lanterns (5×)", "Twinkling Stars (20×)", "Sun Rays", "Drifting Clouds"].map(e => (
                <span key={e} className="text-[9px] px-2 py-1 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      {/* Wallpaper Gallery */}
      <DocSection title="Wallpaper Gallery (Easter Egg)" icon={<Award size={15} className="text-primary" />}>
        <div className="space-y-2">
          <FeatureRow icon={<Download size={13} className="text-purple-400" />} title="Downloadable Wallpapers" desc="16 wallpapers: 8 phone (9:16) + 8 desktop (16:9), spanning Classic and Cinematic variants across all time-of-day themes." badge="🥚" />
          <FeatureRow icon={<ImageIcon size={13} className="text-blue-400" />} title="App Icon Download" desc="PWA icon (512×512) available as a standalone download from the gallery." />
          <FeatureRow icon={<Globe size={13} className="text-green-400" />} title="Direct URL Access" desc="/wallpapers route — accessible on both mobile and desktop without Easter egg trigger." />
          <div className="p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
            <p className="text-[10px] text-muted-foreground"><strong className="text-foreground">Filters:</strong> All / Classic / Cinematic × All Sizes / Phone / Desktop. Tap any wallpaper to download.</p>
          </div>
        </div>
      </DocSection>

      {/* Desktop Grid Layouts */}
      <DocSection title="Desktop Grid Patterns" icon={<Boxes size={15} className="text-primary" />}>
        <DataTable headers={["Component", "Mobile", "Tablet (md)", "Desktop (lg+)"]} rows={[
          ["Property cards", "grid-cols-2", "grid-cols-3", "grid-cols-4 lg:grid-cols-5"],
          ["Curation grid", "scroll-x", "grid-cols-3", "grid-cols-4"],
          ["Wishlist grid", "grid-cols-2", "grid-cols-3", "grid-cols-4"],
          ["Admin tables", "card list", "data table", "data table + filters sidebar"],
          ["Stats grid", "grid-cols-2", "grid-cols-3", "grid-cols-4"],
          ["Wallpaper phone", "grid-cols-2", "grid-cols-3", "grid-cols-4 lg:grid-cols-5"],
          ["Wallpaper desktop", "grid-cols-1", "grid-cols-2", "grid-cols-3"],
        ]} />
      </DocSection>

      {/* Mouse & Keyboard */}
      <DocSection title="Mouse & Keyboard Interactions" icon={<PenTool size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "Hover States", desc: "Property cards: scale-105 + shadow-lg on hover. Wallpaper cards show download overlay. Buttons show opacity/scale transitions." },
            { title: "Keyboard Shortcuts", desc: "⌘K: Command Palette (Admin). Esc: Close modals/sheets. Tab: Focus navigation. Enter: Confirm actions." },
            { title: "Cursor Styles", desc: "pointer on clickables, grab on draggable elements, text on selectable content." },
            { title: "whileHover vs whileTap", desc: "Desktop uses whileHover={{ scale: 1.05 }}. Mobile uses whileTap={{ scale: 0.95 }}. Both coexist via Framer Motion." },
            { title: "Right-Click Context", desc: "Admin panel: context menus on property rows and booking cards for quick actions." },
          ].map(p => (
            <div key={p.title} className="flex gap-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <div>
                <p className="font-bold text-foreground text-xs">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Sheet → Modal Adaptation */}
      <DocSection title="Sheet → Modal Adaptation" icon={<Layers size={15} className="text-primary" />}>
        <DataTable headers={["Component", "Mobile (< md)", "Desktop (md+)"]} rows={[
          ["Settings", "Bottom sheet (Vaul)", "Side sheet / Dialog"],
          ["Edit Profile", "Bottom sheet", "Centered modal"],
          ["Live Ordering", "Bottom sheet", "Side panel"],
          ["Checkout", "Full screen", "Right panel + summary"],
          ["Search", "Full screen overlay", "Inline dropdown panel"],
          ["Map View", "Full screen", "Split-pane (list + map)"],
          ["Wallpapers", "Full screen overlay", "Full page (/wallpapers)"],
        ]} />
      </DocSection>

      {/* Easter Eggs */}
      <DocSection title="Easter Eggs & Hidden Features" icon={<Award size={15} className="text-primary" />}>
        <DataTable headers={["Trigger", "Location", "Result"]} rows={[
          ["Tap version 5× in 2s", "Profile tab, bottom", "Full in-app documentation overlay with wallpaper gallery"],
          ["Visit /wallpapers", "Direct URL", "Public wallpaper download page"],
        ]} />
      </DocSection>

      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground"><Monitor size={10} className="inline text-primary mr-1" />Desktop Blueprint v1.36 · Responsive architecture reference</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: MOBILE & RESPONSIVE
// ═══════════════════════════════════════════════════════════════
function MobileTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, hsl(var(--primary) / 0.12) 0%, hsl(270 60% 50% / 0.08) 100%)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <p className="text-4xl mb-3">📱</p>
        <h2 className="text-xl font-black text-foreground tracking-tight">Mobile & Responsive Blueprint</h2>
        <p className="text-[11px] text-muted-foreground mt-2 max-w-[300px] mx-auto leading-relaxed">Everything done to make Hushh a native-quality mobile experience — use this as the reference for building the web/desktop version.</p>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {["Mobile-First", "PWA", "Capacitor", "Touch-Optimized", "Offline-Ready"].map(tag => (
            <span key={tag} className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.15)" }}>{tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Distribution Strategy */}
      <div>
        <SectionHeader title="Distribution Strategy" subtitle="How users access the app on mobile" />
        <div className="space-y-2">
          <FeatureRow icon={<Globe size={13} className="text-blue-400" />} title="PWA (Progressive Web App)" desc="VitePWA with autoUpdate, service worker caching, installable from browser. Manifest: standalone, portrait, icons 192+512." badge="Primary" />
          <FeatureRow icon={<Smartphone size={13} className="text-green-400" />} title="Capacitor Native Shell" desc="appId: app.lovable.hushhjeypore. WebView loads live URL — changes deploy instantly without rebuilding APK." badge="Android" />
          <FeatureRow icon={<Zap size={13} className="text-amber-400" />} title="GitHub Actions CI/CD" desc="Automated APK builds on push to main. Java 21, Gradle 8.14, debug APK artifact upload." />
          <FeatureRow icon={<Wifi size={13} className="text-cyan-400" />} title="Live-Reload Dev Mode" desc="server.url points to Lovable preview for hot-reload during development. Stripped at build time for standalone APK." />
        </div>
      </div>

      {/* Viewport & Layout */}
      <DocSection title="Viewport & Layout Strategy" icon={<Layout size={15} className="text-primary" />} defaultOpen>
        <div className="space-y-3">
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Core Viewport Rules</p>
            <DataTable headers={["Rule", "Value", "Why"]} rows={[
              ["viewport meta", "width=device-width, initial-scale=1.0", "Proper scaling on all devices"],
              ["max-width: 100%", "html, body, #root", "Prevent horizontal overflow"],
              ["overflow-x: hidden", "html, body, #root", "Block sideways drift from 3D transforms"],
              ["overscroll-behavior-x: none", "html, body, #root", "Disable rubber-band horizontal scroll"],
              ["orientation", "portrait (manifest)", "Lock PWA to portrait"],
              ["display", "standalone (manifest)", "Full-screen app experience"],
            ]} />
          </div>
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Primary Design Target</p>
            <div className="p-3 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">390 × 844px</strong> (iPhone 14/15 logical) — all components designed for this viewport first, then tested on 360px (Android) and 428px (iPhone Pro Max).</p>
              <p className="text-[11px] text-muted-foreground mt-1"><strong className="text-foreground">Safe areas:</strong> Bottom nav accounts for iOS home indicator. Status bar uses <code className="text-primary">apple-mobile-web-app-status-bar-style: black-translucent</code>.</p>
            </div>
          </div>
        </div>
      </DocSection>

      {/* Responsive Patterns */}
      <DocSection title="Responsive Layout Patterns" icon={<Layers size={15} className="text-primary" />} defaultOpen>
        <div className="space-y-2">
          {[
            { title: "Single Column Stack", desc: "All primary screens use a single-column vertical scroll. No side-by-side panels on mobile.", screens: "Home, Profile, Trips, Messages, Booking Detail" },
            { title: "Grid Adapts to 2-col", desc: "Property cards, stats grids, Four Pillars all use grid-cols-2 at mobile. Curation cards use horizontal scroll.", screens: "Home cards, Profile stats, Wishlist grid" },
            { title: "Bottom Sheet Pattern", desc: "All modals use Vaul drawer (bottom sheet) instead of centered dialogs. Natural thumb-reach zone.", screens: "Settings, Edit Profile, Split Pay, Live Ordering, Identity Upload" },
            { title: "Sticky Elements", desc: "Bottom nav (fixed), sticky category bar (top), sticky booking CTA bar (bottom) on Property Detail.", screens: "BottomNav, CategoryBar, PropertyDetail" },
            { title: "Full-Screen Overlays", desc: "Search, Map View, Documentation all render as full-screen overlays with back navigation.", screens: "SearchScreen, MapViewScreen, AppDocumentation" },
            { title: "Horizontal Scroll Carousels", desc: "Spotlight, Foodie, Sports, Achievements, Curations all use embla-carousel or CSS overflow-x-auto snap scrolling.", screens: "SpotlightCarousel, FoodieCarousel, Achievements" },
          ].map(p => (
            <div key={p.title} className="p-3 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <p className="font-bold text-foreground text-xs">{p.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              <p className="text-[9px] text-primary mt-1 font-medium">Used in: {p.screens}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Touch & Interaction */}
      <DocSection title="Touch & Interaction Design" icon={<PenTool size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "44px Minimum Touch Targets", desc: "All buttons, nav items, and interactive elements meet the 44×44px minimum. Bottom nav icons are 48px zones." },
            { title: "Haptic Feedback", desc: "lib/haptics.ts provides vibration on booking confirm, spin wheel, toggle switches, and pull-to-refresh. Uses navigator.vibrate API." },
            { title: "Swipe Gestures", desc: "Message conversations support swipe-to-archive. Property gallery uses touch-drag carousel. Pull-to-refresh on Home screen." },
            { title: "Tap-Hold Actions", desc: "Property cards support long-press for quick preview. Admin SwipeableRow for delete/edit actions." },
            { title: "Framer Motion Springs", desc: "All animations use spring physics (stiffness: 300, damping: 30) for natural iOS-like motion. whileTap={{ scale: 0.95 }} on all buttons." },
            { title: "Scroll Snap", desc: "Horizontal carousels use CSS scroll-snap-type: x mandatory for card-by-card paging feel." },
          ].map(p => (
            <div key={p.title} className="flex gap-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <div>
                <p className="font-bold text-foreground text-xs">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Typography & Spacing */}
      <DocSection title="Mobile Typography Scale" icon={<PenTool size={15} className="text-primary" />}>
        <DataTable headers={["Element", "Size", "Weight", "Font"]} rows={[
          ["Page titles", "text-2xl (24px)", "font-black (900)", "Space Grotesk"],
          ["Section headers", "text-base (16px)", "font-black (900)", "Space Grotesk"],
          ["Card titles", "text-sm (14px)", "font-bold (700)", "Space Grotesk"],
          ["Body text", "text-[13px]", "font-medium (500)", "Space Grotesk"],
          ["Labels & badges", "text-[11px]", "font-bold (700)", "DM Sans"],
          ["Micro text", "text-[9px]–text-[10px]", "font-medium (500)", "DM Sans"],
          ["Editorial overlays", "text-lg–text-2xl", "font-bold (700)", "Playfair Display"],
        ]} />
        <div className="mt-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
          <p className="text-[10px] text-muted-foreground"><strong className="text-foreground">Spacing system:</strong> Tailwind default scale. Cards use p-3 to p-4 (12–16px). Gaps between sections use space-y-4 to space-y-6. Horizontal padding on screens: px-4 (16px).</p>
        </div>
      </DocSection>

      {/* Aspect Ratios & Media */}
      <DocSection title="Aspect Ratios & Media" icon={<Eye size={15} className="text-primary" />}>
        <DataTable headers={["Element", "Aspect Ratio", "Details"]} rows={[
          ["Property card images", "16:10 (aspect-[16/10])", "Rounded-2xl, object-cover, lazy loading"],
          ["Spotlight video cards", "16:9", "Autoplay, muted, loop, playsInline, poster fallback"],
          ["Gallery carousel", "4:3", "Full-width swipe, dot indicators"],
          ["Avatar images", "1:1 (rounded-full)", "w-10 to w-20 depending on context"],
          ["Curated pack bg video", "Full-screen", "Absolute positioned, object-cover, z-0"],
          ["Map view", "Full-viewport", "Leaflet container takes remaining height after header"],
          ["Spin wheel", "1:1 (300×300)", "Canvas-rendered, centered"],
        ]} />
      </DocSection>

      {/* Theme System */}
      <DocSection title="Dual Theme System" icon={<Palette size={15} className="text-primary" />}>
        <div className="space-y-3">
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">HSL-Based CSS Variables</p>
            <p className="text-[11px] text-muted-foreground">All colors defined as HSL in <code className="text-primary">index.css</code> under <code className="text-primary">:root</code> (dark) and <code className="text-primary">.light</code>. Components use semantic tokens only — never hardcoded colors.</p>
          </div>
          <DataTable headers={["Token", "Dark Mode", "Light Mode"]} rows={[
            ["--background", "260 20% 6%", "260 20% 98%"],
            ["--foreground", "0 0% 96%", "260 25% 12%"],
            ["--primary", "270 80% 65%", "270 72% 52%"],
            ["--card", "260 18% 10%", "0 0% 100%"],
            ["--muted", "260 12% 16%", "260 14% 94%"],
            ["--border", "260 15% 16%", "260 16% 90%"],
          ]} />
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Theme-Aware Effects</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "glass / glass-light classes",
                "glow-sm/md/lg adapts",
                "shadow-card/elevated adapts",
                "Gradient text adjusts",
                "0.4s transition on switch",
              ].map(e => (
                <span key={e} className="text-[9px] px-2 py-1 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      {/* Performance */}
      <DocSection title="Mobile Performance Optimizations" icon={<Zap size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "Service Worker Caching", desc: "Workbox with NetworkFirst for API, CacheFirst for static assets. 10MB max cache per file. Auto-update on new deploy." },
            { title: "Font Loading Strategy", desc: "4 Google Fonts preloaded with rel='preload' as='style' + onload pattern. Non-render-blocking with <noscript> fallback." },
            { title: "LazySection Component", desc: "Home screen sections wrapped in IntersectionObserver — only render when scrolled into viewport. Reduces initial DOM size." },
            { title: "Image Optimization", desc: "OptimizedImage component with native lazy loading, blur-up placeholder, error fallback. All images use object-cover." },
            { title: "Video Preloading", desc: "lib/video-preloader.ts preloads spotlight videos. All videos use playsInline + muted + loop for autoplay policy compliance." },
            { title: "React Query Cache", desc: "30s staleTime, 2× retry with exponential backoff. Prevents waterfall re-fetches on tab switches." },
            { title: "Critical Preconnects", desc: "fonts.googleapis.com, fonts.gstatic.com, supabase.co — DNS prefetch + preconnect in <head>." },
            { title: "Inline Splash", desc: "HTML-inline splash screen (no JS needed) for instant FCP. Replaced by React SplashScreen component." },
          ].map(p => (
            <div key={p.title} className="flex gap-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <div>
                <p className="font-bold text-foreground text-xs">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Capacitor Config */}
      <DocSection title="Capacitor Native Configuration" icon={<Smartphone size={15} className="text-primary" />}>
        <DataTable headers={["Config", "Value", "Notes"]} rows={[
          ["appId", "app.lovable.hushhjeypore", "Java package format for Android"],
          ["appName", "hushh-jeypore", "Display name on device"],
          ["webDir", "dist", "Vite build output"],
          ["server.url", "lovableproject.com preview", "Live URL — instant updates"],
          ["server.cleartext", "true", "Allow HTTP during dev"],
        ]} />
        <div className="mt-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
          <p className="text-[10px] text-muted-foreground"><strong className="text-foreground">Build pipeline:</strong> GitHub Actions → npm install → npm run build → cap add android → cap sync → gradlew assembleDebug → upload APK artifact</p>
        </div>
      </DocSection>

      {/* Native Caching & WebView Tuning */}
      <DocSection title="Native-Grade Caching & Performance" icon={<Zap size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "Native Data Cache", desc: "Capacitor Preferences stores API responses with TTL. Stale-while-revalidate pattern — shows cached data instantly, revalidates in background." },
            { title: "Prefetch on Launch", desc: "On native cold start, listings, curations, packages, and app_config are fetched and cached before React renders." },
            { title: "CapacitorHttp", desc: "Native HTTP stack bypasses WebView CORS. Direct native networking = faster API calls, no cookie/header overhead." },
            { title: "WebView Tuning", desc: "androidScheme:'https', allowMixedContent:true, captureInput:true. Background color #050505 eliminates white flash." },
            { title: "Keyboard Config", desc: "resize:'body' with resizeOnFullScreen — inputs stay visible when keyboard opens, no layout reflow." },
            { title: "SplashScreen", desc: "CENTER_CROP scale type for edge-to-edge splash. Zero duration auto-hide — React takes over instantly." },
          ].map(p => (
            <div key={p.title} className="flex gap-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <div>
                <p className="font-bold text-foreground text-xs">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 p-2.5 rounded-xl font-mono text-[9px]" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)", color: "hsl(var(--muted-foreground))" }}>
          App Launch → initNativePlugins() → prefetchCriticalData() → React render (cached data available) → background revalidation
        </div>
      </DocSection>
      <DocSection title="PWA Configuration" icon={<Globe size={15} className="text-primary" />}>
        <DataTable headers={["Property", "Value"]} rows={[
          ["name", "Hushh Jeypore"],
          ["short_name", "Hushh"],
          ["display", "standalone"],
          ["orientation", "portrait"],
          ["theme_color", "#050505"],
          ["background_color", "#050505"],
          ["start_url", "/"],
          ["scope", "/"],
          ["registerType", "autoUpdate"],
          ["icons", "192×192 + 512×512 (any maskable)"],
          ["navigateFallbackDenylist", "/sw-push.js"],
        ]} />
      </DocSection>

      {/* Offline Behavior */}
      <DocSection title="Offline & Resilience" icon={<Wifi size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "OfflineBanner", desc: "Animated banner appears when navigator.onLine is false. Uses useOnlineStatus hook with event listeners." },
            { title: "Error Boundaries", desc: "Per-route React Error Boundaries catch component crashes without killing the whole app." },
            { title: "Graceful Degradation", desc: "Guest mode works entirely offline with mock data. Auth features show friendly error messages." },
            { title: "Retry Strategy", desc: "React Query retries failed requests 2× with exponential backoff before showing error state." },
          ].map(p => (
            <div key={p.title} className="flex gap-2 p-2.5 rounded-xl" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border) / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <div>
                <p className="font-bold text-foreground text-xs">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Component Navigation */}
      <DocSection title="Mobile Navigation Architecture" icon={<MapPin size={15} className="text-primary" />}>
        <div className="space-y-3">
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Bottom Navigation (5 tabs)</p>
            <DataTable headers={["Tab", "Icon", "Screen"]} rows={[
              ["Explore", "🏠 Home", "HomeScreen — feed, search, categories"],
              ["Wishlists", "❤️ Heart", "WishlistScreen — saved properties grid"],
              ["Trips", "✈️ Plane", "TripsScreen — active/upcoming/past/cancelled"],
              ["Messages", "💬 Chat", "MessagesScreen — conversations + chat"],
              ["Profile", "👤 User", "ProfileScreen — settings, loyalty, host"],
            ]} />
          </div>
          <div>
            <p className="font-bold text-foreground text-xs mb-1.5">Navigation Patterns</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "State machine (not router)",
                "Back button via onBack prop",
                "Sheet/drawer for settings",
                "Full-screen for search/map",
                "Nested detail views",
                "Tab memory preserved",
              ].map(e => (
                <span key={e} className="text-[9px] px-2 py-1 rounded-full font-medium" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      {/* Web Version Prompts */}
      <DocSection title="🤖 AI Prompts for Web/Desktop Version" icon={<Cpu size={15} className="text-primary" />}>
        <div className="space-y-2">
          {[
            { title: "Layout Expansion", prompt: "Convert single-column mobile layout to multi-panel desktop: sidebar navigation (replace bottom nav), main content area, and optional right panel for details/chat. Use Tailwind lg: breakpoints." },
            { title: "Navigation Upgrade", prompt: "Replace BottomNav with a persistent left sidebar (collapsible) for desktop. Add breadcrumbs. Convert full-screen overlays (search, map) to panels within the main layout." },
            { title: "Grid Scaling", prompt: "Scale property card grids from 2-col (mobile) to 3-col (tablet) to 4-col (desktop). Increase card size proportionally. Add hover states (scale, shadow) that replace tap states." },
            { title: "Bottom Sheets → Modals", prompt: "Convert all Vaul bottom sheet dialogs to centered Dialog modals for desktop. Keep bottom sheet behavior for mobile using useMobile() hook conditional." },
            { title: "Table Views", prompt: "Admin panel: convert card-based mobile lists to full data tables with sorting, filtering, and pagination for desktop viewport. Use shadcn Table component." },
            { title: "Split View", prompt: "Messages: implement split-pane layout — conversation list on left (300px), chat thread on right. Property Detail: sticky image gallery on left, info/booking on right." },
            { title: "Responsive Typography", prompt: "Scale up: page titles to text-3xl, section headers to text-xl, body to text-sm. Increase spacing: px-8 on desktop, max-w-7xl container. Keep mobile sizes at current scale." },
            { title: "Mouse Interactions", prompt: "Add hover:scale-105, hover:shadow-lg on property cards. Replace whileTap with whileHover. Add keyboard shortcuts (Esc to close, Enter to confirm). Cursor: pointer on clickables." },
          ].map(p => (
            <div key={p.title} className="p-3 rounded-xl" style={{ background: "hsl(var(--primary) / 0.04)", border: "1px solid hsl(var(--primary) / 0.1)" }}>
              <p className="font-bold text-foreground text-xs mb-1">{p.title}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">{p.prompt}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground"><Smartphone size={10} className="inline text-primary mr-1" />Mobile Blueprint v1.35 · Reference for web expansion</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: WALLPAPERS
// ═══════════════════════════════════════════════════════════════
function WallpapersTab() {
  const [filter, setFilter] = useState<"all" | "classic" | "cinematic">("all");
  const [format, setFormat] = useState<"all" | "phone" | "desktop">("all");

  const filtered = wallpapers.filter(
    (w) => (filter === "all" || w.variant === filter) && (format === "all" || w.format === format)
  );
  const phoneItems = filtered.filter((w) => w.format === "phone");
  const desktopItems = filtered.filter((w) => w.format === "desktop");

  const downloadImage = async (src: string, filename: string) => {
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
      active ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-6">
      <SectionHeader title="Hushh Wallpapers" subtitle="Download splash screens and app assets" />

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5" style={{ background: "hsl(var(--primary) / 0.04)", borderRadius: "16px", padding: "8px" }}>
        <button className={pillClass(filter === "all")} onClick={() => setFilter("all")}>All</button>
        <button className={pillClass(filter === "classic")} onClick={() => setFilter("classic")}>🎨 Classic</button>
        <button className={pillClass(filter === "cinematic")} onClick={() => setFilter("cinematic")}>🏝️ Cinematic</button>
        <div className="w-px h-5 self-center mx-1" style={{ background: "hsl(var(--border))" }} />
        <button className={pillClass(format === "all")} onClick={() => setFormat("all")}>All</button>
        <button className={pillClass(format === "phone")} onClick={() => setFormat("phone")}>📱</button>
        <button className={pillClass(format === "desktop")} onClick={() => setFormat("desktop")}>🖥️</button>
      </div>

      {/* App Icon */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <ImageIcon size={12} /> App Icon
        </p>
        <div
          className="w-24 h-24 rounded-[20px] overflow-hidden shadow-2xl cursor-pointer group relative"
          onClick={() => downloadImage(appIconAsset.src, "hushh-app-icon.png")}
        >
          <img src={appIconAsset.src} alt="Hushh Icon" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Download size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Phone Wallpapers */}
      {(format === "all" || format === "phone") && phoneItems.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Smartphone size={12} /> Phone Wallpapers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {phoneItems.map((w) => (
              <div
                key={w.id}
                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[9/16]"
                onClick={() => downloadImage(w.src, `hushh-${w.id}.${w.src.includes(".webp") ? "webp" : "jpg"}`)}
              >
                <img src={w.src} alt={w.label} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 inset-x-0 p-2 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div>
                    <p className="text-[10px] font-semibold text-white">{w.emoji} {w.label}</p>
                    <p className="text-[8px] text-white/60">{w.variant}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsla(0,0%,100%,0.2)", backdropFilter: "blur(4px)" }}>
                    <Download size={10} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Wallpapers */}
      {(format === "all" || format === "desktop") && desktopItems.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Monitor size={12} /> Desktop Wallpapers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {desktopItems.map((w) => (
              <div
                key={w.id}
                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-video"
                onClick={() => downloadImage(w.src, `hushh-${w.id}.${w.src.includes(".webp") ? "webp" : "jpg"}`)}
              >
                <img src={w.src} alt={w.label} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 inset-x-0 p-2 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div>
                    <p className="text-[10px] font-semibold text-white">{w.emoji} {w.label}</p>
                    <p className="text-[8px] text-white/60">{w.variant}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsla(0,0%,100%,0.2)", backdropFilter: "blur(4px)" }}>
                    <Download size={10} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground py-4">
        🤫 Tap any wallpaper to download
      </p>
    </div>
  );
}

// TAB: CHANGELOG
// ═══════════════════════════════════════════════════════════════
function ChangelogTab() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Change History" subtitle={`${changeLog.length} versions from v1.0 to v1.36`} />
      
      <div className="relative pl-4">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-full" style={{ background: "hsl(var(--primary) / 0.15)" }} />
        
        {changeLog.slice().reverse().map((phase, i) => (
          <motion.div key={phase.version} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="relative mb-4 pl-5">
            {/* Dot */}
            <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.2)", border: "2px solid hsl(var(--primary))" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            
            <div className="rounded-2xl p-3.5" style={{ background: "hsl(var(--primary) / 0.03)", border: "1px solid hsl(var(--primary) / 0.08)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>v{phase.version}</span>
                <span className="text-xs font-bold text-foreground">{phase.phase}</span>
              </div>
              <ul className="space-y-0.5">
                {phase.items.map((item, j) => (
                  <li key={j} className="text-[11px] text-muted-foreground flex gap-1.5">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GENERATE FULL DOC (for copy)
// ═══════════════════════════════════════════════════════════════
function generateFullDoc(): string {
  const header = `# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.35 | Internal Documentation & Blueprint

Hushh is a premium mobile-first marketplace for booking private experiences, stays, and curated lifestyle services in Jeypore, India.

## Core Stats
- 80+ Components | 27 Custom Hooks | 45 DB Tables | 6 Edge Functions
- 15 User Screens | 22 Admin Pages | 7 Staff Tabs

## Four Pillars
- **Stays**: Farmhouses, Villas, Work Pods, Rooftops, Pool Houses
- **Experiences**: Candlelight Dinners, Parties, Bonfires, Heritage Walks
- **Services**: Chef-on-Call, Decor, DJ, Rides, Staff
- **Curations**: Date Night Deluxe, Birthday Bash, Corporate Retreat

## Tech Stack
React 18 · TypeScript · Vite 8 · Tailwind CSS 3 · shadcn/ui · Framer Motion · React Query · React Router v6 · Lovable Cloud · Recharts · RHF + Zod

---

## 📱 Mobile & Responsive Blueprint

### Distribution
- **PWA**: VitePWA autoUpdate, service worker, installable, standalone portrait
- **Capacitor**: app.lovable.hushhjeypore, WebView loads live URL, instant updates
- **CI/CD**: GitHub Actions → debug APK on every push to main

### Viewport & Layout
- Target: 390×844px (iPhone 14/15). Tested on 360px (Android) and 428px (Pro Max)
- overflow-x: hidden + overscroll-behavior-x: none on html/body/#root
- Single-column stack, 2-col grids, bottom sheets (not dialogs), sticky nav

### Touch & Interaction
- 44px minimum touch targets, haptic feedback (navigator.vibrate)
- Framer Motion springs (stiffness: 300, damping: 30), whileTap scale 0.95
- Swipe gestures on messages, pull-to-refresh, scroll-snap carousels

### Typography Scale
- Titles: 24px/900 Space Grotesk | Headers: 16px/900 | Cards: 14px/700
- Labels: 11px/700 DM Sans | Micro: 9-10px | Editorial: Playfair Display

### Aspect Ratios
- Property cards: 16:10 | Spotlight video: 16:9 | Gallery: 4:3
- Avatars: 1:1 | Pack bg: full-screen | Spin wheel: 300×300

### Theme System
- HSL variables in :root (dark) and .light class
- Semantic tokens only — no hardcoded colors in components
- glass/glow/shadow utilities adapt per theme, 0.4s transition

### Performance
- Service worker: NetworkFirst API, CacheFirst static, 10MB limit
- Fonts: preload + non-render-blocking pattern
- LazySection (IntersectionObserver), OptimizedImage, video preloader
- Inline HTML splash for instant FCP, React Query 30s stale + 2× retry

### Navigation
- Bottom nav: 5 tabs (Explore, Wishlists, Trips, Messages, Profile)
- State machine navigation (not router), sheet/drawer for settings
- Full-screen overlays for search/map, nested detail views

### AI Prompts for Web/Desktop Conversion
1. Convert single-column to multi-panel: sidebar nav, main content, detail panel
2. Replace BottomNav with persistent left sidebar, add breadcrumbs
3. Scale grids: 2→3→4 columns, add hover states replacing tap
4. Bottom sheets → centered Dialogs on desktop, keep sheets on mobile
5. Card lists → data tables with sorting/filtering/pagination
6. Split-pane: messages list+chat, property gallery+info
7. Scale typography: titles 3xl, headers xl, body sm, px-8, max-w-7xl
8. Add hover:scale-105, keyboard shortcuts, cursor:pointer

---

`;
  const changes = changeLog.map(p => `### v${p.version} — ${p.phase}\n${p.items.map(i => `- ${i}`).join("\n")}`).join("\n\n");
  return header + changes;
}

// ═══════════════════════════════════════════════════════════════
// GENERATE PDF HTML (beautiful styled PDF matching app dark theme)
// ═══════════════════════════════════════════════════════════════
function generatePDFHtml(): string {
  const tables = [
    ["profiles", "User profiles"], ["bookings", "Booking records"], ["wishlists", "Saved properties"],
    ["conversations", "Chat threads"], ["messages", "Chat messages"], ["notifications", "Push alerts"],
    ["reviews", "Reviews"], ["review_responses", "Host replies"], ["loyalty_transactions", "Point ledger"],
    ["referral_codes", "Referral codes"], ["referral_uses", "Code usage"], ["host_listings", "Property listings"],
    ["curations", "Experience packs"], ["orders", "In-stay orders"], ["order_items", "Order line items"],
    ["order_notes", "Staff notes"], ["spin_history", "Spin results"], ["user_milestones", "Achievements"],
    ["user_roles", "RBAC roles"], ["app_config", "Runtime settings"], ["inventory", "Stock management"],
    ["experience_packages", "Add-on packages"], ["coupons", "Discount codes"], ["campaigns", "Marketing"],
    ["expenses", "Expense tracking"], ["budget_allocations", "Budget planning"], ["staff_members", "Staff directory"],
    ["staff_tasks", "Task tracking"], ["staff_attendance", "Attendance"], ["staff_leaves", "Leave requests"],
    ["staff_salary_payments", "Payroll"], ["audit_logs", "Activity audit"], ["client_notes", "CRM notes"],
    ["booking_photos", "Guest photos"], ["booking_splits", "Split payments"], ["identity_verifications", "ID verification"],
    ["property_tags", "Tag definitions"], ["tag_assignments", "Tag mappings"], ["payments", "Payment tracking"],
    ["refunds", "Refund management"], ["invoices", "Invoice generation"], ["property_slots", "Slot management"],
    ["slot_availability", "Per-date availability"], ["notification_preferences", "Notification control"],
    ["push_tokens", "FCM tokens"],
  ];

  const changelog = changeLog.map(p => `<div class="version-block"><div class="version-badge">v${p.version}</div><div class="version-title">${p.phase}</div><ul>${p.items.map(i => `<li>${i}</li>`).join("")}</ul></div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hushh Documentation v1.36</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&family=Pacifico&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Space Grotesk',sans-serif;color:#e2e1f0;background:#0a0918;padding:40px;font-size:11px;line-height:1.6;}
h1{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;color:#fff;margin-bottom:4px;}
h2{font-size:18px;font-weight:700;color:#a78bfa;margin:32px 0 14px;padding-bottom:8px;border-bottom:2px solid rgba(167,139,250,0.2);letter-spacing:-0.3px;}
h3{font-size:13px;font-weight:700;color:#e2e1f0;margin:18px 0 8px;letter-spacing:-0.2px;}
.subtitle{color:#8b8aa0;font-size:13px;margin-bottom:20px;}
.hero{background:linear-gradient(160deg,rgba(124,58,237,0.2) 0%,rgba(139,92,246,0.08) 50%,rgba(15,12,40,0.9) 100%);border-radius:20px;padding:36px;text-align:center;margin-bottom:36px;border:1px solid rgba(167,139,250,0.2);position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:-50px;right:-50px;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,0.15),transparent 70%);border-radius:50%;}
.hero::after{content:'';position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%);border-radius:50%;}
.hero h1{font-size:42px;background:linear-gradient(135deg,#a78bfa,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.hero .brand-name{font-family:'Pacifico',cursive;font-size:48px;color:#a78bfa;display:block;margin-bottom:4px;}
.hero .emoji{font-size:48px;margin-bottom:8px;}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;}
.stat-card{background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.15);border-radius:14px;padding:14px;text-align:center;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:-10px;right:-10px;width:40px;height:40px;background:radial-gradient(circle,rgba(167,139,250,0.1),transparent 70%);border-radius:50%;}
.stat-card .value{font-size:26px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.stat-card .label{font-size:8px;color:#8b8aa0;text-transform:uppercase;letter-spacing:1.2px;margin-top:3px;font-weight:600;}
.pillar{display:inline-block;background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.12);border-radius:10px;padding:8px 14px;margin:4px;font-size:10px;}
.pillar strong{color:#a78bfa;}
table{width:100%;border-collapse:separate;border-spacing:0;margin:10px 0;font-size:10px;border-radius:10px;overflow:hidden;border:1px solid rgba(167,139,250,0.12);}
th{background:rgba(124,58,237,0.3);color:#c4b5fd;padding:8px 12px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;}
td{padding:6px 12px;border-bottom:1px solid rgba(167,139,250,0.06);color:#c7c6d7;}
tr:nth-child(even){background:rgba(167,139,250,0.03);}
tr:hover{background:rgba(167,139,250,0.06);}
code{font-family:'Space Grotesk',monospace;color:#a78bfa;background:rgba(167,139,250,0.1);padding:1px 5px;border-radius:4px;font-size:9px;}
.feature-row{display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-bottom:1px solid rgba(167,139,250,0.06);border-radius:8px;margin:3px 0;}
.feature-row:hover{background:rgba(167,139,250,0.04);}
.feature-dot{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);margin-top:4px;flex-shrink:0;box-shadow:0 0 6px rgba(167,139,250,0.3);}
.feature-title{font-weight:700;color:#e2e1f0;font-size:11px;}
.feature-desc{color:#8b8aa0;font-size:10px;margin-top:1px;}
.feature-badge{display:inline-block;background:rgba(167,139,250,0.15);color:#a78bfa;font-size:8px;font-weight:700;padding:1px 6px;border-radius:6px;margin-left:6px;}
.version-block{margin-bottom:14px;padding:12px 14px;background:rgba(167,139,250,0.04);border-radius:10px;border-left:3px solid #7c3aed;position:relative;}
.version-badge{display:inline-block;background:linear-gradient(135deg,#7c3aed,#9b5de5);color:#fff;font-size:9px;font-weight:700;padding:2px 10px;border-radius:8px;margin-bottom:4px;}
.version-title{font-weight:700;font-size:12px;display:inline;margin-left:8px;color:#e2e1f0;}
ul{margin:6px 0;padding-left:16px;}
li{font-size:10px;margin:2px 0;color:#9d9cb2;}
li::marker{color:#7c3aed;}
.wireframe{font-family:'Space Grotesk',monospace;font-size:8px;background:linear-gradient(180deg,#0f0d24 0%,#12102a 100%);color:#a78bfa;padding:14px;border-radius:10px;margin:10px 0;white-space:pre;overflow-x:auto;line-height:1.3;border:1px solid rgba(167,139,250,0.1);}
.section{page-break-inside:avoid;}
.section-card{background:rgba(167,139,250,0.04);border:1px solid rgba(167,139,250,0.1);border-radius:14px;padding:16px;margin:12px 0;}
.section-card h3{margin-top:0;color:#c4b5fd;}
.tag{display:inline-block;background:rgba(167,139,250,0.1);color:#a78bfa;font-size:9px;font-weight:600;padding:3px 10px;border-radius:20px;margin:2px;border:1px solid rgba(167,139,250,0.15);}
.page-break{page-break-before:always;margin-top:24px;}
.footer{text-align:center;margin-top:48px;padding-top:20px;border-top:1px solid rgba(167,139,250,0.15);color:#5a5970;font-size:9px;}
.footer strong{color:#a78bfa;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,0.2),transparent);margin:24px 0;}
@media print{
  body{padding:20px;font-size:9px;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#0a0918 !important;}
  h1{font-size:28px;}
  .hero{padding:24px;}
  .stats-grid{grid-template-columns:repeat(3,1fr);}
  .page-break{page-break-before:always;}
}
</style></head><body>

<div class="hero">
<div class="emoji">🏡</div>
<span class="brand-name">Hushh</span>
<div class="subtitle">Private Experience Marketplace · v1.36 · Made in Jeypore ❤️</div>
<div style="font-size:10px;color:#8b8aa0;max-width:400px;margin:0 auto;">Book private stays, curated experiences, and on-demand services — all in one app.</div>
<div style="margin-top:16px;">
${["Mobile-First", "Real-Time", "AI-Powered", "PWA + Native", "Offline-Ready"].map(t => `<span class="tag">${t}</span>`).join(" ")}
</div>
</div>

<div class="stats-grid">
<div class="stat-card"><div class="value">80+</div><div class="label">Components</div></div>
<div class="stat-card"><div class="value">27</div><div class="label">Custom Hooks</div></div>
<div class="stat-card"><div class="value">45</div><div class="label">DB Tables</div></div>
<div class="stat-card"><div class="value">6</div><div class="label">Edge Functions</div></div>
<div class="stat-card"><div class="value">15</div><div class="label">User Screens</div></div>
<div class="stat-card"><div class="value">22</div><div class="label">Admin Pages</div></div>
</div>

<h2>🏛 Four Pillars</h2>
<div>
<div class="pillar"><strong>🏠 Stays</strong> — Farmhouses, Villas, Work Pods, Rooftops</div>
<div class="pillar"><strong>🎭 Experiences</strong> — Dinners, Parties, Bonfires, Walks</div>
<div class="pillar"><strong>🛎 Services</strong> — Chef, Decor, DJ, Rides, Staff</div>
<div class="pillar"><strong>✨ Curations</strong> — Date Night, Birthday Bash, Corporate</div>
</div>

<h2>🎯 Target Audience</h2>
<table><tr><th>Segment</th><th>Use Case</th><th>Key Features</th></tr>
<tr><td>Young Couples</td><td>Date nights, anniversaries</td><td>Couple Specials, romantic venues</td></tr>
<tr><td>Friend Groups</td><td>House parties, celebrations</td><td>Group bookings, experience builder</td></tr>
<tr><td>Remote Workers</td><td>Weekday work sessions</td><td>Work Pods, Quiet Rooms</td></tr>
<tr><td>Corporate</td><td>Team retreats, offsites</td><td>Package deals, bulk booking</td></tr>
<tr><td>Hosts</td><td>Monetizing spaces</td><td>Dashboard, analytics, inventory</td></tr>
<tr><td>Admins</td><td>Operations management</td><td>CRM, CRUD, AI assistant</td></tr>
</table>

<h2>📱 User App — 15 Screens</h2>
<table><tr><th>Screen</th><th>Description</th></tr>
<tr><td>Splash</td><td>Animated logo, cinematic island villa, time-of-day backgrounds</td></tr>
<tr><td>Home/Explore</td><td>Search, Active Trip, Categories, Spotlight, Cards, Sports, Foodie, Curations</td></tr>
<tr><td>Property Detail</td><td>Gallery, slot picker, reviews, sticky book bar</td></tr>
<tr><td>Experience Builder</td><td>4 category tabs, quantity selectors, smart nudges</td></tr>
<tr><td>Checkout</td><td>Summary, coupon, GST, price breakdown</td></tr>
<tr><td>Confirmation</td><td>Confetti, booking ID, loyalty points</td></tr>
<tr><td>Search</td><td>DB-powered, category chips, recent searches</td></tr>
<tr><td>Map View</td><td>Leaflet pins, preview cards</td></tr>
<tr><td>Wishlists</td><td>Grid of saved properties</td></tr>
<tr><td>Trips</td><td>5 tabs, order food, cancel/rebook</td></tr>
<tr><td>Booking Detail</td><td>Status, order food, split pay, photos</td></tr>
<tr><td>Messages</td><td>Real-time chat, support contacts</td></tr>
<tr><td>Profile</td><td>Hero card, achievements, theme, social</td></tr>
<tr><td>Loyalty</td><td>Spin wheel, milestones, transactions</td></tr>
<tr><td>Notifications</td><td>Filter tabs, grouped by day</td></tr>
</table>

<h2>🛡️ Admin Panel — 22 Pages</h2>
<table><tr><th>Page</th><th>Description</th></tr>
<tr><td>Command Center</td><td>KPI dashboard, live feed, pending items</td></tr>
<tr><td>AI Assistant</td><td>Natural language queries via edge function</td></tr>
<tr><td>Smart Alerts</td><td>Low stock, overdue tasks, anomalies</td></tr>
<tr><td>Properties</td><td>Full CRUD — name, pricing, images, slots, status</td></tr>
<tr><td>Inventory</td><td>Stock tracking with alerts</td></tr>
<tr><td>Bookings + Calendar</td><td>Status flow, heatmap, monthly view</td></tr>
<tr><td>Client Directory</td><td>CRM 2.0 — engagement scoring, AI search</td></tr>
<tr><td>Live Orders</td><td>Real-time order tracking</td></tr>
<tr><td>Analytics + Earnings</td><td>Charts, revenue, payouts</td></tr>
<tr><td>Curations</td><td>Pack CRUD with mood tags</td></tr>
<tr><td>Campaigns + Coupons</td><td>Marketing + discount engine</td></tr>
<tr><td>Staff Management</td><td>Directory, attendance, leaves, payroll</td></tr>
<tr><td>Finance Hub</td><td>Expenses, budgets, receipts</td></tr>
<tr><td>Reports & Exports</td><td>CSV reports, data exports, audit trail</td></tr>
<tr><td>Homepage Manager</td><td>Sections, Videos, Filters, Tags</td></tr>
<tr><td>Settings</td><td>General, Branding, Advanced</td></tr>
</table>

<div class="divider"></div>

<h2>🗄 Database Schema (45 Tables)</h2>
<table><tr><th>Table</th><th>Purpose</th></tr>
${tables.map(([t, d]) => `<tr><td><code>${t}</code></td><td>${d}</td></tr>`).join("")}
</table>

<div class="page-break"></div>

<h2>🏗 Architecture</h2>
<div class="section-card">
<h3>Tech Stack</h3>
<p style="color:#c7c6d7;">React 18 · TypeScript · Vite 8 · Tailwind CSS 3 · shadcn/ui · Framer Motion 12 · React Query · React Router v6 · Lovable Cloud · Recharts · React Hook Form + Zod · Capacitor 8</p>
</div>

<h3>Security Layers</h3>
<table><tr><th>#</th><th>Layer</th><th>Implementation</th></tr>
<tr><td>1</td><td>Authentication</td><td>Email/password, JWT, email verification</td></tr>
<tr><td>2</td><td>RBAC</td><td>user_roles table, has_role() security definer</td></tr>
<tr><td>3</td><td>RLS</td><td>Every table, per-user data isolation</td></tr>
<tr><td>4</td><td>Client-Side</td><td>No secrets in client, edge functions for ops</td></tr>
</table>

<h3>Edge Functions</h3>
<table><tr><th>Function</th><th>Purpose</th></tr>
<tr><td><code>admin-ai</code></td><td>Natural language admin queries</td></tr>
<tr><td><code>smart-alerts</code></td><td>Automated alert generation</td></tr>
<tr><td><code>auto-notifications</code></td><td>DB webhook → user alerts</td></tr>
<tr><td><code>property-history-ai</code></td><td>AI search booking history</td></tr>
<tr><td><code>weekly-digest</code></td><td>Weekly summary email</td></tr>
<tr><td><code>staff-report</code></td><td>Staff attendance report</td></tr>
</table>

<h3>Custom Hooks (27)</h3>
<div class="section-card">
<p style="font-size:9px;color:#8b8aa0;line-height:2;">
${["useAuth","useAdmin","useBookings","useWishlists","useMessages","useNotifications","useLoyalty","useReferrals","useReviews","useHostListings","useHostAnalytics","useImageUpload","useTheme","usePrivacyMode","useCurations","useUnreadCount","useAppConfig","useHomepageSections","useHomepageFilters","useVideoCards","useDragReorder","useMobile","useOnlineStatus","usePayments","useSlotAvailability","useInvoices","useOrders","useSearch"].map(h => `<code>${h}</code>`).join("  ")}
</p>
</div>

<div class="divider"></div>

<h2>📐 Wireframes</h2>
<div class="wireframe">┌─────────────────────────┐
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
│ 🏠  ❤️  ✈️  💬  👤    │  Bottom nav
└─────────────────────────┘</div>

<div class="wireframe">┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ DETAIL  │→│ BUILDER │→│CHECKOUT │→│ CONFIRM │
│ Gallery │ │ Food    │ │ Summary │ │ 🎊      │
│ Slots   │ │ Decor   │ │ Coupon  │ │HUSHH-XX │
│ Date    │ │ DJ      │ │ GST 18% │ │ +50 pts │
│ [Book→] │ │ [Next→] │ │ [Pay→]  │ │ [Trips] │
└─────────┘ └─────────┘ └─────────┘ └─────────┘</div>

<div class="page-break"></div>

<h2>🖥️ Desktop & Web Blueprint</h2>

<h3>Desktop Navigation</h3>
<div class="section-card">
${[
  {t:"Top Navigation Bar (DesktopTopNav)", d:"Persistent horizontal nav replaces BottomNav at md+ breakpoint. Logo, search, category links, user avatar dropdown.", b:"md+"},
  {t:"Multi-Panel Layouts", d:"Property detail uses side-by-side gallery + booking panel. Messages use split-pane.", b:"lg+"},
  {t:"Admin Sidebar", d:"Collapsible sidebar with 22+ nav items, Command Palette (⌘K).", b:""},
  {t:"Search Upgrade", d:"On desktop, search opens inline panel instead of full-screen overlay.", b:""},
].map(f => `<div class="feature-row"><div class="feature-dot"></div><div><span class="feature-title">${f.t}</span>${f.b ? `<span class="feature-badge">${f.b}</span>` : ''}<div class="feature-desc">${f.d}</div></div></div>`).join("")}
</div>

<h3>Responsive Breakpoints</h3>
<table><tr><th>Breakpoint</th><th>Width</th><th>Layout Changes</th></tr>
<tr><td>sm</td><td>640px</td><td>2-col grids, larger touch targets</td></tr>
<tr><td>md</td><td>768px</td><td>DesktopTopNav replaces BottomNav, wider cards</td></tr>
<tr><td>lg</td><td>1024px</td><td>3-col property grids, split-view panels</td></tr>
<tr><td>xl</td><td>1280px</td><td>4-col grids, max-width containers, sidebar expand</td></tr>
<tr><td>2xl</td><td>1536px</td><td>Max content width, generous whitespace</td></tr>
</table>

<h3>Desktop Typography Scale</h3>
<table><tr><th>Element</th><th>Mobile</th><th>Desktop (md+)</th><th>Font</th></tr>
<tr><td>Page titles</td><td>text-2xl</td><td>text-3xl lg:text-4xl</td><td>Space Grotesk</td></tr>
<tr><td>Section headers</td><td>text-base</td><td>text-lg lg:text-xl</td><td>Space Grotesk</td></tr>
<tr><td>Splash brand</td><td>text-[58px]</td><td>md:text-[84px] xl:text-[124px]</td><td>Pacifico (cursive)</td></tr>
<tr><td>Splash greeting</td><td>text-[32px]</td><td>md:text-5xl xl:text-7xl</td><td>Playfair Display</td></tr>
</table>

<h3>Sheet → Modal Adaptation</h3>
<table><tr><th>Component</th><th>Mobile (&lt; md)</th><th>Desktop (md+)</th></tr>
<tr><td>Settings</td><td>Bottom sheet (Vaul)</td><td>Side sheet / Dialog</td></tr>
<tr><td>Edit Profile</td><td>Bottom sheet</td><td>Centered modal</td></tr>
<tr><td>Live Ordering</td><td>Bottom sheet</td><td>Side panel</td></tr>
<tr><td>Checkout</td><td>Full screen</td><td>Right panel + summary</td></tr>
<tr><td>Search</td><td>Full screen overlay</td><td>Inline dropdown panel</td></tr>
<tr><td>Map View</td><td>Full screen</td><td>Split-pane (list + map)</td></tr>
</table>

<h3>Desktop Grid Patterns</h3>
<table><tr><th>Component</th><th>Mobile</th><th>Tablet (md)</th><th>Desktop (lg+)</th></tr>
<tr><td>Property cards</td><td>grid-cols-2</td><td>grid-cols-3</td><td>grid-cols-4 lg:grid-cols-5</td></tr>
<tr><td>Curation grid</td><td>scroll-x</td><td>grid-cols-3</td><td>grid-cols-4</td></tr>
<tr><td>Wishlist grid</td><td>grid-cols-2</td><td>grid-cols-3</td><td>grid-cols-4</td></tr>
<tr><td>Admin tables</td><td>card list</td><td>data table</td><td>data table + filters sidebar</td></tr>
</table>

<div class="page-break"></div>

<h2>📱 Mobile & Responsive Blueprint</h2>

<h3>Distribution Strategy</h3>
<table><tr><th>Channel</th><th>Technology</th><th>Details</th></tr>
<tr><td>PWA</td><td>VitePWA + Workbox</td><td>autoUpdate, standalone, portrait, installable from browser</td></tr>
<tr><td>Android APK</td><td>Capacitor 8</td><td>WebView loads live URL, instant updates without rebuild</td></tr>
<tr><td>CI/CD</td><td>GitHub Actions</td><td>Auto-build debug APK on push to main, Java 21, Gradle 8.14</td></tr>
</table>

<h3>Viewport & Layout</h3>
<table><tr><th>Rule</th><th>Value</th><th>Purpose</th></tr>
<tr><td>Design target</td><td>390×844px</td><td>iPhone 14/15 logical, tested 360px–428px</td></tr>
<tr><td>overflow-x</td><td>hidden on html/body/#root</td><td>Prevent horizontal drift from 3D transforms</td></tr>
<tr><td>overscroll-behavior-x</td><td>none</td><td>Disable rubber-band horizontal scroll</td></tr>
<tr><td>Layout</td><td>Single column stack</td><td>All primary screens, 2-col grids for cards</td></tr>
<tr><td>Modals</td><td>Bottom sheets (Vaul)</td><td>Natural thumb reach zone</td></tr>
</table>

<h3>Touch & Interaction</h3>
<table><tr><th>Feature</th><th>Implementation</th></tr>
<tr><td>Touch targets</td><td>44px minimum, bottom nav 48px zones</td></tr>
<tr><td>Haptics</td><td>Capacitor ImpactStyle + Web Vibration API fallback</td></tr>
<tr><td>Animations</td><td>Framer Motion springs (stiffness 300, damping 30), whileTap scale 0.95</td></tr>
<tr><td>Gestures</td><td>Swipe messages, pull-to-refresh, scroll-snap carousels</td></tr>
</table>

<h3>Aspect Ratios</h3>
<table><tr><th>Element</th><th>Ratio</th></tr>
<tr><td>Property cards</td><td>16:10, object-cover, lazy</td></tr>
<tr><td>Spotlight video</td><td>16:9, autoplay muted loop</td></tr>
<tr><td>Gallery carousel</td><td>4:3, swipe with dots</td></tr>
<tr><td>Avatars</td><td>1:1, rounded-full</td></tr>
</table>

<h3>Theme System</h3>
<div class="section-card">
<p style="color:#c7c6d7;font-size:10px;">HSL CSS variables in :root (dark) and .light class. Semantic tokens only — no hardcoded colors in components. glass/glow/shadow utilities adapt per theme. 0.5s ease transition on switch with programmatic morph.</p>
</div>

<h3>Performance</h3>
<table><tr><th>Optimization</th><th>Details</th></tr>
<tr><td>Service Worker</td><td>NetworkFirst API, CacheFirst static, 10MB limit</td></tr>
<tr><td>Fonts</td><td>preload + non-render-blocking, 4 Google Fonts</td></tr>
<tr><td>Lazy Loading</td><td>LazySection (IntersectionObserver), OptimizedImage</td></tr>
<tr><td>Inline Splash</td><td>HTML-inline for instant FCP, replaced by React</td></tr>
<tr><td>React Query</td><td>30s stale, 2× retry, exponential backoff</td></tr>
</table>

<h3>Native-Grade Caching (v1.35)</h3>
<table><tr><th>Feature</th><th>Details</th></tr>
<tr><td>Native Data Cache</td><td>Capacitor Preferences with TTL + stale-while-revalidate</td></tr>
<tr><td>Prefetch on Launch</td><td>Listings, curations, packages, config cached on cold start</td></tr>
<tr><td>CapacitorHttp</td><td>Native HTTP stack, bypasses WebView CORS overhead</td></tr>
<tr><td>WebView Tuning</td><td>androidScheme:https, allowMixedContent, captureInput, bg:#050505</td></tr>
<tr><td>Launch Flow</td><td>initNativePlugins → prefetchCriticalData → React render with cache</td></tr>
</table>

<h3>Native Capacitor Plugins</h3>
<table><tr><th>Plugin</th><th>Usage</th></tr>
<tr><td>@capacitor/share</td><td>Native share sheet for properties, referrals, bookings</td></tr>
<tr><td>@capacitor/clipboard</td><td>Copy referral codes, booking IDs</td></tr>
<tr><td>@capacitor/network</td><td>Connection detection (WiFi/cellular/none)</td></tr>
<tr><td>@capacitor/browser</td><td>In-app browser for external links</td></tr>
<tr><td>@capacitor/preferences</td><td>Native key-value storage replacing localStorage</td></tr>
<tr><td>@capacitor/haptics</td><td>ImpactStyle feedback on interactions</td></tr>
<tr><td>@capacitor/push-notifications</td><td>Native push with token storage</td></tr>
<tr><td>@capacitor/camera</td><td>Photo capture for profile, reviews</td></tr>
</table>

<h3>AI Prompts for Web/Desktop Conversion</h3>
<ol style="font-size:10px;line-height:2;color:#c7c6d7;">
<li>Convert single-column to multi-panel: sidebar nav + main content + detail panel</li>
<li>Replace BottomNav with persistent left sidebar, add breadcrumbs</li>
<li>Scale grids: 2→3→4 columns, add hover states replacing tap</li>
<li>Bottom sheets → centered Dialogs on desktop, keep sheets on mobile</li>
<li>Card lists → data tables with sorting/filtering/pagination</li>
<li>Split-pane: messages list+chat, property gallery+info</li>
<li>Scale typography: titles 3xl, headers xl, body sm, px-8, max-w-7xl</li>
<li>Add hover:scale-105, keyboard shortcuts, cursor:pointer</li>
</ol>

<div class="page-break"></div>

<h2>🎨 Cinematic Splash Screen</h2>
<div class="section-card">
<h3>Two Variants (Admin Toggle)</h3>
<table><tr><th>Variant</th><th>Style</th><th>Backgrounds</th></tr>
<tr><td>1 — Classic</td><td>3D metallic typography, spring letter flip</td><td>4 time-of-day photos (mobile + desktop)</td></tr>
<tr><td>2 — Cinematic (default)</td><td>Island villa with H silhouette, underwater typography</td><td>4 time-of-day illustrations (mobile 9:16 + desktop 16:9)</td></tr>
</table>

<h3>Time-of-Day Assets</h3>
<table><tr><th>Time</th><th>Hours</th><th>Mobile Asset</th><th>Desktop Asset</th></tr>
<tr><td>Dawn ☀️</td><td>05:00–11:59</td><td>splash2-dawn-v2.jpg</td><td>splash2-dawn-v2-desktop.jpg</td></tr>
<tr><td>Day 🌤️</td><td>12:00–16:59</td><td>splash2-day-v2.jpg</td><td>splash2-day-v2-desktop.jpg</td></tr>
<tr><td>Dusk 🌅</td><td>17:00–20:59</td><td>splash2-dusk-v2.jpg</td><td>splash2-dusk-v2-desktop.jpg</td></tr>
<tr><td>Night 🌙</td><td>21:00–04:59</td><td>splash2-night-v2.jpg</td><td>splash2-night-v2-desktop.jpg</td></tr>
</table>

<h3>Atmospheric Animations</h3>
<div>
${["Fireflies (16-20 particles)", "Shooting Stars (3×)", "Flying Birds (5 SVG)", "Floating Lanterns (5×)", "Twinkling Stars (20×)", "Sun Rays", "Drifting Clouds"].map(e => `<span class="tag">${e}</span>`).join(" ")}
</div>
</div>

<h2>🖼️ Wallpaper Gallery</h2>
<div class="section-card">
<p style="color:#c7c6d7;font-size:10px;margin-bottom:8px;">16 downloadable wallpapers: 8 phone (9:16) + 8 desktop (16:9), spanning Classic and Cinematic variants across all time-of-day themes. Accessible via <code>/wallpapers</code> route and Easter egg documentation.</p>
<table><tr><th>Filter</th><th>Options</th></tr>
<tr><td>Variant</td><td>All · Classic · Cinematic</td></tr>
<tr><td>Format</td><td>All Sizes · Phone (9:16) · Desktop (16:9)</td></tr>
</table>
</div>

<h2>🥚 Easter Eggs</h2>
<table><tr><th>Trigger</th><th>Location</th><th>Result</th></tr>
<tr><td>Tap version text 5× in 2s</td><td>Profile tab, bottom</td><td>Full in-app documentation overlay with wallpaper gallery</td></tr>
<tr><td>Visit /wallpapers</td><td>Direct URL</td><td>Public wallpaper download page</td></tr>
</table>

<div class="page-break"></div>

<h2>📋 Change History</h2>
${changelog}

<div class="footer">
<p>🏡 <strong>Hushh</strong> v1.36 · Private Experience Marketplace · Made in Jeypore ❤️</p>
<p style="margin-top:4px;">80+ Components · 27 Hooks · 45 Tables · 6 Edge Functions · 15 Screens · 22 Admin Pages</p>
<p style="margin-top:8px;">Generated ${new Date().toLocaleDateString()} · Confidential Internal Document</p>
</div>
</body></html>`;
}