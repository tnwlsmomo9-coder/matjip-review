import NearbyExploreSection from "@/components/NearbyExploreSection";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent-sub/30 blur-3xl sm:h-[26rem] sm:w-[26rem] lg:h-[32rem] lg:w-[32rem]"
      />
      <main className="relative w-full">
        <NearbyExploreSection />
      </main>
    </div>
  );
}
