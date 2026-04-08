/**
 * Centralized demo/mock data for admin panel pages.
 * Used as fallback when Supabase returns empty results.
 * All dates are relative to "now" so they always look fresh.
 */

const now = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000);

// ─── Property/Listing data ───

export const DEMO_LISTINGS = [
  { id: "demo-l1", name: "The Firefly Villa", status: "published", category: "couples", base_price: 8500, capacity: 10, location: "Jeypore, Odisha", rating: 4.9, image_urls: [], created_at: daysAgo(120).toISOString() },
  { id: "demo-l2", name: "Anniversary Garden", status: "published", category: "couples", base_price: 7000, capacity: 6, location: "Jeypore, Odisha", rating: 4.9, image_urls: [], created_at: daysAgo(90).toISOString() },
  { id: "demo-l3", name: "Smash Pickleball Club", status: "published", category: "sports", base_price: 1999, capacity: 20, location: "Jeypore, Odisha", rating: 4.6, image_urls: [], created_at: daysAgo(60).toISOString() },
  { id: "demo-l4", name: "Blue Lagoon Pool", status: "published", category: "pool", base_price: 3800, capacity: 15, location: "Jeypore, Odisha", rating: 4.7, image_urls: [], created_at: daysAgo(80).toISOString() },
  { id: "demo-l5", name: "Stargazer Rooftop", status: "published", category: "experience", base_price: 2800, capacity: 8, location: "Jeypore, Odisha", rating: 4.8, image_urls: [], created_at: daysAgo(45).toISOString() },
  { id: "demo-l6", name: "Ember Grounds BBQ", status: "published", category: "party", base_price: 4500, capacity: 25, location: "Jeypore, Odisha", rating: 4.5, image_urls: [], created_at: daysAgo(100).toISOString() },
  { id: "demo-l7", name: "Tribal Heritage Camp", status: "published", category: "experience", base_price: 3200, capacity: 12, location: "Koraput, Odisha", rating: 4.8, image_urls: [], created_at: daysAgo(70).toISOString() },
  { id: "demo-l8", name: "Moonrise Terrace", status: "published", category: "couples", base_price: 5500, capacity: 4, location: "Jeypore, Odisha", rating: 4.9, image_urls: [], created_at: daysAgo(110).toISOString() },
  { id: "demo-l9", name: "Work Pod Alpha", status: "published", category: "service", base_price: 499, capacity: 2, location: "Jeypore, Odisha", rating: 4.4, image_urls: [], created_at: daysAgo(30).toISOString() },
  { id: "demo-l10", name: "Chef on Call", status: "published", category: "service", base_price: 1500, capacity: 1, location: "Jeypore, Odisha", rating: 4.7, image_urls: [], created_at: daysAgo(55).toISOString() },
];

// ─── Bookings data (matches user-side demo bookings) ───

export const DEMO_BOOKINGS = [
  { id: "demo-b1", property_id: "demo-l1", booking_id: "HUSHH-ACT001", date: fmt(daysAgo(0)), slot: "Evening · 6 PM – 11 PM", guests: 4, total: 8500, status: "active", user_id: "demo-u1", created_at: daysAgo(2).toISOString(), updated_at: daysAgo(0).toISOString() },
  { id: "demo-b2", property_id: "demo-l5", booking_id: "HUSHH-UP0025", date: fmt(daysFromNow(5)), slot: "Night · 7 PM – 11 PM", guests: 2, total: 4200, status: "upcoming", user_id: "demo-u2", created_at: daysAgo(1).toISOString(), updated_at: daysAgo(1).toISOString() },
  { id: "demo-b3", property_id: "demo-l3", booking_id: "HUSHH-UP0026", date: fmt(daysFromNow(10)), slot: "Full Day · 10 AM – 10 PM", guests: 12, total: 18500, status: "upcoming", user_id: "demo-u3", created_at: daysAgo(3).toISOString(), updated_at: daysAgo(3).toISOString() },
  { id: "demo-b4", property_id: "demo-l8", booking_id: "HUSHH-UP0027", date: fmt(daysFromNow(15)), slot: "Morning · 9 AM – 1 PM", guests: 8, total: 6400, status: "upcoming", user_id: "demo-u4", created_at: daysAgo(5).toISOString(), updated_at: daysAgo(5).toISOString() },
  { id: "demo-b5", property_id: "demo-l2", booking_id: "HUSHH-CP0012", date: fmt(daysAgo(10)), slot: "Full Day · 10 AM – 10 PM", guests: 8, total: 15200, status: "completed", user_id: "demo-u1", created_at: daysAgo(15).toISOString(), updated_at: daysAgo(10).toISOString() },
  { id: "demo-b6", property_id: "demo-l4", booking_id: "HUSHH-CP0011", date: fmt(daysAgo(20)), slot: "Evening · 5 PM – 10 PM", guests: 6, total: 9800, status: "completed", user_id: "demo-u5", created_at: daysAgo(25).toISOString(), updated_at: daysAgo(20).toISOString() },
  { id: "demo-b7", property_id: "demo-l6", booking_id: "HUSHH-CP0010", date: fmt(daysAgo(30)), slot: "Night · 8 PM – 12 AM", guests: 2, total: 3500, status: "completed", user_id: "demo-u2", created_at: daysAgo(35).toISOString(), updated_at: daysAgo(30).toISOString() },
  { id: "demo-b8", property_id: "demo-l7", booking_id: "HUSHH-CP0009", date: fmt(daysAgo(45)), slot: "Full Day · 10 AM – 10 PM", guests: 15, total: 22000, status: "completed", user_id: "demo-u3", created_at: daysAgo(50).toISOString(), updated_at: daysAgo(45).toISOString() },
  { id: "demo-b9", property_id: "demo-l3", booking_id: "HUSHH-CP0008", date: fmt(daysAgo(60)), slot: "Night · 9 PM – 2 AM", guests: 10, total: 14500, status: "completed", user_id: "demo-u6", created_at: daysAgo(65).toISOString(), updated_at: daysAgo(60).toISOString() },
  { id: "demo-b10", property_id: "demo-l1", booking_id: "HUSHH-CP0007", date: fmt(daysAgo(75)), slot: "Evening · 5 PM – 11 PM", guests: 4, total: 7200, status: "completed", user_id: "demo-u4", created_at: daysAgo(80).toISOString(), updated_at: daysAgo(75).toISOString() },
  { id: "demo-b11", property_id: "demo-l5", booking_id: "HUSHH-CX0005", date: fmt(daysAgo(15)), slot: "Night · 8 PM – 1 AM", guests: 2, total: 6000, status: "cancelled", user_id: "demo-u7", created_at: daysAgo(20).toISOString(), updated_at: daysAgo(15).toISOString() },
  { id: "demo-b12", property_id: "demo-l9", booking_id: "HUSHH-CX0004", date: fmt(daysAgo(50)), slot: "Morning · 10 AM – 2 PM", guests: 4, total: 2800, status: "cancelled", user_id: "demo-u8", created_at: daysAgo(55).toISOString(), updated_at: daysAgo(50).toISOString() },
];

// ─── Profiles / Users ───

export const DEMO_PROFILES = [
  { id: "demo-u1", user_id: "demo-u1", display_name: "Amrit Patel", email: "amrit@example.com", phone: "+91 98765 43210", tier: "gold", loyalty_points: 850, location: "Jeypore", created_at: daysAgo(180).toISOString(), avatar_url: null },
  { id: "demo-u2", user_id: "demo-u2", display_name: "Priya Sharma", email: "priya@example.com", phone: "+91 87654 32109", tier: "silver", loyalty_points: 420, location: "Jeypore", created_at: daysAgo(120).toISOString(), avatar_url: null },
  { id: "demo-u3", user_id: "demo-u3", display_name: "Rahul Mishra", email: "rahul@example.com", phone: "+91 76543 21098", tier: "bronze", loyalty_points: 180, location: "Koraput", created_at: daysAgo(90).toISOString(), avatar_url: null },
  { id: "demo-u4", user_id: "demo-u4", display_name: "Sneha Reddy", email: "sneha@example.com", phone: "+91 65432 10987", tier: "gold", loyalty_points: 1200, location: "Jeypore", created_at: daysAgo(200).toISOString(), avatar_url: null },
  { id: "demo-u5", user_id: "demo-u5", display_name: "Vikram Das", email: "vikram@example.com", phone: "+91 54321 09876", tier: "silver", loyalty_points: 350, location: "Jeypore", created_at: daysAgo(60).toISOString(), avatar_url: null },
  { id: "demo-u6", user_id: "demo-u6", display_name: "Ananya Mohanty", email: "ananya@example.com", phone: "+91 43210 98765", tier: "bronze", loyalty_points: 90, location: "Koraput", created_at: daysAgo(45).toISOString(), avatar_url: null },
  { id: "demo-u7", user_id: "demo-u7", display_name: "Kiran Behera", email: "kiran@example.com", phone: "+91 32109 87654", tier: "bronze", loyalty_points: 50, location: "Jeypore", created_at: daysAgo(30).toISOString(), avatar_url: null },
  { id: "demo-u8", user_id: "demo-u8", display_name: "Meera Rao", email: "meera@example.com", phone: "+91 21098 76543", tier: "silver", loyalty_points: 280, location: "Jeypore", created_at: daysAgo(150).toISOString(), avatar_url: null },
];

// ─── Orders ───

export const DEMO_ORDERS = [
  { id: "demo-o1", booking_id: "demo-b1", property_id: "demo-l1", user_id: "demo-u1", total: 1250, status: "delivered", created_at: daysAgo(0).toISOString(), notes: "" },
  { id: "demo-o2", booking_id: "demo-b5", property_id: "demo-l2", user_id: "demo-u1", total: 890, status: "delivered", created_at: daysAgo(10).toISOString(), notes: "" },
  { id: "demo-o3", booking_id: "demo-b6", property_id: "demo-l4", user_id: "demo-u5", total: 1450, status: "delivered", created_at: daysAgo(20).toISOString(), notes: "" },
  { id: "demo-o4", booking_id: "demo-b1", property_id: "demo-l1", user_id: "demo-u1", total: 650, status: "pending", created_at: daysAgo(0).toISOString(), notes: "Extra naan x2" },
  { id: "demo-o5", booking_id: "demo-b8", property_id: "demo-l7", user_id: "demo-u3", total: 2100, status: "delivered", created_at: daysAgo(45).toISOString(), notes: "" },
];

export const DEMO_ORDER_ITEMS = [
  { id: "oi1", order_id: "demo-o1", item_name: "Paneer Tikka", item_emoji: "🧀", quantity: 2, unit_price: 250, total: 500 },
  { id: "oi2", order_id: "demo-o1", item_name: "Butter Naan", item_emoji: "🫓", quantity: 5, unit_price: 50, total: 250 },
  { id: "oi3", order_id: "demo-o1", item_name: "Masala Chai", item_emoji: "🍵", quantity: 4, unit_price: 80, total: 320 },
  { id: "oi4", order_id: "demo-o2", item_name: "Tribal Thali", item_emoji: "🍛", quantity: 2, unit_price: 350, total: 700 },
  { id: "oi5", order_id: "demo-o3", item_name: "BBQ Platter", item_emoji: "🍖", quantity: 1, unit_price: 850, total: 850 },
  { id: "oi6", order_id: "demo-o3", item_name: "Cold Coffee", item_emoji: "☕", quantity: 3, unit_price: 200, total: 600 },
  { id: "oi7", order_id: "demo-o4", item_name: "Butter Naan", item_emoji: "🫓", quantity: 4, unit_price: 50, total: 200 },
  { id: "oi8", order_id: "demo-o4", item_name: "Dal Fry", item_emoji: "🫘", quantity: 2, unit_price: 180, total: 360 },
  { id: "oi9", order_id: "demo-o5", item_name: "Party Platter", item_emoji: "🎉", quantity: 1, unit_price: 1500, total: 1500 },
  { id: "oi10", order_id: "demo-o5", item_name: "Mocktails", item_emoji: "🍹", quantity: 6, unit_price: 100, total: 600 },
];

// ─── Reviews ───

export const DEMO_REVIEWS = [
  { id: "demo-r1", property_id: "demo-l1", user_id: "demo-u1", rating: 5, content: "Absolutely magical evening! The bonfire setup was perfect and the pool was pristine.", created_at: daysAgo(5).toISOString() },
  { id: "demo-r2", property_id: "demo-l2", user_id: "demo-u2", rating: 5, content: "Rose petals, live music, and the best anniversary dinner. Rekha was an amazing host.", created_at: daysAgo(12).toISOString() },
  { id: "demo-r3", property_id: "demo-l3", user_id: "demo-u3", rating: 4, content: "Great pickleball courts and the snack bar was awesome. Will come back!", created_at: daysAgo(18).toISOString() },
  { id: "demo-r4", property_id: "demo-l4", user_id: "demo-u5", rating: 5, content: "The pool lights at night were breathtaking. Perfect for our group outing.", created_at: daysAgo(22).toISOString() },
  { id: "demo-r5", property_id: "demo-l7", user_id: "demo-u6", rating: 5, content: "An authentic tribal experience. The dance performance was unforgettable!", created_at: daysAgo(40).toISOString() },
];

// ─── Inventory ───

export const DEMO_INVENTORY = [
  { id: "inv1", name: "Paneer Tikka", emoji: "🧀", stock: 45, low_stock_threshold: 10, available: true, category: "food", unit_price: 250, unit: "plate", property_id: null, sort_order: 1, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv2", name: "Butter Naan", emoji: "🫓", stock: 120, low_stock_threshold: 20, available: true, category: "food", unit_price: 50, unit: "piece", property_id: null, sort_order: 2, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv3", name: "Tribal Thali", emoji: "🍛", stock: 30, low_stock_threshold: 5, available: true, category: "food", unit_price: 350, unit: "plate", property_id: null, sort_order: 3, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv4", name: "BBQ Platter", emoji: "🍖", stock: 15, low_stock_threshold: 5, available: true, category: "food", unit_price: 850, unit: "platter", property_id: null, sort_order: 4, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv5", name: "Masala Chai", emoji: "🍵", stock: 200, low_stock_threshold: 30, available: true, category: "beverage", unit_price: 80, unit: "cup", property_id: null, sort_order: 5, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv6", name: "Cold Coffee", emoji: "☕", stock: 80, low_stock_threshold: 15, available: true, category: "beverage", unit_price: 200, unit: "glass", property_id: null, sort_order: 6, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv7", name: "Mocktails", emoji: "🍹", stock: 60, low_stock_threshold: 10, available: true, category: "beverage", unit_price: 100, unit: "glass", property_id: null, sort_order: 7, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv8", name: "Party Platter", emoji: "🎉", stock: 8, low_stock_threshold: 3, available: true, category: "food", unit_price: 1500, unit: "platter", property_id: null, sort_order: 8, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv9", name: "Fairy Lights Set", emoji: "✨", stock: 3, low_stock_threshold: 5, available: true, category: "decor", unit_price: 500, unit: "set", property_id: null, sort_order: 9, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv10", name: "Bonfire Kit", emoji: "🔥", stock: 12, low_stock_threshold: 3, available: true, category: "supplies", unit_price: 300, unit: "kit", property_id: null, sort_order: 10, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv11", name: "Rose Petals Bag", emoji: "🌹", stock: 25, low_stock_threshold: 5, available: true, category: "decor", unit_price: 150, unit: "bag", property_id: null, sort_order: 11, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
  { id: "inv12", name: "Dal Fry", emoji: "🫘", stock: 50, low_stock_threshold: 10, available: true, category: "food", unit_price: 180, unit: "bowl", property_id: null, sort_order: 12, created_at: daysAgo(30).toISOString(), image_url: null, image_urls: [] },
];

// ─── Curations ───

export const DEMO_CURATIONS = [
  { id: "cur1", name: "After Hours Chills", emoji: "🌙", tagline: "Maggi + Old music under the stars", price: 999, original_price: 1499, slot: "9 PM – 1 AM", includes: ["🏠 Private Stay", "🍕 Food & Drinks", "🎵 Music System", "🔥 Bonfire"], tags: ["Couple", "Chill"], mood: ["Romantic", "Chill"], badge: "Popular", property_id: "demo-l1", active: true, sort_order: 1, image_urls: [], created_at: daysAgo(60).toISOString() },
  { id: "cur2", name: "Party Scene Pack", emoji: "🎉", tagline: "Speaker + Lights + Snacks + Drinks — go wild!", price: 1999, original_price: 3499, slot: "7 PM – 12 AM", includes: ["🏠 Private Stay", "🍕 Food & Drinks", "🎵 Music System", "🎬 Projector", "🏊 Pool Access"], tags: ["Party", "Birthday", "Celebration"], mood: ["Party"], badge: "Trending", property_id: "demo-l3", active: true, sort_order: 2, image_urls: [], created_at: daysAgo(45).toISOString() },
  { id: "cur3", name: "Just Us Night", emoji: "💑", tagline: "Candles + Dinner + Music — just you two", price: 2499, original_price: 3999, slot: "7 PM – 11 PM", includes: ["🏠 Private Stay", "🍕 Food & Drinks", "🎵 Music System", "🎂 Cake & Decor"], tags: ["Couple", "Romantic"], mood: ["Romantic"], badge: "#1 Pick", property_id: "demo-l2", active: true, sort_order: 3, image_urls: [], created_at: daysAgo(50).toISOString() },
  { id: "cur4", name: "BBQ & Bonfire", emoji: "🔥", tagline: "Grill, chill, and stargaze", price: 1499, original_price: 2499, slot: "6 PM – 11 PM", includes: ["🏠 Private Stay", "🍕 Food & Drinks", "🔥 Bonfire"], tags: ["Fun", "Chill"], mood: ["Chill", "Party"], badge: "", property_id: "demo-l6", active: true, sort_order: 4, image_urls: [], created_at: daysAgo(40).toISOString() },
  { id: "cur5", name: "Work Escape", emoji: "💻", tagline: "WiFi + Coffee + Silence = Productivity", price: 299, original_price: null, slot: "9 AM – 6 PM", includes: ["🏠 Private Stay", "🍕 Food & Drinks"], tags: ["Work"], mood: ["Work"], badge: "", property_id: "demo-l9", active: true, sort_order: 5, image_urls: [], created_at: daysAgo(20).toISOString() },
];

// ─── Staff ───

export const DEMO_STAFF = [
  { id: "s1", name: "Ravi Kumar", role: "manager", phone: "+91 98765 00001", email: "ravi@hushh.in", status: "active", joined_at: daysAgo(365).toISOString(), salary: 25000 },
  { id: "s2", name: "Sunita Devi", role: "chef", phone: "+91 98765 00002", email: "sunita@hushh.in", status: "active", joined_at: daysAgo(300).toISOString(), salary: 18000 },
  { id: "s3", name: "Prakash Behera", role: "host", phone: "+91 98765 00003", email: "prakash@hushh.in", status: "active", joined_at: daysAgo(200).toISOString(), salary: 15000 },
  { id: "s4", name: "Laxmi Sahu", role: "housekeeping", phone: "+91 98765 00004", email: "laxmi@hushh.in", status: "active", joined_at: daysAgo(150).toISOString(), salary: 12000 },
  { id: "s5", name: "Deepak Jena", role: "driver", phone: "+91 98765 00005", email: "deepak@hushh.in", status: "active", joined_at: daysAgo(180).toISOString(), salary: 14000 },
];

// ─── Expenses ───

export const DEMO_EXPENSES = [
  { id: "exp1", amount: 8500, date: fmt(daysAgo(2)), category: "food_supplies", description: "Weekly vegetables & spices", created_at: daysAgo(2).toISOString() },
  { id: "exp2", amount: 3200, date: fmt(daysAgo(5)), category: "maintenance", description: "Pool cleaning chemicals", created_at: daysAgo(5).toISOString() },
  { id: "exp3", amount: 15000, date: fmt(daysAgo(8)), category: "salary", description: "Gardener monthly pay", created_at: daysAgo(8).toISOString() },
  { id: "exp4", amount: 2800, date: fmt(daysAgo(12)), category: "utilities", description: "Electricity bill - March", created_at: daysAgo(12).toISOString() },
  { id: "exp5", amount: 4500, date: fmt(daysAgo(15)), category: "supplies", description: "Fairy lights + decor items", created_at: daysAgo(15).toISOString() },
  { id: "exp6", amount: 6000, date: fmt(daysAgo(20)), category: "food_supplies", description: "Bulk beverages order", created_at: daysAgo(20).toISOString() },
  { id: "exp7", amount: 1200, date: fmt(daysAgo(25)), category: "transport", description: "Guest pickup fuel", created_at: daysAgo(25).toISOString() },
];

// ─── Campaigns ───

export const DEMO_CAMPAIGNS = [
  { id: "camp1", name: "Valentine's Week Special", type: "discount", status: "active", discount_percent: 20, start_date: fmt(daysAgo(10)), end_date: fmt(daysFromNow(4)), target_audience: "couples", created_at: daysAgo(15).toISOString(), description: "20% off all romantic experiences" },
  { id: "camp2", name: "Weekend Warriors", type: "discount", status: "active", discount_percent: 15, start_date: fmt(daysAgo(5)), end_date: fmt(daysFromNow(30)), target_audience: "all", created_at: daysAgo(7).toISOString(), description: "15% off Friday-Sunday bookings" },
  { id: "camp3", name: "Refer & Earn Double", type: "referral", status: "completed", discount_percent: 0, start_date: fmt(daysAgo(60)), end_date: fmt(daysAgo(30)), target_audience: "existing", created_at: daysAgo(65).toISOString(), description: "Double referral points for a month" },
];

// ─── Coupons ───

export const DEMO_COUPONS = [
  { id: "coup1", code: "HUSHH20", discount_type: "percent", discount_value: 20, min_order: 1000, max_uses: 100, used_count: 34, active: true, expires_at: daysFromNow(30).toISOString(), created_at: daysAgo(30).toISOString(), description: "20% off, min order ₹1000" },
  { id: "coup2", code: "FIRST500", discount_type: "flat", discount_value: 500, min_order: 2000, max_uses: 50, used_count: 12, active: true, expires_at: daysFromNow(60).toISOString(), created_at: daysAgo(45).toISOString(), description: "₹500 flat off for new users" },
  { id: "coup3", code: "PARTY10", discount_type: "percent", discount_value: 10, min_order: 1500, max_uses: 200, used_count: 89, active: true, expires_at: daysFromNow(15).toISOString(), created_at: daysAgo(60).toISOString(), description: "10% off party bookings" },
  { id: "coup4", code: "SUMMER25", discount_type: "percent", discount_value: 25, min_order: 3000, max_uses: 30, used_count: 30, active: false, expires_at: daysAgo(5).toISOString(), created_at: daysAgo(90).toISOString(), description: "Expired summer special" },
];

// ─── Notifications ───

export const DEMO_NOTIFICATIONS = [
  { id: "n1", title: "New booking confirmed", body: "Amrit Patel booked The Firefly Villa for tonight", type: "booking", read: false, created_at: daysAgo(0).toISOString() },
  { id: "n2", title: "5-star review received", body: "Priya Sharma rated Anniversary Garden 5 stars", type: "review", read: false, created_at: daysAgo(1).toISOString() },
  { id: "n3", title: "Low stock alert", body: "Fairy Lights Set is running low (3 remaining)", type: "inventory", read: true, created_at: daysAgo(2).toISOString() },
  { id: "n4", title: "Food order placed", body: "Order #demo-o4 for The Firefly Villa — ₹650", type: "order", read: true, created_at: daysAgo(0).toISOString() },
  { id: "n5", title: "Payment received", body: "₹8,500 received for booking HUSHH-ACT001", type: "payment", read: true, created_at: daysAgo(2).toISOString() },
];

// ─── Loyalty / Referrals ───

export const DEMO_LOYALTY_TRANSACTIONS = [
  { id: "lt1", user_id: "demo-u1", points: 425, type: "earned", description: "Booking: The Firefly Villa", emoji: "🏨", created_at: daysAgo(2).toISOString() },
  { id: "lt2", user_id: "demo-u1", points: -200, type: "redeemed", description: "Coupon: HUSHH20", emoji: "🎫", created_at: daysAgo(5).toISOString() },
  { id: "lt3", user_id: "demo-u2", points: 350, type: "earned", description: "Booking: Anniversary Garden", emoji: "🏨", created_at: daysAgo(12).toISOString() },
  { id: "lt4", user_id: "demo-u4", points: 600, type: "earned", description: "Referral bonus", emoji: "🤝", created_at: daysAgo(20).toISOString() },
];

export const DEMO_REFERRAL_CODES = [
  { id: "ref1", user_id: "demo-u1", code: "AMRIT100", uses: 3, reward_points: 100, created_at: daysAgo(90).toISOString() },
  { id: "ref2", user_id: "demo-u4", code: "SNEHA200", uses: 5, reward_points: 200, created_at: daysAgo(60).toISOString() },
];

// ─── Audit Logs ───

export const DEMO_AUDIT_LOGS = [
  { id: "al1", action: "create", user_id: "demo-u1", entity_type: "booking", entity_id: "demo-b1", details: "Booking HUSHH-ACT001 created for The Firefly Villa", created_at: daysAgo(0).toISOString() },
  { id: "al2", action: "create", user_id: "demo-u1", entity_type: "order", entity_id: "demo-o1", details: "Food order ₹1,250 placed for booking HUSHH-ACT001", created_at: daysAgo(0).toISOString() },
  { id: "al3", action: "create", user_id: "demo-u2", entity_type: "review", entity_id: "demo-r1", details: "5-star review for Anniversary Garden", created_at: daysAgo(1).toISOString() },
  { id: "al4", action: "update", user_id: null, entity_type: "curation", entity_id: "demo-c1", details: "Updated price for After Hours Chills", created_at: daysAgo(3).toISOString() },
  { id: "al5", action: "view", user_id: null, entity_type: "inventory", entity_id: "demo-i1", details: "Fairy Lights Set below threshold (3 remaining)", created_at: daysAgo(2).toISOString() },
];

// ─── Helper: build listing map from demo data ───

export function buildDemoListingMap(): Map<string, string> {
  const map = new Map<string, string>();
  DEMO_LISTINGS.forEach(l => map.set(l.id, l.name));
  return map;
}

export function buildDemoListingMapRich(): Map<string, { name: string; image: string; location: string; capacity: number; category: string }> {
  const map = new Map<string, { name: string; image: string; location: string; capacity: number; category: string }>();
  DEMO_LISTINGS.forEach(l => map.set(l.id, { name: l.name, image: l.image_urls?.[0] || "", location: l.location, capacity: l.capacity, category: l.category }));
  return map;
}

export function buildDemoProfileMap(): Map<string, string> {
  const map = new Map<string, string>();
  DEMO_PROFILES.forEach(p => map.set(p.user_id, p.display_name));
  return map;
}

/** Check if a dataset is "real" (from Supabase) vs demo */
export function isUsingDemoData(data: any[] | null | undefined): boolean {
  if (!data || data.length === 0) return true;
  // Check if first item has a demo-prefixed ID
  const first = data[0];
  if (first?.id && typeof first.id === "string" && first.id.startsWith("demo-")) return true;
  return false;
}
