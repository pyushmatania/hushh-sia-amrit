// Maps listing names to their local image assets for admin thumbnails
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
import listingWorkPod from "@/assets/listing-work-pod.jpg";
import listingCoupleCocoon from "@/assets/listing-couple-cocoon.jpg";
import listingBlueLagoon from "@/assets/listing-blue-lagoon.jpg";
import listingGreenLawn from "@/assets/listing-green-lawn.jpg";
import listingHushhRides from "@/assets/listing-hushh-rides.jpg";
import listingChefOnCall from "@/assets/listing-chef-on-call.jpg";
import listingPartyDecor from "@/assets/listing-party-decor.jpg";
import listingDjSound from "@/assets/listing-dj-sound.jpg";

const thumbnailMap: Record<string, string> = {
  "The Firefly Villas": listingFireflyVilla,
  "Koraput Garden House": listingKoraputGarden,
  "Ember Grounds": listingEmberGrounds,
  "Moonrise Terrace": listingMoonriseTerrace,
  "Tribal Camp": listingTribalCamp,
  "The Sports Arena": listingSportsArena,
  "Karaoke Cube": listingKaraokeCube,
  "Sunset Pavilion": listingSunsetPavilion,
  "Birthday Bliss Hall": listingBirthdayHall,
  "Anniversary Garden": listingAnniversaryGarden,
  "Smash Pickleball Club": listingPickleball,
  "Kitty Party Lounge": listingKittyParty,
  "Heritage Walk Jeypore": listingHeritageWalk,
  "Tribal Pottery Workshop": listingPottery,
  "Koraput Coffee Trail": listingCoffeeTrail,
  "Haldi Mehndi Garden": listingHaldiMehndi,
  "Stargazing Deck": listingStargazing,
  "White Water Rafting": listingRafting,
  "Open Air Cinema": listingMovieAmphitheater,
  "Tribal Dance Circle": listingTribalDance,
  "Work Pod": listingWorkPod,
  "Couple Cocoon": listingCoupleCocoon,
  "Blue Lagoon Pool": listingBlueLagoon,
  "Green Lawn Events": listingGreenLawn,
  "Hushh Rides": listingHushhRides,
  "Chef On Call": listingChefOnCall,
  "Party Decor Studio": listingPartyDecor,
  "DJ & Sound System": listingDjSound,
};

/**
 * Get the thumbnail image for a listing.
 * Priority: image_urls[0] > name-based local asset > null
 */
export function getListingThumbnail(name: string, imageUrls?: string[]): string | null {
  if (imageUrls && imageUrls.length > 0 && imageUrls[0]) return imageUrls[0];
  return thumbnailMap[name] || null;
}
