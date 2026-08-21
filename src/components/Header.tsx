export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4">
        <span className="font-heading text-xl font-extrabold tracking-tight text-accent">
          맛집리뷰
        </span>
        <button
          type="button"
          className="rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          로그인
        </button>
      </div>
    </header>
  );
}
