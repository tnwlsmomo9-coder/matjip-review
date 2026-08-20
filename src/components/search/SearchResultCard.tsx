import { MapPin, Phone } from "lucide-react";
import type { KakaoPlaceDocument } from "@/types/kakao";

function lastCategorySegment(categoryName: string): string {
  const segments = categoryName.split(" > ").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : categoryName;
}

export default function SearchResultCard({ place }: { place: KakaoPlaceDocument }) {
  const address = place.road_address_name || place.address_name;

  return (
    <article className="flex flex-col gap-2 rounded-[10px] border border-hairline bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-base font-bold text-ink">{place.place_name}</h3>
        {place.category_name && (
          <span className="shrink-0 text-xs font-medium text-ink/50">
            {lastCategorySegment(place.category_name)}
          </span>
        )}
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
        className="mt-2 text-sm font-medium text-accent underline underline-offset-2"
      >
        카카오맵에서 보기
      </a>
    </article>
  );
}
