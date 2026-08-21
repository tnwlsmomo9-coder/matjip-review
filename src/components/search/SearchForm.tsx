"use client";

import { Search } from "lucide-react";
import { useLanguage, type Lang } from "@/components/LanguageProvider";

const copy: Record<Lang, { placeholder: string; ariaLabel: string; submit: string }> = {
  ko: {
    placeholder: "맛집, 카페, 지역을 검색해보세요",
    ariaLabel: "맛집 검색어",
    submit: "검색",
  },
  en: {
    placeholder: "Search restaurants, cafes, or areas",
    ariaLabel: "Restaurant search query",
    submit: "Search",
  },
};

interface SearchFormProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function SearchForm({ query, onQueryChange, onSubmit, disabled }: SearchFormProps) {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2"
    >
      <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-hairline bg-white px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-ink/50" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t.placeholder}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          aria-label={t.ariaLabel}
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {t.submit}
      </button>
    </form>
  );
}
