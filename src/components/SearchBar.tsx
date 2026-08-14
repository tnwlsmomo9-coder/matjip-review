import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="mx-auto w-full max-w-screen-lg px-4">
      <label className="flex items-center gap-3 rounded-[10px] border border-hairline bg-white px-4 py-3 transition-colors focus-within:border-accent">
        <Search className="h-5 w-5 shrink-0 text-ink/50" aria-hidden />
        <input
          type="text"
          placeholder="도시, 동네, 역 이름으로 검색해보세요"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </label>
    </div>
  );
}
