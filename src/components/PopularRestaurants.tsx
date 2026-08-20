import type { Restaurant } from "@/types/restaurant";
import RestaurantCard from "@/components/RestaurantCard";

export default function PopularRestaurants({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section className="mx-auto w-full max-w-screen-lg px-4">
      <h2 className="font-heading text-xl font-bold text-ink sm:text-2xl">
        지금 인기 있는 맛집
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        믿을 수 있는 리뷰로 검증된 맛집을 만나보세요
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
}
