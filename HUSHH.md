# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.21 | Internal Documentation & Blueprint

Hushh is a premium mobile-first marketplace for booking private experiences, stays, and curated lifestyle services in Jeypore, India. Think Airbnb meets a concierge — but hyper-local, with a focus on curated combos and on-demand add-ons.

**Published**: [hushh-jeypore.lovable.app](https://hushh-jeypore.lovable.app)

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
20. [Conventions & Guidelines](#-conventions--guidelines)
18. [Easter Eggs](#-easter-eggs)

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
│   ├── shared/AccentFrame.tsx # Reusable corner accent
│   └── ui/                    # 40+ shadcn/ui primitives
├── data/
│   ├── properties.ts          # Mock property/package/combo data (migrating to DB)
│   └── mock-users.ts          # Mock profiles, notifications, loyalty
├── hooks/                     # 16 custom hooks (auth, data, UI, admin)
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

---

## 🗄 Database Schema

### Tables (30+ total)
| Table | Key Columns | Purpose |
|-------|------------|---------|
| `profiles` | user_id, display_name, avatar_url, bio, location, loyalty_points, tier | User profiles |
| `bookings` | user_id, property_id, booking_id, date, slot, guests, total, status | Booking records |
| `wishlists` | user_id, property_id | Saved properties |
| `conversations` | participant_1, participant_2 | Chat threads |
| `messages` | conversation_id, sender_id, content, read | Chat messages |
| `notifications` | user_id, title, body, type, icon, read, action_url | Alerts |
| `reviews` | user_id, property_id, rating, content, photo_urls, verified | Property reviews |
| `review_responses` | review_id, host_id, content | Host replies |
| `loyalty_transactions` | user_id, title, points, type, icon | Point ledger |
| `referral_codes` | user_id, code, uses, reward_points | Referral codes |
| `referral_uses` | code_id, referrer_user_id, referred_user_id, credited | Usage tracking |
| `host_listings` | user_id, name, category, base_price, capacity, amenities, tags, image_urls, status, property_type, primary_category, lat, lng, highlights, slots (JSONB), rules (JSONB), host_name, rating, review_count, discount_label, entry_instructions | Property listings (fully database-driven) |
| `curations` | name, tagline, emoji, slot, includes[], tags[], mood[], price, original_price, gradient, badge, property_id, active, sort_order | Curated experience packs |
| `orders` | user_id, property_id, booking_id, total, status, assigned_to, assigned_name | In-stay food/drink orders |
| `order_items` | order_id, item_name, item_emoji, quantity, unit_price | Individual order line items |
| `spin_history` | user_id, points_won, prize_label, prize_emoji, spun_at | Daily spin wheel results |
| `user_milestones` | user_id, milestone_id, achieved_at | Achievement tracking |
| `user_roles` | user_id, role (app_role enum) | RBAC — super_admin, ops_manager, host, staff |
| `audit_logs` | user_id, entity_type, entity_id, action, details (JSONB) | Activity audit trail |
| `campaigns` | title, type, discount_type, discount_value, target_properties[], target_audience[], active | Marketing campaigns |
| `coupons` | code, discount_type, discount_value, min_order, max_uses, uses, expires_at, user_specific_id | Discount codes |
| `property_tags` | name, icon, color | Tag definitions |
| `tag_assignments` | tag_id, target_id, target_type | Tag-to-entity mappings |
| `identity_verifications` | user_id, document_type, document_url, status, notes, reviewed_by | ID verification queue |
| `inventory` | name, emoji, category, unit_price, stock, low_stock_threshold, available, property_id | Stock management |
| `staff_tasks` | title, description, priority, status, assigned_to, property_id, due_date | Staff task tracking |
| `app_config` | key, value, label, description, category | Dynamic app configuration (pricing, branding, support, homepage) |
| `budget_allocations` | category, month, year, allocated, spent, notes | Budget tracking |
| `expenses` | title, amount, category, vendor, date, payment_method, recurring | Expense management |
| `experience_packages` | name, emoji, gradient, includes[], price, image_urls[] | Add-on experience packages |

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
**Version**: 1.20
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
│  │  38 tables · RLS policies · Triggers · Functions    ││
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
│ v1.20                   │  ← 5-tap → easter egg
├─────────────────────────┤
│ 🏠  ❤️  ✈️  💬  👤    │
└─────────────────────────┘
```

### Database Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  auth.users  │     │   profiles   │     │  user_roles  │
│              │◄────│  user_id FK  │     │  user_id     │
│  id (PK)     │     │  display_name│     │  role (enum) │
│  email       │     │  avatar_url  │     └──────────────┘
└──────┬───────┘     │  loyalty_pts │
       │             │  tier        │     ┌──────────────┐
       │             └──────────────┘     │  wishlists   │
       │                                  │  user_id     │
       │     ┌──────────────┐            │  property_id │
       ├────▶│   bookings   │            └──────────────┘
       │     │  user_id     │
       │     │  property_id │────────┐   ┌──────────────┐
       │     │  date, slot  │        │   │host_listings │
       │     │  guests,total│        └──▶│  id (PK)     │
       │     │  status      │            │  user_id     │
       │     └──────┬───────┘            │  name, price │
       │            │                    │  category    │
       │            │                    │  amenities[] │
       │     ┌──────▼───────┐            │  image_urls[]│
       │     │   orders     │            │  slots JSONB │
       │     │  booking_id  │            │  status      │
       │     │  property_id │            └──────────────┘
       │     │  total,status│
       │     └──────┬───────┘            ┌──────────────┐
       │            │                    │  curations   │
       │     ┌──────▼───────┐            │  name, price │
       │     │ order_items  │            │  includes[]  │
       │     │  order_id FK │            │  mood[], tags│
       │     │  item_name   │            │  property_id │
       │     │  qty, price  │            └──────────────┘
       │     └──────────────┘
       │                                 ┌──────────────┐
       │     ┌──────────────┐            │  inventory   │
       ├────▶│   reviews    │            │  name, stock │
       │     │  user_id     │            │  category    │
       │     │  property_id │            │  unit_price  │
       │     │  rating      │            │  property_id │
       │     │  content     │            └──────────────┘
       │     └──────────────┘
       │                                 ┌──────────────┐
       │     ┌──────────────┐            │  campaigns   │
       ├────▶│conversations │            │  title, type │
       │     │participant_1 │            │  discount    │
       │     │participant_2 │            │  targets[]   │
       │     └──────┬───────┘            └──────────────┘
       │            │
       │     ┌──────▼───────┐            ┌──────────────┐
       │     │  messages    │            │   coupons    │
       │     │conversation_id            │  code        │
       │     │sender_id     │            │  discount    │
       │     │content, read │            │  max_uses    │
       │     └──────────────┘            └──────────────┘
       │
       │     ┌──────────────┐            ┌──────────────┐
       ├────▶│notifications │            │staff_members │
       │     │  user_id     │            │  name, role  │
       │     │  title, body │            │  department  │
       │     │  type, read  │            │  salary      │
       │     └──────────────┘            └──────────────┘
       │
       │     ┌──────────────┐
       └────▶│loyalty_trans │
             │  user_id     │
             │  points, type│
             └──────────────┘
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
