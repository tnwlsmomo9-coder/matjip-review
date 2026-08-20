import { Search } from "lucide-react";
import { mockRestaurants } from "@/lib/mock-restaurants";

// Category chips are derived from the mock dataset for now — they're
// structural/visual only in this round. Wiring them up to real category
// filtering is out of scope here to avoid scope creep.
const categories = Array.from(
  new Set(mockRestaurants.map((restaurant) => restaurant.category))
);

export default function SearchBar() {
  return (
    <div className="mx-auto w-full max-w-screen-lg px-4">
      <label className="flex items-center gap-3 rounded-[10px] border-2 border-hairline bg-white px-5 py-4 transition-colors focus-within:border-accent">
        <Search className="h-5 w-5 shrink-0 text-ink/50" aria-hidden />
        <input
          type="text"
          placeholder="도시, 동네, 역 이름으로 검색해보세요"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className="rounded-[10px] border border-hairline bg-white px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-accent hover:text-accent sm:text-sm"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
