// Types for Google Places API (New). Field shapes follow
// https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places

export interface GooglePlaceLocation {
  latitude: number;
  longitude: number;
}

export interface GoogleLocalizedText {
  text: string;
  languageCode?: string;
}

export interface GoogleSearchNearbyPlace {
  id: string;
  displayName?: GoogleLocalizedText;
  location?: GooglePlaceLocation;
}

export interface GoogleSearchNearbyResponse {
  places?: GoogleSearchNearbyPlace[];
}

export interface GooglePlaceReview {
  rating?: number;
  text?: GoogleLocalizedText;
  originalText?: GoogleLocalizedText;
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
}

export interface GooglePlaceDetailsResponse {
  displayName?: GoogleLocalizedText;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlaceReview[];
}

// Normalized shape returned by /api/google-place-reviews and cached client-side.
export interface GooglePlaceReviewItem {
  authorName: string;
  rating: number;
  relativeTime: string;
  text: string;
}

export interface GooglePlaceReviewData {
  name: string;
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
  reviews: GooglePlaceReviewItem[];
}

export type GooglePlaceReviewResult =
  | { found: true; place: GooglePlaceReviewData }
  | { found: false };
