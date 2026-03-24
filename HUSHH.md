# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.36 | Internal Documentation & Blueprint

Hushh is a premium mobile-first marketplace for booking private experiences, stays, and curated lifestyle services in Jeypore, India. Think Airbnb meets a concierge — but hyper-local, with a focus on curated combos and on-demand add-ons.

**Published**: [hushh-jeypore.lovable.app](https://hushh-jeypore.lovable.app)

**Android APK**: Auto-built via GitHub Actions on push to `main`. Download from Actions → Artifacts.

---

## Table of Contents

1. [Core Concept](#-core-concept--four-pillars)
2. [Target Audience](#-target-audience)
3. [User Flow](#-user-flow)
4. [Screen-by-Screen Documentation](#-screen-by-screen-documentation)
5. [Features — Guest Mode](#-features--guest-mode)
6. [Features — Authenticated](#-features--authenticated)
7. [Features — Host](#-features--host)
8. [Admin Panel](#-admin-panel)
9. [Design System](#-design-system)
10. [Architecture](#-architecture)
11. [Component Reference](#-component-reference)
12. [Hooks Reference](#-hooks-reference)
13. [Database Schema](#-database-schema)
14. [Security & RLS](#-security--rls)
15. [Tech Stack](#-tech-stack)
16. [Product Requirements Document (PRD)](#-product-requirements-document-prd)
17. [App Blueprint](#-app-blueprint)
18. [Wireframes](#-wireframes)
19. [Change History](#-change-history)
20. [Mobile & Responsive Blueprint](#-mobile--responsive-blueprint)
21. [Conventions & Guidelines](#-conventions--guidelines)
22. [Easter Eggs](#-easter-eggs)

---

## 🏛 Core Concept — Four Pillars

| Pillar | What it means | Examples |
|--------|--------------|----------|
| **Stays** | Private spaces you can book by time slot | Farmhouses, Work Pods, Rooftops, Villas, Pool Houses |
| **Experiences** | What happens at the space | Candlelight Dinner, House Party, Bonfire Night, Heritage Walk |
| **Services** | On-demand add-ons | Chef-on-Call, Decor Setup, DJ & Lights, Rides, Staff |
| **Curations** | Pre-built combos | "Date Night Deluxe", "Birthday Bash", "Corporate Retreat" |

### Strategic Focus
- **"Work-from-resort"** — weekday monetization with Work Pods, Quiet Rooms, and co-working spaces
- **Couple experiences** — romantic getaways, candlelight dinners, anniversary specials
- **Group celebrations** — birthday halls, kitty parties, team outings

---

## 🎯 Target Audience

| Segment | Use Case | Key Features |
|---------|----------|-------------|
| **Young couples** | Date nights, anniversaries, weekend getaways | Couple Specials, romantic venues, privacy-focused |
| **Friend groups** | House parties, game nights, celebrations | Group bookings, experience builder, add-ons |
| **Remote workers** | Weekday work sessions, change of scenery | Work Pods, Quiet Rooms, Wi-Fi, coffee |
| **Families** | Birthday parties, family gatherings | Birthday halls, catering, decor services |
| **Corporate** | Team retreats, offsites, brainstorming | Package deals, analytics, bulk booking |
| **Hosts** | Property owners monetizing spaces | Dashboard, analytics, listing management |
| **Admins** | Operations managers, super admins | Full CRM, property CRUD, analytics, AI assistant |

---

## 🗺 User Flow

### Primary Flow (Booking)
```
App Launch
  └─▸ Splash Screen (animated logo reveal, ~2s)
       └─▸ Home / Explore Tab
            ├─▸ Browse by category (Home, Stays, Experiences, Services, Curations, Work)
            ├─▸ Search (rotating placeholders → full-text search with filters)
            ├─▸ Map View (pin-based venue browsing with previews)
            └─▸ Tap Property Card
                 └─▸ Property Detail Page
                      ├─▸ Swipe gallery (images)
                      ├─▸ Read reviews (tap reviewer → public profile)
                      ├─▸ Select slot (Morning/Afternoon/Evening/Night/Full Day)
                      ├─▸ Set guest count + Pick date
                      └─▸ Tap "Book Now"
                           └─▸ Experience Builder
                                ├─▸ Browse add-on categories (Food, Decor, Entertainment, Transport)
                                ├─▸ Toggle add-ons with quantity + running total
                                └─▸ Tap "Continue"
                                     └─▸ Checkout Screen
                                          ├─▸ Review summary, apply coupon, price breakdown
                                          └─▸ Tap "Confirm Booking"
                                               └─▸ Booking Confirmation
                                                    ├─▸ Confetti animation 🎊
                                                    ├─▸ Booking ID + loyalty points awarded
                                                    └─▸ "View Trips" → Trips tab
```

### Secondary Flows
```
Wishlists Tab → Grid of saved properties → Detail → Book
Trips Tab → Active (checked-in) / Upcoming / Past / Cancelled → Detail → Cancel/Rebook/Order Food
Messages Tab → Conversation list → Chat thread (real-time)
Profile Tab → Edit profile, Loyalty, Referrals, Past Trips, Host Dashboard, Settings, Theme
Active Trip → Order Food (live ordering sheet) / Add Extras (per-item emoji icons)
```

### Admin Flow
```
/admin → Auth Screen (or Skip for dev)
  └─▸ Admin Layout (sidebar + command palette ⌘K)
       ├─▸ Command Center — KPI dashboard, live activity feed, pending items
       ├─▸ Properties — Full CRUD (name, pricing, images, tags, slots, rules, amenities)
       ├─▸ Inventory — Food/drink/activity item management with stock tracking
       ├─▸ Bookings — All bookings with status management
       ├─▸ Client Directory — CRM 2.0 with engagement scoring, journey timeline
       ├─▸ Property History — Calendar-based stay tracking, AI-powered search
       ├─▸ Live Orders — Real-time food/service order management
       ├─▸ Curations — Curated pack CRUD
       ├─▸ Campaigns — Marketing campaign studio
       ├─▸ Coupons — Discount code engine
       ├─▸ Analytics — Charts, trends, breakdowns
       ├─▸ Earnings — Revenue tracking
       ├─▸ AI Assistant — Natural language queries across all data
       ├─▸ Smart Alerts — Automated notification system
       ├─▸ Dynamic Pricing — Demand-based price adjustments
       ├─▸ Homepage Manager — Sections visibility/ordering, video cards, filter pills, tags
       ├─▸ Users (CRM) — User management (admin-only)
       ├─▸ Calendar — Host calendar view
       ├─▸ Booking Requests — Pending approval queue
       ├─▸ Achievements — Milestone management
       ├─▸ Loyalty & Referrals — Points & referral analytics
       ├─▸ Exports — CSV/data export tools
       ├─▸ Settings — General (pricing/fees/support), Branding (name/logo/tagline/social/legal), Advanced (map/spin/notifications)
       └─▸ Audit Trail — Full activity log (admin-only)
```

---

## 📱 Screen-by-Screen Documentation

### 1. Splash Screen (`SplashScreen.tsx`)
- Animated brand logo with spring physics, auto-transitions to Home after ~2s
- **Dynamic branding**: App name and logo pulled from `app_config` (key: `app_name`, `logo_url`)

### 2. Home / Explore (`HomeScreen.tsx`)
- **Header**: Profile avatar, location pill (dynamic `app_tagline`), notification bell (unread badge)
- **Rotating Search Bar**: Cycles through placeholder suggestions
- **Active Trip Card**: Shows current checked-in booking with 1-tap food ordering and trip view
- **Category Bar**: Horizontal tabs — Home, Stays, Experiences, Services, Curations, Work
  - **Dynamic sub-filters** per category from `homepage_filters` config (admin-editable)
  - Smooth scroll on switch (offset 280px on sub-filter)
- **Content Sections**: Ordered by `homepage_sections` config (admin can toggle visibility & reorder)
  - Spotlight Carousel (video URLs + overlay text from `homepage_videos` config), Property Cards, Sports Cards, Foodie Carousel, Couple Specials, Service Grid, Curated Pack Listings, What's Hot, Events, Blockbuster Banner, Experience Cards
- **Pull-to-refresh** + **Back-to-top button**

### 3. Property Detail (`PropertyDetail.tsx`)
- Gallery carousel, info section (name, location, rating, tags, capacity), "Enhance Your Stay" accordion, slot picker, guest counter, date picker, related listings, review section, sticky bottom bar, wishlist toggle

### 4. Experience Builder (`ExperienceBuilder.tsx`)
- Add-on categories (Food, Decor, Entertainment, Transport), quantity selectors, running total, haptic feedback, spring animations

### 5. Checkout Screen (`CheckoutScreen.tsx`)
- Booking summary, add-on line items, coupon input, price breakdown, confirm CTA

### 6. Booking Confirmation (`BookingConfirmation.tsx`)
- Full-screen success, confetti particles, booking ID (HUSHH-XXXXXX), loyalty points badge

### 7. Search Screen (`SearchScreen.tsx`)
- Full-screen overlay, real-time filtering, category chips, recent searches

### 8. Map View (`MapViewScreen.tsx`)
- Pin markers, tap → preview card → detail

### 9. Wishlist Screen (`WishlistScreen.tsx`)
- Grid of wishlisted properties, empty state illustration

### 10. Trips Screen (`TripsScreen.tsx`)
- Tabs: Active (checked-in) / Upcoming / Past / Cancelled
- Identity verification prompt for unverified users
- Active trips show live ordering CTA and "Add Extras" with per-item emoji icons
- Booking cards with status-colored badges, View/Cancel/Rebook actions

### 11. Booking Detail (`BookingDetailScreen.tsx`)
- Full booking info, status banner (Active/Upcoming/Completed/Cancelled)
- Property card with live badge for active trips
- **Order Food**: Swiggy-style live ordering sheet for checked-in guests
- **Add Extras**: Bottom sheet with categorized add-ons, per-item emoji icons, quantity selectors, running total
- Cancel dialog with confirmation, rebook flow

### 12. Messages Screen (`MessagesScreen.tsx`)
- Conversation list, unread badges, chat thread, message input
- **Dynamic support contacts**: Phone, email, WhatsApp pulled from `app_config`

### 13. Profile Screen (`ProfileScreen.tsx`)
- **Hero Card**: Centered avatar with glow + verified badge, name, location, bio, stats (Trips/Reviews/Member)
- **Membership Badge**: Gold tier, points, cashback → Loyalty Screen
- **Quick Stats**: Bookings, Wishlisted, Total Spent
- **Achievements**: Horizontal scroll gradient cards (Early Adopter, 5-Star Guest, Party Starter, Romantico)
- **Recent Activity**: Last 3 bookings in contained card with ambient glow
- **Two Cards Grid**: Past Trips, Connections
- **Become a Host** CTA → Host Dashboard
- **Theme Switcher**: Light/Dark/Auto animated toggle
- **Social Media Footer**: Dynamic Instagram/Facebook/YouTube/Twitter icons from branding config
- **Terms & Privacy Sheet**: Dynamic legal links (terms_url, privacy_url, refund_policy_url) from config
- **Settings Menu**: 10 items with sheets
- **Version text**: Tap 5× → App Documentation

### 14. Public Profile (`PublicProfileScreen.tsx`)
- User info, stats, achievements — works with mock profiles for guests

### 15–24. Supporting Screens
- Edit Profile Sheet, Settings Sheet, Loyalty Screen, Referral Screen, Notification Center, Host Dashboard, Create Listing, Host Analytics, Auth Screen, App Documentation

---

## 🛡️ Admin Panel

The admin panel (`/admin`) is a full-featured operations dashboard for managing all aspects of the Hushh platform. It is accessible to users with `super_admin` or `ops_manager` roles (currently open to all authenticated users during development).

### Access & Authentication
- Route: `/admin`
- Auth required (with "Skip for now" bypass during dev)
- Role-based access via `useAdmin()` hook — checks `user_roles` table
- `super_admin` sees everything; `ops_manager` sees most; some pages are admin-only (Users CRM, Audit Trail)

### Layout (`AdminLayout.tsx`)
- **Collapsible Sidebar**: 22 navigation items with icons, role-filtered visibility
- **Mobile Drawer**: Slide-out sidebar on mobile with backdrop overlay
- **Command Palette** (`⌘K`): Fuzzy search across all admin pages with keyboard navigation
- **Floating Checklist**: Persistent onboarding/task checklist widget

### Admin Pages (22 total)

| Page | Component | Description |
|------|-----------|-------------|
| **Command Center** | `CommandCenter.tsx` | KPI dashboard with live stats, activity feed, pending items widget, quick navigation |
| **AI Assistant** | `AdminAI.tsx` | Natural language queries — "Who stayed in Room 2 last Sunday?", "How many bonfires booked this month?" |
| **Smart Alerts** | `AdminAlerts.tsx` | Automated monitoring — low stock, overdue tasks, booking anomalies |
| **Dynamic Pricing** | `DynamicPricing.tsx` | Demand-based pricing rules, peak/off-peak multipliers |
| **Calendar** | `HostCalendar.tsx` | Monthly calendar view with booking overlays per property |
| **Booking Requests** | `BookingRequests.tsx` | Pending booking approval/rejection queue |
| **Properties** | `AdminProperties.tsx` | **Full CRUD** — name, pricing, images, tags, amenities, slots (JSONB), rules (JSONB), lat/lng, capacity, status (published/draft/paused), duplicate, delete |
| **Bookings** | `AdminBookings.tsx` | All bookings across all users, status management, filters |
| **Live Orders** | `AdminOrders.tsx` | Real-time food/service order tracking, Zomato-style status flow |
| **Inventory** | `AdminInventory.tsx` | Food/drink/activity item management — stock levels, low-stock alerts, pricing, availability toggle, category grouping |
| **Client Directory** | `AdminClients.tsx` | CRM 2.0 — profile cards with engagement score (0-100), journey timeline, stay/order/review history, AI-powered search |
| **Property History** | `AdminPropertyHistory.tsx` | Calendar-based stay tracking, chronological timeline, AI search ("last month who was in villa?") |
| **Users (CRM)** | `AdminUsers.tsx` | Full user management (admin-only), role assignment |
| **Analytics** | `AdminAnalytics.tsx` | Charts, trends, revenue breakdowns, booking patterns |
| **Earnings** | `HostEarnings.tsx` | Revenue tracking, payout summaries |
| **Curations** | `AdminCurations.tsx` | Curated pack CRUD — name, tagline, pricing, includes, mood tags, gradient, badge |
| **Campaigns** | `AdminCampaigns.tsx` | Marketing campaign studio — flash deals, seasonal offers, target audience/properties |
| **Coupons** | `AdminCoupons.tsx` | Discount code engine — percentage/flat, min order, max uses, expiry, user-specific |
| **Tags** | `AdminTags.tsx` | Property tag management — name, icon, color |
| **Exports** | `AdminExports.tsx` | CSV/data export tools |
| **Achievements** | `AdminAchievements.tsx` | Milestone management, user achievement tracking |
| **Loyalty & Referrals** | `AdminLoyaltyReferrals.tsx` | Points analytics, referral code performance |
| **Homepage Manager** | `AdminHomepage.tsx` | 4-tab manager: Sections (visibility/order), Videos (spotlight config), Filters (category pills), Tags (property tag CRUD) |
| **Settings** | `AdminSettings.tsx` | 3-tab config: General (pricing/fees/support), Branding (name/logo/tagline/social/legal URLs), Advanced (map/spin/notifications) |
| **Audit Trail** | `AdminAuditLog.tsx` | Full activity log — who did what when (admin-only) |

### Admin-Specific Features

#### Command Palette (`CommandPalette.tsx`)
- Triggered via `⌘K` / `Ctrl+K`
- Fuzzy search across 17 command entries
- Keyboard navigation (↑↓ arrows, Enter to select, Esc to close)
- Each command has icon, label, and keyword aliases

#### AI-Powered Search
- Available in **Command Center**, **Client Directory**, and **Property History**
- Natural language queries processed via edge function (`admin-ai`)
- Example queries: "Who ordered maggie last week?", "How many bonfire bookings in March?", "Show me VIP clients"

#### Live Activity Feed
- Real-time feed in Command Center showing recent bookings, orders, reviews
- Auto-refresh with polling

#### Client Engagement Scoring
- Automated 0-100 score based on: booking frequency, order count, review count, loyalty points
- Segments: VIP (80+), Frequent (50+), Returning (20+), New (<20)

#### Property CRUD (Database-Driven)
- All 28+ properties migrated from hardcoded `properties.ts` to `host_listings` table
- Admin can edit: name, description, full_description, location, lat/lng, base_price, capacity, category, property_type, primary_category, tags, amenities, highlights, image_urls, slots (JSONB), rules (JSONB), entry_instructions, host_name, discount_label, status
- Actions: publish/pause/draft, duplicate, delete
- Changes reflect across the entire app (consumer HomeScreen reads from DB)

#### Inventory Management
- Categories: Food, Drinks, Activities, Equipment, Supplies
- Per-item: name, emoji, unit_price, stock, low_stock_threshold, available toggle
- Low-stock alerts integrated with Smart Alerts

#### Edge Functions (Admin Backend)
| Function | Purpose |
|----------|---------|
| `admin-ai` | Processes natural language admin queries |
| `auto-notifications` | Automated notification triggers |
| `property-history-ai` | AI search over property stay history |
| `smart-alerts` | Automated alert generation |
| `weekly-digest` | Weekly summary email generation |

### Admin Hooks

| Hook | Purpose |
|------|---------|
| `useAdmin` | Role checking — `isAdmin`, `isOps`, `isHost`, `isStaff`, `hasAdminAccess` |

### Admin Database Tables

| Table | Admin Usage |
|-------|-------------|
| `user_roles` | Role-based access control (super_admin, ops_manager, host, staff) |
| `audit_logs` | Activity tracking — entity_type, action, details (JSONB) |
| `staff_tasks` | Task assignment and tracking |
| `host_listings` | Full property CRUD |
| `inventory` | Stock management |
| `campaigns` | Marketing campaigns |
| `coupons` | Discount codes |
| `property_tags` | Tag definitions |
| `tag_assignments` | Tag-to-property mappings |
| `identity_verifications` | ID document review queue |

---

## ✨ Features — Guest Mode

Everything works without login using mock data:

| Feature | Mock Behavior |
|---------|--------------|
| Property browsing | Full catalog with video thumbnails |
| Property detail | Gallery, slots, reviews (clickable mock reviewers) |
| Wishlists | 5 demo wishlisted properties, session-persistent |
| Trips | 12 demo bookings across all statuses (active, upcoming, past, cancelled) |
| Messages | Mock conversations |
| Notifications | 4 sample notifications |
| Loyalty | 320 points, Gold tier, mock transactions, spin wheel |
| Profile | "Guest Explorer" with mock stats, past trips synced |
| Search & Map | Full functionality |
| Theme | Light / Dark / Auto |

---

## 🔐 Features — Authenticated

| Feature | Database Table | Details |
|---------|---------------|---------|
| Auth | `auth.users` | Email/password, email verification, password reset |
| Profile | `profiles` | Display name, avatar, bio, location, loyalty pts, tier |
| Identity Verification | `identity_verifications` | Aadhaar/PAN upload, admin review queue |
| Wishlists | `wishlists` | Real-time sync across devices |
| Bookings | `bookings` | Full CRUD, status management, mandatory guest count |
| Messages | `conversations` + `messages` | Real-time chat, unread counts |
| Notifications | `notifications` | Read/unread, types, action URLs |
| Reviews | `reviews` + `review_responses` | Ratings, photos, host responses |
| Loyalty | `loyalty_transactions` | Earn 5 pts/₹100, tier progression |
| Referrals | `referral_codes` + `referral_uses` | Unique codes, point rewards |
| Curations | `curations` | 8 experience packs, public read, DB-seeded |
| Orders | `orders` + `order_items` | In-stay live ordering (Swiggy-style), saved per user |
| Spin Wheel | `spin_history` | Daily spin results, 1 spin/day enforced via DB query |
| Milestones | `user_milestones` | Achievement tracking, unique per user+milestone |

---

## 🎨 Design System

### Typography
| Font | Usage | Weight |
|------|-------|--------|
| **Space Grotesk** | Primary UI text, headings | 300–700 |
| **Playfair Display** | Editorial overlays on video | 400–900 |
| **Plus Jakarta Sans** | Secondary body text | 200–800 |
| **DM Sans** | Compact labels, captions | 100–1000 |

### Color Palette (HSL)
| Token | Value | Purpose |
|-------|-------|---------|
| `--background` | 260 20% 6% | App background |
| `--foreground` | 0 0% 96% | Primary text |
| `--primary` | 270 80% 65% | Brand purple, CTAs |
| `--secondary` | 260 15% 14% | Subtle backgrounds |
| `--muted` | 260 12% 16% | Disabled states |
| `--accent` | 270 60% 50% | Highlights |
| `--destructive` | 0 72% 55% | Error, delete |
| `--success` | 160 60% 42% | Success states |
| `--gold` | 43 96% 56% | Premium, loyalty |

### Visual Effects
- **Glassmorphism** (`glass` class), **Ambient glows** (radial gradients), **AccentFrame** (L-shaped corners via CSS masks), **AccentTag** (clip-path polygons), **Gradient borders**

### Animation: Framer Motion springs, staggered reveals, `whileTap` scaling, `layoutId` transitions, Web Vibration API haptics

---

## 🏗 Architecture

```
src/
├── App.tsx                    # Router (/, /admin, /staff, /reset-password, 404)
│                              # ErrorBoundary wraps each route + global fallback
│                              # OfflineBanner auto-shows when navigator.onLine = false
├── pages/
│   ├── Index.tsx              # SPA shell — screen state machine + bottom nav
│   ├── Admin.tsx              # Admin panel entry — auth gate + page router
│   ├── Staff.tsx              # Staff dashboard
│   └── ResetPassword.tsx      # Password reset flow
├── components/
│   ├── admin/                 # 25+ admin components
│   │   ├── AdminLayout.tsx    # Sidebar + mobile drawer + command palette
│   │   ├── CommandCenter.tsx  # KPI dashboard
│   │   ├── CommandPalette.tsx # ⌘K fuzzy search
│   │   ├── AdminProperties.tsx # Full property CRUD
│   │   ├── AdminInventory.tsx # Stock management
│   │   ├── AdminClients.tsx   # CRM 2.0
│   │   ├── AdminPropertyHistory.tsx # Calendar + timeline
│   │   ├── AdminAI.tsx        # AI assistant
│   │   └── ... (20+ more)
│   ├── home/                  # 15 feed sub-components
│   ├── staff/                 # Staff dashboard components
│   ├── shared/
│   │   ├── AccentFrame.tsx    # Reusable corner accent
│   │   ├── ErrorBoundary.tsx  # React class error boundary with "Try Again"
│   │   ├── OfflineBanner.tsx  # Animated offline detection banner
│   │   └── ...
│   └── ui/                    # 40+ shadcn/ui primitives
├── data/
│   ├── properties.ts          # Mock property/package/combo data (migrating to DB)
│   └── mock-users.ts          # Mock profiles, notifications, loyalty
├── hooks/
│   ├── use-online-status.tsx  # navigator.onLine + event listeners
│   └── ... (16+ custom hooks: auth, data, UI, admin)
├── lib/                       # Utilities (animations, haptics, share, cn)
└── integrations/              # Supabase client + Lovable
supabase/
├── functions/                 # 5 edge functions
│   ├── admin-ai/              # AI query processing
│   ├── auto-notifications/    # Automated alerts
│   ├── property-history-ai/   # Property history AI search
│   ├── smart-alerts/          # Smart alert generation
│   └── weekly-digest/         # Weekly summary emails
└── config.toml                # Supabase project config
```

### 🛡️ Resilience & Error Handling

#### Error Boundaries
Every route is wrapped in a `<ErrorBoundary>` component that catches React render crashes and shows a recovery UI with "Try Again" button. A global ErrorBoundary wraps the entire router as a last-resort fallback.

| Boundary Level | Scope | Fallback Title |
|---|---|---|
| Global | Entire app (wraps `<BrowserRouter>`) | "App crashed unexpectedly" |
| Home Route | Index page and all sub-screens | "Failed to load home" |
| Admin Route | Admin panel | "Admin panel error" |
| Staff Route | Staff dashboard | "Staff panel error" |

#### Offline Detection
- `useOnlineStatus()` hook tracks `navigator.onLine` + `online`/`offline` window events
- `<OfflineBanner>` renders a fixed top bar with animated entrance/exit when offline
- App remains functional for cached data; new mutations will fail gracefully with toast errors

#### Query Retry Strategy (React Query)
- **Queries**: Retry 2× with exponential backoff (1s → 2s → 4s, max 10s)
- **Mutations**: Retry 1× on failure
- **Stale time**: 30 seconds (prevents unnecessary refetches)
- **Window refocus**: Disabled (prevents data thrashing on tab switch)

#### Rate Limiting Awareness
| Surface | Mechanism | Limit |
|---|---|---|
| Auth attempts | Supabase GoTrue built-in | 30/hour per IP |
| Spin Wheel | DB trigger: 1 spin per user per day | 1/day/user |
| Edge Functions | Supabase default rate limit | 100 req/s |
| Search queries | Client-side debounce (300ms) | N/A |
| Order submissions | Optimistic lock via status check | 1 active order/booking |

#### Video & Asset Strategy
- Homepage video cards use `.mp4.asset.json` references resolved at build time
- Videos are lazy-loaded via `IntersectionObserver` (preloadVideos utility)
- Images served through Supabase Storage public buckets (CDN-backed)
- Listing images: `listing-images` bucket | Review photos: `review-images` bucket
- Font loading: `<link rel="preconnect">` + `display=swap` for non-blocking render

---

## 🪝 Hooks Reference

| Hook | Purpose | Guest Fallback |
|------|---------|---------------|
| `useAuth` | Auth context | — |
| `useAdmin` | Role-based admin access | — |
| `useBookings` | Booking CRUD | — |
| `useWishlists` | Wishlist management | — |
| `useMessages` | Chat conversations | — |
| `useNotifications` | Notifications | ✅ Mock alerts |
| `useLoyalty` | Points, tier, transactions | ✅ 320 pts Gold |
| `useReferrals` | Referral codes | — |
| `useReviews` | Reviews + responses | — |
| `useHostListings` | Host listing CRUD | — |
| `useHostAnalytics` | Analytics data | — |
| `useImageUpload` | Storage upload | — |
| `useTheme` | Theme management | — |
| `usePrivacyMode` | Privacy toggle + name masking | ✅ localStorage |
| `useCurations` | Fetch curated packs from DB | ✅ Static fallback |
| `useUnreadCount` | Unread message count | — |
| `useAppConfig` | Dynamic app config from DB (pricing, branding, support) | ✅ Defaults |
| `useHomepageSections` | Section visibility & ordering from DB | ✅ Default sections |
| `useHomepageFilters` | Dynamic category filter pills from DB | ✅ Default filters |
| `useVideoCards` | Spotlight video card config from DB | ✅ Default videos |
| `useDragReorder` | Pointer-based drag-and-drop reordering | — |
| `useMobile` | Mobile viewport detection | — |
| `useOnlineStatus` | Offline/online detection | — |
| `usePayments` | Payment CRUD (payments table) | — |
| `useSlotAvailability` | Property slots + per-date availability | — |
| `useInvoices` | Invoice retrieval by booking | — |
| `useOrders` | Order CRUD with items, active order tracking | — |
| `useSearch` | Debounced search across properties & curations | — |

---

## 🗄 Database Schema

### Tables (45 total)
| Table | Key Columns | Purpose |
|-------|------------|---------|
| `profiles` | user_id, display_name, avatar_url, bio, location, loyalty_points, tier | User profiles |
| `bookings` | user_id, property_id, booking_id, date, slot, guests, total, status, **payment_status**, **payment_id** | Booking records |
| `wishlists` | user_id, property_id | Saved properties |
| `conversations` | participant_1, participant_2, **type**, **property_id**, **metadata** | Chat threads (direct/support/group) |
| `messages` | conversation_id, sender_id, content, read | Chat messages |
| `notifications` | user_id, title, body, type, icon, read, action_url | Alerts |
| `reviews` | user_id, property_id, rating, content, photo_urls, verified | Property reviews |
| `review_responses` | review_id, host_id, content | Host replies |
| `loyalty_transactions` | user_id, title, points, type, icon | Point ledger |
| `referral_codes` | user_id, code, uses, reward_points | Referral codes |
| `referral_uses` | code_id, referrer_user_id, referred_user_id, credited | Usage tracking |
| `host_listings` | user_id, name, category, base_price, capacity, amenities, tags, image_urls, status, slots (JSONB), rules (JSONB), lat, lng | Property listings |
| `curations` | name, tagline, emoji, slot, includes[], tags[], mood[], price, property_id | Curated experience packs |
| `orders` | user_id, property_id, booking_id, total, status, assigned_to | In-stay food/drink orders |
| `order_items` | order_id, item_name, item_emoji, quantity, unit_price | Order line items |
| `order_notes` | order_id, content, author_name, author_role, user_id | Staff notes on orders |
| `spin_history` | user_id, points_won, prize_label, prize_emoji, spun_at | Daily spin wheel results |
| `user_milestones` | user_id, milestone_id, achieved_at | Achievement tracking |
| `user_roles` | user_id, role (app_role enum) | RBAC — super_admin, ops_manager, host, staff |
| `audit_logs` | user_id, entity_type, entity_id, action, details (JSONB) | Activity audit trail |
| `campaigns` | title, type, discount_type, discount_value, target_properties[], target_audience[] | Marketing campaigns |
| `coupons` | code, discount_type, discount_value, min_order, max_uses, expires_at | Discount codes |
| `property_tags` | name, icon, color | Tag definitions |
| `tag_assignments` | tag_id, target_id, target_type | Tag-to-entity mappings |
| `identity_verifications` | user_id, document_type, document_url, status, notes | ID verification queue |
| `inventory` | name, emoji, category, unit_price, stock, low_stock_threshold, property_id | Stock management |
| `staff_tasks` | title, description, priority, status, assigned_to, property_id | Staff task tracking |
| `app_config` | key, value, label, description, category, **updated_by** | Dynamic app configuration |
| `budget_allocations` | category, month, year, allocated, spent, notes | Budget tracking |
| `expenses` | title, amount, category, vendor, date, payment_method, recurring | Expense management |
| `experience_packages` | name, emoji, gradient, includes[], price, image_urls[] | Add-on experience packages |
| `staff_members` | name, role, department, salary, status, user_id | Staff directory |
| `staff_attendance` | staff_id, date, check_in, check_out, hours_worked | Attendance tracking |
| `staff_leaves` | staff_id, leave_type, start_date, end_date, status | Leave requests |
| `staff_salary_payments` | staff_id, amount, month, year, status | Payroll |
| `client_notes` | client_user_id, content, author_name, author_id, note_type | CRM notes |
| `booking_photos` | booking_id, photo_url, caption, user_id | Guest photos |
| `booking_splits` | booking_id, friend_name, friend_email, amount, status, **payment_status**, **payment_id**, **payment_link_url** | Split payment tracking |
| **`payments`** | booking_id, user_id, amount, currency, status, payment_method, gateway, gateway_order_id, gateway_payment_id | **Payment tracking (v1.22)** |
| **`refunds`** | payment_id, booking_id, amount, reason, status, gateway_refund_id, initiated_by | **Refund management (v1.22)** |
| **`invoices`** | booking_id, payment_id, user_id, invoice_number, amount, tax_amount, line_items (JSONB), pdf_url | **Invoice generation (v1.22)** |
| **`property_slots`** | property_id (FK host_listings), label, start_time, end_time, base_price, capacity, is_blocked | **Dedicated slot management (v1.22)** |
| **`slot_availability`** | slot_id (FK property_slots), date, booked_count, is_available, price_override | **Per-date availability + dynamic pricing (v1.22)** |
| **`notification_preferences`** | user_id, notification_type, channel (push/email/sms), enabled | **Granular notification opt-out (v1.22)** |
| **`push_tokens`** | user_id, token, platform (web/ios/android), active | **FCM push notification tokens (v1.22)** |

### Database Functions
| Function | Purpose |
|----------|---------|
| `award_loyalty_points(user_id, points, title, icon?)` | Add points + transaction |
| `redeem_loyalty_points(user_id, points, title, icon?)` | Deduct points if sufficient |
| `create_notification(user_id, title, body, type, icon?)` | Insert notification |
| `has_role(user_id, role)` | Check if user has a specific role (security definer) |

### Enums
| Enum | Values |
|------|--------|
| `app_role` | `super_admin`, `ops_manager`, `host`, `staff` |

### Clarifications (from v1.22 Audit)
- **`host_listings` vs "Properties"**: The table is named `host_listings` but is referred to as "Properties" throughout the UI and admin panel
- **`curations` vs `experience_packages`**: Curations are homepage discovery packs (e.g., "Date Night Deluxe"). Experience packages are add-on bundles within the Experience Builder during booking
- **`has_role()` default**: Returns FALSE when no entry exists — new users without roles are treated as regular authenticated users
- **"Work" category**: A cross-pillar filter/tag, not a standalone pillar. "Home" is the default unfiltered view
- **Spin Wheel guest mode**: Uses localStorage for mock spins. Authenticated spins are DB-enforced (1/day)
- **Booking Requests**: Accessible as a tab within the Bookings admin page, not a separate page
- **Finance Hub**: Revenue + Expenses + Budgets consolidated under Earnings in the admin sidebar

---

## 🔒 Security & RLS

All tables have Row-Level Security enabled:
- Users can only read/write their own data
- Conversations: participant match required
- Reviews: anyone can read, only author can write
- Host listings: owner can CRUD, anyone can read active listings
- **Admin access**: `has_role()` security definer function prevents recursive RLS
- **User roles**: Stored in dedicated `user_roles` table (never on profiles)
- Admin-only tables (audit_logs, user_roles management): require `super_admin` role
- Development overrides: Some tables have `public` SELECT policies for dev convenience (marked with "dev" suffix)

---

## 🔧 Tech Stack

React 18 · TypeScript 5.8 · Vite 8 · Tailwind CSS 3.4 · shadcn/ui · CVA · Framer Motion 12 · React Query 5 · React Router 6 · Lovable Cloud · Recharts 2 · React Hook Form 7 + Zod 3 · Vitest + Playwright

---

## 📋 Product Requirements Document (PRD)

### 1. Product Overview

**Product Name**: Hushh
**Tagline**: "Your Private Getaway"
**Version**: 1.23
**Platform**: Mobile-first Progressive Web App (PWA)
**Market**: Jeypore, Odisha, India (expanding to tier-2/3 cities)

### 2. Problem Statement

In tier-2/3 cities, there's no unified platform for discovering and booking private experiences. Customers rely on word-of-mouth, WhatsApp groups, and fragmented phone calls to find venues for celebrations, getaways, or workspace. Property owners lack tools to manage bookings, pricing, and guest communication professionally.

### 3. Solution

A marketplace connecting experience seekers with private venue owners, offering:
- **One-tap discovery** of curated stays, experiences, and services
- **Bundled experience packs** (curations) that eliminate decision fatigue
- **Real-time operations** for hosts (inventory, orders, staff management)
- **Gamified loyalty** to drive repeat bookings

### 4. Success Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Active Users (MAU) | 5,000+ | Auth sessions |
| Booking Conversion Rate | 8-12% | Bookings / Detail Views |
| Average Order Value (AOV) | ₹3,500+ | Revenue / Bookings |
| Repeat Booking Rate | 40%+ | Users with 2+ bookings |
| Host Onboarding | 50+ properties | Active listings |
| NPS Score | 60+ | Quarterly survey |
| App Rating | 4.5+ | Store reviews |

### 5. User Personas

#### Persona 1: Priya (The Planner)
- **Age**: 26 | **Role**: Marketing Executive
- **Goal**: Plan a memorable anniversary dinner
- **Pain**: Can't find unique venues beyond restaurants
- **Behavior**: Researches options 3-4 days ahead, budget-conscious but willing to splurge for quality
- **Feature needs**: Curations, reviews, split payments, photos

#### Persona 2: Rahul (The Spontaneous One)
- **Age**: 24 | **Role**: Software Developer
- **Goal**: Find a chill spot for tonight with friends
- **Pain**: Last-minute planning always falls apart
- **Behavior**: Decides same-day, values speed over perfection
- **Feature needs**: Tonight tags, active trip ordering, quick checkout

#### Persona 3: Sunita (The Host)
- **Age**: 42 | **Role**: Farmhouse Owner
- **Goal**: Monetize her property during weekdays
- **Pain**: Manages bookings via phone calls and notebooks
- **Behavior**: Not tech-savvy, needs simple tools
- **Feature needs**: Dashboard, calendar, inventory, staff management

#### Persona 4: Vikram (The Corporate Booker)
- **Age**: 35 | **Role**: HR Manager
- **Goal**: Book team outing venue with activities
- **Pain**: Coordinating venue + food + activities separately is exhausting
- **Behavior**: Books 2-4 weeks ahead, needs invoices and receipts
- **Feature needs**: Experience builder, bulk booking, receipts, curations

### 6. Feature Priority Matrix

| Priority | Feature | Status | Impact | Effort |
|----------|---------|--------|--------|--------|
| P0 (Must) | Property discovery & booking flow | ✅ Done | High | High |
| P0 (Must) | Authentication & user profiles | ✅ Done | High | Medium |
| P0 (Must) | Admin property CRUD | ✅ Done | High | High |
| P1 (Should) | Experience Builder (add-ons) | ✅ Done | High | Medium |
| P1 (Should) | Curated experience packs | ✅ Done | High | Medium |
| P1 (Should) | Live in-stay ordering | ✅ Done | Medium | Medium |
| P1 (Should) | Loyalty & gamification | ✅ Done | Medium | Medium |
| P1 (Should) | Admin CRM & analytics | ✅ Done | Medium | High |
| P2 (Nice) | Payment gateway integration | 🔜 Planned | High | Medium |
| P2 (Nice) | Push notifications (FCM) | 🔜 Planned | Medium | Medium |
| P2 (Nice) | Multi-language support | 🔜 Planned | Medium | Low |
| P2 (Nice) | AI-powered recommendations | 🔜 Planned | Medium | High |
| P3 (Later) | Native mobile apps (iOS/Android) | 📋 Backlog | High | Very High |
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
| Data Privacy | User data encrypted at rest, HTTPS enforced |

### 8. Release Roadmap

| Phase | Version | Timeline | Key Deliverables |
|-------|---------|----------|-----------------|
| Foundation | v1.0–1.3 | Complete | Core UI, booking flow, profiles |
| Backend | v1.4–1.6 | Complete | Auth, DB, real-time, host tools |
| Polish | v1.7–1.10 | Complete | Design system, feed, guest mode, docs |
| Monetization | v1.11–1.13 | Complete | Curations, ordering, gamification |
| Operations | v1.14–1.20 | Complete | Admin panel, CRM, CRUD, config, SEO |
| Payments | v2.0 | Planned | Razorpay/UPI integration, invoicing |
| Growth | v2.1 | Planned | Push notifications, referral 2.0, AI recs |
| Scale | v3.0 | Planned | Multi-city, vendor marketplace, native apps |

### 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low host adoption | High | Medium | Hands-on onboarding, zero listing fees initially |
| Payment fraud | High | Low | UPI verification, booking limits, admin review |
| Seasonal demand | Medium | High | Work-from-resort push, weekday pricing, corporate packages |
| Data loss | Critical | Low | Automated backups, RLS, audit logs |
| Competition from OTAs | Medium | Medium | Hyper-local focus, curated packs, personal touch |

---

## 🗺 App Blueprint

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  React   │  │ React    │  │ Framer   │  │Tailwind ││
│  │  Router  │  │ Query    │  │ Motion   │  │   CSS   ││
│  └────┬─────┘  └────┬─────┘  └──────────┘  └─────────┘│
│       │              │                                   │
│  ┌────▼──────────────▼─────────────────────────────────┐│
│  │              SUPABASE JS CLIENT                      ││
│  │   Auth · Realtime · Storage · PostgREST · Functions ││
│  └────────────────────┬────────────────────────────────┘│
└───────────────────────┼─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                  LOVABLE CLOUD                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │                EDGE FUNCTIONS                        ││
│  │  admin-ai · smart-alerts · auto-notifications       ││
│  │  property-history-ai · weekly-digest · staff-report ││
│  └────────────────────┬────────────────────────────────┘│
│  ┌────────────────────▼────────────────────────────────┐│
│  │              POSTGRESQL DATABASE                     ││
│  │  45 tables · RLS policies · Triggers · Functions    ││
│  └────────────────────┬────────────────────────────────┘│
│  ┌────────────────────▼────────────────────────────────┐│
│  │              STORAGE BUCKETS                         ││
│  │  listing-images · identity-docs · booking-photos    ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │           AUTHENTICATION (GoTrue)                    ││
│  │  Email/Password · Email Verification · Reset        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GUEST      │     │ AUTHENTICATED│     │    ADMIN      │
│   USER       │     │    USER      │     │   / HOST      │
└──────┬───────┘     └──────┬───────┘     └──────┬────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│                    APP SHELL (Index.tsx)                  │
│  Screen State Machine: home → detail → checkout → trips  │
└──────┬───────────────────┬──────────────────────┬────────┘
       │                   │                      │
       ▼                   ▼                      ▼
┌─────────────┐  ┌────────────────┐  ┌────────────────────┐
│ MOCK DATA   │  │ SUPABASE       │  │ ADMIN PANEL        │
│ (localStorage│  │ QUERIES        │  │ (/admin route)     │
│  + static)  │  │ (React Query)  │  │ 22 pages + sidebar │
└─────────────┘  └────────────────┘  └────────────────────┘
```

### Module Dependency Map

```
                          App.tsx
                            │
               ┌────────────┼────────────────┐
               ▼            ▼                ▼
          Index.tsx     Admin.tsx        Staff.tsx
               │            │                │
    ┌──────────┼──────┐     │          ┌─────┼─────┐
    ▼          ▼      ▼     ▼          ▼     ▼     ▼
  Home    PropertyD  Trips  AdminLayout StaffOrders
  Screen  Detail    Screen  (22 pages)  StaffTasks
    │                  │                StaffCheckin
    ├─SpotlightCarousel│
    ├─CategoryBar      ├─BookingDetail
    ├─ServiceGrid      │  └─LiveOrdering
    ├─CurationGrid     │  └─OrderNotes
    ├─FoodieCarousel   │
    ├─ActiveTripCard   ├─TripsScreen
    └─CuratedPackList  └─OrderHistory

SHARED HOOKS:
useAuth → useBookings → useWishlists → useMessages
useNotifications → useLoyalty → useReferrals → useReviews
useAdmin → useHostListings → useAppConfig
useHomepageSections → useHomepageFilters → useVideoCards
```

### State Management Architecture

```
┌─────────────────────────────────────────┐
│            GLOBAL STATE                  │
│                                          │
│  AuthProvider (React Context)            │
│    └─ user, session, signIn, signOut     │
│                                          │
│  ThemeProvider (React Context)           │
│    └─ theme: light | dark | auto         │
│                                          │
│  PrivacyModeProvider (Context)           │
│    └─ privacyMode, maskName()            │
│                                          │
│  PropertiesProvider (Context)            │
│    └─ dbProperties, categories           │
│                                          │
│  QueryClient (React Query)              │
│    └─ Server state cache + refetch       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            LOCAL STATE                   │
│                                          │
│  Index.tsx (Screen State Machine)        │
│    └─ screen, selectedProperty, cart     │
│                                          │
│  Component-level useState               │
│    └─ UI toggles, form fields, modals   │
│                                          │
│  localStorage (Guest Fallback)           │
│    └─ mock wishlists, trips, privacy     │
└─────────────────────────────────────────┘
```

### API & Edge Function Architecture

```
┌────────────────────────────────────────────────────────┐
│                  EDGE FUNCTIONS                         │
│                                                         │
│  POST /admin-ai                                        │
│    ├─ Input: { query: string }                         │
│    ├─ Process: AI model interprets natural language     │
│    └─ Output: { answer, data[], suggestions[] }        │
│                                                         │
│  POST /smart-alerts                                    │
│    ├─ Trigger: Cron or manual                          │
│    ├─ Check: Low stock, overdue tasks, anomalies       │
│    └─ Output: Creates notifications for admin          │
│                                                         │
│  POST /auto-notifications                              │
│    ├─ Trigger: Database webhook                        │
│    ├─ Events: Booking created, status changed          │
│    └─ Output: User notification + optional email       │
│                                                         │
│  POST /property-history-ai                             │
│    ├─ Input: { query, property_id? }                   │
│    ├─ Search: Booking + order history with AI          │
│    └─ Output: { results[], summary }                   │
│                                                         │
│  POST /weekly-digest                                   │
│    ├─ Trigger: Weekly cron                             │
│    ├─ Aggregate: Bookings, revenue, top properties     │
│    └─ Output: Email digest to admin                    │
│                                                         │
│  POST /staff-report                                    │
│    ├─ Input: { staff_id, period }                      │
│    └─ Output: Attendance, tasks, performance summary   │
└────────────────────────────────────────────────────────┘
```

### Security Architecture

```
┌────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                        │
│                                                         │
│  Layer 1: AUTHENTICATION (GoTrue)                      │
│    ├─ Email/Password with email verification           │
│    ├─ Password reset via magic link                    │
│    └─ JWT tokens with auto-refresh                     │
│                                                         │
│  Layer 2: AUTHORIZATION (RBAC)                         │
│    ├─ user_roles table (separate from profiles)        │
│    ├─ has_role() security definer function              │
│    └─ Roles: super_admin, ops_manager, host, staff     │
│                                                         │
│  Layer 3: ROW-LEVEL SECURITY (RLS)                     │
│    ├─ Every table has RLS enabled                      │
│    ├─ Users read/write only their own data             │
│    ├─ Public READ on listings, curations               │
│    └─ Admin tables: require has_role() check           │
│                                                         │
│  Layer 4: APPLICATION SECURITY                         │
│    ├─ No secrets in client code                        │
│    ├─ Publishable keys only in .env                    │
│    ├─ Edge functions for sensitive operations           │
│    └─ Identity verification for booking flow           │
└────────────────────────────────────────────────────────┘
```

---

## 📐 Wireframes

### Screen Layout Map

```
┌─────────────────────────────────────────────────────────┐
│                  APP SCREEN HIERARCHY                    │
│                                                         │
│  ┌──── Bottom Tab 1: EXPLORE ──────────────────────┐   │
│  │  HomeScreen                                      │   │
│  │  ├── RotatingSearchBar (top)                     │   │
│  │  ├── ActiveTripCard (if checked-in)              │   │
│  │  ├── CategoryBar (sticky, scrollable)            │   │
│  │  ├── SpotlightCarousel (video cards)             │   │
│  │  ├── PropertyCards (vertical scroll)             │   │
│  │  ├── SportsCards (horizontal)                    │   │
│  │  ├── FoodieCarousel (horizontal)                 │   │
│  │  ├── CoupleSpecials (grid)                       │   │
│  │  ├── ServiceGrid (2-col)                         │   │
│  │  ├── CuratedPackListing (tall video cards)       │   │
│  │  ├── WhatsHot + Events + Blockbuster             │   │
│  │  └── ExperienceCards (bottom)                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──── Bottom Tab 2: WISHLISTS ────────────────────┐   │
│  │  WishlistScreen                                  │   │
│  │  └── 2-column grid of PropertyCardSmall          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──── Bottom Tab 3: TRIPS ────────────────────────┐   │
│  │  TripsScreen                                     │   │
│  │  ├── Filter Tabs (All/Active/Upcoming/Past/Cancelled)│
│  │  ├── Identity Verification Banner (if needed)    │   │
│  │  └── Booking Cards (status badges, CTAs)         │   │
│  │      └── BookingDetailScreen                     │   │
│  │          ├── Property info + status banner        │   │
│  │          ├── LiveOrderingSheet (active trips)     │   │
│  │          ├── OrderHistory                         │   │
│  │          └── Cancel / Rebook actions              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──── Bottom Tab 4: MESSAGES ─────────────────────┐   │
│  │  MessagesScreen                                  │   │
│  │  ├── Conversation List (avatar + last message)   │   │
│  │  ├── Chat Thread (real-time)                     │   │
│  │  └── Help Section (dynamic contacts)             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──── Bottom Tab 5: PROFILE ──────────────────────┐   │
│  │  ProfileScreen                                   │   │
│  │  ├── Hero Card (avatar + glow + stats)           │   │
│  │  ├── Membership Badge (tier + points)            │   │
│  │  ├── Quick Stats (3 cards)                       │   │
│  │  ├── Achievements (horizontal scroll)            │   │
│  │  ├── Recent Activity (last 3 bookings)           │   │
│  │  ├── Grid Cards (Past Trips / Connections)       │   │
│  │  ├── Become a Host CTA                           │   │
│  │  ├── Theme Switcher                              │   │
│  │  ├── Social Links Footer                         │   │
│  │  ├── Terms & Privacy                             │   │
│  │  └── Version Text (5-tap → Docs Easter Egg)     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Booking Flow Wireframe

```
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   PROPERTY DETAIL │    │ EXPERIENCE BUILDER│    │   CHECKOUT        │
│                   │    │                   │    │                   │
│ ┌───────────────┐ │    │ ┌───────────────┐ │    │ ┌───────────────┐ │
│ │  Image Gallery│ │    │ │ Category Tabs │ │    │ │ Booking       │ │
│ │  (swipeable)  │ │    │ │ Food|Decor|DJ │ │    │ │ Summary       │ │
│ └───────────────┘ │    │ └───────────────┘ │    │ │ ┌───────────┐ │ │
│                   │    │                   │    │ │ │Property   │ │ │
│ ┌───────────────┐ │    │ ┌───────────────┐ │    │ │ │Date + Slot│ │ │
│ │ Name + Rating │ │    │ │ Add-on Item   │ │    │ │ │Guests     │ │ │
│ │ Location      │ │    │ │ [emoji] Name  │ │    │ │ └───────────┘ │ │
│ │ Tags          │ │    │ │   ₹XXX  [-][+]│ │    │ └───────────────┘ │
│ └───────────────┘ │    │ ├───────────────┤ │    │                   │
│                   │    │ │ Add-on Item   │ │    │ ┌───────────────┐ │
│ ┌───────────────┐ │    │ │ [emoji] Name  │ │    │ │ Add-on Items  │ │
│ │ Slot Picker   │ │    │ │   ₹XXX  [-][+]│ │    │ │ (line items)  │ │
│ │ ○ Morning     │ │    │ └───────────────┘ │    │ └───────────────┘ │
│ │ ● Evening     │ │    │                   │    │                   │
│ │ ○ Night       │ │    │ ┌───────────────┐ │    │ ┌───────────────┐ │
│ │ ○ Full Day    │ │    │ │ Suggested     │ │    │ │ Coupon Input  │ │
│ └───────────────┘ │    │ │ "Also add..."│ │    │ │ [__________]  │ │
│                   │    │ └───────────────┘ │    │ └───────────────┘ │
│ ┌───────────────┐ │    │                   │    │                   │
│ │ Date + Guests │ │    │ ════════════════  │    │ ┌───────────────┐ │
│ │ [📅] [- 4 +] │ │    │ Running Total:   │    │ │ Price         │ │
│ └───────────────┘ │    │ ₹X,XXX           │    │ │ Breakdown     │ │
│                   │    │                   │    │ │ Base: ₹XXXX   │ │
│ ┌───────────────┐ │    │ ┌───────────────┐ │    │ │ Add-ons: ₹XXX│ │
│ │ Reviews       │ │    │ │  [Continue →] │ │    │ │ Discount: -₹X│ │
│ │ ★★★★☆ (4.2)  │ │    │ └───────────────┘ │    │ │ ─────────────│ │
│ └───────────────┘ │    └───────────────────┘    │ │ Total: ₹XXXX │ │
│                   │                              │ └───────────────┘ │
│ ═══════════════   │                              │                   │
│ ┌───────────────┐ │    ┌───────────────────┐    │ ┌───────────────┐ │
│ │ [Book ₹XXXX] │ │───▶│   CONFIRMATION    │◀───│ │[Confirm Book] │ │
│ └───────────────┘ │    │                   │    │ └───────────────┘ │
└───────────────────┘    │  🎊 Confetti!     │    └───────────────────┘
                         │                   │
                         │  ✅ HUSHH-XXXXXX  │
                         │  +50 Loyalty Pts   │
                         │                   │
                         │  [View Trips]     │
                         └───────────────────┘
```

### Admin Panel Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN PANEL                                            [⌘K]   │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│ SIDEBAR │          MAIN CONTENT AREA                            │
│         │                                                       │
│ ┌─────┐ │  ┌─────────────────────────────────────────────────┐ │
│ │ 🏠  │ │  │ COMMAND CENTER                                  │ │
│ │Home │ │  │                                                  │ │
│ ├─────┤ │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │
│ │ 🤖  │ │  │  │ ₹42K │ │  28  │ │  12  │ │ 4.8★ │          │ │
│ │AI   │ │  │  │Rev.  │ │Books │ │Active│ │Rating│          │ │
│ ├─────┤ │  │  └──────┘ └──────┘ └──────┘ └──────┘          │ │
│ │ 🔔  │ │  │                                                  │ │
│ │Alert│ │  │  ┌─────────────────┐ ┌─────────────────┐       │ │
│ ├─────┤ │  │  │ LIVE ACTIVITY   │ │ PENDING ITEMS   │       │ │
│ │ 💰  │ │  │  │ ● New booking   │ │ □ 3 bookings    │       │ │
│ │Price│ │  │  │ ● Food order    │ │ □ 2 reviews     │       │ │
│ ├─────┤ │  │  │ ● Review posted │ │ □ 1 verification│       │ │
│ │ 📅  │ │  │  └─────────────────┘ └─────────────────┘       │ │
│ │Cal  │ │  └─────────────────────────────────────────────────┘ │
│ ├─────┤ │                                                       │
│ │ 📋  │ │  ┌─────────────────────────────────────────────────┐ │
│ │Req  │ │  │ PROPERTIES                              [+ New] │ │
│ ├─────┤ │  │                                                  │ │
│ │ 🏠  │ │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│ │Prop │ │  │  │ Villa    │ │Farmhouse │ │ Work Pod │       │ │
│ ├─────┤ │  │  │ ₹2,500   │ │ ₹1,800   │ │ ₹999     │       │ │
│ │ 📦  │ │  │  │ [Edit]   │ │ [Edit]   │ │ [Edit]   │       │ │
│ │Inv  │ │  │  └──────────┘ └──────────┘ └──────────┘       │ │
│ ├─────┤ │  └─────────────────────────────────────────────────┘ │
│ │ 👥  │ │                                                       │
│ │Users│ │  ┌─────────────────────────────────────────────────┐ │
│ ├─────┤ │  │ INVENTORY                         [Low Stock ⚠]│ │
│ │ ...  │ │  │                                                  │ │
│ │(+14 │ │  │  Category: [All ▼]  Search: [________]          │ │
│ │more)│ │  │                                                  │ │
│ └─────┘ │  │  ┌──────┬──────┬──────┬──────┬──────┐          │ │
│         │  │  │Item  │Price │Stock │Status│Action│          │ │
│         │  │  ├──────┼──────┼──────┼──────┼──────┤          │ │
│         │  │  │🍔Burger│₹250│  8   │ ✅  │ Edit │          │ │
│         │  │  │🍕Pizza │₹350│  3⚠ │ ✅  │ Edit │          │ │
│         │  │  │🍺Beer  │₹200│  24  │ ✅  │ Edit │          │ │
│         │  │  └──────┴──────┴──────┴──────┴──────┘          │ │
│         │  └─────────────────────────────────────────────────┘ │
└─────────┴───────────────────────────────────────────────────────┘
```

### Home Screen Wireframe (Mobile)

```
┌─────────────────────────┐
│ [👤]  Jeypore  [🔔·3]  │  ← Header: avatar, location, notifications
├─────────────────────────┤
│ [🔍 Search farmhouses...]│  ← Rotating placeholder
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🟢 Active Trip      │ │  ← Shows only when checked-in
│ │ Villa Sunset · Eve   │ │
│ │ [🍽 Order] [View →] │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ 🏠 Stays 🎭 Exp ✨ Cur │  ← Category bar (scrollable)
│  ───                    │
├─────────────────────────┤
│ ╔═════════════════════╗ │
│ ║   SPOTLIGHT VIDEO   ║ │  ← Autoplay video card
│ ║   "Bonfire Night"   ║ │
│ ║   ₹2,999            ║ │
│ ╚═════════════════════╝ │
│                         │
│ ┌──────┐ ┌──────┐      │
│ │ 🏡   │ │ 🌿   │      │  ← Property cards (2-col grid)
│ │Villa │ │Farm  │      │
│ │₹2.5K │ │₹1.8K │      │
│ │★4.8  │ │★4.5  │      │
│ └──────┘ └──────┘      │
│                         │
│ ── Sports ──            │
│ [🏸][🎯][🏊][🏓]       │  ← Horizontal sport icons
│                         │
│ ── Foodie Picks ──      │
│ [🍽 Thali][🕯 Candle]  │  ← Horizontal video cards
│                         │
│ ── Curated Packs ──     │
│ ┌─────────────────────┐ │
│ │ VIDEO BG            │ │  ← Tall vertical pack cards
│ │ "Date Night Deluxe" │ │
│ │ ₹3,999  (was ₹5,200)│ │
│ │ [Book Now]          │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ 🏠  ❤️  ✈️  💬  👤    │  ← Bottom navigation
│ Home Wish Trip Msg Prof │
└─────────────────────────┘
```

### Profile Screen Wireframe

```
┌─────────────────────────┐
│         Profile          │
├─────────────────────────┤
│                         │
│      ┌──────────┐       │
│      │  Avatar  │       │  ← Glow effect behind
│      │  (with   │       │
│      │  badge)  │       │
│      └──────────┘       │
│     Priya Sharma         │
│     📍 Jeypore           │
│     "Adventure seeker"   │
│                         │
│  ┌─────┬─────┬────────┐ │
│  │  12 │  8  │ 2 yrs  │ │  ← Stats row
│  │Trips│Revws│Member  │ │
│  └─────┴─────┴────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🥇 Gold Member      │ │  ← Membership badge
│ │ 1,240 pts · 3% back │ │
│ └─────────────────────┘ │
│                         │
│ Quick Stats             │
│ ┌──────┬──────┬──────┐  │
│ │  12  │   5  │₹42K  │  │
│ │Books │Saved │Spent │  │
│ └──────┴──────┴──────┘  │
│                         │
│ Achievements            │
│ [🌟Early][⭐5Star]→    │  ← Horizontal scroll
│                         │
│ Recent Activity         │
│ ┌─────────────────────┐ │
│ │ Villa Sunset · ₹3.2K│ │
│ │ Farmhouse · ₹1.8K   │ │
│ │ Pool Party · ₹4.5K  │ │
│ └─────────────────────┘ │
│                         │
│ ┌──────────┬──────────┐ │
│ │Past Trips│Connections│ │
│ └──────────┴──────────┘ │
│                         │
│ [🏠 Become a Host]     │
│                         │
│ [☀️ Light][🌙 Dark]    │  ← Theme toggle
│                         │
│ [📸 Insta][📘 FB][▶ YT]│  ← Social links
│ Terms · Privacy          │
│ v1.24                   │  ← 5-tap → easter egg
├─────────────────────────┤
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
```

### Database Entity Relationship Diagram

```
auth.users ─┬─ profiles (1:1)
            ├─ bookings ─┬─ orders → order_items
            │            │         → order_notes
            │            ├─ booking_splits ──→ payments
            │            ├─ booking_photos
            │            └─ payments → refunds
            │                       → invoices
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
            ├─ identity_verifications
            └─ spin_history

host_listings ─┬─ curations
               ├─ inventory
               ├─ property_slots → slot_availability
               └─ property_tags (via tag_assignments)

staff_members ─┬─ staff_attendance
               ├─ staff_leaves
               └─ staff_salary_payments

standalone: campaigns · coupons · expenses · budget_allocations · app_config · audit_logs · client_notes · experience_packages · staff_tasks
```

---

## 📋 Change History

> **Convention**: Every change MUST be logged here AND in `src/components/AppDocumentation.tsx` (`changeLog` array).

### v1.0 — Foundation
- Project scaffolding — React + Vite + Tailwind + TypeScript + shadcn/ui
- Animated splash screen, home screen, property cards, bottom nav
- 20+ mock properties with slots, pricing, amenities

### v1.1 — Booking Flow
- Experience Builder, checkout, confirmation with confetti
- Trips screen with tabs, booking detail with cancel/rebook

### v1.2 — Social & Discovery
- Search, map view, wishlists, messages, reviews

### v1.3 — Profile & Personalization
- Profile screen, edit profile, settings, theme switcher, public profiles

### v1.4 — Backend Integration (Lovable Cloud)
- Auth (email/password, verification, reset), database tables, RLS
- Real-time wishlists/bookings/messages

### v1.5 — Loyalty & Growth
- Loyalty system (5 pts/₹100, tiers), referrals, notifications

### v1.6 — Host Features
- Dashboard, create/edit listings, analytics

### v1.7 — Visual Identity & Polish
- Design system overhaul, AccentFrame, glassmorphism, video thumbnails, haptics

### v1.8 — Home Feed Enrichment
- Spotlight, sports, foodie, couples, events, curations, service grid, sticky tabs

### v1.9 — Mock Data & Guest Experience
- Full guest mode with mock data for all features

### v1.10 — Profile Redesign & Documentation
- Profile hero/achievements/activity redesign
- HUSHH.md + in-app documentation (easter egg: tap version 5×)
- Change history convention established

### v1.11 — Curations & Mood Discovery
- Mood Selector — emoji-based vibe picker filters entire feed
- 8 Curated Experience Packs with 1-tap booking
- CuratedPackCard with gradient headers, savings badges, strikethrough pricing
- Slot Intelligence — smart tags on time slots
- Dynamic Pricing — strikethrough prices, savings badges

### v1.12 — Monetization & Gamification (DB-Wired)
- Live Service Ordering — Swiggy-style bottom sheet
- Privacy Mode, Experience Builder Smart Nudges
- Spin Wheel — daily spin-to-win with weighted prizes
- Milestone Rewards — 6 achievements with point rewards

### v1.13 — Trip Experience & Active Booking
- Active Trip Card on Home, Trip Detail overhaul
- 12 demo bookings, status normalization, wishlist sanitization

### v1.14 — Loyalty & Rewards Redesign
- Gamified Loyalty Screen with tabbed interface
- Enhanced Spin Wheel with sound effects

### v1.15 — Add-on Icons & Curated Listings
- Per-item emoji icons, curated pack video backgrounds

### v1.16 — Admin Panel Foundation
- Admin layout with collapsible sidebar (22 nav items)
- Command Palette (⌘K) with fuzzy search
- Command Center dashboard with KPI cards, live activity feed
- Role-based access control via `user_roles` table and `has_role()` function
- Admin pages: Properties, Bookings, Users, Analytics, Curations, Campaigns, Coupons, Tags, Orders, Exports, AI Assistant, Smart Alerts, Audit Trail, Earnings, Dynamic Pricing, Achievements, Loyalty & Referrals
- Floating Checklist widget
- Edge functions: admin-ai, auto-notifications, smart-alerts, weekly-digest, property-history-ai

### v1.17 — Admin CRM & Property History
- **Client Directory (CRM 2.0)** — engagement scoring (0-100), journey timeline, stay/order/review aggregation from 9+ tables
- **Property History** — calendar-based stay tracking, chronological timeline, AI-powered natural language search
- AI search integrated into Command Center, Client Directory, and Property History
- Live Orders widget (Zomato-style), Live Pending tracker
- Booking Heatmap visualization
- Weekly Digest preview
- Auto-Actions panel for automated workflows
- Identity verification review queue in admin

### v1.18 — Database-Driven CRUD & Inventory
- **Properties fully database-driven** — all 28+ properties migrated from `properties.ts` to `host_listings` table
- **Full Property CRUD** — admin can edit name, pricing, images, tags, amenities, slots, rules, status, duplicate, delete
- **Inventory Management** — food/drink/activity stock tracking with low-stock alerts, category grouping, availability toggles
- `host_listings` schema expanded with 12 new columns (property_type, primary_category, lat/lng, highlights, slots JSONB, rules JSONB, host_name, rating, review_count)
- Coupons and campaigns seeded in database
- Identity verification enforcement on booking flow

### v1.19 — Dynamic App Configuration System
- **`app_config` table** — centralized key-value store for all runtime settings
- **Admin Settings page** — 3-tab interface (General, Branding, Advanced) for managing all config
- **Admin Homepage Manager** — 4-tab interface (Sections, Videos, Filters, Tags) for controlling user-facing homepage
- **Dynamic Branding** — `app_name`, `logo_url`, `app_tagline` wired to SplashScreen and HomeScreen header
- **Dynamic Homepage Sections** — visibility toggles and drag-to-reorder, stored as JSON in `homepage_sections` config
- **Dynamic Spotlight Videos** — admin edits video URLs and overlay text, wired to SpotlightCarousel via `useVideoCards`
- **Dynamic Filter Pills** — category filters for Stays/Experiences/Services/Curations editable in admin, wired via `useHomepageFilters`
- **Dynamic Support Contacts** — `support_phone`, `support_email`, `whatsapp_number` wired to MessagesScreen help section
- **Tags merged into Homepage Manager** — property tag CRUD consolidated under Homepage → Tags tab
- 4 new hooks: `useAppConfig`, `useHomepageSections`, `useHomepageFilters`, `useVideoCards`

### v1.20 — Social & Legal Integration
- **Social Media Links** — Instagram, Facebook, YouTube, Twitter URLs from branding config rendered as icons in ProfileScreen footer
- **Terms & Privacy Sheet** — dynamic legal links (terms_url, privacy_url, refund_policy_url) accessible from Profile settings
- Links only render when URLs are configured in admin, graceful empty state otherwise

### v1.21 — Product Planning & Documentation
- **Product Requirements Document (PRD)** — full PRD with personas, KPIs, priority matrix, risks, roadmap added to HUSHH.md
- **App Blueprint** — system architecture diagrams, data flow, module dependencies, state management, security layers, API architecture
- **Wireframes** — ASCII wireframes for all screens: home, booking flow, admin panel, profile, screen hierarchy, ER diagram
- **Easter Egg Docs Updated** — PRD, Blueprint, and Wireframe sections added to in-app documentation

### v1.22 — Schema Hardening & Audit Resolution
- **7 new database tables**: `payments`, `refunds`, `invoices`, `property_slots`, `slot_availability`, `notification_preferences`, `push_tokens` — total now 45 tables
- **Payment foundation**: `payments` table with Razorpay fields (gateway_order_id, gateway_payment_id, gateway_signature), `refunds` table with status tracking, `invoices` table with JSONB line_items
- **Slot management**: `property_slots` table replaces JSONB-only slots in host_listings, `slot_availability` tracks per-date booking counts and dynamic price overrides
- **Booking schema hardened**: `payment_status` + `payment_id` added to `bookings` table
- **Split payments**: `payment_status`, `payment_id`, `payment_link_url` added to `booking_splits`
- **Conversations enhanced**: `type` (direct/support/group), `property_id`, `metadata` fields added
- **Config audit trail**: `updated_by` added to `app_config`
- **FCM readiness**: `push_tokens` table with platform tracking (web/ios/android)
- **Notification granularity**: `notification_preferences` table for per-type per-channel opt-out
- **Documentation audit**: All 8 critical items resolved, 20+ warnings addressed, ER diagram updated, hooks reference expanded, clarifications added for naming conventions and feature boundaries
- **Realtime enabled**: `payments` and `slot_availability` tables added to supabase_realtime publication

### v1.23 — Complete Wireframes & Onboarding
- **8 new wireframes** added to documentation and easter egg UI:
  - **Experience Builder** — category tabs (Food/Decor/DJ/Transport), item cards with qty selectors, running total bar
  - **Checkout Screen** — property summary, price breakdown, coupon input, GST, conflict warning, confirm CTA
  - **Live Ordering Sheet** — category chips, menu items, add-to-cart, cart bar, order history
  - **Search Screen** — auto-focus input, category chips, recent searches, results grid, empty state
  - **Map View** — Leaflet map with pin markers, preview card on tap, list toggle
  - **Loyalty & Spin Wheel** — tier card with progress bar, spin wheel graphic, transaction history, milestones
  - **Auth / Onboarding** — sign-in, sign-up, guest mode, email verification flow
  - **Notifications Screen** — filter tabs, read/unread states, grouped by day, empty state
- **ER diagram updated** with complete payment flow relationships (payments → refunds → invoices)
- **Total wireframes**: 16 (8 user app + 8 admin app) — all revenue-critical screens now documented

### v1.24 — Resilience & Performance
- **React Error Boundaries**: Global + per-route ErrorBoundary components catch render crashes with "Try Again" recovery UI
- **Offline Detection**: `useOnlineStatus` hook + `OfflineBanner` component — animated top bar appears when device goes offline
- **Query Retry Config**: React Query configured with exponential backoff (2 retries, 1s→4s), 30s stale time, no refetch-on-focus
- **Mutation Retry**: Single retry for failed mutations
- **Rate Limiting Documented**: Auth (30/hr), Spin Wheel (1/day/user), Edge Functions (100 req/s), Search (client debounce 300ms)
- **Video & Asset Strategy Documented**: Lazy loading via IntersectionObserver, CDN-backed Supabase Storage, font preconnect + swap
- **Architecture Diagram Updated**: ErrorBoundary, OfflineBanner, and useOnlineStatus hook reflected in tree

### v1.25 — v2.0 Hooks
- **5 new hooks** built for Phase 1 tables:
  - `usePayments` — Payment CRUD, create payment, get payment by booking, auto-refresh
  - `useSlotAvailability` — Fetch property slots + per-date availability, remaining capacity calc, dynamic pricing
  - `useInvoices` — Invoice retrieval by user/booking, PDF URL access
  - `useOrders` — Order CRUD with nested items, active order tracking, create order with items
  - `useSearch` — Debounced (300ms) full-text search across host_listings + curations with category filtering
- **Total hooks**: 27 (up from 22)
- **Documentation & easter egg UI synced** with all new hooks

### v1.27 — Staff Portal Enhancement
- **3 new staff portal tabs**: Attendance, Leave, Salary (total: 7 tabs)
- **StaffAttendance** — Self check-in/check-out with time tracking, hours worked calculation, overtime detection, 14-day history
- **StaffLeaves** — Leave request form (Casual/Sick/Earned/Emergency), quota progress bars, approval status tracking, rejection notes
- **StaffSalary** — Monthly salary summary with base/bonus/deductions breakdown, net pay calculation, payment history, total earnings
- **Staff profile linking** — Components check `staff_members.user_id` to link auth users to staff profiles
- **StaffLayout updated** — 7-tab scrollable bottom nav (Orders, Check-In, Tasks, Clock, Leave, Pay, Stock)

### v1.27 — Wire Hooks into UI
- **SearchScreen** wired to `useSearch` — DB-powered search across `host_listings` and `curations` with debounced queries, displayed alongside local mock results
- **LiveOrderingSheet** enhanced — Awards loyalty points on order placement via `award_loyalty_points` RPC
- **PropertyDetail** wired to `useSlotAvailability` — Shows real-time "X spots left" from `property_slots` + `slot_availability` tables when date is selected
- **3 hooks now active in UI**: useSearch, useOrders (via LiveOrderingSheet), useSlotAvailability (via PropertyDetail)

### v1.28 — Rate Limiting & Resilience Hardening
- **Client-side rate limiter** (`src/lib/rate-limiter.ts`) — sliding window counter with configurable limits per action
- **Auth rate limiting**: Login (5 attempts/5 min), Signup (3/10 min), Password reset (3/15 min) — auto-resets on success
- **Order submission rate limiting**: 5 orders/minute per user — prevents duplicate submissions
- **Section-level error boundaries** on HomeScreen — crash in one feed section (spotlight, packs, foodie) doesn't kill the entire home feed
- **Rate limit configs**: `RATE_LIMITS` constant with predefined limits for AUTH_LOGIN, AUTH_SIGNUP, AUTH_RESET, ORDER_SUBMIT, SPIN_WHEEL, REVIEW_SUBMIT, SEARCH_QUERY
- **User-facing error messages**: Rate limit errors show human-readable retry times ("Try again in 3 minutes")
- **Audit report resolved**: All 8 critical issues confirmed fixed, 20+ warnings addressed, remaining items documented

### v1.29 — Native Android Distribution
- **Capacitor 8 Android integration** — WebView loads live published URL for instant web updates
- **GitHub Actions CI/CD pipeline** — auto-build debug APK on push to main branch
- **Java 21 + Gradle 8.14** build configuration
- **App ID**: `com.hushh.jeypore`, `capacitor.config.ts` with `server.url` pointing to published domain
- APK artifact uploaded to GitHub Actions for download — no rebuild needed for web changes

### v1.36 — Telegram Bot, AI Intelligence & APK Hardening

#### 🤖 Telegram Admin Bot
- **Bot polling** via `telegram-poll` Edge Function — receives and responds to admin messages
- **Auto-reply** for common customer queries (`/bookings`, `/menu`, `/help`, `/status`)
- **Auto-notifications** — booking created, order placed → instant Telegram alert to admin
- **Daily summary cron** — revenue, booking count, key metrics sent at 9 PM IST
- **11 admin commands**: `/report`, `/alerts`, `/lowstock`, `/tasks`, `/staff`, `/top`, `/expenses`, `/reviews`, `/confirm <id>`, `/cancel <id>`, `/broadcast <msg>`
- **AI-powered business intelligence** — admin asks natural language questions ("What was last week's revenue?") and gets real-time data-driven answers via Gemini AI
- **Test notifications panel** in Admin UI (`AdminTelegram.tsx`) — test all notification types

#### 📱 APK & Native Fixes
- **Crash fix** — `server` block properly stripped from `capacitor.config.ts` during CI build (replaced `sed` with reliable Node.js script)
- **No more Capacitor icon** — build workflow installs ImageMagick, generates all launcher icon densities from `app-icon.png`, creates solid dark (#050505) splash screens
- **Capacitor splash hidden immediately** — `SplashScreen.hide()` called in `initNativePlugins()` so React splash takes over instantly
- **WebView debugging enabled** — `webContentsDebuggingEnabled: true` for Chrome DevTools via `chrome://inspect`
- **Global error handlers** — `window.error` and `unhandledrejection` listeners in `main.tsx`

#### 🛡 Error Boundary Enhancement
- **Copy Log button** — crash screen now shows "Copy Log" with full stack trace, component tree, timestamp, URL, and user agent
- **Inline dark styling** — error screen renders correctly even if CSS fails to load
- **Clipboard fallback** — uses `document.execCommand('copy')` when `navigator.clipboard` unavailable (native WebView)

#### Edge Functions
| Function | Purpose |
|----------|---------|
| `telegram-poll` | Polls Telegram getUpdates, handles commands + AI queries |
| `telegram-notify` | Sends formatted notifications (booking, order, test) |
| `telegram-send` | Low-level Telegram message sender |
| `telegram-daily-summary` | Cron: daily metrics digest at 9 PM IST |
| `auto-notifications` | DB trigger: auto-send on booking/order create |

### v1.30 — Dark & Light Theme Polish
- **Light mode fixes** — removed blur/white overlay on Trips property images
- **Theme contrast improvements** across both dark and light modes
- **Refined card backgrounds**, borders, and shadow tokens for light theme
- Ensured all screens render correctly in both themes without hardcoded colors

### v1.31 — Home Performance Optimization
- **Replaced framer-motion AnimatePresence** with instant CSS renders on category tab switching
- **PullToRefresh rebuilt** with native CSS transforms — eliminated layout thrashing during scroll
- **Video carousel rootMargin reduced** (400px → 50px) to prevent GPU memory bloat from offscreen videos
- **LazySection** uses `content-visibility: auto` + `contain-intrinsic-size` for off-screen sections
- **SettingRow rebuilt** without framer-motion — pure CSS transitions for snappy settings pages
- **Removed `will-change: transform`** from video cards to reduce composited layers
- **Native `@keyframes spin`** in CSS replacing JS-driven spinner animation

---

## 📱 Mobile & Responsive Blueprint

> This section documents every mobile-specific decision so an AI can use it as a reference to build the web/desktop version.

### Distribution Strategy

| Channel | Technology | Details |
|---------|-----------|---------|
| **PWA** | VitePWA + Workbox | autoUpdate, standalone, portrait, installable from browser |
| **Android APK** | Capacitor 8 | WebView loads live URL (`lovableproject.com`), instant updates without rebuild |
| **CI/CD** | GitHub Actions | Auto-build debug APK on push to main, Java 21, Gradle 8.14 |

### Viewport & Layout

| Rule | Value | Purpose |
|------|-------|---------|
| Design target | 390×844px (iPhone 14/15) | Tested on 360px (Android) and 428px (Pro Max) |
| `overflow-x: hidden` | `html, body, #root` | Prevent horizontal drift from 3D card transforms |
| `overscroll-behavior-x: none` | `html, body, #root` | Disable rubber-band horizontal scroll |
| Layout | Single column stack | All primary screens, 2-col grids for property cards |
| Modals | Bottom sheets (Vaul) | Natural thumb reach zone instead of centered dialogs |
| Sticky elements | Bottom nav, category bar, booking CTA | Fixed/sticky positioning for key interactive elements |

### Responsive Layout Patterns

| Pattern | Screens | Details |
|---------|---------|---------|
| Single Column Stack | Home, Profile, Trips, Messages | Vertical scroll, no side-by-side panels |
| 2-Column Grid | Property cards, Stats, Wishlist | `grid-cols-2` at mobile width |
| Horizontal Carousels | Spotlight, Foodie, Sports, Achievements | `embla-carousel` or CSS `overflow-x-auto` with snap |
| Full-Screen Overlays | Search, Map, Documentation | Back navigation, no partial modals |
| Bottom Sheet Modals | Settings, Edit Profile, Split Pay | Vaul drawer, swipe-to-dismiss |

### Touch & Interaction

| Feature | Implementation |
|---------|---------------|
| Touch targets | 44px minimum, bottom nav icons 48px zones |
| Haptic feedback | `navigator.vibrate` on booking confirm, spin wheel, toggles |
| Animations | Framer Motion springs (stiffness: 300, damping: 30), `whileTap={{ scale: 0.95 }}` |
| Swipe gestures | Message conversations, pull-to-refresh (Home), gallery carousel |
| Scroll snap | `scroll-snap-type: x mandatory` on horizontal carousels |

### Mobile Typography Scale

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page titles | `text-2xl` (24px) | 900 (black) | Space Grotesk |
| Section headers | `text-base` (16px) | 900 (black) | Space Grotesk |
| Card titles | `text-sm` (14px) | 700 (bold) | Space Grotesk |
| Body text | `text-[13px]` | 500 (medium) | Space Grotesk |
| Labels & badges | `text-[11px]` | 700 (bold) | DM Sans |
| Micro text | `text-[9px]`–`text-[10px]` | 500 (medium) | DM Sans |
| Editorial overlays | `text-lg`–`text-2xl` | 700 (bold) | Playfair Display |

**Spacing:** Cards use `p-3` to `p-4` (12–16px). Section gaps: `space-y-4` to `space-y-6`. Screen horizontal padding: `px-4` (16px).

### Aspect Ratios & Media

| Element | Aspect Ratio | Details |
|---------|-------------|---------|
| Property card images | 16:10 (`aspect-[16/10]`) | `rounded-2xl`, `object-cover`, lazy loading |
| Spotlight video cards | 16:9 | Autoplay, muted, loop, `playsInline`, poster fallback |
| Gallery carousel | 4:3 | Full-width swipe, dot indicators |
| Avatar images | 1:1 (`rounded-full`) | w-10 to w-20 depending on context |
| Curated pack bg video | Full-screen | Absolute positioned, `object-cover`, z-0 |
| Map view | Full-viewport | Leaflet takes remaining height after header |
| Spin wheel | 1:1 (300×300) | Canvas-rendered, centered |

### Dual Theme System

All colors defined as HSL in `index.css` under `:root` (dark) and `.light`. Components use **semantic tokens only** — never hardcoded colors.

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--background` | 260 20% 6% | 260 20% 98% |
| `--foreground` | 0 0% 96% | 260 25% 12% |
| `--primary` | 270 80% 65% | 270 72% 52% |
| `--card` | 260 18% 10% | 0 0% 100% |
| `--muted` | 260 12% 16% | 260 14% 94% |
| `--border` | 260 15% 16% | 260 16% 90% |

Theme-aware utilities: `glass`/`glass-light`, `glow-sm/md/lg`, `shadow-card/elevated`, `text-gradient`. All transition in 0.4s.

### Mobile Performance Optimizations

| Optimization | Details |
|-------------|---------|
| Service Worker | Workbox: NetworkFirst for API, CacheFirst for static. 10MB max cache per file |
| Font Loading | 4 Google Fonts via `rel="preload" as="style"` + `onload` pattern. Non-render-blocking |
| LazySection | Home sections wrapped in `IntersectionObserver` — render only when in viewport |
| OptimizedImage | Native lazy loading, blur-up placeholder, error fallback. `object-cover` |
| Video Preloading | `lib/video-preloader.ts` preloads spotlight videos. `playsInline + muted + loop` for autoplay |
| React Query Cache | 30s staleTime, 2× retry with exponential backoff |
| Critical Preconnects | `fonts.googleapis.com`, `fonts.gstatic.com`, `supabase.co` |
| Inline Splash | HTML-inline splash (no JS) for instant FCP, replaced by React `SplashScreen` |

### Navigation Architecture

**Bottom Navigation (5 tabs):**

| Tab | Icon | Screen |
|-----|------|--------|
| Explore | 🏠 Home | HomeScreen — feed, search, categories |
| Wishlists | ❤️ Heart | WishlistScreen — saved properties grid |
| Trips | ✈️ Plane | TripsScreen — active/upcoming/past/cancelled |
| Messages | 💬 Chat | MessagesScreen — conversations + chat |
| Profile | 👤 User | ProfileScreen — settings, loyalty, host |

**Patterns:** State machine navigation (not React Router for internal screens), back button via `onBack` prop, sheet/drawer for settings, full-screen for search/map, tab memory preserved.

### Capacitor Configuration

| Config | Value |
|--------|-------|
| appId | `com.hushh.jeypore` |
| appName | `Hushh Jeypore` |
| webDir | `dist` |
| server.url | `https://hushh-jeypore.lovable.app` (live — instant updates) |
| Build pipeline | GitHub Actions → npm install → build → cap add android → cap sync → gradlew assembleDebug → APK artifact |

### Native Plugins (v1.35)

| Plugin | Purpose | Bridge File |
|--------|---------|-------------|
| `@capacitor/share` | Native share sheet for properties & referrals | `src/lib/native-share.ts` |
| `@capacitor/clipboard` | Copy referral codes, booking IDs | `src/lib/native-share.ts` |
| `@capacitor/network` | Detect WiFi/cellular/offline with real-time listener | `src/lib/native-network.ts` |
| `@capacitor/browser` | In-app browser for external links | `src/lib/native-browser.ts` |
| `@capacitor/preferences` | Persistent key-value storage (replaces localStorage) | `src/lib/native-preferences.ts` |
| `@capacitor/screen-orientation` | Portrait lock on native | `src/lib/native.ts` |
| `@capacitor/keyboard` | iOS keyboard resize mode | `src/lib/native.ts` |
| `@capacitor/app` | Android back button, deep links, app state | `src/lib/native.ts` |
| `@capacitor/push-notifications` | Native push registration & token storage | `src/lib/native.ts` |
| `@capacitor/haptics` | Impact/notification feedback | `src/lib/haptics.ts` |
| `@capacitor/status-bar` | Dark style, #050505 background | `src/lib/native.ts` |
| `@capacitor/camera` | Photo capture (available for reviews, profile) | Direct import |
| `@capacitor/geolocation` | GPS location for nearby properties | Direct import |
| `@capacitor/splash-screen` | Native splash with #050505 background | Capacitor config |
| `@capacitor/local-notifications` | Scheduled local alerts | Direct import |

### Fallback Chain Pattern

All native bridges follow a consistent fallback pattern:
```
Capacitor Native Plugin → Web API → Graceful no-op
```
Example: Share → `@capacitor/share` → `navigator.share()` → `clipboard.writeText()` → silent fail

### Native-Grade Caching (v1.35)

| Feature | Details |
|---------|---------|
| **Native Data Cache** | `src/lib/native-cache.ts` — cacheSet/cacheGet with TTL + stale-while-revalidate |
| **Prefetch on Launch** | Listings, curations, packages, app_config cached on cold start via `prefetchCriticalData()` |
| **CapacitorHttp** | Native HTTP stack enabled — bypasses WebView CORS, faster API calls |
| **WebView Tuning** | `androidScheme:'https'`, `allowMixedContent:true`, `captureInput:true`, `backgroundColor:#050505` |
| **Keyboard** | `resize:'body'`, `resizeOnFullScreen:true` — no layout reflow on input focus |
| **Launch Flow** | `initNativePlugins()` → `prefetchCriticalData()` → React render with cached data available instantly |

### PWA Configuration

| Property | Value |
|----------|-------|
| name | Hushh Jeypore |
| display | standalone |
| orientation | portrait |
| theme_color | #050505 |
| registerType | autoUpdate |
| icons | 192×192 + 512×512 (any maskable) |
| navigateFallbackDenylist | /sw-push.js |

### 🤖 AI Prompts for Web/Desktop Conversion

Use these prompts when converting the mobile-first app to a responsive web/desktop version:

1. **Layout Expansion**: Convert single-column mobile layout to multi-panel desktop: sidebar navigation (replace bottom nav), main content area, and optional right panel for details/chat. Use Tailwind `lg:` breakpoints.
2. **Navigation Upgrade**: Replace BottomNav with a persistent left sidebar (collapsible) for desktop. Add breadcrumbs. Convert full-screen overlays (search, map) to panels within the main layout.
3. **Grid Scaling**: Scale property card grids from 2-col (mobile) to 3-col (tablet) to 4-col (desktop). Increase card size proportionally. Add hover states (scale, shadow) that replace tap states.
4. **Bottom Sheets → Modals**: Convert all Vaul bottom sheet dialogs to centered Dialog modals for desktop. Keep bottom sheet behavior for mobile using `useMobile()` hook conditional.
5. **Table Views**: Admin panel: convert card-based mobile lists to full data tables with sorting, filtering, and pagination for desktop viewport. Use shadcn Table component.
6. **Split View**: Messages: implement split-pane layout — conversation list on left (300px), chat thread on right. Property Detail: sticky image gallery on left, info/booking on right.
7. **Responsive Typography**: Scale up: page titles to `text-3xl`, section headers to `text-xl`, body to `text-sm`. Increase spacing: `px-8` on desktop, `max-w-7xl` container.
8. **Mouse Interactions**: Add `hover:scale-105`, `hover:shadow-lg` on property cards. Replace `whileTap` with `whileHover`. Add keyboard shortcuts (Esc to close, Enter to confirm).

---

## 📐 Conventions & Guidelines

### Adding Features
1. Implement the feature
2. Add changelog entry to `HUSHH.md` under the appropriate version
3. Add entry to `src/components/AppDocumentation.tsx` `changeLog` array
4. Document new screens in Screen-by-Screen section

### Code Style
- Semantic design tokens only — never raw colors
- All colors in HSL
- Framer Motion for animations
- Refactor components >400 lines
- Mock fallbacks in hooks for guest mode

### File Naming
- Components: `PascalCase.tsx` | Hooks: `use-kebab.tsx` | Data: `kebab.ts` | Lib: `kebab.ts`

### Admin Development
- All admin components in `src/components/admin/`
- Admin page type must be added to `AdminPage` union in `AdminLayout.tsx`
- New pages must be added to: `AdminLayout` nav items, `CommandPalette` commands, `Admin.tsx` switch/case
- Always use `useAdmin()` hook for role checks — never client-side storage

---

## 🥚 Easter Eggs

| Trigger | Location | Result |
|---------|----------|--------|
| Tap version text 5× within 2s | Profile tab, bottom | Full in-app documentation overlay |

---

📄 **License**: Private — All rights reserved.
