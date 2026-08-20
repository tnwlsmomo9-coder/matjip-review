"use client";

import { useRef, useState } from "react";
import CategoryChips from "@/components/search/CategoryChips";
import SearchForm from "@/components/search/SearchForm";
import SearchResultCard from "@/components/search/SearchResultCard";
import SearchResultsState from "@/components/search/SearchResultsState";
import { KakaoApiError, KakaoConfigError, searchKeyword } from "@/lib/kakao-local";
import type { KakaoPlaceDocument } from "@/types/kakao";

type Status = "idle" | "loading" | "success" | "error";

function messageForError(error: unknown): string {
  if (error instanceof KakaoConfigError) {
    return "카카오 API 키 설정을 확인해주세요.";
  }
  if (error instanceof KakaoApiError) {
    if (error.status === 401) {
      return "카카오 API 키 설정을 확인해주세요.";
    }
    if (error.status === 429) {
      return "요청이 많아 잠시 후 다시 시도해주세요.";
    }
    return "검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  }
  return "검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<KakaoPlaceDocument[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await searchKeyword(
        { query: trimmed, category_group_code: selectedCategory },
        controller.signal
      );
      setResults(response.documents);
      setStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setResults([]);
      setErrorMessage(messageForError(error));
      setStatus("error");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-ink">맛집 담기</h1>
        <p className="text-sm text-ink/60">키워드나 카테고리로 근처 맛집을 검색해보세요.</p>
      </div>

      <div className="flex flex-col gap-4">
        <SearchForm
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          disabled={status === "loading"}
        />
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {status === "loading" && <SearchResultsState status="loading" />}
      {status === "error" && <SearchResultsState status="error" message={errorMessage ?? undefined} />}
      {status === "success" && results.length === 0 && <SearchResultsState status="empty" />}
      {status === "success" && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((place) => (
            <SearchResultCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </main>
  );
}
