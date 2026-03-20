# Hushh — Private Experience Marketplace

> **Made in Jeypore ❤️** | v1.0

Hushh is a premium mobile-first marketplace for booking private experiences, stays, and curated lifestyle services in Jeypore, India. Think Airbnb meets a concierge — but hyper-local, with a focus on curated combos and on-demand add-ons.

---

## 🏛 Core Concept — Four Pillars

| Pillar | What it means | Examples |
|--------|--------------|----------|
| **Stays** | Private spaces you can book by the slot | Farmhouses, Work Pods, Rooftops, Villas |
| **Experiences** | What happens at the space | Candlelight Dinner, House Party, Bonfire Night |
| **Services** | On-demand add-ons | Chef-on-Call, Decor Setup, DJ & Lights, Rides |
| **Curations** | Pre-built combos | "Date Night Deluxe", "Birthday Bash Package" |

A strategic focus is **"Work-from-resort"** for weekday monetization — featuring Work Pods and Quiet Rooms.

---

## 🗺 User Flow

```
Splash Screen
  └─▸ Home (Explore)
       ├─▸ Category Bar (filter by: Home, Stays, Experiences, Services, Curations, Work)
       ├─▸ Rotating Search Bar → Search Screen (full-text + filters)
       ├─▸ Map View (pin-based venue browsing)
       ├─▸ Notification Center (bell icon)
       ├─▸ Property Card tap → Property Detail
       │    ├─▸ Gallery, slots, reviews, "Enhance Your Stay" accordion
       │    ├─▸ Book → Experience Builder (add-ons selection)
       │    │    └─▸ Checkout Screen (payment summary)
       │    │         └─▸ Booking Confirmation (confetti + loyalty points)
       │    └─▸ Reviewer name tap → Public Profile
       ├─▸ Curated Combo Cards → Detail
       └─▸ Spotlight Carousel, Foodie Carousel, Sports Cards, Couple Specials, What's Hot, Events

Bottom Navigation:
  Explore | Wishlists | Trips | Messages | Profile

Profile Tab:
  ├─▸ Hero card (avatar, stats, bio)
  ├─▸ Membership badge → Loyalty Screen
  ├─▸ Achievements + Recent Activity
  ├─▸ Past Trips / Connections cards
  ├─▸ Become a Host → Host Dashboard
  │    ├─▸ Create / Edit Listing
  │    └─▸ Host Analytics
  ├─▸ Theme Switcher (Light / Dark / Auto)
  ├─▸ Settings menu → Settings Sheet
  ├─▸ Refer a Friend → Referral Screen
  ├─▸ Loyalty Points → Loyalty Screen
  └─▸ Sign in / Sign out
```

---

## ✨ Features

### Guest Experience (no login needed)
- Full property browsing with rich cards, video thumbnails, and L-shaped accent frames
- Property detail with gallery, slot picker, reviews, and related listings
- Mock wishlists, trips, messages, notifications, loyalty (320 pts / Gold tier)
- Mock public profiles for all reviewers (tap reviewer name → see profile)
- Search with rotating placeholder suggestions
- Map view with pins
- Theme switching (dark / light / auto)
- Pull-to-refresh on home feed
- Back-to-top floating button
- Haptic feedback (Web Vibration API) on interactions

### Authenticated Experience
- Email/password auth with email verification
- Password reset flow (`/reset-password`)
- Real wishlists, bookings, messages, notifications, loyalty (all from database)
- Booking flow: Select slot → Experience Builder (add-ons) → Checkout → Confirmation
- Loyalty points: earn 5 pts per ₹100 spent, redeem for cashback
- Referral system with unique codes and point rewards
- Real-time messaging (database-backed conversations)
- Notification center with read/unread state

### Host Features
- Host Dashboard with listing management
- Create / edit listings (name, category, pricing, capacity, amenities, photos)
- Host Analytics screen
- Toggle listing active/inactive status

### Design System
- **Fonts**: Space Grotesk (primary), Playfair Display (editorial), Plus Jakarta Sans, DM Sans
- **Colors**: Deep navy/purple-black base (#0C0B1D → #111028), vibrant purple primary (270° 80% 65%)
- **Effects**: Glassmorphism (`glass` utility), ambient radial glows, gradient borders
- **Visual Identity**: L-shaped corner accents (`AccentFrame`), asymmetric status tags (`AccentTag`)
- **Animations**: Framer Motion spring physics, staggered reveals, layout animations
- **Light mode**: Full light theme with adjusted tokens

---

## 🏗 Architecture

```
src/
├── App.tsx                    # Router: /, /reset-password, 404
├── pages/Index.tsx            # Main SPA shell — screen state machine + bottom nav
├── components/
│   ├── HomeScreen.tsx         # Explore tab with all sections
│   ├── home/                  # Home sub-components (carousels, grids, cards)
│   ├── PropertyCard.tsx       # Full-width listing card
│   ├── PropertyDetail.tsx     # Detail page with gallery + booking
│   ├── ExperienceBuilder.tsx  # Add-on selection step
│   ├── CheckoutScreen.tsx     # Payment summary
│   ├── ProfileScreen.tsx      # Profile tab
│   ├── AppDocumentation.tsx   # Hidden docs (tap version 5×)
│   └── ... (40+ components)
├── data/
│   ├── properties.ts          # Mock property/package/combo data
│   └── mock-users.ts          # Mock profiles for guest mode
├── hooks/                     # 15+ custom hooks for auth, data, UI
├── lib/                       # Utilities (animations, haptics, share)
└── integrations/              # Supabase client + Lovable
```

### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | Display name, avatar, bio, location, loyalty points, tier |
| `bookings` | Booking records with slot, date, guests, total, status |
| `wishlists` | User ↔ property wishlist joins |
| `conversations` | Two-participant chat threads |
| `messages` | Chat messages with read state |
| `notifications` | Push-style alerts per user |
| `reviews` | Property reviews with ratings and photos |
| `review_responses` | Host responses to reviews |
| `loyalty_transactions` | Point earn/redeem ledger |
| `referral_codes` | User referral codes |
| `referral_uses` | Code usage tracking |
| `host_listings` | User-created venue listings |

---

## 📋 Change History

> **Convention**: Every change is logged here AND in `src/components/AppDocumentation.tsx` (the in-app docs).

### v1.0 — Foundation
- Project scaffolding — React + Vite + Tailwind + TypeScript + shadcn/ui
- Animated splash screen, home screen, property cards, bottom nav
- 20+ mock properties with slots, pricing, amenities

### v1.1 — Booking Flow
- Experience Builder, checkout, confirmation with confetti
- Trips screen with upcoming/completed/cancelled tabs
- Booking detail with cancel/rebook

### v1.2 — Social & Discovery
- Search, map view, wishlists, messages, reviews

### v1.3 — Profile & Personalization
- Profile screen, edit profile, settings, theme switcher, public profiles

### v1.4 — Backend Integration
- Auth, database tables, RLS, real-time wishlists/bookings/messages

### v1.5 — Loyalty & Growth
- Loyalty system, referrals, notifications

### v1.6 — Host Features
- Dashboard, create/edit listings, analytics

### v1.7 — Visual Identity & Polish
- Design system overhaul, AccentFrame, glassmorphism, video thumbnails, haptics

### v1.8 — Home Feed Enrichment
- Spotlight, sports, foodie, couples, events, curations, service grid

### v1.9 — Mock Data & Guest Experience
- Full guest mode with mock data for all features

### v1.10 — Profile Redesign & Docs
- Profile hero/achievements/activity redesign
- README + in-app documentation (easter egg: tap version 5×)

---

## 🔧 Tech Stack

React 18 · TypeScript · Vite 8 · Tailwind CSS 3 · shadcn/ui · Framer Motion 12 · React Query · React Router v6 · Lovable Cloud · Recharts · React Hook Form + Zod

## 🚀 Getting Started

```bash
npm install
npm run dev
```

### Easter Egg 🥚
On the **Profile tab**, tap the version text **5 times** to reveal the full in-app documentation.

---

📄 **License**: Private — All rights reserved.
