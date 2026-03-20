/* Mock user profiles for guest mode */
export interface MockUserProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  tier: string;
  loyalty_points: number;
  created_at: string;
}

export const mockProfiles: Record<string, MockUserProfile> = {
  "mock-user-ananya": {
    user_id: "mock-user-ananya",
    display_name: "Ananya Sharma",
    avatar_url: null,
    bio: "Weekend wanderer 🌿 Love bonfires & good food. Jeypore local!",
    location: "Jeypore, India",
    tier: "Gold",
    loyalty_points: 320,
    created_at: "2024-06-15T00:00:00Z",
  },
  "mock-user-raj": {
    user_id: "mock-user-raj",
    display_name: "Raj Patel",
    avatar_url: null,
    bio: "Foodie & party lover 🎉 Always looking for the next hidden gem.",
    location: "Koraput, India",
    tier: "Silver",
    loyalty_points: 85,
    created_at: "2024-09-01T00:00:00Z",
  },
  "mock-user-priya": {
    user_id: "mock-user-priya",
    display_name: "Priya Mishra",
    avatar_url: null,
    bio: "Travel photographer 📸 Capturing moments, one trip at a time.",
    location: "Vizag, India",
    tier: "Platinum",
    loyalty_points: 620,
    created_at: "2024-03-10T00:00:00Z",
  },
  "mock-user-vikram": {
    user_id: "mock-user-vikram",
    display_name: "Vikram Das",
    avatar_url: null,
    bio: "Adventure seeker 🏔️ Camping, trekking & stargazing enthusiast.",
    location: "Bhubaneswar, India",
    tier: "Gold",
    loyalty_points: 210,
    created_at: "2024-07-20T00:00:00Z",
  },
  "mock-user-sneha": {
    user_id: "mock-user-sneha",
    display_name: "Sneha Reddy",
    avatar_url: null,
    bio: "Couple getaways & romantic dinners 💑 Living our best life.",
    location: "Hyderabad, India",
    tier: "Diamond",
    loyalty_points: 1050,
    created_at: "2023-12-01T00:00:00Z",
  },
  "mock-guest": {
    user_id: "mock-guest",
    display_name: "Guest Explorer",
    avatar_url: null,
    bio: "Explorer of hidden gems 🌿 Love bonfires, stargazing, and good coffee.",
    location: "Jeypore, India",
    tier: "Gold",
    loyalty_points: 320,
    created_at: "2024-01-15T00:00:00Z",
  },
};

/* Map static review names → mock user IDs */
export const reviewNameToUserId: Record<string, string> = {
  "Ananya S.": "mock-user-ananya",
  "Raj P.": "mock-user-raj",
  "Priya M.": "mock-user-priya",
  "Vikram D.": "mock-user-vikram",
  "Sneha R.": "mock-user-sneha",
  // Fallback patterns
  "Ananya": "mock-user-ananya",
  "Raj": "mock-user-raj",
  "Priya": "mock-user-priya",
  "Vikram": "mock-user-vikram",
  "Sneha": "mock-user-sneha",
};

export function getMockUserId(reviewerName: string): string {
  // Try exact match first
  if (reviewNameToUserId[reviewerName]) return reviewNameToUserId[reviewerName];
  // Try first name match
  const firstName = reviewerName.split(/[\s.]/)[0];
  if (reviewNameToUserId[firstName]) return reviewNameToUserId[firstName];
  // Default to first mock user
  return "mock-user-ananya";
}

/* Mock notifications for guest mode */
export const mockNotifications = [
  {
    id: "mock-n1",
    type: "booking",
    title: "Booking Confirmed! 🎉",
    body: "Your evening slot at Koraput Garden House on Mar 18 is confirmed.",
    icon: "🎫",
    read: false,
    action_url: null,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-n2",
    type: "promo",
    title: "Weekend Special 🔥",
    body: "Get 20% off all bonfire experiences this weekend. Use code FIRE20.",
    icon: "🎁",
    read: false,
    action_url: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-n3",
    type: "reminder",
    title: "Tomorrow's Trip 📍",
    body: "Don't forget your visit to The Firefly Villa tomorrow at 4 PM.",
    icon: "📍",
    read: true,
    action_url: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-n4",
    type: "reward",
    title: "You earned 150 pts! ⭐",
    body: "Your loyalty points from The Firefly Villa have been credited. Gold tier!",
    icon: "⭐",
    read: true,
    action_url: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-n5",
    type: "review",
    title: "Rate Your Experience",
    body: "How was your visit? Share feedback and earn 50 extra loyalty points.",
    icon: "💬",
    read: true,
    action_url: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/* Mock loyalty transactions for guest mode */
export const mockLoyaltyTransactions = [
  { id: "mock-lt1", type: "earn" as const, title: "Booking: The Firefly Villa", points: 75, icon: "🏨", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-lt2", type: "earn" as const, title: "Review: Koraput Garden", points: 20, icon: "⭐", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-lt3", type: "redeem" as const, title: "₹100 Cashback", points: -50, icon: "🎁", created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-lt4", type: "earn" as const, title: "Booking: Ember Grounds", points: 125, icon: "🏨", created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-lt5", type: "earn" as const, title: "Referral: Friend signup", points: 100, icon: "🎁", created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-lt6", type: "earn" as const, title: "Birthday bonus", points: 50, icon: "🎂", created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
];

/* Mock reviews for public profile */
export const mockUserReviews = [
  { id: "mock-r1", property_id: "1", rating: 5, content: "Absolutely magical experience! The fireflies were incredible.", photo_urls: [], verified: true, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-r2", property_id: "2", rating: 4, content: "Great garden, wonderful host. Will definitely come back!", photo_urls: [], verified: true, created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "mock-r3", property_id: "3", rating: 5, content: "Perfect for our group bonfire night. Amazing vibes!", photo_urls: [], verified: false, created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
];
