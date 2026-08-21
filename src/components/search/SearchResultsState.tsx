"use client";

import { useLanguage, type Lang } from "@/components/LanguageProvider";

interface SearchResultsStateProps {
  status: "loading" | "empty" | "error";
  message?: string;
}

const DEFAULT_MESSAGE: Record<Lang, Record<SearchResultsStateProps["status"], string>> = {
  ko: {
    loading: "검색 중이에요...",
    empty: "검색 결과가 없어요. 다른 키워드로 검색해보세요.",
    error: "오류가 발생했어요. 잠시 후 다시 시도해주세요.",
  },
  en: {
    loading: "Searching...",
    empty: "No results found. Try a different keyword.",
    error: "Something went wrong. Please try again in a moment.",
  },
};

export default function SearchResultsState({ status, message }: SearchResultsStateProps) {
  const { lang } = useLanguage();

  return (
    <div className="flex items-center justify-center rounded-[10px] border border-hairline bg-white px-4 py-16 text-center">
      <p className="text-sm text-ink/60">{message ?? DEFAULT_MESSAGE[lang][status]}</p>
    </div>
  );
}
