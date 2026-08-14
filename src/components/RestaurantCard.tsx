import Image from "next/image";
import { Heart, MapPin } from "lucide-react";
import type { Restaurant } from "@/types/restaurant";
import TrustBadge from "@/components/TrustBadge";

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="overflow-hidden rounded-[10px] border border-hairline bg-white">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-ink">
            {restaurant.name}
          </h3>
          <span className="shrink-0 text-xs font-medium text-ink/50">
            {restaurant.category}
          </span>
        </div>
        <p className="text-sm text-ink/70">{restaurant.oneLineReview}</p>
        <p className="flex items-center gap-1 text-xs text-ink/50">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {restaurant.landmarkText}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <TrustBadge reviewCount={restaurant.reviewCount} trustScore={restaurant.trustScore} />
          <span className="flex items-center gap-1 text-xs text-ink/50">
            <Heart className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {restaurant.saveCount}
          </span>
        </div>
      </div>
    </article>
  );
}
