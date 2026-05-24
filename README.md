# MedCentral

## Project Overview

MedCentral is an AI-powered clinic finder and booking platform designed for the Thai market. It lets patients discover verified clinics, compare services and pricing side-by-side, read real reviews, and book appointments — guided by an AI chat assistant.

The platform supports three user roles:

- **Patient** — browse clinics, book appointments, track upcoming visits, and earn loyalty points
- **Clinic** — manage clinic profile, services, and incoming appointments; new clinics submit a registration form that goes through admin verification before going live
- **Admin** — review and approve (or reject) pending clinic registrations and service-addition requests through a 3-step audit checklist

## Installation

**Prerequisites:** Node.js 18+ and npm.

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd easy-med-find
npm install
```

2. Create a `.env` file at the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Developer quick login

Without a real Supabase account you can sign in using the **Developer Quick Login** panel on the `/auth` page to instantly log in as any role (Patient, Clinic, or Admin) for local testing.

### Other commands

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # run ESLint
npm run format    # run Prettier
```

## Technology Stack

| Category             | Technology                                                                            |
| -------------------- | ------------------------------------------------------------------------------------- |
| Framework            | [TanStack Start](https://tanstack.com/start) — SSR React 19                           |
| Router               | [TanStack Router](https://tanstack.com/router) — file-based, type-safe                |
| Server-side data     | [TanStack Query](https://tanstack.com/query)                                          |
| Styling              | [Tailwind CSS v4](https://tailwindcss.com)                                            |
| UI Components        | [shadcn/ui](https://ui.shadcn.com) — Radix UI primitives                              |
| Authentication       | [Supabase Auth](https://supabase.com/auth) — Google OAuth, LINE OAuth, email/password |
| Database             | [Supabase](https://supabase.com) (auth only; app data uses localStorage stores)       |
| Internationalisation | [i18next](https://www.i18next.com) + react-i18next — Thai (default) and English       |
| Icons                | [Lucide React](https://lucide.dev)                                                    |
| Forms                | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)               |
| Charts               | [Recharts](https://recharts.org)                                                      |
| Build tool           | [Vite](https://vite.dev)                                                              |
| Deployment           | [Cloudflare Workers](https://workers.cloudflare.com) via Wrangler                     |
| Language             | TypeScript                                                                            |
