import Header from "@/components/Header";
import NearbyExploreSection from "@/components/NearbyExploreSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col pb-16">
        <div className="relative flex flex-1 flex-col items-center overflow-hidden px-4 py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent-sub/30 blur-3xl sm:h-[26rem] sm:w-[26rem] lg:h-[32rem] lg:w-[32rem]"
          />
          <div className="relative w-full">
            <NearbyExploreSection />
          </div>
        </div>
      </main>
    </>
  );
}
