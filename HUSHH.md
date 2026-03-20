# 🏡 HUSHH — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.0 | Internal Documentation & Blueprint

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
8. [Design System](#-design-system)
9. [Architecture](#-architecture)
10. [Component Reference](#-component-reference)
11. [Hooks Reference](#-hooks-reference)
12. [Database Schema](#-database-schema)
13. [Security & RLS](#-security--rls)
14. [Tech Stack](#-tech-stack)
15. [Change History](#-change-history)
16. [Conventions & Guidelines](#-conventions--guidelines)
17. [Easter Eggs](#-easter-eggs)

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
Trips Tab → Upcoming/Completed/Cancelled → Detail → Cancel/Rebook
Messages Tab → Conversation list → Chat thread (real-time)
Profile Tab → Edit profile, Loyalty, Referrals, Host Dashboard, Settings, Theme
```

---

## 📱 Screen-by-Screen Documentation

### 1. Splash Screen (`SplashScreen.tsx`)
- Animated brand logo with spring physics, auto-transitions to Home after ~2s

### 2. Home / Explore (`HomeScreen.tsx`)
- **Header**: Profile avatar, location pill, notification bell (unread badge)
- **Rotating Search Bar**: Cycles through placeholder suggestions
- **Category Bar**: Horizontal tabs — Home, Stays, Experiences, Services, Curations, Work
  - Sub-filters per category, smooth scroll on switch (offset 280px on sub-filter)
- **Content Sections**: Spotlight Carousel, Property Cards (video thumbnails + AccentFrame), Sports Cards, Curated Combos, Foodie Carousel, Couple Specials, Service Grid, Curation Grid/Hero, What's Hot, Events, Blockbuster Banner, Experience Cards
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
- Tabs: Upcoming/Completed/Cancelled, booking cards, View/Cancel/Rebook actions

### 11. Booking Detail (`BookingDetailScreen.tsx`)
- Full booking info, status badge, cancel/rebook buttons

### 12. Messages Screen (`MessagesScreen.tsx`)
- Conversation list, unread badges, chat thread, message input

### 13. Profile Screen (`ProfileScreen.tsx`)
- **Hero Card**: Centered avatar with glow + verified badge, name, location, bio, stats (Trips/Reviews/Member)
- **Membership Badge**: Gold tier, points, cashback → Loyalty Screen
- **Quick Stats**: Bookings, Wishlisted, Total Spent
- **Achievements**: Horizontal scroll gradient cards (Early Adopter, 5-Star Guest, Party Starter, Romantico)
- **Recent Activity**: Last 3 bookings in contained card with ambient glow
- **Two Cards Grid**: Past Trips, Connections
- **Become a Host** CTA → Host Dashboard
- **Theme Switcher**: Light/Dark/Auto animated toggle
- **Settings Menu**: 10 items with sheets
- **Version text**: Tap 5× → App Documentation

### 14. Public Profile (`PublicProfileScreen.tsx`)
- User info, stats, achievements — works with mock profiles for guests

### 15–24. Supporting Screens
- Edit Profile Sheet, Settings Sheet, Loyalty Screen, Referral Screen, Notification Center, Host Dashboard, Create Listing, Host Analytics, Auth Screen, App Documentation

---

## ✨ Features — Guest Mode

Everything works without login using mock data:

| Feature | Mock Behavior |
|---------|--------------|
| Property browsing | Full catalog with video thumbnails |
| Property detail | Gallery, slots, reviews (clickable mock reviewers) |
| Wishlists | Local state, session-persistent |
| Trips | Sample completed bookings |
| Messages | Mock conversations |
| Notifications | 4 sample notifications |
| Loyalty | 320 points, Gold tier, mock transactions |
| Profile | "Guest Explorer" with mock stats |
| Search & Map | Full functionality |
| Theme | Light / Dark / Auto |

---

## 🔐 Features — Authenticated

| Feature | Database Table | Details |
|---------|---------------|---------|
| Auth | `auth.users` | Email/password, email verification, password reset |
| Profile | `profiles` | Display name, avatar, bio, location, loyalty pts, tier |
| Wishlists | `wishlists` | Real-time sync across devices |
| Bookings | `bookings` | Full CRUD, status management |
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
├── App.tsx                    # Router (/, /reset-password, 404)
├── pages/Index.tsx            # SPA shell — screen state machine + bottom nav
├── components/                # 40+ components (see Screen-by-Screen above)
│   ├── home/                  # 15 feed sub-components
│   ├── shared/AccentFrame.tsx # Reusable corner accent
│   └── ui/                    # 40+ shadcn/ui primitives
├── data/
│   ├── properties.ts          # 1525 lines — all mock property/package/combo data
│   └── mock-users.ts          # Mock profiles, notifications, loyalty
├── hooks/                     # 15 custom hooks (auth, data, UI)
├── lib/                       # Utilities (animations, haptics, share, cn)
└── integrations/              # Supabase client + Lovable
```

---

## 🪝 Hooks Reference

| Hook | Purpose | Guest Fallback |
|------|---------|---------------|
| `useAuth` | Auth context | — |
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

---

## 🗄 Database Schema

### Tables (16 total)
| Table | Key Columns | Purpose |
|-------|------------|---------|
| `profiles` | user_id, display_name, avatar_url, bio, location, loyalty_points, tier | User profiles |
| `bookings` | user_id, property_id, booking_id, date, slot, guests, total, status | Booking records |
| `wishlists` | user_id, property_id | Saved properties |
| `conversations` | participant_1, participant_2 | Chat threads |
| `messages` | conversation_id, sender_id, content, read | Chat messages |
| `notifications` | user_id, title, body, type, icon, read | Alerts |
| `reviews` | user_id, property_id, rating, content, photo_urls, verified | Property reviews |
| `review_responses` | review_id, host_id, content | Host replies |
| `loyalty_transactions` | user_id, title, points, type, icon | Point ledger |
| `referral_codes` | user_id, code, uses, reward_points | Referral codes |
| `referral_uses` | code_id, referrer_user_id, referred_user_id, credited | Usage tracking |
| `host_listings` | user_id, name, category, base_price, capacity, amenities, tags, image_urls, status | Host venues |
| `curations` | name, tagline, emoji, slot, includes[], tags[], mood[], price, original_price, gradient, badge, property_id, active, sort_order | Curated experience packs |
| `orders` | user_id, property_id, booking_id, total, status | In-stay food/drink orders |
| `order_items` | order_id, item_name, item_emoji, quantity, unit_price | Individual order line items |
| `spin_history` | user_id, points_won, prize_label, prize_emoji, spun_at | Daily spin wheel results |
| `user_milestones` | user_id, milestone_id, achieved_at | Achievement tracking |

### Database Functions
| Function | Purpose |
|----------|---------|
| `award_loyalty_points(user_id, points, title, icon?)` | Add points + transaction |
| `redeem_loyalty_points(user_id, points, title, icon?)` | Deduct points if sufficient |
| `create_notification(user_id, title, body, type, icon?)` | Insert notification |

---

## 🔒 Security & RLS

All tables have Row-Level Security enabled:
- Users can only read/write their own data
- Conversations: participant match required
- Reviews: anyone can read, only author can write
- Host listings: owner can CRUD, anyone can read active listings

---

## 🔧 Tech Stack

React 18 · TypeScript 5.8 · Vite 8 · Tailwind CSS 3.4 · shadcn/ui · CVA · Framer Motion 12 · React Query 5 · React Router 6 · Lovable Cloud · Recharts 2 · React Hook Form 7 + Zod 3 · Vitest + Playwright

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
- 8 Curated Experience Packs with 1-tap booking (After Hours Chill, Just Us Night, Party Scene, BBQ Bonfire, Movie Night, Game Night, Work Escape, Team Work Day)
- Tonight Tags — quick discovery filters
- CuratedPackCard with gradient headers, savings badges, strikethrough pricing
- Slot Intelligence — smart tags on time slots (Almost Full, Best Price, Trending)
- Dynamic Pricing — strikethrough prices, savings badges, viewers-now microcopy
- `curations` table created in DB with public read RLS, 8 seeded packs
- `use-curations` hook fetches from DB with fallback to static data

### v1.12 — Monetization & Gamification (DB-Wired)
- Live Service Ordering — Swiggy-style bottom sheet, 20-item menu, category filters, cart
  - Wired to `orders` + `order_items` tables with authenticated RLS
  - Accessible from booking confirmation via "Order Food & Drinks" button
- Privacy Mode — toggle masks names & booking IDs, persisted in localStorage
- Experience Builder Smart Nudges — contextual "People also added" suggestions
- Spin Wheel — daily spin-to-win with weighted prizes (5–100 pts)
  - Wired to `spin_history` table, 1 spin/day enforced via DB check
- Milestone Rewards — 6 achievements with point rewards
  - Wired to `user_milestones` table with unique(user_id, milestone_id)
- PrivacyModeProvider wraps entire app

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

---

## 🥚 Easter Eggs

| Trigger | Location | Result |
|---------|----------|--------|
| Tap version text 5× within 2s | Profile tab, bottom | Full in-app documentation overlay |

---

📄 **License**: Private — All rights reserved.
