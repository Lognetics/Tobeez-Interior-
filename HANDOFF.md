# Codex Handoff — TOBEEZ Interiors (13 July 2026)

Continuation brief from the previous Claude Code session. Live site: https://www.tobeezinteriors.com
**Your task: build the real consultation backend + consultant dashboard for the two consultants, then test everything.** Details in "THE TASK" below. Read this whole file first.

## Stack & conventions (read before writing code)

- **Next.js 16** (App Router, Turbopack). Breaking changes vs your training data — read `node_modules/next/dist/docs/` before framework work. **Middleware is renamed: it's `src/proxy.ts`** (exports `proxy()` + `config.matcher`), currently gating `/dashboard`, `/admin`, `/designer` via a presence-only `tobeez-auth` cookie.
- **Tailwind v4** — the linter enforces canonical classes (`z-100` not `z-[100]`, `aspect-4/3`, `bg-linear-to-br`, `size-4.5`).
- **Verification gate: `npm run build`** (runs the TypeScript check; there is NO test framework in this repo).
- **Auth model**: client-side Supabase (`@supabase/supabase-js`, localStorage session — NOT `@supabase/ssr`). Protected API routes verify the Bearer token via `authenticateApiRequest` in `src/lib/auth/api-auth.ts`. The session mirror + cookie live in `src/lib/session.ts` and `src/lib/auth/cookie.ts`; `CloudSync` (`src/components/system/cloud-sync.tsx`) mirrors the Supabase user (incl. `user_metadata` name/phone/location/avatar) into the session store on every load.
- **Data**: zustand stores persisted to localStorage. `useAppData` (`src/lib/store/app-data.ts`) holds bookings/orders/invoices/notifications/Studio Pro sub and is mirrored per-user to a Supabase `user_data` JSONB row by `src/lib/supabase/sync.ts` — **that table does not exist yet in the live DB** (migration `0002_user_data.sql` unapplied), so sync silently no-ops. Every Supabase read follows a graceful-fallback pattern (see `src/lib/data/catalog.ts`) — keep that pattern.
- **Payments**: Paystack inline (`src/lib/paystack.ts`), TEST keys, amounts in Naira (converted to kobo internally). Server verify at `/api/paystack/verify` uses `PAYSTACK_SECRET_KEY`. Test card: 4084 0840 8408 4081, any future expiry/CVV. Paystack is the ONLY payment method — never show other options in UI.
- **AI**: chat = GPT-5.5 with homegrown RAG (`src/lib/ai/knowledge.ts`, generated from live platform data) and provider failover OpenAI → Anthropic → keyless (`src/lib/ai/providers.ts`); private user context must NEVER fall through to the keyless provider (already enforced). Images = GPT Image 2 incl. room-photo edits; video = Veo 3.1 via Replicate (max 8s; large reference images upload via Replicate Files API). Studio Pro = ₦43,000/30 days, client-side sub in `useAppData` with silent quotas (`STUDIO_PRO_LIMITS`: 20 images / 5 videos per cycle; numbers are hidden from UI on purpose).
- **Deploys**: Vercel CLI only — `vercel deploy --prod --yes` (no git integration; ships the working tree). Project `ukonuzoidxs-projects/tobeez-interior`, domain www.tobeezinteriors.com.
- **CRITICAL TRAP**: never set Vercel env vars from PowerShell — PS 5.1 pipes prepend an invisible UTF-16 BOM that corrupts credentials (this broke ALL production keys once; fixed 13 Jul). Use Git Bash: `printf '%s' "$value" | vercel env add NAME production`. All 10 prod+preview vars are currently clean.
- **Git**: branch `David-edits`, PR #1 open → `main`. Conventional commits (`fix:`/`feat:` + explanatory body). `.env` is gitignored — never commit it. The `gh` CLI token lacks `read:org`; use `gh api` REST, with `GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | sed -n 's/^password=//p')`.

## The two consultants (single source of truth)

`src/lib/data/designers.ts` feeds the consultation booking flow, the About "Meet the team" cards, and the AI's RAG knowledge:
- **d1 Victory Asaboro** — "Lead Designer, TOBEEZ Interiors" (she is also the founder), photo `/gallery/founder.jpg`, real bio (client-supplied).
- **d2 Joy** — "Interior Designer", photo `/coporate/joy.png`, real bio; surname pending from client.
- The stat fields (rating, projects, completedConsultations, successRate, responseTime) are **placeholders** — replace with real data when supplied, or remove from UI if asked.
- Pricing is per-mode in `CONSULTATION_MODES`: video/phone ₦100,000, in-person ₦150,000. Note `getConsultants()` in catalog.ts prefers a Supabase `consultants` table if it ever exists (it currently doesn't) — the file is live truth.

## THE TASK: real consultation backend + consultant dashboard + testing

**Current state (all client-side, honestly broken for a real business):** the booking wizard (`src/components/consultation/booking.tsx`) takes Paystack payment, then stores the booking in the *payer's own localStorage*. Consultants and admin never see it. No emails exist anywhere (no SMTP). No accept/decline. The availability calendar (`src/components/consultation/availability-calendar.tsx`) is a deterministic formula, not real schedules. The call screen (`src/components/messages/call-screen.tsx`) is camera/mic UI with no connection backend. Consultant chat unlocks by DATE only (`unlockDateIso`), not time.

**Build order** (each step must degrade gracefully when its table is missing — copy the catalog.ts pattern):

1. **Migration `supabase/migrations/0003_consultations.sql`**: a `bookings` table (id, client_user_id, consultant_id, type, mode, date_iso, time, amount, paystack_ref, status: pending/confirmed/declined/completed/cancelled, notes, created_at) and `consultant_availability` (consultant_id, date or weekly template, slots jsonb). RLS: clients select their own rows; consultant users select/update rows addressed to their consultant_id; inserts only via authenticated API. Also remind the user to apply **0002_user_data.sql** at the same time (SQL editor) — cloud sync and Studio Pro cross-device persistence are dead until then. There is NO service-role key available and MCP access to this Supabase project is not authorized — the user applies migrations by hand in the dashboard.
2. **Consultant identity**: map auth users → consultants. Simplest v1: a `consultant_users` table (user_id, consultant_id) seeded by hand, or an env map `CONSULTANT_EMAILS="victory@x.com:d1,joy@x.com:d2"` checked server-side. The designer portal is already sign-in-gated by proxy.ts but has NO role check — add one (non-consultants hitting /designer get a friendly "not a consultant" screen or redirect).
3. **API routes** under `src/app/api/consultations/`: create (verify Bearer token AND re-verify the Paystack reference server-side with the secret key BEFORE inserting — never trust the client's claim of payment), list-mine (client), list-leads (consultant), accept / decline / cancel (consultant or client respectively). Follow the existing route style (zod schema, `authenticateApiRequest`, JSON errors with codes).
4. **Designer portal Leads page** (`src/app/designer/leads/`): real list of that consultant's bookings with client name/notes/amount/date, Accept / Decline buttons, and an upcoming-schedule view. Wire the booking flow so new paid bookings land as `pending` and notify in-app.
5. **Real availability**: consultants set available days/slots in the portal (writes `consultant_availability`); the booking calendar reads real availability and only falls back to the current formula when the table is missing.
6. **Client dashboard consultations page**: show real status transitions (pending → confirmed/declined), with an in-app notification on change. Declines: mark for manual refund (Paystack refunds can be manual for v1 — just surface it clearly).
7. **Notifications**: in-app both directions now (`useAppData().addNotification`). Create `src/lib/notify.ts` with an email hook that is a clearly-marked no-op until SMTP exists.
8. **Time gating**: include the session TIME (not just date) when unlocking consultant chat.
9. **Test everything**: `npm run build` clean; drive the full flow in the browser with the Paystack test card; create a second test account mapped as a consultant and verify accept/decline + that RLS blocks reading someone else's bookings; then `vercel deploy --prod --yes` and re-verify the live flow on www.tobeezinteriors.com.

## Guardrails

- Don't break existing flows: estimator + ₦7,000 unlock, Studio Pro subscription + quotas, AI studio (chat/image/video), marketplace (demo products currently ON via `MARKETPLACE_STOCKED` in catalog.ts until the client's real products arrive).
- No invented facts about real people (Victory/Joy) — mark placeholders as placeholders.
- The public site assistant allows anonymous chat (per-IP rate limit in `/api/ai/chat`) — keep it that way; Studio image/video stay behind sign-in + subscription.
- Production deploys were explicitly authorized by David for this workstream; commit and push to `David-edits` as you go (PR #1 updates automatically).

## Backlog (not this task — don't lose)

- Apply `0002_user_data.sql` in Supabase (unblocks cloud sync + cross-device Studio Pro).
- Supabase dashboard: custom SMTP (signup + booking emails), enable Google/Apple OAuth providers, optionally clear the demo rows in the `products` table.
- Granular estimator overhaul (client voice note): per-item quantities/specs — furniture origin (Turkish/China), upholstery, seater counts, beds/bedsides, dining seats, curtain motorized/manual, flooring type (tiles/marble/SPC/vinyl), inverter kVA ± panels, lighting brand + fixture types. Needs the client's price list; build the option tree with marked placeholder ranges.
- Portfolio refresh: client's 65 3D renders live in `public/images/`; client is re-sorting them. Prior shortlist: WA0125, 0109, 0093, 0100, 0091, 0121, 0134, 0119, 0107, 0078, 0112, 0083, 0080, 0099, 0136, 0116 (rejects: WA0087/88/89/95/101/103/084 — low-res or unusable). Wire into `src/lib/gallery.ts` (PORTFOLIO / HERO_SLIDES / ABOUT_COLLAGE) once confirmed.
- Joy's surname; real consultant stats (or strip the stat chips); real contact email/phone in `src/lib/site.ts` (placeholders now, also shown on /about and in legal pages).
- Escrow/milestone project payments — the agreed anti-disintermediation strategy (client + Claude aligned on this); spec before building.
