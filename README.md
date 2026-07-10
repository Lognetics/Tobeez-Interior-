# TOBEEZ INTERIOR

**Intelligent Interior Planning Powered by AI**

An enterprise-grade platform to estimate the cost of furnishing any property, book
expert consultations, source products and manage projects — all in one elegant,
premium web app.

> **Status:** Milestone 2 — live integrations. Landing page, AI Cost Estimator,
> marketplace, consultation booking, and Client/Designer/Admin dashboards are in
> place. AI chat plus image/video generation (OpenAI + Replicate), Paystack payments
> (test mode), and Supabase-backed auth/cloud sync are now **live**; email remains
> stubbed and cleanly swappable.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first tokens), custom design system |
| Animation | Framer Motion |
| State / data | Zustand (persisted), TanStack Query |
| UI | Custom component library (`src/components/ui`) + lucide icons |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Theming | next-themes (dark / light / system) |
| Database | Prisma ORM + SQLite (dev) → PostgreSQL (prod, one-line swap) |

---

## Quick start

```bash
npm install          # installs deps + generates Prisma client (postinstall)
npm run db:reset     # creates the SQLite DB and seeds demo data
npm run dev          # http://localhost:3000
```

The app runs without API keys (integrations fall back to stubs/library content),
but live AI, payments, and cloud sync need the keys listed in `.env.example`.

### Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset + reseed |
| `npm run db:studio` | Open Prisma Studio |

---

## Project structure

```
src/
├── app/
│   ├── (marketing)/         # Public site — shared navbar/footer layout
│   │   ├── page.tsx         #   Landing page
│   │   ├── about/
│   │   ├── marketplace/
│   │   └── consultation/
│   ├── (auth)/              # Login / signup (split-screen layout)
│   ├── estimator/           # AI Cost Estimator wizard + results
│   ├── dashboard/           # Client dashboard (+ sub-routes)
│   ├── designer/            # Designer portal (+ sub-routes)
│   ├── admin/               # Admin panel (+ sub-routes)
│   ├── layout.tsx           # Root: fonts, providers, floating AI assistant
│   └── globals.css          # Design tokens + utilities (Tailwind v4)
├── components/
│   ├── ui/                  # Design-system primitives (Button, Card, Input…)
│   ├── layout/              # Navbar, footer, page hero
│   ├── landing/             # Landing-page sections
│   ├── estimator/           # Wizard, steps, results
│   ├── marketplace/ consultation/ auth/ dashboard/ ai/ theme/ brand/
├── lib/
│   ├── estimator/           # constants.ts, engine.ts (cost engine), store.ts
│   ├── ai/stub.ts           # Stubbed AI chat engine
│   ├── data/                # Mock products & designers
│   ├── db.ts                # Prisma singleton
│   ├── site.ts              # Nav + brand config
│   └── utils.ts             # cn(), currency formatting
prisma/
├── schema.prisma            # Data model
└── seed.ts                  # Demo data seeder
```

---

## Key features (this milestone)

- **Design system** — OKLCH-based tokens, dark/light, glassmorphism, soft shadows,
  motion, fully responsive.
- **Landing page** — animated hero, stats, property categories, features, process,
  testimonials, FAQ, CTA.
- **AI Cost Estimator** — 11-step wizard with **auto-save/resume** (persisted store),
  a deterministic itemised cost engine (region/style/quality/stage multipliers),
  and a results view with pie + bar charts, an itemised table, and print/export.
- **Marketplace** — filterable product grid with search, wishlist, categories.
- **Consultation booking** — session type → designer → date/time → confirm flow.
- **Auth** — polished stubbed login/signup, ready for NextAuth/Clerk.
- **Dashboards** — Client, Designer and Admin shells with responsive sidebar,
  stat cards, charts, and 28 scaffolded sub-pages.
- **Floating AI assistant** — persistent chat widget backed by a stub engine.
- **Database** — Prisma schema (Users, Designers, Projects, Estimates,
  Consultations, Products, Orders, Reviews) + seed script.

---

## Swapping stubs for real services

Everything stubbed lives behind a single module so the UI never changes:

| Stub | File | Replace with |
|---|---|---|
| AI chat / estimator | `src/lib/ai/stub.ts` | OpenAI API + vector search |
| Auth | `src/components/auth/auth-form.tsx` | NextAuth / Clerk |
| Products / designers | `src/lib/data/*` | Prisma queries via `src/lib/db.ts` |
| Payments | consultation "Confirm & pay" | Stripe / Paystack / Flutterwave |

### Moving to PostgreSQL

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. `npm run db:push && npm run db:seed`.

---

## Roadmap (next milestones)

- Wire real auth + role-based access control and route protection
- Connect dashboards to live Prisma data (server components + actions)
- Real OpenAI-backed estimator, moodboards and image recognition
- Payments (Stripe/Paystack), invoices and subscriptions
- Real-time consultation (WebRTC/Socket.IO), messaging, notifications
- Admin CMS, analytics, pricing/regional index management
- PWA, i18n/multi-currency, testing (Vitest/Playwright), CI/CD

---

© TOBEEZ INTERIOR. Built as a scalable software ecosystem, not just a website.
