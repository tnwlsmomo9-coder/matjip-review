# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npx tsc --noEmit` — type-check only (no test framework is configured in this repo)

## Project context

This is the mock/static-UI first pass of a restaurant review service. Two docs at the repo root are the source of truth and should be checked before adding features:

- `PRD_1.md` — product scope, MVP vs Phase 2, feature definitions (search/explore, guided reviews, receipt-verified anti-troll reviews, trust scoring, etc.)
- `DESIGN_1.md` — mood, color palette, typography, and component style rules

Current scope is intentionally narrow: **still no app database** (no restaurant/review tables), but auth is now real. Integrations that exist:
- `/search` (`src/app/search/page.tsx`) calls the real Kakao Local API client-side via `src/lib/kakao-local.ts`, gated by the `NEXT_PUBLIC_KAKAO_REST_API_KEY` env var (see `.env.local.example` for setup). The home page's "내 주변 맛집 탐색하기" button in `NearbyExploreSection` uses a real `navigator.geolocation.getCurrentPosition` call and routes to `/search?lat=&lng=`, which runs a distance-sorted Kakao category search (`searchCategory`) instead of the old mock-only flow.
- Clicking a `SearchResultCard` opens a Google reviews modal (`src/components/search/GoogleReviewsModal.tsx`) that hits the first (and only) server route in this repo, `src/app/api/google-place-reviews/route.ts`, which calls Google Places API (New) server-side via `src/lib/google-places.ts` using the server-only `GOOGLE_PLACES_API_KEY` env var (never `NEXT_PUBLIC_`). This is why `next.config.ts` no longer sets `output: "export"` — the app needs a real Next.js server build. Deployment is Vercel-only; the earlier GitHub Pages static-export workflow was removed since it can't run a server route.
- Email/password auth via Supabase (`src/lib/supabase.ts`), gated by `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `.env.local.example`). `src/components/AuthProvider.tsx` wraps the whole app (`src/app/layout.tsx`) and exposes `useAuth()` — `{ user, loading, openAuthModal, closeAuthModal, signOut }` — as the one place other features should check "who's logged in." It also mounts `src/components/auth/AuthModal.tsx` (email/password sign-in + sign-up, Korean/English error copy via `src/lib/auth-errors.ts`) globally, opened from anywhere via `openAuthModal()`. Sign-up is meant to log the user in immediately with no email-confirmation wait, which requires "Confirm email" to be turned off in the Supabase dashboard (Authentication → Sign In / Providers → Email) — the Supabase MCP tools available in this repo have no method to read or change that setting, so it must be toggled manually and can't be assumed from code alone. Everything built so far stays usable while logged out **except** 찜(favorites): `SearchResultCard`'s heart button and `/favorites` both gate on `user` and open the login modal instead when signed out. There's no per-user favorites storage yet — `src/lib/favorites.ts` is still a single shared `localStorage` bucket, just now access-gated; wiring favorites to a real per-user Supabase table is a later task.

Don't wire up further real integrations (e.g. Naver, a second map provider) unless asked.

## Architecture

- Next.js App Router + TypeScript, path alias `@/*` → `src/*`.
- Tailwind CSS v4, CSS-first config (no `tailwind.config.ts`). All design tokens live in `src/app/globals.css` under an `@theme` block, named after DESIGN_1.md's own vocabulary rather than raw hex: `bg-surface`, `bg-surface-alt`, `text-ink`, `bg-accent` (vivid orange CTA color), `bg-accent-sub` (yellow, badges/highlights), `border-hairline`. Add new colors/spacing there, not as inline arbitrary-value classes.
- Fonts: Pretendard is self-hosted via the `pretendard` npm package (imported in `globals.css`, not `next/font/local`) since it's a Korean font not available through `next/font/google`. English/number pairing uses Inter Tight loaded through `next/font/google` in `src/app/layout.tsx`.
- `src/types/restaurant.ts` defines the `Restaurant` shape; `src/lib/mock-restaurants.ts` holds the mock dataset. Any new mock content should follow the same PRD-flavored shape (guide-question-style one-line review, landmark/subway-exit distance text, trust/save counts) rather than generic placeholder copy.
- `src/components/` holds presentational, single-purpose home-screen sections (`Header`, `SearchBar`, `NearbyExploreSection`, `PopularRestaurants`, `RestaurantCard`, `TrustBadge`). Not all of them are currently wired into `src/app/page.tsx` — check `page.tsx` to see what's actually rendered before assuming a component is live on the page.
- Icons come from `lucide-react`; don't hand-roll SVGs or add a second icon library.

## 반응형
- 모바일(375)
- 태블릿(768)
- 데스크탑(1180)
으로 브레이크포인트 설정
