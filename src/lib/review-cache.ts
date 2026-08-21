import type { GooglePlaceReviewResult } from "@/types/google-places";

const KEY_PREFIX = "google-review:";

// Cached indefinitely by design: once a place's Google review lookup
// succeeds or comes back "not found", clicking it again should read from
// the browser instead of re-hitting the Google Places API.
export function getCachedGoogleReview(kakaoPlaceId: string): GooglePlaceReviewResult | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + kakaoPlaceId);
    if (!raw) return null;
    return JSON.parse(raw) as GooglePlaceReviewResult;
  } catch {
    return null;
  }
}

export function setCachedGoogleReview(kakaoPlaceId: string, result: GooglePlaceReviewResult): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + kakaoPlaceId, JSON.stringify(result));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.) — caching is a
    // best-effort optimization, not a correctness requirement.
  }
}
