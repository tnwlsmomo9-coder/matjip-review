export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4">
        <span className="flex items-baseline gap-1.5">
          <span className="font-heading text-xl font-extrabold tracking-tight text-accent">찍고</span>
          <span className="font-heading text-xs font-semibold tracking-[0.15em] text-accent/60">ZZIGO</span>
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
