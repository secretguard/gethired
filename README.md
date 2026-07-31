# GetHired

A rule-based (no LLM, no external AI API calls) career-readiness tool for cybersecurity job seekers. It screens a CV against real job-posting requirements, gives personalized next-step recommendations, and will eventually add a practical skills assessment. Everything is keyword/weight scoring and decision-tree logic — deterministic, free to run, no AI API costs.

Deploys to Vercel at `gethired.sarathg.me`.

## Stack

- **Next.js** (App Router, TypeScript strict mode) — frontend + API routes
- **Supabase** (Postgres) — stores screening results and (later) lab scores
- **Resend** — transactional email for report delivery
- **Tailwind CSS** — styling

## Why `unpdf` + `mammoth` for text extraction

- **PDF**: [`unpdf`](https://github.com/unjs/unpdf) is a build of PDF.js specifically packaged for serverless/edge runtimes (no native bindings, no filesystem assumptions baked into the default build). That fits Vercel's Node.js serverless functions much better than libraries like `pdf-parse`, which historically assumed a persistent local filesystem and pull in Node-only internals not needed here.
- **DOCX**: [`mammoth`](https://github.com/mwilliamson/mammoth.js) is pure JS, has no native dependencies, and extracts clean text from `.docx` (Word XML) reliably.
- The `/api/screen` route explicitly sets `export const runtime = "nodejs"` since both libraries expect Node's `Buffer` and related APIs — they are not run on the Edge runtime.

## Project status

| Phase | Description | Status |
| --- | --- | --- |
| 1 | CV screener (standalone, no DB/email) | ✅ Done |
| 2 | Supabase logging of screening results | ✅ Done |
| 3 | Resend email delivery of the report | ✅ Done |
| 4 | Practical skills assessment | ❌ **Deferred** — see below |
| 5 | Recommendation engine (CV-gap based) | ✅ Done |
| 6 | Unified report (CV + recommendations) | ✅ Done |

### Phase 4 — deferred

The practical assessment system is being redesigned from scratch and will be specified in a separate prompt later. This build intentionally does **not** include any `labs.sarathg.me` integration, placeholder assessment UI, or lab-score callback endpoint — that's a deliberate scope decision, not a gap that was missed. A `lab_scores` table may exist as an empty/unused stub once Phase 2's migrations land, purely to keep a clean seam for later; there is no integration code against it.

## Folder structure

```
app/
  api/screen/route.ts        # POST /api/screen — CV upload + scoring + recommendations + persistence
  api/send-report/route.ts   # POST /api/send-report — email the unified report
  components/                # Frontend UI components (ReportView is the unified report)
  page.tsx                   # CV screener + report page
lib/
  scoring/               # Pure, unit-testable scoring engine
  parsing/               # PDF/DOCX text extraction
  supabase/              # Server-only Supabase client + data access
  email/                 # Server-only Resend client + report template
  recommendations/       # Pure, rule-based next-step recommendation engine
data/
  corpus.json            # Job-posting keyword corpus (weights by category)
supabase/
  migrations/            # SQL migrations
```

## Supabase schema (Phase 2)

`supabase/migrations/0001_create_screenings.sql` creates:

- **`screenings`** — one row per CV screening (`overall_score`, `category_breakdown`, `matched_keywords`, `missing_keywords`). `id` is the result ID returned to the frontend, and is also the identifier a future practical-assessment result would link back to.
- **`lab_scores`** — an unused stub table for the deferred Phase 4 practical assessment (see below). No application code reads or writes it yet.

Row Level Security is enabled on both tables with no policies for `anon`/`authenticated`, so all client-side access is denied by default. Only the server-side Supabase client (authenticated with the service-role/secret key in `lib/supabase/server.ts`, which is never imported into a client component) can read or write — it bypasses RLS entirely, which is standard Supabase behavior for the service role.

If Supabase isn't configured (or the insert fails for any reason), `POST /api/screen` still returns the scoring result to the user — it just logs the error server-side and returns `resultId: null`. Screening still works standalone even without a Supabase project wired up.

## Email report (Phase 3)

`POST /api/send-report` takes `{ resultId, email }`, looks the screening up in Supabase, renders an inline-styled HTML email (score + category breakdown), and sends it via Resend. The frontend only shows the "email me this report" field when a `resultId` came back from `/api/screen` (i.e. Supabase persistence succeeded).

### Needs confirmation

- **Sender address**: `lib/email/resend.ts` currently sends from Resend's shared test address (`onboarding@resend.dev`), which works without any domain setup but isn't suitable for real delivery. Once a sending domain (e.g. `gethired.sarathg.me`) is verified in Resend, update `REPORT_FROM_ADDRESS` to send from it.

## Recommendation engine (Phase 5)

`lib/recommendations` is a pure, rule-based (no ML) module: `generateRecommendations(cvGaps, labScores?)` takes the CV screening's per-category breakdown and, for every category whose score falls below that category's threshold, recommends its top-N highest-weight missing items. The whole list is then sorted by weight so the highest-impact gaps surface first regardless of category.

- **Thresholds, top-N, and per-category copy templates** live in `data/recommendations-config.json` — tune them without touching code.
- **`labScores` is accepted but unused today** — it's a placeholder parameter so wiring in the future practical assessment (Phase 4, deferred) won't require changing this function's signature. Every current call site omits it.

## Unified report (Phase 6)

This is the deliverable page a job seeker sees today. Both `POST /api/screen`'s JSON response and the emailed report combine three sections in the same order:

1. **CV match score + category breakdown** (Phase 1) — `ResultsView`
2. **Prioritized recommendations** (Phase 5) — `RecommendationsList`
3. **A clearly marked placeholder** — "Practical assessment: coming soon" — `PracticalAssessmentPlaceholder`. No fake or stubbed lab data is shown; the placeholder is static copy with no assumptions about what the future assessment will look like.

Once Phase 4 (deferred) is scoped and built, it gains its own section here in place of the placeholder — nothing else in this report needs to change shape for that.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Phase 1 (the CV screener) works fully in the browser with no environment variables required. Later phases will require the Supabase and Resend variables below.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in real values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

### Needs confirmation

- **Supabase key naming**: Supabase now offers a newer publishable/secret key system alongside the legacy anon/service_role keys. This project keeps the legacy-style env var **names** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) because they were specified explicitly, but the intent is for the *values* pasted into them to be the new publishable key (client-side) and secret key (server-side) respectively — `createClient()` just takes a key string, so the variable name doesn't need to match Supabase's newer terminology. Confirm this is the desired mapping before going live.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY` is currently unused**: every Supabase call in this codebase goes through the server-only client in `lib/supabase/server.ts`, authenticated with `SUPABASE_SERVICE_ROLE_KEY`. There is no client-side Supabase usage (the browser never talks to Supabase directly — it only calls this app's own API routes), so the anon/publishable key isn't read anywhere yet. It's still worth setting for when/if a client-side use case shows up.

## Applying Supabase migrations

SQL migration files live in `supabase/migrations/`. Apply them via the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste the migration SQL directly into the Supabase SQL editor.
