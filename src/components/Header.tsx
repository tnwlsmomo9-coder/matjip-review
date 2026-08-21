"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function Header() {
  const { lang } = useLanguage();

  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="찍고" width={40} height={40} className="rounded-[10px]" priority />
          <span className="font-heading text-xs font-semibold tracking-[0.15em] text-accent/60">ZZIGO</span>
        </Link>
        <Link
          href="/favorites"
          className="flex items-center gap-1.5 rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Heart className="h-4 w-4" aria-hidden />
          {lang === "en" ? "Favorites" : "찜목록"}
        </Link>
      </div>
    </header>
  );
}
