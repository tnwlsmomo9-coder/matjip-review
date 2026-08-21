"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage, type Lang } from "@/components/LanguageProvider";

const copy: Record<
  Lang,
  {
    title: string;
    email: string;
    password: string;
    login: string;
    signup: string;
    close: string;
    emailConfirmationRequired: string;
  }
> = {
  ko: {
    title: "로그인",
    email: "이메일",
    password: "비밀번호",
    login: "로그인",
    signup: "회원가입",
    close: "닫기",
    emailConfirmationRequired: "이메일 인증이 필요합니다. 관리자에게 문의해주세요.",
  },
  en: {
    title: "Log in",
    email: "Email",
    password: "Password",
    login: "Log in",
    signup: "Sign up",
    close: "Close",
    emailConfirmationRequired: "Email confirmation is required. Please contact an admin.",
  },
};

export default function AuthModal() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError(null);
    closeAuthModal();
  };

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(mapAuthErrorMessage(error.message, lang));
        return;
      }
      handleClose();
    } catch {
      // Network failure or anything else signInWithPassword doesn't hand
      // back as `error` — without this the button would just look dead.
      setError(mapAuthErrorMessage("", lang));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    // Unlike the 로그인 button, this one isn't type="submit", so the
    // browser's required-field validation never runs on its own — without
    // this, an empty click sends a credential-less signup straight to
    // Supabase, which rejects it as an anonymous sign-in attempt.
    if (!formRef.current?.reportValidity()) return;
    setError(null);
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(mapAuthErrorMessage(error.message, lang));
        return;
      }
      // Confirmation-disabled projects still don't create a duplicate
      // account for an already-registered email — they instead return a
      // user with no identities and no error, to avoid leaking which
      // emails exist.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(mapAuthErrorMessage("already registered", lang));
        return;
      }
      if (!data.session) {
        setError(t.emailConfirmationRequired);
        return;
      }
      handleClose();
    } catch {
      setError(mapAuthErrorMessage("", lang));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-[10px] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-ink">{t.title}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.close}
            className="rounded-[10px] p-1 text-ink/40 transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <form
          ref={formRef}
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSignIn();
          }}
        >
          <input
            type="email"
            required
            autoComplete="email"
            placeholder={t.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-[10px] border border-hairline px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder={t.password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-[10px] border border-hairline px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {t.login}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSignUp}
              className="flex-1 rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {t.signup}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
