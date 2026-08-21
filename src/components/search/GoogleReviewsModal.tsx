"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { KakaoPlaceDocument } from "@/types/kakao";
import type { GooglePlaceReviewData, GooglePlaceReviewResult } from "@/types/google-places";
import { getCachedGoogleReview, setCachedGoogleReview } from "@/lib/review-cache";
import ReviewAnalysisPanel from "@/components/search/ReviewAnalysisPanel";
import { useLanguage, type Lang } from "@/components/LanguageProvider";

type ReviewView =
  | { status: "loading" }
  | { status: "found"; data: GooglePlaceReviewData }
  | { status: "not_found" }
  | { status: "error" };

function viewFromResult(result: GooglePlaceReviewResult): ReviewView {
  return result.found ? { status: "found", data: result.place } : { status: "not_found" };
}

const copy: Record<
  Lang,
  {
    close: string;
    loading: string;
    notFound: string;
    error: string;
    reviewCount: (count: number) => string;
    noReviews: string;
    viewAllOnGoogleMaps: string;
  }
> = {
  ko: {
    close: "닫기",
    loading: "리뷰를 불러오는 중 …",
    notFound: "구글에서 이 가게를 찾을 수 없어요.",
    error: "리뷰를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
    reviewCount: (count) => `리뷰 ${count}개`,
    noReviews: "아직 등록된 리뷰가 없어요.",
    viewAllOnGoogleMaps: "구글 맵에서 전체 리뷰 보기",
  },
  en: {
    close: "Close",
    loading: "Loading reviews …",
    notFound: "Couldn't find this place on Google.",
    error: "Couldn't load reviews. Please try again in a moment.",
    reviewCount: (count) => `${count} reviews`,
    noReviews: "No reviews yet.",
    viewAllOnGoogleMaps: "See all reviews on Google Maps",
  },
};

interface GoogleReviewsModalProps {
  place: KakaoPlaceDocument;
  onClose: () => void;
}

export default function GoogleReviewsModal({ place, onClose }: GoogleReviewsModalProps) {
  const { lang } = useLanguage();
  const t = copy[lang];

  // Lazy-initialized from the browser cache so a cache hit never needs an
  // effect to call setState synchronously — it's just the initial render.
  const [view, setView] = useState<ReviewView>(() => {
    const cached = getCachedGoogleReview(lang, place.id);
    return cached ? viewFromResult(cached) : { status: "loading" };
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (view.status !== "loading") return;

    const controller = new AbortController();

    (async () => {
      try {
        const params = new URLSearchParams({ name: place.place_name, lat: place.y, lng: place.x, lang });
        const response = await fetch(`/api/google-place-reviews?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setView({ status: "error" });
          return;
        }
        const result = (await response.json()) as GooglePlaceReviewResult;
        setCachedGoogleReview(lang, place.id, result);
        setView(viewFromResult(result));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setView({ status: "error" });
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.id, lang]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-y-auto rounded-[10px] border border-hairline bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2 className="font-heading text-base font-bold text-ink">
            {view.status === "found" ? view.data.name : place.place_name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="shrink-0 rounded-[10px] p-1 text-ink/50 transition-colors hover:bg-surface-alt hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {view.status === "loading" && (
          <div className="flex items-center justify-center rounded-[10px] border border-hairline bg-white px-4 py-16 text-center">
            <p className="text-sm text-ink/60">{t.loading}</p>
          </div>
        )}

        {view.status === "not_found" && (
          <div className="flex items-center justify-center rounded-[10px] border border-hairline bg-white px-4 py-16 text-center">
            <p className="text-sm text-ink/60">{t.notFound}</p>
          </div>
        )}

        {view.status === "error" && (
          <div className="flex items-center justify-center rounded-[10px] border border-hairline bg-white px-4 py-16 text-center">
            <p className="text-sm text-ink/60">{t.error}</p>
          </div>
        )}

        {view.status === "found" && (
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center rounded-[10px] bg-accent-sub/30 px-2.5 py-1 text-xs font-semibold text-ink">
              ⭐ {view.data.rating.toFixed(1)} · {t.reviewCount(view.data.userRatingCount)}
            </span>

            {view.data.reviews.length > 0 && (
              <ReviewAnalysisPanel placeId={place.id} placeName={view.data.name} reviews={view.data.reviews} />
            )}

            <ul className="flex flex-col gap-3">
              {view.data.reviews.map((review, index) => (
                <li
                  key={index}
                  className="flex flex-col gap-1 border-t border-hairline pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-ink/50">
                    <span className="font-medium text-ink/70">{review.authorName}</span>
                    <span>{review.relativeTime}</span>
                  </div>
                  <span className="text-xs text-ink/50">⭐ {review.rating}</span>
                  <p className="text-sm text-ink/80">{review.text}</p>
                </li>
              ))}
              {view.data.reviews.length === 0 && (
                <li className="text-sm text-ink/60">{t.noReviews}</li>
              )}
            </ul>

            {view.data.googleMapsUri && (
              <a
                href={view.data.googleMapsUri}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-accent underline underline-offset-2"
              >
                {t.viewAllOnGoogleMaps}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
