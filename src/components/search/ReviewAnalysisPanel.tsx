"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { GooglePlaceReviewItem } from "@/types/google-places";
import type { ReviewAnalysis } from "@/types/review-analysis";
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/review-analysis-cache";
import { useLanguage, type Lang } from "@/components/LanguageProvider";

type AnalysisView =
  | { status: "loading" }
  | { status: "done"; data: ReviewAnalysis }
  | { status: "error" };

const SENTIMENT_LABELS: Record<
  Lang,
  { key: keyof ReviewAnalysis["sentiment"]; label: string; barClass: string }[]
> = {
  ko: [
    { key: "positive", label: "긍정", barClass: "bg-positive" },
    { key: "neutral", label: "보통", barClass: "bg-neutral" },
    { key: "negative", label: "부정", barClass: "bg-negative" },
  ],
  en: [
    { key: "positive", label: "Positive", barClass: "bg-positive" },
    { key: "neutral", label: "Neutral", barClass: "bg-neutral" },
    { key: "negative", label: "Negative", barClass: "bg-negative" },
  ],
};

const copy: Record<Lang, { title: string; loading: string; error: string }> = {
  ko: { title: "AI 리뷰 분석", loading: "AI 리뷰를 분석하는 중 …", error: "AI 분석을 불러오지 못했어요." },
  en: { title: "AI Review Analysis", loading: "Analyzing reviews with AI …", error: "Couldn't load AI analysis." },
};

function keywordFontSize(score: number): number {
  const clamped = Math.min(10, Math.max(1, score));
  return 12 + ((clamped - 1) / 9) * 12;
}

interface ReviewAnalysisPanelProps {
  placeId: string;
  placeName: string;
  reviews: GooglePlaceReviewItem[];
}

export default function ReviewAnalysisPanel({ placeId, placeName, reviews }: ReviewAnalysisPanelProps) {
  const { lang } = useLanguage();
  const t = copy[lang];
  const sentimentLabels = SENTIMENT_LABELS[lang];

  const [view, setView] = useState<AnalysisView>(() => {
    const cached = getCachedAnalysis(lang, placeId);
    return cached ? { status: "done", data: cached } : { status: "loading" };
  });

  useEffect(() => {
    if (view.status !== "loading") return;

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch("/api/analyze-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placeName,
            reviews: reviews.map((review) => ({ rating: review.rating, text: review.text })),
            lang,
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          setView({ status: "error" });
          return;
        }
        const result = (await response.json()) as { analysis: ReviewAnalysis };
        setCachedAnalysis(lang, placeId, result.analysis);
        setView({ status: "done", data: result.analysis });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setView({ status: "error" });
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, lang]);

  if (view.status === "error") {
    return <p className="text-xs text-ink/50">{t.error}</p>;
  }

  return (
    <div className="flex flex-col gap-3 border-b border-hairline pb-4">
      <h3 className="font-heading text-sm font-bold text-ink">{t.title}</h3>

      {view.status === "loading" && (
        <div className="flex items-center justify-center rounded-[10px] border border-hairline bg-white px-4 py-8 text-center">
          <p className="text-sm text-ink/60">{t.loading}</p>
        </div>
      )}

      {view.status === "done" && (
        <>
          <div className="flex flex-col gap-1.5">
            <div className="flex h-3 overflow-hidden rounded-full bg-surface-alt">
              {sentimentLabels.map(({ key, barClass }) => {
                const total =
                  view.data.sentiment.positive + view.data.sentiment.neutral + view.data.sentiment.negative;
                const width = total > 0 ? (view.data.sentiment[key] / total) * 100 : 0;
                return <div key={key} className={barClass} style={{ width: `${width}%` }} />;
              })}
            </div>
            <p className="text-xs text-ink/60">
              {sentimentLabels.map(({ key, label }) => `${label} ${view.data.sentiment[key]}`).join(" · ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-2 rounded-[10px] bg-surface-alt p-4">
            {view.data.keywords.map((keyword, index) => (
              <span
                key={index}
                className={keyword.context === "positive" ? "font-semibold text-positive" : "font-semibold text-negative"}
                style={{ fontSize: `${keywordFontSize(keyword.score)}px` }}
              >
                #{keyword.word.replace(/\s+/g, "")}
              </span>
            ))}
          </div>

          {view.data.summary && (
            <div className="flex items-start gap-2 rounded-[16px] rounded-bl-sm border border-hairline bg-accent-sub/20 px-4 py-3">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/60" aria-hidden />
              <p className="text-sm text-ink/80">{view.data.summary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
