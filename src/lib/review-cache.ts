import type { GooglePlaceReviewResult } from "@/types/google-places";
import type { Lang } from "@/components/LanguageProvider";

const KEY_PREFIX = "google-review:";

// Keyed by language too, so switching the site language doesn't show
// stale-language cached content — each language is only ever fetched (and
// cached) the first time a place is actually opened in that language.
function keyFor(lang: Lang, kakaoPlaceId: string): string {
  return `${KEY_PREFIX}${lang}:${kakaoPlaceId}`;
}

// Cached indefinitely by design: once a place's Google review lookup
// succeeds or comes back "not found", clicking it again should read from
// the browser instead of re-hitting the Google Places API.
export function getCachedGoogleReview(lang: Lang, kakaoPlaceId: string): GooglePlaceReviewResult | null {
  try {
    const raw = window.localStorage.getItem(keyFor(lang, kakaoPlaceId));
    if (!raw) return null;
    return JSON.parse(raw) as GooglePlaceReviewResult;
  } catch {
    return null;
  }
}

export function setCachedGoogleReview(lang: Lang, kakaoPlaceId: string, result: GooglePlaceReviewResult): void {
  try {
    window.localStorage.setItem(keyFor(lang, kakaoPlaceId), JSON.stringify(result));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.) — caching is a
    // best-effort optimization, not a correctness requirement.
  }
}
