// Maps listing names to their local image assets for admin thumbnails
import listingFireflyVilla from "@/assets/listing-firefly-villa.webp";
import listingKoraputGarden from "@/assets/listing-koraput-garden.webp";
import listingEmberGrounds from "@/assets/listing-ember-grounds.webp";
import listingMoonriseTerrace from "@/assets/listing-moonrise-terrace.webp";
import listingTribalCamp from "@/assets/listing-tribal-camp.webp";
import listingSportsArena from "@/assets/listing-sports-arena.webp";
import listingKaraokeCube from "@/assets/listing-karaoke-cube.webp";
import listingSunsetPavilion from "@/assets/listing-sunset-pavilion.webp";
import listingBirthdayHall from "@/assets/listing-birthday-hall.webp";
import listingAnniversaryGarden from "@/assets/listing-anniversary-garden.webp";
import listingPickleball from "@/assets/listing-pickleball.webp";
import listingKittyParty from "@/assets/listing-kitty-party.webp";
import listingHeritageWalk from "@/assets/listing-heritage-walk.webp";
import listingPottery from "@/assets/listing-pottery.webp";
import listingCoffeeTrail from "@/assets/listing-coffee-trail.webp";
import listingHaldiMehndi from "@/assets/listing-haldi-mehndi.webp";
import listingStargazing from "@/assets/listing-stargazing.webp";
import listingRafting from "@/assets/listing-rafting.webp";
import listingMovieAmphitheater from "@/assets/listing-movie-amphitheater.webp";
import listingTribalDance from "@/assets/listing-tribal-dance.webp";
import listingWorkPod from "@/assets/listing-work-pod.webp";
import listingCoupleCocoon from "@/assets/listing-couple-cocoon.webp";
import listingBlueLagoon from "@/assets/listing-blue-lagoon.webp";
import listingGreenLawn from "@/assets/listing-green-lawn.webp";
import listingHushhRides from "@/assets/listing-hushh-rides.webp";
import listingChefOnCall from "@/assets/listing-chef-on-call.webp";
import listingPartyDecor from "@/assets/listing-party-decor.webp";
import listingDjSound from "@/assets/listing-dj-sound.webp";

const normalizeListingName = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const thumbnailMap: Record<string, string> = {
  [normalizeListingName("The Firefly Villas")]: listingFireflyVilla,
  [normalizeListingName("Koraput Garden House")]: listingKoraputGarden,
  [normalizeListingName("Ember Grounds")]: listingEmberGrounds,
  [normalizeListingName("Moonrise Terrace")]: listingMoonriseTerrace,
  [normalizeListingName("Tribal Camp")]: listingTribalCamp,
  [normalizeListingName("The Sports Arena")]: listingSportsArena,
  [normalizeListingName("Karaoke Cube")]: listingKaraokeCube,
  [normalizeListingName("Sunset Pavilion")]: listingSunsetPavilion,
  [normalizeListingName("Birthday Bliss Hall")]: listingBirthdayHall,
  [normalizeListingName("Anniversary Garden")]: listingAnniversaryGarden,
  [normalizeListingName("Smash Pickleball Club")]: listingPickleball,
  [normalizeListingName("Kitty Party Lounge")]: listingKittyParty,
  [normalizeListingName("Heritage Walk Jeypore")]: listingHeritageWalk,
  [normalizeListingName("Tribal Pottery Workshop")]: listingPottery,
  [normalizeListingName("Koraput Coffee Trail")]: listingCoffeeTrail,
  [normalizeListingName("Haldi Mehndi Garden")]: listingHaldiMehndi,
  [normalizeListingName("Stargazing Deck")]: listingStargazing,
  [normalizeListingName("White Water Rafting")]: listingRafting,
  [normalizeListingName("Open Air Cinema")]: listingMovieAmphitheater,
  [normalizeListingName("Tribal Dance Circle")]: listingTribalDance,
  [normalizeListingName("Work Pod")]: listingWorkPod,
  [normalizeListingName("Couple Cocoon")]: listingCoupleCocoon,
  [normalizeListingName("Blue Lagoon Pool")]: listingBlueLagoon,
  [normalizeListingName("Green Lawn Events")]: listingGreenLawn,
  [normalizeListingName("Hushh Rides")]: listingHushhRides,
  [normalizeListingName("Chef On Call")]: listingChefOnCall,
  [normalizeListingName("Party Decor Studio")]: listingPartyDecor,
  [normalizeListingName("DJ & Sound System")]: listingDjSound,
};

/**
 * Get the thumbnail image for a listing.
 * Priority (default): image_urls[0] > mapped local asset > null
 * When preferMapped=true: mapped local asset > image_urls[0] > null
 */
export function getListingThumbnail(
  name: string,
  imageUrls?: string[],
  options?: { preferMapped?: boolean }
): string | null {
  const normalizedName = normalizeListingName(name || "");
  const mapped = thumbnailMap[normalizedName] || null;
  const firstUrl = imageUrls?.find((url) => !!url) || null;

  if (options?.preferMapped) return mapped || firstUrl;
  // Always try firstUrl first, then fall back to mapped asset for display
  return firstUrl || mapped;
}
