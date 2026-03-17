import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

export interface TimeSlot {
  id: string;
  label: string;
  time: string;
  price: number;
  available: boolean;
  popular?: boolean;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  location: string;
  amenities: string[];
  amenityIcons: string[];
  slotsLeft: number;
  basePrice: number;
  tags: string[];
  verified: boolean;
  slots: TimeSlot[];
  entryInstructions: string;
  fullDescription: string;
}

export const properties: Property[] = [
  {
    id: "1",
    name: "The Firefly Villa",
    description: "Private pool villa · Bonfire · Sound system",
    fullDescription: "Nestled in the heart of Jeypore, The Firefly Villa is your private paradise. Featuring a heated pool, a crackling bonfire pit, and a premium Bose sound system — this is where memories are made. Perfect for couples seeking intimacy or friend groups ready to celebrate under the stars.",
    images: [property1, property2, property3],
    rating: 4.8,
    reviewCount: 124,
    location: "Jeypore, Odisha",
    amenities: ["Private Pool", "Bonfire Pit", "Sound System", "Free Parking", "BBQ Area", "Fairy Lights"],
    amenityIcons: ["🏊", "🔥", "🎵", "🅿️", "🍖", "✨"],
    slotsLeft: 3,
    basePrice: 999,
    tags: ["🔥 Hot Today", "💑 Couple Friendly"],
    verified: true,
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 999, available: true },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 1299, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 1499, available: true, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 1799, available: true },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 3999, available: false },
    ],
    entryInstructions: "Take the back gate off NH-26. Call +91-98765-43210 on arrival.",
  },
  {
    id: "2",
    name: "Koraput Garden House",
    description: "Farmhouse · Outdoor dining · Stargazing deck",
    fullDescription: "A sprawling farmhouse with an enchanting outdoor dining setup, surrounded by native flora. The stargazing deck offers unobstructed views of the Odisha night sky. Ideal for romantic dinners, family gatherings, or intimate birthday celebrations.",
    images: [property2, property3, property1],
    rating: 4.6,
    reviewCount: 89,
    location: "Jeypore, Odisha",
    amenities: ["Outdoor Dining", "Stargazing Deck", "Garden", "Parking", "Kitchen Access", "Hammocks"],
    amenityIcons: ["🍽️", "🌌", "🌿", "🅿️", "👨‍🍳", "🛏️"],
    slotsLeft: 1,
    basePrice: 1299,
    tags: ["🌌 Stargazer's Pick"],
    verified: true,
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 1299, available: false },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 1499, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 1799, available: true, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 1999, available: true },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 4499, available: true },
    ],
    entryInstructions: "Main road entrance. Security will guide you in.",
  },
  {
    id: "3",
    name: "Ember Grounds",
    description: "Open-air venue · Bonfire circle · Movie screen",
    fullDescription: "The Ember Grounds is an open-air experience venue built around a massive bonfire circle. With a 20-foot outdoor movie screen, premium lounge seating, and space for up to 30 guests — this is where parties come alive. The stars above, the fire below.",
    images: [property3, property1, property2],
    rating: 4.9,
    reviewCount: 201,
    location: "Jeypore, Odisha",
    amenities: ["Bonfire Circle", "Movie Screen", "Lounge Seating", "DJ Booth", "Bar Counter", "Dance Floor"],
    amenityIcons: ["🔥", "🎬", "🛋️", "🎧", "🍸", "💃"],
    slotsLeft: 0,
    basePrice: 1499,
    tags: ["🎉 Party Venue", "⭐ Top Rated"],
    verified: true,
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 1499, available: false },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 1799, available: false },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 2299, available: false, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 2799, available: false },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 5999, available: false },
    ],
    entryInstructions: "Follow the firefly lanterns from the parking lot.",
  },
];

export interface ExperiencePackage {
  id: string;
  name: string;
  emoji: string;
  price: number;
  includes: string[];
  gradient: string;
}

export const packages: ExperiencePackage[] = [
  { id: "p1", name: "Romantic Date", emoji: "💑", price: 2499, includes: ["Dinner", "Decor", "Pool"], gradient: "from-primary/80 to-primary/40" },
  { id: "p2", name: "Birthday Bash", emoji: "🎂", price: 4999, includes: ["Decor", "Cake", "DJ", "10 ppl"], gradient: "from-tertiary/80 to-tertiary/40" },
  { id: "p3", name: "Weekend Party", emoji: "🎉", price: 7999, includes: ["Full day", "BBQ", "Music", "20 ppl"], gradient: "from-accent/60 to-accent/20" },
];

export const categories = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "couples", label: "Couples", emoji: "💑" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "bonfire", label: "Bonfire", emoji: "🔥" },
  { id: "sports", label: "Sports", emoji: "🏓" },
  { id: "movie", label: "Movie Night", emoji: "🎬" },
  { id: "stargazing", label: "Stargazing", emoji: "🌌" },
  { id: "dining", label: "Dining", emoji: "🍽️" },
  { id: "karaoke", label: "Karaoke", emoji: "🎤" },
];

export interface Addon {
  id: string;
  category: string;
  categoryEmoji: string;
  name: string;
  description: string;
  price: number;
  perPerson?: boolean;
}

export const addons: Record<string, Addon[]> = {
  "Food": [
    { id: "f1", category: "Food", categoryEmoji: "🍽️", name: "Tribal Thali", description: "Authentic Koraput cuisine", price: 349, perPerson: true },
    { id: "f2", category: "Food", categoryEmoji: "🍽️", name: "BBQ Platter", description: "Chicken + Paneer + Corn", price: 499, perPerson: true },
    { id: "f3", category: "Food", categoryEmoji: "🍽️", name: "Chai & Maggi Station", description: "Unlimited refills", price: 99, perPerson: true },
  ],
  "Decoration": [
    { id: "d1", category: "Decoration", categoryEmoji: "🎨", name: "Romantic Setup", description: "Candles, petals, fairy lights", price: 999 },
    { id: "d2", category: "Decoration", categoryEmoji: "🎨", name: "Birthday Setup", description: "Balloons, banner, cake table", price: 1499 },
    { id: "d3", category: "Decoration", categoryEmoji: "🎨", name: "Neon Sign", description: "Customizable message", price: 499 },
  ],
  "Music": [
    { id: "m1", category: "Music", categoryEmoji: "🎵", name: "Bluetooth Speaker", description: "Included with booking", price: 0 },
    { id: "m2", category: "Music", categoryEmoji: "🎵", name: "DJ (2 hours)", description: "Professional DJ setup", price: 2999 },
    { id: "m3", category: "Music", categoryEmoji: "🎵", name: "Karaoke Setup", description: "Mic + screen + 500 songs", price: 799 },
  ],
  "Activities": [
    { id: "a1", category: "Activities", categoryEmoji: "🏊", name: "Pool Access", description: "Heated private pool", price: 299, perPerson: true },
    { id: "a2", category: "Activities", categoryEmoji: "🏊", name: "Pickleball Court", description: "1 hour session", price: 399 },
    { id: "a3", category: "Activities", categoryEmoji: "🏊", name: "Private Movie", description: "Projector + Screen", price: 599 },
  ],
  "Extras": [
    { id: "e1", category: "Extras", categoryEmoji: "📸", name: "Photographer", description: "30 min shoot", price: 1499 },
    { id: "e2", category: "Extras", categoryEmoji: "📸", name: "Surprise Reveal", description: "Custom setup", price: 799 },
    { id: "e3", category: "Extras", categoryEmoji: "📸", name: "Candlelight Dinner", description: "Private table setup", price: 1999 },
  ],
};
