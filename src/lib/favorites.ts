import type { KakaoPlaceDocument } from "@/types/kakao";

const STORAGE_KEY = "zzigo-favorites";

// Keyed by place id so a place can only ever be favorited once, and the
// full document is stored (not just the id) since there's no "get place by
// id" Kakao endpoint to re-fetch details from later — the favorites list
// page reads straight out of this snapshot.
function readAll(): Record<string, KakaoPlaceDocument> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, KakaoPlaceDocument>;
  } catch {
    return {};
  }
}

function writeAll(favorites: Record<string, KakaoPlaceDocument>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.).
  }
}

export function isFavorited(placeId: string): boolean {
  return placeId in readAll();
}

export function getFavorites(): KakaoPlaceDocument[] {
  return Object.values(readAll());
}

// Returns the new favorited state so callers can update their UI without a
// separate isFavorited() re-read.
export function toggleFavorite(place: KakaoPlaceDocument): boolean {
  const all = readAll();
  const alreadyFavorited = place.id in all;
  if (alreadyFavorited) {
    delete all[place.id];
  } else {
    all[place.id] = place;
  }
  writeAll(all);
  return !alreadyFavorited;
}
