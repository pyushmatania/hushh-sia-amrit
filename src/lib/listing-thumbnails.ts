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
  return firstUrl || mapped;
}
