# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite + TanStack Start)
npm run build        # Production build (deploys to Cloudflare Workers via wrangler)
npm run build:dev    # Dev build
npm run lint         # ESLint
npm run format       # Prettier
```

There are no automated tests in this project.

## Architecture

**MedCentral** is a Thai clinic-finder and booking platform. It is a React 19 + TanStack Start SSR app (file-based routing), deployed to Cloudflare Workers via `@cloudflare/vite-plugin`. The `vite.config.ts` uses `@lovable.dev/vite-tanstack-config` — do not manually add the plugins it already bundles (see the comment at the top of that file).

### Routing

Routes live in `src/routes/` and are auto-discovered by `@tanstack/router-plugin`. The generated tree is committed as `src/routeTree.gen.ts` — never edit it by hand. The router is created in `src/router.tsx` and receives a `QueryClient` via context. The root layout (`src/routes/__root.tsx`) wraps everything in `QueryClientProvider` and `AuthProvider`.

Current routes: `/` (home/discover), `/auth`, `/categories`, `/clinic.$clinicId`, `/compare`, `/dashboard`, `/promotions`.

### State management pattern

**There is no real database yet.** All mutable state is stored in `localStorage` via a hand-rolled `useSyncExternalStore` pattern. Each domain module (`src/lib/clinics.ts`, `src/lib/bookings.ts`, `src/lib/admin-approvals.ts`, `src/lib/loyalty.ts`, `src/lib/clinic-registration.ts`) maintains:

- An in-memory `cache` variable
- A `Set<() => void>` of listeners
- A `read()` function (hydrates from `localStorage`, falls back to mock data on first load)
- A `write(next)` function (writes to cache + `localStorage` + notifies listeners)
- A React hook using `useSyncExternalStore`

The mock seed data lives in `src/lib/mock-data.ts`. Clinics are keyed with `c1`, `c2`, etc. The `mock-clinic` user (`ownerId: "mock-clinic"`) owns `c1`.

Supabase (`src/integrations/supabase/`) is wired up for auth only — `supabase/types.ts` has no tables defined. Real data operations use `localStorage` not Supabase queries.

### Auth

`src/lib/auth.tsx` provides `AuthProvider` and `useAuth()`. Three roles: `patient`, `clinic`, `admin`. Auth supports real Supabase email/password + Google OAuth, plus **mock login** for development (stored in `localStorage` under key `medcentral.mockUser`). The mock logins on the `/auth` page let you quickly switch roles without needing a real account.

The `dashboard` route renders different UIs by role:

- `patient` → bookings + loyalty points
- `clinic` → registration flow (if new) or clinic management (profile, services, appointments)
- `admin` → platform admin panel for approving/rejecting pending clinics and services

### i18n

All UI text is translated via `react-i18next`. Translations are defined inline in `src/lib/i18n.ts` (not separate JSON files) for both `en` and `th`. Default language is Thai (`th`). The language preference is persisted in `localStorage` under key `medcentral_lang`. Always use `useTranslation()` and add keys to both locales when adding new UI text.

### UI components

UI primitives are shadcn/ui components in `src/components/ui/` (Radix UI + Tailwind CSS v4). Use these rather than raw HTML elements. Icons come from `lucide-react`. Toast notifications use `sonner`.

Path alias `@/` maps to `src/`.
