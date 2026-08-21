// Server-only client for Google Places API (New). Never import this from a
// "use client" component — GOOGLE_PLACES_API_KEY has no NEXT_PUBLIC_ prefix
// on purpose, so it only exists in the Node runtime (route handlers).
import type {
  GooglePlaceReviewData,
  GoogleSearchNearbyResponse,
  GooglePlaceDetailsResponse,
} from "@/types/google-places";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places";

// Walking-2-minutes radius used to disambiguate same-name chains that show up
// in multiple locations nationwide.
const MATCH_RADIUS_METERS = 150;

export class GooglePlacesApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GooglePlacesApiError";
    this.status = status;
  }
}

export class GooglePlacesConfigError extends Error {
  constructor(message = "GOOGLE_PLACES_API_KEY is not set") {
    super(message);
    this.name = "GooglePlacesConfigError";
  }
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase();
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Nearby Search (New) enforces `locationRestriction` server-side and exactly
// (not a ranking bias), so every candidate returned here is guaranteed to be
// within MATCH_RADIUS_METERS — unlike Text Search's `locationBias`. It can't
// filter by name, though, so name matching happens locally against this
// already-radius-restricted candidate list.
export async function findNearbyPlaceId(
  name: string,
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string | null> {
  if (!API_KEY) {
    throw new GooglePlacesConfigError();
  }

  const response = await fetch(SEARCH_NEARBY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location",
    },
    body: JSON.stringify({
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: MATCH_RADIUS_METERS,
        },
      },
      languageCode: "ko",
    }),
    signal,
  });

  if (!response.ok) {
    throw new GooglePlacesApiError(response.status, `Google Places searchNearby failed with status ${response.status}`);
  }

  const data = (await response.json()) as GoogleSearchNearbyResponse;
  const candidates = data.places ?? [];
  const target = normalizeName(name);

  const exact = candidates.filter((place) => normalizeName(place.displayName?.text ?? "") === target);
  const partial = candidates.filter((place) => {
    const candidateName = normalizeName(place.displayName?.text ?? "");
    return candidateName.includes(target) || target.includes(candidateName);
  });

  const pool = exact.length > 0 ? exact : partial;
  if (pool.length === 0) {
    return null;
  }

  const nearest = pool.reduce((closest, place) => {
    const distance = haversineMeters(
      { lat, lng },
      { lat: place.location?.latitude ?? lat, lng: place.location?.longitude ?? lng }
    );
    return distance < closest.distance ? { place, distance } : closest;
  }, { place: pool[0], distance: Infinity });

  return nearest.place.id;
}

export async function getPlaceReviewDetails(
  placeId: string,
  signal?: AbortSignal
): Promise<GooglePlaceReviewData> {
  if (!API_KEY) {
    throw new GooglePlacesConfigError();
  }

  const response = await fetch(`${PLACE_DETAILS_URL}/${placeId}?languageCode=ko`, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews,googleMapsUri",
    },
    signal,
  });

  if (!response.ok) {
    throw new GooglePlacesApiError(response.status, `Google Places details failed with status ${response.status}`);
  }

  const data = (await response.json()) as GooglePlaceDetailsResponse;

  return {
    name: data.displayName?.text ?? "",
    rating: data.rating ?? 0,
    userRatingCount: data.userRatingCount ?? 0,
    googleMapsUri: data.googleMapsUri ?? "",
    reviews: (data.reviews ?? []).map((review) => ({
      authorName: review.authorAttribution?.displayName ?? "익명",
      rating: review.rating ?? 0,
      relativeTime: review.relativePublishTimeDescription ?? "",
      text: review.text?.text ?? review.originalText?.text ?? "",
    })),
  };
}
