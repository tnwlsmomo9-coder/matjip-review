import type { ReviewAnalysis } from "@/types/review-analysis";

const KEY_PREFIX = "gemini-analysis:";

// Unlike review-cache.ts, only successful analyses are ever cached here — a
// failed Gemini call is more likely a transient API error than a permanent
// fact about the place, so it's worth allowing a retry on the next click.
export function getCachedAnalysis(kakaoPlaceId: string): ReviewAnalysis | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + kakaoPlaceId);
    if (!raw) return null;
    return JSON.parse(raw) as ReviewAnalysis;
  } catch {
    return null;
  }
}

export function setCachedAnalysis(kakaoPlaceId: string, analysis: ReviewAnalysis): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + kakaoPlaceId, JSON.stringify(analysis));
  } catch {
    // Ignore storage failures — caching is a best-effort optimization.
  }
}
