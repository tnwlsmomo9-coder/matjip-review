import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import NearbyExploreSection from "@/components/NearbyExploreSection";
import PopularRestaurants from "@/components/PopularRestaurants";
import { mockRestaurants } from "@/lib/mock-restaurants";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-10 py-8">
        <SearchBar />
        <NearbyExploreSection />
        <PopularRestaurants restaurants={mockRestaurants} />
      </main>
    </div>
  );
}
