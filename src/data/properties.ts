import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import listingFireflyVilla from "@/assets/listing-firefly-villa.jpg";
import listingKoraputGarden from "@/assets/listing-koraput-garden.jpg";
import listingEmberGrounds from "@/assets/listing-ember-grounds.jpg";
import listingMoonriseTerrace from "@/assets/listing-moonrise-terrace.jpg";
import listingTribalCamp from "@/assets/listing-tribal-camp.jpg";
import listingSportsArena from "@/assets/listing-sports-arena.jpg";
import listingKaraokeCube from "@/assets/listing-karaoke-cube.jpg";
import listingSunsetPavilion from "@/assets/listing-sunset-pavilion.jpg";
import listingBirthdayHall from "@/assets/listing-birthday-hall.jpg";
import listingAnniversaryGarden from "@/assets/listing-anniversary-garden.jpg";
import listingPickleball from "@/assets/listing-pickleball.jpg";
import listingKittyParty from "@/assets/listing-kitty-party.jpg";
import listingHeritageWalk from "@/assets/listing-heritage-walk.jpg";
import listingPottery from "@/assets/listing-pottery.jpg";
import listingCoffeeTrail from "@/assets/listing-coffee-trail.jpg";
import listingHaldiMehndi from "@/assets/listing-haldi-mehndi.jpg";
import listingStargazing from "@/assets/listing-stargazing.jpg";
import listingRafting from "@/assets/listing-rafting.jpg";
import listingMovieAmphitheater from "@/assets/listing-movie-amphitheater.jpg";
import listingTribalDance from "@/assets/listing-tribal-dance.jpg";

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
    images: [listingFireflyVilla, property2, property3],
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
    category: ["stays", "couples", "party", "bonfire", "pool"],
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
    category: ["stays", "family", "stargazing", "dining"],
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
    category: ["stays", "party", "bonfire", "movie"],
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
    category: ["stays", "couples", "dining", "party"],
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
    category: ["stays", "family", "bonfire", "experiences"],
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
    category: ["experiences", "services", "pool"],
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
    category: ["experiences", "party", "services"],
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
    category: ["stays", "couples", "dining", "stargazing"],
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
  {
    id: "9",
    name: "Birthday Bliss Hall",
    description: "Party hall · Balloon décor · DJ + Cake setup",
    fullDescription: "Jeypore's most loved birthday celebration venue! A fully decorated hall with themed balloon arches, neon signboards, fog machines, and a professional DJ. Includes a dedicated cake-cutting stage, photo booth with props, and catering options for up to 50 guests. From 1st birthdays to 50th — we make every year special.",
    images: [property1, property3, property2],
    rating: 4.8,
    reviewCount: 210,
    location: "Jeypore, Odisha",
    amenities: ["DJ Booth", "Dance Floor", "Photo Booth", "Stage Area", "AC Room", "Parking", "Washroom", "Neon Lighting"],
    amenityIcons: ["🎧", "💃", "📸", "🎤", "❄️", "🅿️", "🚻", "🌈"],
    slotsLeft: 3,
    basePrice: 3999,
    tags: ["🎂 Birthday Special", "🎉 Most Booked"],
    verified: true,
    capacity: 50,
    hostName: "Suman P.",
    hostSince: "2022",
    responseRate: "99%",
    category: ["experiences", "party", "services"],
    highlights: ["Themed balloon arch included", "Fog machine grand entrance", "Professional cake-cutting stage", "Photo booth with 50+ props"],
    rules: [
      { icon: "🕐", text: "Setup begins 2 hours before event" },
      { icon: "🎂", text: "Bring your own cake or order through us" },
      { icon: "🔇", text: "Music off by 10 PM" },
      { icon: "🧹", text: "Cleanup crew included" },
    ],
    reviews: [
      { id: "r1", name: "Priti M.", avatar: "👩", rating: 5, date: "3 days ago", comment: "My daughter's 5th birthday was MAGICAL! The balloon arch and fog entrance made her feel like a princess!" },
      { id: "r2", name: "Rajesh K.", avatar: "👨", rating: 5, date: "1 week ago", comment: "Best birthday venue in Jeypore. Suman handled everything perfectly. Highly recommend!" },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "9 AM - 1 PM", price: 3999, available: true },
      { id: "s2", label: "Afternoon", time: "1 PM - 5 PM", price: 4499, available: true },
      { id: "s3", label: "Evening", time: "5 PM - 9 PM", price: 5999, available: true, popular: true },
      { id: "s4", label: "Night", time: "7 PM - 11 PM", price: 5499, available: true },
      { id: "s5", label: "Full Day", time: "9 AM - 11 PM", price: 9999, available: false },
    ],
    entryInstructions: "Behind City Centre Mall, 2nd building on the left. Look for the balloon entrance.",
  },
  {
    id: "10",
    name: "Anniversary Garden",
    description: "Romantic garden · Candlelight · Live music",
    fullDescription: "Celebrate your love story in this enchanting private garden designed exclusively for couples. With rose petal pathways, floating candles, a candlelight dinner table for two, and optional live acoustic music — every anniversary becomes a memory to treasure forever. Includes complimentary champagne and a personalized love letter setup.",
    images: [property2, property1, property3],
    rating: 4.9,
    reviewCount: 145,
    location: "Jeypore, Odisha",
    amenities: ["Flower Decor", "Floating Candles", "Acoustic Music", "Private Chef", "Fairy Lights", "Parking", "Washroom", "Photo Booth"],
    amenityIcons: ["🌸", "🕯️", "🎸", "👨‍🍳", "✨", "🅿️", "🚻", "📸"],
    slotsLeft: 1,
    basePrice: 3499,
    tags: ["💍 Anniversary", "💑 Most Romantic"],
    verified: true,
    capacity: 6,
    hostName: "Rekha S.",
    hostSince: "2021",
    responseRate: "100%",
    category: ["experiences", "couples", "dining"],
    highlights: ["Rose petal pathway to table", "Complimentary champagne toast", "Personalized love letter scroll", "Optional surprise proposal setup"],
    rules: [
      { icon: "🕐", text: "Arrive 15 mins before sunset for best experience" },
      { icon: "👗", text: "Formal attire recommended" },
      { icon: "📸", text: "Photographer available on request" },
      { icon: "🌸", text: "All flowers are fresh & organic" },
    ],
    reviews: [
      { id: "r1", name: "Neha D.", avatar: "👩", rating: 5, date: "5 days ago", comment: "Our 10th anniversary was absolutely perfect here! The rose petals and candles were breathtaking." },
      { id: "r2", name: "Suresh V.", avatar: "👨", rating: 5, date: "2 weeks ago", comment: "Proposed to my girlfriend here — she said YES! Rekha made everything magical. Can't thank her enough." },
    ],
    slots: [
      { id: "s1", label: "Afternoon", time: "12 PM - 4 PM", price: 3499, available: true },
      { id: "s2", label: "Evening", time: "4 PM - 8 PM", price: 4999, available: true, popular: true },
      { id: "s3", label: "Night", time: "8 PM - 12 AM", price: 4499, available: false },
      { id: "s4", label: "Full Evening", time: "4 PM - 12 AM", price: 7999, available: true },
    ],
    entryInstructions: "Private gate behind Sai Temple. Rekha will personally welcome you.",
  },
  {
    id: "11",
    name: "Smash Pickleball Club",
    description: "2 courts · Floodlights · Coaching available",
    fullDescription: "Jeypore's premier pickleball facility with 2 professional-grade courts, floodlights for night play, and certified coaching. Whether you're a beginner looking for lessons or a pro wanting competitive matches, we've got you covered. Includes equipment rental, cold towels, and a refreshment lounge. Perfect for corporate team-building too!",
    images: [property3, property1, property2],
    rating: 4.6,
    reviewCount: 87,
    location: "Jeypore, Odisha",
    amenities: ["Pickleball Court", "Floodlights", "Changing Room", "Refreshment Counter", "Parking", "First Aid", "WiFi", "AC Room"],
    amenityIcons: ["🏓", "💡", "🚿", "🥤", "🅿️", "🏥", "📶", "❄️"],
    slotsLeft: 6,
    basePrice: 399,
    tags: ["🏓 Pickleball", "🆕 New"],
    verified: true,
    capacity: 8,
    hostName: "Coach Ravi",
    hostSince: "2024",
    responseRate: "98%",
    category: ["experiences", "services", "pool"],
    highlights: ["2 professional-grade courts", "Equipment rental included", "Certified coaching available", "Cold towels & energy drinks"],
    rules: [
      { icon: "👟", text: "Non-marking shoes mandatory" },
      { icon: "🕐", text: "Arrive 10 mins early" },
      { icon: "💧", text: "Stay hydrated — water station available" },
      { icon: "🏓", text: "Equipment provided, bring your own if preferred" },
    ],
    reviews: [
      { id: "r1", name: "Anil G.", avatar: "👨", rating: 5, date: "4 days ago", comment: "Best pickleball courts in the region! Coach Ravi's training is excellent. Great vibe!" },
      { id: "r2", name: "Manya S.", avatar: "👩", rating: 4, date: "1 week ago", comment: "Clean courts, good lighting. Loved the coaching session. Will come back weekly!" },
    ],
    slots: [
      { id: "s1", label: "Early Morning", time: "6 AM - 8 AM", price: 399, available: true },
      { id: "s2", label: "Morning", time: "8 AM - 10 AM", price: 499, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 6 PM", price: 599, available: true, popular: true },
      { id: "s4", label: "Night", time: "6 PM - 8 PM", price: 699, available: true },
    ],
    entryInstructions: "Next to Nehru Stadium, Gate 3. Look for the green banner.",
  },
  {
    id: "12",
    name: "Kitty Party Lounge",
    description: "Private lounge · Games · High tea setup",
    fullDescription: "A chic, Instagram-worthy private lounge designed specifically for kitty parties, ladies' get-togethers, and brunch clubs. Features a curated high tea menu, fun party games (Tambola, cards, trivia), photo wall with props, and ambient music. Accommodates 8-20 ladies. Includes complimentary welcome drinks and a surprise goodie bag for each guest!",
    images: [property1, property2, property3],
    rating: 4.7,
    reviewCount: 63,
    location: "Jeypore, Odisha",
    amenities: ["AC Room", "Photo Booth", "Board Games", "Sound System", "WiFi", "Washroom", "Parking", "Neon Lighting"],
    amenityIcons: ["❄️", "📸", "🎲", "🎵", "📶", "🚻", "🅿️", "🌈"],
    slotsLeft: 4,
    basePrice: 499,
    tags: ["👯 Kitty Party", "🍰 High Tea"],
    verified: true,
    capacity: 20,
    hostName: "Priya N.",
    hostSince: "2023",
    responseRate: "97%",
    category: ["experiences", "party", "dining"],
    highlights: ["Curated high tea with 12 items", "Tambola, trivia & card games included", "Goodie bag for every guest", "Instagram-worthy flower wall"],
    rules: [
      { icon: "🕐", text: "Minimum 2-hour booking" },
      { icon: "👯", text: "Minimum 8 guests for booking" },
      { icon: "🍰", text: "Custom cake can be arranged" },
      { icon: "📸", text: "Photographer add-on available" },
    ],
    reviews: [
      { id: "r1", name: "Sunita M.", avatar: "👩", rating: 5, date: "1 week ago", comment: "Best kitty party ever! The high tea was delicious and the games were so much fun. All 15 of us loved it!" },
      { id: "r2", name: "Kavita R.", avatar: "👩", rating: 5, date: "2 weeks ago", comment: "Priya is an amazing host. The goodie bags were such a sweet touch. Already planning next month's!" },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "10 AM - 1 PM", price: 499, available: true },
      { id: "s2", label: "Afternoon", time: "1 PM - 4 PM", price: 599, available: true, popular: true },
      { id: "s3", label: "Evening", time: "4 PM - 7 PM", price: 699, available: true },
      { id: "s4", label: "Full Day", time: "10 AM - 7 PM", price: 1299, available: true },
    ],
    entryInstructions: "Above Tanishq showroom, 1st floor. Use the side staircase.",
  },
  {
    id: "13",
    name: "Heritage Walk Jeypore",
    description: "Guided tour · Temples · Local food trail",
    fullDescription: "Discover Jeypore's hidden treasures with this 3-hour guided heritage walk. Visit the ancient Jagannath Temple, explore the vibrant weekly haat (tribal market), taste authentic Koraput coffee, and walk through 300-year-old colonial-era architecture. Led by a certified local historian, this immersive experience brings Jeypore's rich culture alive. Perfect for tourists, families, and anyone curious about local history.",
    images: [property2, property3, property1],
    rating: 4.8,
    reviewCount: 112,
    location: "Jeypore Old Town, Odisha",
    amenities: ["Nature Trail", "Clean Washrooms", "First Aid", "Parking", "WiFi"],
    amenityIcons: ["🥾", "🚻", "🏥", "🅿️", "📶"],
    slotsLeft: 8,
    basePrice: 299,
    tags: ["🏛️ Heritage", "🗺️ Local Experience"],
    verified: true,
    capacity: 15,
    hostName: "Dr. Patnaik",
    hostSince: "2020",
    responseRate: "95%",
    category: ["experiences"],
    highlights: ["300-year-old colonial architecture", "Authentic Koraput coffee tasting", "Tribal market visit (on market days)", "Led by certified local historian"],
    rules: [
      { icon: "👟", text: "Comfortable walking shoes required" },
      { icon: "🕐", text: "Walk starts sharp on time" },
      { icon: "💧", text: "Carry water bottle" },
      { icon: "📸", text: "Photography encouraged!" },
    ],
    reviews: [
      { id: "r1", name: "Alok M.", avatar: "👨", rating: 5, date: "2 days ago", comment: "Dr. Patnaik is an incredible storyteller. Learned so much about Jeypore's history. A must-do!" },
      { id: "r2", name: "Sarah L.", avatar: "👩", rating: 5, date: "1 week ago", comment: "Best local experience! The Koraput coffee was amazing and the temple visit was so peaceful." },
    ],
    slots: [
      { id: "s1", label: "Morning Walk", time: "6:30 AM - 9:30 AM", price: 299, available: true, popular: true },
      { id: "s2", label: "Evening Walk", time: "4 PM - 7 PM", price: 349, available: true },
    ],
    entryInstructions: "Meet at the Clock Tower, Jeypore Main Square. Look for the red flag.",
  },
  {
    id: "14",
    name: "Tribal Pottery Workshop",
    description: "Hands-on pottery · Tribal artists · Take home your art",
    fullDescription: "Learn the ancient art of pottery from Dongria Kondh tribal artisans in this immersive 2-hour workshop. Shape clay on a traditional wheel, paint with natural dyes, and take home your handmade creation. Includes a tribal chai break and a mini exhibition of rare tribal pottery. A soul-enriching experience for all ages.",
    images: [property3, property2, property1],
    rating: 4.7,
    reviewCount: 54,
    location: "Jeypore, Odisha",
    amenities: ["Tribal Art", "Clean Washrooms", "Parking", "First Aid"],
    amenityIcons: ["🎨", "🚻", "🅿️", "🏥"],
    slotsLeft: 5,
    basePrice: 499,
    tags: ["🎨 Workshop", "🏺 Cultural"],
    verified: true,
    capacity: 10,
    hostName: "Artisan Ganga",
    hostSince: "2023",
    responseRate: "90%",
    category: ["experiences"],
    highlights: ["Learn from Dongria Kondh tribal artisans", "Take home your handmade pottery", "Natural dye painting session", "Tribal chai & snacks included"],
    rules: [
      { icon: "👕", text: "Wear clothes you don't mind getting dirty" },
      { icon: "🕐", text: "Session starts sharp on time" },
      { icon: "👶", text: "Kids 5+ welcome" },
      { icon: "📸", text: "Photos & videos welcome" },
    ],
    reviews: [
      { id: "r1", name: "Diya S.", avatar: "👩", rating: 5, date: "4 days ago", comment: "Such a beautiful experience! Ganga is so patient and talented. My kids loved making their own pots!" },
      { id: "r2", name: "James W.", avatar: "👨", rating: 5, date: "2 weeks ago", comment: "Highlight of my Odisha trip. Authentic, raw, and deeply moving. The tribal chai was a bonus!" },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "9 AM - 11 AM", price: 499, available: true, popular: true },
      { id: "s2", label: "Afternoon", time: "2 PM - 4 PM", price: 499, available: true },
      { id: "s3", label: "Evening", time: "4 PM - 6 PM", price: 549, available: true },
    ],
    entryInstructions: "Tribal Art Village, 5 km from Jeypore bus stand. Follow signs for 'Pottery Workshop'.",
  },
  {
    id: "15",
    name: "Koraput Coffee Trail",
    description: "Coffee plantation tour · Tasting · Bean-to-cup",
    fullDescription: "Experience the magic of Koraput's famous Arabica coffee — from bean to cup. Tour a working plantation nestled in the Eastern Ghats, learn about organic farming, roast your own beans, and enjoy a curated tasting of 5 single-origin brews. Includes a take-home pack of fresh-roasted beans. The lush green hills and misty mornings make this a photographer's paradise.",
    images: [property1, property3, property2],
    rating: 4.9,
    reviewCount: 189,
    location: "Koraput, Odisha",
    amenities: ["Nature Trail", "Clean Washrooms", "Parking", "First Aid", "WiFi"],
    amenityIcons: ["🥾", "🚻", "🅿️", "🏥", "📶"],
    slotsLeft: 4,
    basePrice: 599,
    tags: ["☕ Coffee Trail", "⭐ Must Visit"],
    verified: true,
    capacity: 12,
    hostName: "Mohan R.",
    hostSince: "2019",
    responseRate: "96%",
    category: ["experiences", "dining"],
    highlights: ["Walk through a real coffee plantation", "Roast your own beans hands-on", "Tasting of 5 single-origin brews", "Take-home pack of fresh beans"],
    rules: [
      { icon: "👟", text: "Wear trekking-friendly shoes" },
      { icon: "🕐", text: "Morning slot recommended for best weather" },
      { icon: "📸", text: "Stunning photo opportunities" },
      { icon: "🌧️", text: "Light rain gear in monsoon season" },
    ],
    reviews: [
      { id: "r1", name: "Anita C.", avatar: "👩", rating: 5, date: "1 week ago", comment: "Never knew coffee could taste this good! The plantation is gorgeous and Mohan is so knowledgeable." },
      { id: "r2", name: "Vikram J.", avatar: "👨", rating: 5, date: "3 weeks ago", comment: "Best experience in Koraput. The bean-to-cup journey was fascinating. Bought 3 packs of beans!" },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "7 AM - 10 AM", price: 599, available: true, popular: true },
      { id: "s2", label: "Late Morning", time: "10 AM - 1 PM", price: 649, available: true },
      { id: "s3", label: "Afternoon", time: "2 PM - 5 PM", price: 599, available: true },
    ],
    entryInstructions: "Sunabeda Plateau, 35 km from Jeypore. Pickup available from Jeypore bus stand.",
  },
  {
    id: "16",
    name: "Haldi & Mehndi Lawn",
    description: "Pre-wedding venue · Floral décor · DJ & Dhol",
    fullDescription: "The perfect pre-wedding celebration venue! A lush green lawn with floral arches, marigold shower setup, professional Dhol players, and a dedicated Mehndi artist corner. Includes a Haldi ceremony platform, photo booth with ethnic props, and catering for traditional snacks. Make your pre-wedding celebrations Instagram-worthy!",
    images: [property2, property1, property3],
    rating: 4.6,
    reviewCount: 78,
    location: "Jeypore, Odisha",
    amenities: ["Garden", "Stage Area", "DJ Booth", "Flower Decor", "Photo Booth", "Washroom", "Parking", "Sound System"],
    amenityIcons: ["🌿", "🎤", "🎧", "🌸", "📸", "🚻", "🅿️", "🎵"],
    slotsLeft: 2,
    basePrice: 4999,
    tags: ["💒 Pre-Wedding", "🎊 Celebration"],
    verified: true,
    capacity: 60,
    hostName: "Ritu B.",
    hostSince: "2022",
    responseRate: "98%",
    category: ["experiences", "party", "services"],
    highlights: ["Marigold flower shower setup", "Professional Dhol + Nagada players", "Mehndi artist corner for 10 guests", "Ethnic photo booth with props"],
    rules: [
      { icon: "🕐", text: "Setup begins 3 hours before event" },
      { icon: "🌸", text: "All flowers fresh, sourced locally" },
      { icon: "🎵", text: "Music curfew at 10 PM" },
      { icon: "🧹", text: "Full cleanup included" },
    ],
    reviews: [
      { id: "r1", name: "Pallavi D.", avatar: "👩", rating: 5, date: "5 days ago", comment: "My Haldi ceremony was a DREAM! The marigold shower and Dhol players were incredible. Thank you Ritu!" },
      { id: "r2", name: "Arun S.", avatar: "👨", rating: 4, date: "2 weeks ago", comment: "Great venue for pre-wedding events. Well maintained lawn and excellent coordination." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "8 AM - 12 PM", price: 4999, available: true },
      { id: "s2", label: "Afternoon", time: "12 PM - 5 PM", price: 5999, available: true, popular: true },
      { id: "s3", label: "Evening", time: "5 PM - 10 PM", price: 6999, available: true },
      { id: "s4", label: "Full Day", time: "8 AM - 10 PM", price: 11999, available: false },
    ],
    entryInstructions: "Opposite Reliance Mart, green gate with marigold garlands. Can't miss it!",
  },
  {
    id: "17",
    name: "Stargazing Observatory",
    description: "Telescope · Constellation tour · Night photography",
    fullDescription: "Jeypore's only dedicated stargazing experience on a hilltop with zero light pollution. Features a professional 8-inch Dobsonian telescope, guided constellation tour by an astronomy enthusiast, night sky photography assistance, and blankets + hot cocoa under the stars. See Saturn's rings, Jupiter's moons, and the Milky Way with your own eyes!",
    images: [property3, property1, property2],
    rating: 4.9,
    reviewCount: 95,
    location: "Near Jeypore, Odisha",
    amenities: ["Stargazing Deck", "Hammocks", "Clean Washrooms", "Parking", "First Aid"],
    amenityIcons: ["🌌", "🛏️", "🚻", "🅿️", "🏥"],
    slotsLeft: 3,
    basePrice: 699,
    tags: ["🌌 Stargazing", "🔭 Unique"],
    verified: true,
    capacity: 10,
    hostName: "Astro Sameer",
    hostSince: "2023",
    responseRate: "94%",
    category: ["experiences", "stargazing", "couples"],
    highlights: ["8-inch Dobsonian telescope", "See Saturn's rings with your eyes", "Milky Way photography guidance", "Hot cocoa & blankets provided"],
    rules: [
      { icon: "🕐", text: "Arrive before sunset for setup" },
      { icon: "📱", text: "Phones on silent, no flashlights" },
      { icon: "🧥", text: "Bring warm layers — hilltop gets cold" },
      { icon: "☁️", text: "Session rescheduled if cloudy" },
    ],
    reviews: [
      { id: "r1", name: "Tara P.", avatar: "👩", rating: 5, date: "3 days ago", comment: "Seeing Saturn's rings for the first time was surreal! Sameer's knowledge is incredible. Magical night!" },
      { id: "r2", name: "Dev K.", avatar: "👨", rating: 5, date: "2 weeks ago", comment: "Took my wife for a surprise date here — she cried happy tears seeing the Milky Way. Best ₹699 ever spent." },
    ],
    slots: [
      { id: "s1", label: "Evening", time: "6 PM - 9 PM", price: 699, available: true },
      { id: "s2", label: "Late Night", time: "9 PM - 12 AM", price: 899, available: true, popular: true },
      { id: "s3", label: "Full Night", time: "6 PM - 12 AM", price: 1299, available: true },
    ],
    entryInstructions: "Deomali Road, 8 km from Jeypore. Follow the 'Stars Ahead' signboards.",
  },
  {
    id: "18",
    name: "River Rafting & Kayaking",
    description: "Kolab River · Guided rapids · Beginner friendly",
    fullDescription: "Get your adrenaline pumping with river rafting and kayaking on the scenic Kolab River! Grade 1-2 rapids perfect for beginners, guided by certified adventure instructors. Includes safety gear, life jackets, and a riverside snack break. The 2-hour journey passes through lush green gorges and tribal villages. An unforgettable adventure experience!",
    images: [property1, property2, property3],
    rating: 4.5,
    reviewCount: 72,
    location: "Kolab River, Jeypore",
    amenities: ["Nature Trail", "Changing Room", "First Aid", "Refreshment Counter", "Parking", "Clean Washrooms"],
    amenityIcons: ["🥾", "🚿", "🏥", "🥤", "🅿️", "🚻"],
    slotsLeft: 6,
    basePrice: 799,
    tags: ["🚣 Adventure", "🌊 Rafting"],
    verified: true,
    capacity: 8,
    hostName: "Captain Rao",
    hostSince: "2021",
    responseRate: "93%",
    category: ["experiences", "sports"],
    highlights: ["Grade 1-2 rapids, beginner friendly", "Certified adventure instructors", "Scenic gorge & tribal village views", "Riverside chai & snack break"],
    rules: [
      { icon: "🏊", text: "Must know basic swimming" },
      { icon: "🕐", text: "Report 30 mins early for safety briefing" },
      { icon: "📱", text: "Waterproof phone pouch provided" },
      { icon: "👕", text: "Wear quick-dry clothes" },
    ],
    reviews: [
      { id: "r1", name: "Harsh P.", avatar: "👨", rating: 5, date: "1 week ago", comment: "Most thrilling experience near Jeypore! Captain Rao made us feel safe throughout. The gorge views were stunning!" },
      { id: "r2", name: "Sneha T.", avatar: "👩", rating: 4, date: "3 weeks ago", comment: "So much fun! Perfect for beginners. The riverside chai was the cherry on top." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "7 AM - 9 AM", price: 799, available: true, popular: true },
      { id: "s2", label: "Late Morning", time: "10 AM - 12 PM", price: 899, available: true },
      { id: "s3", label: "Afternoon", time: "2 PM - 4 PM", price: 799, available: true },
    ],
    entryInstructions: "Kolab Dam Road, 12 km from Jeypore. Captain Rao will meet you at the parking area.",
  },
  {
    id: "19",
    name: "Outdoor Movie Amphitheater",
    description: "Giant screen · Bean bags · Popcorn bar",
    fullDescription: "Watch movies under the stars in this gorgeous open-air amphitheater! Featuring a 25-foot LED screen, plush bean bag seating for 30, a gourmet popcorn bar (caramel, cheese, masala), and surround sound. Pick from our curated list of Hollywood and Bollywood classics, or bring your own content. Perfect for friend groups, date nights, or family outings.",
    images: [property3, property2, property1],
    rating: 4.7,
    reviewCount: 134,
    location: "Jeypore, Odisha",
    amenities: ["Movie Screen", "Sound System", "Lounge Seating", "Snack Bar", "Parking", "Washroom", "Fairy Lights", "WiFi"],
    amenityIcons: ["🎬", "🎵", "🛋️", "🍿", "🅿️", "🚻", "✨", "📶"],
    slotsLeft: 2,
    basePrice: 1199,
    tags: ["🎬 Movie Night", "🌟 Popular"],
    verified: true,
    capacity: 30,
    hostName: "Chetan M.",
    hostSince: "2022",
    responseRate: "97%",
    category: ["experiences", "movie", "couples"],
    highlights: ["25-foot outdoor LED screen", "Gourmet popcorn bar with 5 flavors", "Premium bean bag + blanket combo", "BYO content or pick from 200+ titles"],
    rules: [
      { icon: "🕐", text: "Gates open 30 mins before showtime" },
      { icon: "🍿", text: "Outside food allowed" },
      { icon: "📱", text: "Phones on silent during movie" },
      { icon: "🌧️", text: "Rain cover available" },
    ],
    reviews: [
      { id: "r1", name: "Naina K.", avatar: "👩", rating: 5, date: "2 days ago", comment: "Watched Interstellar under actual stars — best movie experience EVER! The caramel popcorn was amazing!" },
      { id: "r2", name: "Rahul S.", avatar: "👨", rating: 5, date: "1 week ago", comment: "Date night perfection. Bean bags, fairy lights, great sound. Chetan runs a tight ship!" },
    ],
    slots: [
      { id: "s1", label: "Matinee", time: "3 PM - 6 PM", price: 1199, available: true },
      { id: "s2", label: "Evening Show", time: "6 PM - 9 PM", price: 1499, available: true, popular: true },
      { id: "s3", label: "Late Night", time: "9 PM - 12 AM", price: 1699, available: true },
    ],
    entryInstructions: "Behind the District Library, follow the fairy-lit path. You'll hear the speakers!",
  },
  {
    id: "20",
    name: "Tribal Dance Experience",
    description: "Live tribal dance · Costume try-on · Drum circle",
    fullDescription: "Immerse yourself in the rich tribal culture of Koraput with this unique 2-hour experience. Watch mesmerizing Dhemsa and Ghumura dance performances by Paroja and Gadaba tribal artists, try on traditional tribal costumes, join a high-energy drum circle, and learn basic tribal dance steps. Includes tribal snacks, rice beer tasting (optional), and a handmade tribal souvenir.",
    images: [property2, property3, property1],
    rating: 4.8,
    reviewCount: 68,
    location: "Jeypore, Odisha",
    amenities: ["Stage Area", "Drum Circle", "Tribal Art", "Photo Booth", "Clean Washrooms", "Parking", "First Aid"],
    amenityIcons: ["🎤", "🥁", "🎨", "📸", "🚻", "🅿️", "🏥"],
    slotsLeft: 6,
    basePrice: 599,
    tags: ["💃 Tribal Dance", "🎭 Cultural"],
    verified: true,
    capacity: 20,
    hostName: "Santosh T.",
    hostSince: "2022",
    responseRate: "91%",
    category: ["experiences", "family"],
    highlights: ["Dhemsa & Ghumura dance performances", "Try traditional tribal costumes", "Participate in live drum circle", "Handmade tribal souvenir included"],
    rules: [
      { icon: "👕", text: "Comfortable clothes for dancing" },
      { icon: "🕐", text: "Arrive 15 mins early" },
      { icon: "📸", text: "Photos & videos with artists welcome" },
      { icon: "🍺", text: "Rice beer tasting is optional & 18+" },
    ],
    reviews: [
      { id: "r1", name: "Meghna P.", avatar: "👩", rating: 5, date: "6 days ago", comment: "The drum circle gave me goosebumps! Such raw energy and beautiful dance forms. A must-do in Jeypore!" },
      { id: "r2", name: "Oliver B.", avatar: "👨", rating: 5, date: "3 weeks ago", comment: "Incredible cultural experience. The tribal artists are so talented and welcoming. Highlight of my India trip." },
    ],
    slots: [
      { id: "s1", label: "Morning", time: "9 AM - 11 AM", price: 599, available: true },
      { id: "s2", label: "Afternoon", time: "3 PM - 5 PM", price: 599, available: true, popular: true },
      { id: "s3", label: "Evening", time: "5 PM - 7 PM", price: 699, available: true },
    ],
    entryInstructions: "Tribal Cultural Centre, behind the Collector's Office. Look for the painted bamboo gate.",
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
