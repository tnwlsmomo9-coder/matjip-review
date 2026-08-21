"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage, type Lang } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";

const copy: Record<Lang, { favorites: string; login: string; logout: string; greeting: (name: string) => string }> = {
  ko: { favorites: "찜목록", login: "로그인", logout: "로그아웃", greeting: (name) => `${name}님` },
  en: { favorites: "Favorites", login: "Log in", logout: "Log out", greeting: (name) => `Hi, ${name}` },
};

export default function Header() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const { user, loading, openAuthModal, signOut } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="찍고" width={40} height={40} className="rounded-[10px]" priority />
          <span className="font-heading text-xs font-semibold tracking-[0.15em] text-accent/60">ZZIGO</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/favorites"
            className="flex items-center gap-1.5 rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <Heart className="h-4 w-4" aria-hidden />
            {t.favorites}
          </Link>
          {!loading &&
            (user ? (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-medium text-ink">{t.greeting(displayName)}</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-[10px] px-2 py-2 font-medium text-ink/50 transition-colors hover:text-accent"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {t.login}
              </button>
            ))}
        </div>
      </div>
    </header>
  );
}
