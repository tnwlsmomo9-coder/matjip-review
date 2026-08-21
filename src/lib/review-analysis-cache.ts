import type { ReviewAnalysis } from "@/types/review-analysis";
import type { Lang } from "@/components/LanguageProvider";

const KEY_PREFIX = "gemini-analysis:";

function keyFor(lang: Lang, kakaoPlaceId: string): string {
  return `${KEY_PREFIX}${lang}:${kakaoPlaceId}`;
}

// Unlike review-cache.ts, only successful analyses are ever cached here — a
// failed Gemini call is more likely a transient API error than a permanent
// fact about the place, so it's worth allowing a retry on the next click.
// Keyed by language too, same reasoning as review-cache.ts.
export function getCachedAnalysis(lang: Lang, kakaoPlaceId: string): ReviewAnalysis | null {
  try {
    const raw = window.localStorage.getItem(keyFor(lang, kakaoPlaceId));
    if (!raw) return null;
    return JSON.parse(raw) as ReviewAnalysis;
  } catch {
    return null;
  }
}

export function setCachedAnalysis(lang: Lang, kakaoPlaceId: string, analysis: ReviewAnalysis): void {
  try {
    window.localStorage.setItem(keyFor(lang, kakaoPlaceId), JSON.stringify(analysis));
  } catch {
    // Ignore storage failures — caching is a best-effort optimization.
  }
}
