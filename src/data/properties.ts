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

export interface PropertyReview {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface PropertyRule {
  icon: string;
  text: string;
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
  capacity: number;
  hostName: string;
  hostSince: string;
  responseRate: string;
  rules: PropertyRule[];
  reviews: PropertyReview[];
  highlights: string[];
  category: string[];
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
    amenities: ["Private Pool", "Bonfire Pit", "Sound System", "Free Parking", "BBQ Area", "Fairy Lights", "WiFi", "Washroom"],
    amenityIcons: ["🏊", "🔥", "🎵", "🅿️", "🍖", "✨", "📶", "🚻"],
    slotsLeft: 3,
    basePrice: 999,
    tags: ["🔥 Hot Today", "💑 Couple Friendly"],
    verified: true,
    capacity: 15,
    hostName: "Rahul M.",
    hostSince: "2023",
    responseRate: "98%",
    category: ["couples", "party", "bonfire"],
    highlights: ["Heated pool open till midnight", "Bose premium sound system", "Instagram-worthy fairy light setup", "Private bonfire with marshmallow kit"],
    rules: [
      { icon: "🕐", text: "Check-in at slot start time" },
      { icon: "🔇", text: "Music volume down after 10 PM" },
      { icon: "🚭", text: "No smoking indoors" },
      { icon: "🐾", text: "Pets allowed with prior notice" },
    ],
    reviews: [
      { id: "r1", name: "Priya S.", avatar: "👩", rating: 5, date: "2 weeks ago", comment: "Absolutely magical! The pool was heated perfectly and the bonfire setup was dreamy. Will come back for sure!" },
      { id: "r2", name: "Kiran D.", avatar: "👨", rating: 5, date: "1 month ago", comment: "Best date night ever. The fairy lights and sound system made it feel like a movie. Rahul was super helpful." },
      { id: "r3", name: "Ananya R.", avatar: "👩", rating: 4, date: "1 month ago", comment: "Great vibe, clean pool. Only wish the BBQ area was a bit larger. Otherwise perfect!" },
    ],
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
    amenities: ["Outdoor Dining", "Stargazing Deck", "Garden", "Parking", "Kitchen Access", "Hammocks", "WiFi", "Board Games"],
    amenityIcons: ["🍽️", "🌌", "🌿", "🅿️", "👨‍🍳", "🛏️", "📶", "🎲"],
    slotsLeft: 1,
    basePrice: 1299,
    tags: ["🌌 Stargazer's Pick"],
    verified: true,
    capacity: 20,
    hostName: "Sneha T.",
    hostSince: "2022",
    responseRate: "95%",
    category: ["family", "stargazing", "dining"],
    highlights: ["360° stargazing deck with telescope", "Farm-to-table dining experience", "Organic herb garden walk", "Hammock lounge under banyan tree"],
    rules: [
      { icon: "🕐", text: "Check-in at slot start time" },
      { icon: "🌿", text: "Please respect the garden plants" },
      { icon: "🚭", text: "No smoking on the deck" },
      { icon: "📸", text: "Photography welcome everywhere" },
    ],
    reviews: [
      { id: "r1", name: "Meera K.", avatar: "👩", rating: 5, date: "3 weeks ago", comment: "The stargazing deck is unreal! We saw shooting stars. The farm dinner was the best meal I've had in months." },
      { id: "r2", name: "Rohit V.", avatar: "👨", rating: 4, date: "1 month ago", comment: "Beautiful property, great for families. Kids loved the garden. Food was amazing." },
    ],
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
    amenities: ["Bonfire Circle", "Movie Screen", "Lounge Seating", "DJ Booth", "Bar Counter", "Dance Floor", "Washroom", "Stage Area"],
    amenityIcons: ["🔥", "🎬", "🛋️", "🎧", "🍸", "💃", "🚻", "🎤"],
    slotsLeft: 0,
    basePrice: 1499,
    tags: ["🎉 Party Venue", "⭐ Top Rated"],
    verified: true,
    capacity: 30,
    hostName: "Vikram S.",
    hostSince: "2021",
    responseRate: "99%",
    category: ["party", "bonfire", "movie"],
    highlights: ["20-foot outdoor cinema screen", "Professional DJ booth with lighting", "Massive bonfire circle fits 30 people", "Full bar counter with mixologist option"],
    rules: [
      { icon: "🕐", text: "Check-in at slot start time" },
      { icon: "🔇", text: "Music curfew at 11 PM" },
      { icon: "🍺", text: "BYOB allowed, no glass bottles" },
      { icon: "🧹", text: "Clean-up crew included" },
    ],
    reviews: [
      { id: "r1", name: "Aditya P.", avatar: "👨", rating: 5, date: "1 week ago", comment: "BEST party venue in all of Odisha. The bonfire circle is massive and the movie screen is insane. 10/10!" },
      { id: "r2", name: "Deepika L.", avatar: "👩", rating: 5, date: "2 weeks ago", comment: "Threw my birthday here. Vikram arranged everything perfectly. The DJ booth and dance floor were chef's kiss!" },
      { id: "r3", name: "Sameer J.", avatar: "👨", rating: 5, date: "3 weeks ago", comment: "Movie night under the stars was unforgettable. Great lounge seating and the bar setup was professional." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 1499, available: false },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 1799, available: false },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 2299, available: false, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 2799, available: false },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 5999, available: false },
    ],
    entryInstructions: "Follow the firefly lanterns from the parking lot.",
  },
  {
    id: "4",
    name: "Moonrise Terrace",
    description: "Rooftop lounge · Cocktail bar · City lights view",
    fullDescription: "Perched atop a heritage building in the heart of Jeypore, Moonrise Terrace offers sweeping panoramic views of the city skyline. With a curated cocktail bar, ambient lounge music, and designer furniture — it's the perfect venue for sophisticated celebrations, corporate mixers, or intimate anniversary dinners under the open sky.",
    images: [property1, property3, property2],
    rating: 4.7,
    reviewCount: 156,
    location: "Jeypore, Odisha",
    amenities: ["Rooftop Lounge", "Cocktail Bar", "City View", "Ambient Lighting", "Sound System", "Washroom", "Elevator Access", "AC Indoor Backup"],
    amenityIcons: ["🏙️", "🍸", "🌃", "💡", "🎵", "🚻", "🛗", "❄️"],
    slotsLeft: 2,
    basePrice: 1799,
    tags: ["🌃 City Views", "🍸 Premium"],
    verified: true,
    capacity: 25,
    hostName: "Nisha R.",
    hostSince: "2022",
    responseRate: "97%",
    category: ["couples", "dining", "party"],
    highlights: ["360° panoramic city views", "Curated cocktail menu with mixologist", "Designer Italian furniture", "Ambient warm string lighting"],
    rules: [
      { icon: "🕐", text: "Check-in at slot start time" },
      { icon: "👗", text: "Smart casual dress code" },
      { icon: "🚭", text: "Designated smoking area only" },
      { icon: "📱", text: "No drones without permission" },
    ],
    reviews: [
      { id: "r1", name: "Kavya M.", avatar: "👩", rating: 5, date: "1 week ago", comment: "The sunset from here is breathtaking! Perfect for our anniversary. The cocktails were world-class." },
      { id: "r2", name: "Arjun B.", avatar: "👨", rating: 4, date: "3 weeks ago", comment: "Great corporate event venue. Clean, professional, and the views seal the deal." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 1799, available: true },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 1999, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 2499, available: true, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 2999, available: false },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 6499, available: true },
    ],
    entryInstructions: "Enter through the main lobby. Take the elevator to the 5th floor.",
  },
  {
    id: "5",
    name: "Tribal Camp",
    description: "Camping tents · Tribal art · Nature trail",
    fullDescription: "Experience the raw beauty of tribal Odisha at this curated camping site nestled in the foothills near Jeypore. Hand-painted tribal art adorns every tent. Wake up to birdsong, hike the nature trail, and end the evening with a tribal drum circle around the campfire. A soul-stirring experience for nature lovers and culture enthusiasts.",
    images: [property2, property1, property3],
    rating: 4.5,
    reviewCount: 67,
    location: "Jeypore, Odisha",
    amenities: ["Camping Tents", "Nature Trail", "Tribal Art", "Campfire", "Bird Watching", "Drum Circle", "Clean Washrooms", "First Aid"],
    amenityIcons: ["⛺", "🥾", "🎨", "🔥", "🐦", "🥁", "🚻", "🏥"],
    slotsLeft: 5,
    basePrice: 799,
    tags: ["🏕️ Adventure", "🎨 Cultural"],
    verified: true,
    capacity: 20,
    hostName: "Biju N.",
    hostSince: "2023",
    responseRate: "92%",
    category: ["family", "bonfire", "sports"],
    highlights: ["Authentic tribal drum circle experience", "Guided nature trail with bird spotting", "Hand-painted Dongria Kondh art tents", "Organic campfire dinner included"],
    rules: [
      { icon: "🕐", text: "Check-in at slot start time" },
      { icon: "🌿", text: "Leave no trace — carry out all waste" },
      { icon: "🔦", text: "Torch provided after dark" },
      { icon: "🐾", text: "No pets — wildlife area" },
    ],
    reviews: [
      { id: "r1", name: "Tanvi G.", avatar: "👩", rating: 5, date: "2 weeks ago", comment: "The tribal drum circle was a once-in-a-lifetime experience. Biju is an incredible host!" },
      { id: "r2", name: "Nikhil S.", avatar: "👨", rating: 4, date: "1 month ago", comment: "Great for families. Kids loved the nature trail and bird watching. Very educational." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 799, available: true },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 999, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 1199, available: true, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 1499, available: true },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 2999, available: true },
    ],
    entryInstructions: "Take the forest road from NH-26. Follow the painted arrows on trees.",
  },
  {
    id: "6",
    name: "The Sports Arena",
    description: "Pickleball · Cricket net · Turf ground",
    fullDescription: "Jeypore's first premium sports and recreation venue. Featuring a full-size turf ground, professional cricket nets, a pickleball court, and a lounge area with refreshments. Perfect for corporate team-building, birthday tournaments, or just a fun evening with friends. Floodlights available for night games.",
    images: [property3, property2, property1],
    rating: 4.4,
    reviewCount: 43,
    location: "Jeypore, Odisha",
    amenities: ["Pickleball Court", "Cricket Net", "Turf Ground", "Floodlights", "Changing Room", "Refreshment Counter", "Parking", "First Aid"],
    amenityIcons: ["🏓", "🏏", "⚽", "💡", "🚿", "🥤", "🅿️", "🏥"],
    slotsLeft: 4,
    basePrice: 599,
    tags: ["⚽ Sports", "🏆 Team Events"],
    verified: true,
    capacity: 30,
    hostName: "Amit K.",
    hostSince: "2024",
    responseRate: "96%",
    category: ["sports", "party"],
    highlights: ["Professional-grade pickleball court", "Floodlit turf for night matches", "Cricket bowling machine available", "Tournament hosting with trophies"],
    rules: [
      { icon: "🕐", text: "Check-in 15 mins before slot" },
      { icon: "👟", text: "Sports shoes mandatory on turf" },
      { icon: "💧", text: "Bring your own water bottle" },
      { icon: "🏥", text: "First aid kit available on site" },
    ],
    reviews: [
      { id: "r1", name: "Raj P.", avatar: "👨", rating: 5, date: "1 week ago", comment: "Finally a proper sports venue in Jeypore! The turf is top-notch and the floodlights are great." },
      { id: "r2", name: "Sanya M.", avatar: "👩", rating: 4, date: "2 weeks ago", comment: "Had an amazing pickleball session. Amit keeps the place well-maintained." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "6 AM - 9 AM", price: 599, available: true },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 799, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 7 PM", price: 999, available: true, popular: true },
      { id: "s4", label: "Night", time: "7 PM - 10 PM", price: 1199, available: true },
      { id: "s5", label: "Full Day", time: "6 AM - 10 PM", price: 2499, available: false },
    ],
    entryInstructions: "Opposite City Mall, turn left after the petrol pump. Arena is 200m ahead.",
  },
  {
    id: "7",
    name: "Karaoke Cube",
    description: "Private karaoke room · Neon lights · Snack bar",
    fullDescription: "Step into Jeypore's most vibrant private karaoke experience. Soundproofed rooms with premium JBL speakers, a library of 2000+ songs (Hindi, English, Telugu, Odia), neon ambient lighting, and a snack bar with unlimited nachos and drinks. Great for birthdays, bachelorette parties, or just letting loose with friends.",
    images: [property1, property2, property3],
    rating: 4.7,
    reviewCount: 98,
    location: "Jeypore, Odisha",
    amenities: ["Karaoke System", "Neon Lighting", "Snack Bar", "Sound Proofing", "AC Room", "Photo Booth", "Props & Costumes", "WiFi"],
    amenityIcons: ["🎤", "🌈", "🍿", "🔇", "❄️", "📸", "🎭", "📶"],
    slotsLeft: 3,
    basePrice: 699,
    tags: ["🎤 Karaoke", "🎉 Party"],
    verified: true,
    capacity: 12,
    hostName: "Lisa D.",
    hostSince: "2023",
    responseRate: "100%",
    category: ["karaoke", "party"],
    highlights: ["2000+ songs in 4 languages", "Instagram-worthy neon photo booth", "Unlimited nachos & soft drinks", "Costumes & props for photo ops"],
    rules: [
      { icon: "🕐", text: "Arrive 10 mins early for setup" },
      { icon: "🥤", text: "Outside food not allowed" },
      { icon: "🎤", text: "Handle mics with care" },
      { icon: "📸", text: "Photo booth free for all guests" },
    ],
    reviews: [
      { id: "r1", name: "Pooja K.", avatar: "👩", rating: 5, date: "4 days ago", comment: "SO MUCH FUN! The neon room is gorgeous and the song selection is amazing. Lisa is the best host!" },
      { id: "r2", name: "Varun T.", avatar: "👨", rating: 5, date: "2 weeks ago", comment: "Perfect bachelorette party spot. The props and costumes were hilarious. Highly recommend!" },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "10 AM - 1 PM", price: 699, available: true },
      { id: "s2", label: "Afternoon", time: "1 PM - 4 PM", price: 899, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 7 PM", price: 1099, available: true, popular: true },
      { id: "s4", label: "Night", time: "7 PM - 10 PM", price: 1299, available: true },
      { id: "s5", label: "Full Day", time: "10 AM - 10 PM", price: 2999, available: true },
    ],
    entryInstructions: "2nd floor above Café Mocha, Main Road. Ring the buzzer.",
  },
  {
    id: "8",
    name: "Sunset Pavilion",
    description: "Lake-facing · Sunset dining · Canopy seating",
    fullDescription: "A breathtaking lake-facing pavilion designed for unforgettable sunsets. With canopy dining setups, floating candles on the water, and a private chef option — this is the most romantic spot in Koraput district. Whether it's a proposal, anniversary, or just a magical evening, Sunset Pavilion delivers pure enchantment.",
    images: [property2, property3, property1],
    rating: 4.9,
    reviewCount: 178,
    location: "Jeypore, Odisha",
    amenities: ["Lake View", "Canopy Dining", "Private Chef", "Floating Candles", "Acoustic Music", "Flower Decor", "Parking", "Washroom"],
    amenityIcons: ["🌊", "🏕️", "👨‍🍳", "🕯️", "🎸", "🌸", "🅿️", "🚻"],
    slotsLeft: 1,
    basePrice: 2499,
    tags: ["💑 Most Romantic", "⭐ Top Rated"],
    verified: true,
    capacity: 8,
    hostName: "Deepa M.",
    hostSince: "2021",
    responseRate: "100%",
    category: ["couples", "dining", "stargazing"],
    highlights: ["Direct lake-facing sunset view", "Floating candles on water surface", "Optional live acoustic guitar", "Private chef 5-course dinner available"],
    rules: [
      { icon: "🕐", text: "Arrive 30 mins before sunset" },
      { icon: "👗", text: "Smart casual recommended" },
      { icon: "📱", text: "Silent phones for ambiance" },
      { icon: "🌸", text: "Flower decor included in evening slots" },
    ],
    reviews: [
      { id: "r1", name: "Shruti R.", avatar: "👩", rating: 5, date: "3 days ago", comment: "My husband proposed here and it was PERFECT. The floating candles, the sunset, the music — everything was a dream." },
      { id: "r2", name: "Manish T.", avatar: "👨", rating: 5, date: "1 week ago", comment: "Best anniversary dinner ever. Deepa's private chef cooked an incredible 5-course meal. Unforgettable." },
      { id: "r3", name: "Riya S.", avatar: "👩", rating: 5, date: "2 weeks ago", comment: "The most romantic place in all of Odisha. Period. The lake, the canopy, the candles — pure magic." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 2499, available: false },
      { id: "s2", label: "Afternoon", time: "12 PM - 4 PM", price: 2999, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 8 PM", price: 3999, available: true, popular: true },
      { id: "s4", label: "Night", time: "8 PM - 12 AM", price: 3499, available: false },
      { id: "s5", label: "Full Day", time: "8 AM - 12 AM", price: 7999, available: false },
    ],
    entryInstructions: "Take the lake road from Jeypore bus stand. Look for the fairy-lit entrance on the left.",
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
  { id: "p4", name: "Karaoke Night", emoji: "🎤", price: 1999, includes: ["3 hrs", "Snacks", "Props", "8 ppl"], gradient: "from-primary/60 to-tertiary/40" },
  { id: "p5", name: "Camping Trip", emoji: "🏕️", price: 3499, includes: ["Overnight", "Dinner", "Bonfire", "6 ppl"], gradient: "from-accent/80 to-primary/30" },
  { id: "p6", name: "Sports Day", emoji: "🏆", price: 2999, includes: ["Full day", "Equipment", "Trophies", "16 ppl"], gradient: "from-tertiary/60 to-accent/40" },
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
    { id: "f4", category: "Food", categoryEmoji: "🍽️", name: "Pizza Station", description: "Freshly baked wood-fire", price: 399, perPerson: true },
    { id: "f5", category: "Food", categoryEmoji: "🍽️", name: "Dessert Bar", description: "Gulab jamun, ice cream & more", price: 249, perPerson: true },
  ],
  "Decoration": [
    { id: "d1", category: "Decoration", categoryEmoji: "🎨", name: "Romantic Setup", description: "Candles, petals, fairy lights", price: 999 },
    { id: "d2", category: "Decoration", categoryEmoji: "🎨", name: "Birthday Setup", description: "Balloons, banner, cake table", price: 1499 },
    { id: "d3", category: "Decoration", categoryEmoji: "🎨", name: "Neon Sign", description: "Customizable message", price: 499 },
    { id: "d4", category: "Decoration", categoryEmoji: "🎨", name: "Fog Machine", description: "Dramatic entrance effect", price: 699 },
  ],
  "Music": [
    { id: "m1", category: "Music", categoryEmoji: "🎵", name: "Bluetooth Speaker", description: "Included with booking", price: 0 },
    { id: "m2", category: "Music", categoryEmoji: "🎵", name: "DJ (2 hours)", description: "Professional DJ setup", price: 2999 },
    { id: "m3", category: "Music", categoryEmoji: "🎵", name: "Karaoke Setup", description: "Mic + screen + 500 songs", price: 799 },
    { id: "m4", category: "Music", categoryEmoji: "🎵", name: "Live Acoustic", description: "Guitar + vocalist 1 hour", price: 1999 },
  ],
  "Activities": [
    { id: "a1", category: "Activities", categoryEmoji: "🏊", name: "Pool Access", description: "Heated private pool", price: 299, perPerson: true },
    { id: "a2", category: "Activities", categoryEmoji: "🏊", name: "Pickleball Court", description: "1 hour session", price: 399 },
    { id: "a3", category: "Activities", categoryEmoji: "🏊", name: "Private Movie", description: "Projector + Screen", price: 599 },
    { id: "a4", category: "Activities", categoryEmoji: "🏊", name: "Telescope Session", description: "Guided stargazing 1 hour", price: 499 },
    { id: "a5", category: "Activities", categoryEmoji: "🏊", name: "Tribal Dance Class", description: "30 min with local artists", price: 799 },
  ],
  "Extras": [
    { id: "e1", category: "Extras", categoryEmoji: "📸", name: "Photographer", description: "30 min shoot", price: 1499 },
    { id: "e2", category: "Extras", categoryEmoji: "📸", name: "Surprise Reveal", description: "Custom setup", price: 799 },
    { id: "e3", category: "Extras", categoryEmoji: "📸", name: "Candlelight Dinner", description: "Private table setup", price: 1999 },
    { id: "e4", category: "Extras", categoryEmoji: "📸", name: "Fireworks Mini", description: "5 min sparkler show", price: 999 },
    { id: "e5", category: "Extras", categoryEmoji: "📸", name: "Video Reel", description: "60-sec edited reel", price: 1999 },
  ],
};
