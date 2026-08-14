import { MapPin } from "lucide-react";

export default function NearbyExploreSection() {
  return (
    <section className="mx-auto w-full max-w-screen-lg px-4">
      <div className="flex flex-col items-start gap-3 rounded-[10px] border border-hairline bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            지금 내 주변 맛집이 궁금하다면?
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            위치 권한을 허용하면 가장 가까운 맛집부터 보여드려요
          </p>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          내 주변 맛집 탐색하기
        </button>
      </div>
    </section>
  );
}
