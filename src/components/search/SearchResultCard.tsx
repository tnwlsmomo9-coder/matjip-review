"use client";

import { useState } from "react";
import { Heart, MapPin, Phone } from "lucide-react";
import type { KakaoPlaceDocument } from "@/types/kakao";
import GoogleReviewsModal from "@/components/search/GoogleReviewsModal";
import { isFavorited as getIsFavorited, toggleFavorite } from "@/lib/favorites";
import { useLanguage, type Lang } from "@/components/LanguageProvider";

const copy: Record<Lang, { favorite: string; unfavorite: string; viewOnKakaoMap: string }> = {
  ko: { favorite: "찜하기", unfavorite: "찜 해제", viewOnKakaoMap: "카카오맵에서 보기" },
  en: { favorite: "Add to favorites", unfavorite: "Remove from favorites", viewOnKakaoMap: "View on Kakao Map" },
};

function lastCategorySegment(categoryName: string): string {
  const segments = categoryName.split(" > ").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : categoryName;
}

interface SearchResultCardProps {
  place: KakaoPlaceDocument;
  // Only passed by the 찜목록 page, so unfavoriting there removes the card
  // immediately instead of leaving a stale unfilled heart in the list.
  onFavoriteChange?: (place: KakaoPlaceDocument, favorited: boolean) => void;
}

export default function SearchResultCard({ place, onFavoriteChange }: SearchResultCardProps) {
  const { lang } = useLanguage();
  const t = copy[lang];
  const address = place.road_address_name || place.address_name;
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [favorited, setFavorited] = useState(() => getIsFavorited(place.id));

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setReviewsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setReviewsOpen(true);
          }
        }}
        className="flex cursor-pointer flex-col gap-2 rounded-[10px] border border-hairline bg-white p-5 transition-colors hover:border-ink/20"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-ink">{place.place_name}</h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {place.category_name && (
              <span className="text-xs font-medium text-ink/50">
                {lastCategorySegment(place.category_name)}
              </span>
            )}
            <button
              type="button"
              aria-label={favorited ? t.unfavorite : t.favorite}
              aria-pressed={favorited}
              onClick={(event) => {
                event.stopPropagation();
                const next = toggleFavorite(place);
                setFavorited(next);
                onFavoriteChange?.(place, next);
              }}
              className="rounded-[10px] p-1 text-ink/40 transition-colors hover:text-accent"
            >
              <Heart className={favorited ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4"} aria-hidden />
            </button>
          </div>
        </div>
        {address && (
          <p className="flex items-center gap-1 text-xs text-ink/50">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {address}
            {place.distance && ` · ${place.distance}m`}
          </p>
        )}
        {place.phone && (
          <p className="flex items-center gap-1 text-xs text-ink/50">
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {place.phone}
          </p>
        )}
        <a
          href={place.place_url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="mt-2 text-sm font-medium text-accent underline underline-offset-2"
        >
          {t.viewOnKakaoMap}
        </a>
      </article>
      {reviewsOpen && <GoogleReviewsModal place={place} onClose={() => setReviewsOpen(false)} />}
    </>
  );
}
