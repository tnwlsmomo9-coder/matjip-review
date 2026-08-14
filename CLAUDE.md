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

Current scope is intentionally narrow: **no backend, no real map API (Kakao/Naver), no auth, no database** — everything renders from static mock data in `src/lib/mock-restaurants.ts`. Location-based features are UI-only (no `navigator.geolocation` calls). Don't wire up real integrations unless asked.

## Architecture

- Next.js App Router + TypeScript, path alias `@/*` → `src/*`.
- Tailwind CSS v4, CSS-first config (no `tailwind.config.ts`). All design tokens live in `src/app/globals.css` under an `@theme` block, named after DESIGN_1.md's own vocabulary rather than raw hex: `bg-surface`, `bg-surface-alt`, `text-ink`, `bg-accent` (vivid orange CTA color), `bg-accent-sub` (yellow, badges/highlights), `border-hairline`. Add new colors/spacing there, not as inline arbitrary-value classes.
- Fonts: Pretendard is self-hosted via the `pretendard` npm package (imported in `globals.css`, not `next/font/local`) since it's a Korean font not available through `next/font/google`. English/number pairing uses Inter Tight loaded through `next/font/google` in `src/app/layout.tsx`.
- `src/types/restaurant.ts` defines the `Restaurant` shape; `src/lib/mock-restaurants.ts` holds the mock dataset. Any new mock content should follow the same PRD-flavored shape (guide-question-style one-line review, landmark/subway-exit distance text, trust/save counts) rather than generic placeholder copy.
- `src/components/` holds presentational, single-purpose home-screen sections (`Header`, `SearchBar`, `NearbyExploreSection`, `PopularRestaurants`, `RestaurantCard`, `TrustBadge`). Not all of them are currently wired into `src/app/page.tsx` — check `page.tsx` to see what's actually rendered before assuming a component is live on the page.
- Icons come from `lucide-react`; don't hand-roll SVGs or add a second icon library.
