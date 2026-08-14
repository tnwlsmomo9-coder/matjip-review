interface TrustBadgeProps {
  reviewCount: number;
  trustScore: number;
}

export default function TrustBadge({ reviewCount, trustScore }: TrustBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-[10px] bg-accent-sub/30 px-2.5 py-1 text-xs font-semibold text-ink">
      리뷰 {reviewCount}개 · 도움돼요 {trustScore}%
    </span>
  );
}
