"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import SplitReveal, { type SplitToken } from "@/components/SplitReveal";
import SearchBar from "@/components/SearchBar";

type Lang = "ko" | "en";

const copy: Record<
  Lang,
  { heading: SplitToken[]; body: string; cta: string; locating: string; locationError: string }
> = {
  ko: {
    heading: [
      { type: "word", parts: [{ text: "지금" }] },
      { type: "word", parts: [{ text: "내", className: "text-accent" }] },
      { type: "word", parts: [{ text: "주변", className: "text-accent" }] },
      {
        type: "word",
        parts: [{ text: "맛집", className: "text-accent" }, { text: "이" }],
      },
      { type: "break" },
      { type: "word", parts: [{ text: "궁금하다면?" }] },
    ],
    body: "위치 권한을 허용하면 가장 가까운 맛집부터 보여드려요",
    cta: "내 주변 맛집 탐색하기",
    locating: "위치 확인 중...",
    locationError: "위치 접근을 허용해주세요.",
  },
  en: {
    heading: [
      { type: "word", parts: [{ text: "Curious" }] },
      { type: "word", parts: [{ text: "about" }] },
      { type: "word", parts: [{ text: "restaurants", className: "text-accent" }] },
      { type: "word", parts: [{ text: "near", className: "text-accent" }] },
      { type: "word", parts: [{ text: "you", className: "text-accent" }] },
      { type: "word", parts: [{ text: "right" }] },
      { type: "word", parts: [{ text: "now?" }] },
    ],
    body: "Allow location access and we'll show the closest spots first",
    cta: "Explore restaurants near me",
    locating: "Locating...",
    locationError: "Please allow location access.",
  },
};

export default function NearbyExploreSection() {
  const [lang, setLang] = useState<Lang>("ko");
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const router = useRouter();
  const t = copy[lang];

  const handleKeywordSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleExploreNearby = () => {
    if (!("geolocation" in navigator)) {
      setLocationError(true);
      return;
    }
    setLocating(true);
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        router.push(`/search?lat=${latitude}&lng=${longitude}`);
      },
      () => {
        setLocating(false);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section className="mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl">
      <div className="relative flex flex-col items-center gap-5 rounded-[10px] border border-hairline bg-accent/5 p-6 pt-16 text-center sm:gap-6 sm:p-8 sm:pt-16 lg:gap-6 lg:p-10 lg:pt-16">
        <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[10px] border border-hairline bg-white p-1 sm:top-5 lg:top-6">
          {(["ko", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-[6px] px-3 py-1 text-xs font-semibold transition-colors sm:px-4 sm:py-1.5 sm:text-sm ${
                lang === l ? "bg-accent text-white" : "text-ink/50 hover:text-ink"
              }`}
            >
              {l === "ko" ? "한국어" : "EN"}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-sub/40 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
            <MapPin className="h-6 w-6 text-accent sm:h-7 sm:w-7 lg:h-8 lg:w-8" aria-hidden />
          </span>
          <h2 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-4xl">
            <SplitReveal tokens={t.heading} />
          </h2>
          <p className="mt-1 text-sm text-ink/60 sm:text-base">{t.body}</p>
        </div>

        <div className="w-full text-left">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleKeywordSearch} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleExploreNearby}
            disabled={locating}
            className="flex shrink-0 items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-70 sm:px-6 sm:py-3.5 sm:text-base"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" aria-hidden />
            ) : (
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            )}
            {locating ? t.locating : t.cta}
          </button>
          {locationError && <p className="text-xs text-accent">{t.locationError}</p>}
        </div>
      </div>
    </section>
  );
}
