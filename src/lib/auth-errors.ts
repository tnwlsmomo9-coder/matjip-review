import type { Lang } from "@/components/LanguageProvider";

// Supabase's auth error `message` is always English regardless of request
// locale, so callers match on it and show a localized string instead.
const rules: { test: (message: string) => boolean; ko: string; en: string }[] = [
  {
    test: (m) => /invalid login credentials/i.test(m),
    ko: "이메일 또는 비밀번호가 올바르지 않습니다.",
    en: "Incorrect email or password.",
  },
  {
    test: (m) => /already registered|user already exists/i.test(m),
    ko: "이미 가입된 이메일입니다.",
    en: "This email is already registered.",
  },
  {
    test: (m) => /password should be at least/i.test(m),
    ko: "비밀번호는 6자 이상이어야 합니다.",
    en: "Password must be at least 6 characters.",
  },
  {
    test: (m) => /unable to validate email address|email address .* is invalid|invalid email/i.test(m),
    ko: "올바른 이메일 형식이 아닙니다.",
    en: "That doesn't look like a valid email address.",
  },
  {
    test: (m) => /email not confirmed/i.test(m),
    ko: "이메일 인증이 필요합니다.",
    en: "Please confirm your email before signing in.",
  },
];

export function mapAuthErrorMessage(message: string, lang: Lang): string {
  const rule = rules.find((r) => r.test(message));
  if (rule) return rule[lang];
  return lang === "ko" ? "문제가 발생했습니다. 잠시 후 다시 시도해주세요." : "Something went wrong. Please try again.";
}
