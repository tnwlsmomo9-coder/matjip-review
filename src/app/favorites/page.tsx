"use client";

import { useState } from "react";
import Link from "next/link";
import SearchResultCard from "@/components/search/SearchResultCard";
import { getFavorites } from "@/lib/favorites";
import type { KakaoPlaceDocument } from "@/types/kakao";
import { useLanguage, type Lang } from "@/components/LanguageProvider";

const copy: Record<
  Lang,
  { title: string; subtitle: string; home: string; empty: string; searchCta: string }
> = {
  ko: {
    title: "찜목록",
    subtitle: "찜한 맛집을 모아봤어요.",
    home: "처음 화면",
    empty: "아직 찜한 맛집이 없어요.",
    searchCta: "맛집 검색하러 가기",
  },
  en: {
    title: "Favorites",
    subtitle: "All your favorite restaurants in one place.",
    home: "Home",
    empty: "No favorites yet.",
    searchCta: "Go search restaurants",
  },
};

export default function FavoritesPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [favorites, setFavorites] = useState<KakaoPlaceDocument[]>(() => getFavorites());

  const handleFavoriteChange = (place: KakaoPlaceDocument, favorited: boolean) => {
    if (favorited) return;
    setFavorites((current) => current.filter((item) => item.id !== place.id));
  };

  return (
    <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold text-ink">{t.title}</h1>
          <p className="text-sm text-ink/60">{t.subtitle}</p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {t.home}
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-hairline bg-white px-4 py-16 text-center">
          <p className="text-sm text-ink/60">{t.empty}</p>
          <Link
            href="/search"
            className="text-sm font-medium text-accent underline underline-offset-2"
          >
            {t.searchCta}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((place) => (
            <SearchResultCard key={place.id} place={place} onFavoriteChange={handleFavoriteChange} />
          ))}
        </div>
      )}
    </main>
  );
}
