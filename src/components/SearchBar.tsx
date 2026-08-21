"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

export default function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label className="flex items-center gap-3 rounded-[10px] border-2 border-hairline bg-white px-5 py-4 transition-colors focus-within:border-accent">
        <Search className="h-5 w-5 shrink-0 text-ink/50" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="도시, 동네, 역 이름으로 검색해보세요"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </label>
    </form>
  );
}
