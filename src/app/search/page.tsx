"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import CategoryChips from "@/components/search/CategoryChips";
import SearchForm from "@/components/search/SearchForm";
import SearchResultCard from "@/components/search/SearchResultCard";
import SearchResultsState from "@/components/search/SearchResultsState";
import {
  KakaoApiError,
  KakaoConfigError,
  searchByFilter,
  searchCategoryAll,
  type CategoryFilterValue,
} from "@/lib/kakao-local";
import type { KakaoPlaceDocument } from "@/types/kakao";

const NEARBY_CATEGORY_CODE = "FD6"; // 음식점
const PAGE_SIZE = 30;

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

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const hasCoords = lat !== null && lng !== null;

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterValue>("all");
  const [status, setStatus] = useState<Status>("idle");
  const [allResults, setAllResults] = useState<KakaoPlaceDocument[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uiPage, setUiPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Coordinates (x = longitude, y = latitude in Kakao's API) so keyword
  // searches on this page are also sorted by distance from the user.
  const x = lng ?? undefined;
  const y = lat ?? undefined;

  const runKeywordSearch = async (searchQuery: string, category: CategoryFilterValue) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const sort = hasCoords ? ("distance" as const) : undefined;
      const documents = await searchByFilter({ query: trimmed, x, y, sort }, category, controller.signal);
      setAllResults(documents);
      setUiPage(1);
      setStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setAllResults([]);
      setErrorMessage(messageForError(error));
      setStatus("error");
    }
  };

  const runNearbySearch = async (nearbyLat: string, nearbyLng: string) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const documents = await searchCategoryAll(
        { category_group_code: NEARBY_CATEGORY_CODE, x: nearbyLng, y: nearbyLat, sort: "distance" },
        controller.signal
      );
      setAllResults(documents);
      setUiPage(1);
      setStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setAllResults([]);
      setErrorMessage(messageForError(error));
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!hasCoords && !initialQuery.trim()) return;
    // Deferred so the initial setState doesn't run synchronously within the effect.
    const timeoutId = setTimeout(() => {
      if (hasCoords && lat && lng) {
        runNearbySearch(lat, lng);
      } else {
        runKeywordSearch(initialQuery, "all");
      }
    }, 0);
    return () => clearTimeout(timeoutId);
    // Only run once on mount, for the state the user arrived with via /search?q=... or ?lat=&lng=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => runKeywordSearch(query, selectedCategory);

  const results = allResults.slice((uiPage - 1) * PAGE_SIZE, uiPage * PAGE_SIZE);
  const hasNextPage = uiPage * PAGE_SIZE < allResults.length;

  const goToPrevPage = () => setUiPage((page) => Math.max(1, page - 1));
  const goToNextPage = () => setUiPage((page) => (page * PAGE_SIZE < allResults.length ? page + 1 : page));

  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-ink">내 주변 맛집</h1>
        <p className="text-sm text-ink/60">
          {hasCoords
            ? "가까운 순서로 맛집을 보여드려요."
            : "키워드나 카테고리로 근처 맛집을 검색해보세요."}
        </p>
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
      {status === "success" && allResults.length === 0 && <SearchResultsState status="empty" />}
      {status === "success" && allResults.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((place) => (
              <SearchResultCard key={place.id} place={place} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={uiPage === 1}
              className="rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
            >
              이전 페이지
            </button>
            <span className="text-sm text-ink/60">{uiPage}페이지</span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className="rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
            >
              다음 페이지
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
