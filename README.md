# GetHired

A rule-based (no LLM, no external AI API calls) career-readiness tool for cybersecurity job seekers. It screens a CV against real job-posting requirements, and will eventually run a practical skills assessment and give personalized next-step recommendations. Everything is keyword/weight scoring and decision-tree logic — deterministic, free to run, no AI API costs.

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
| 2 | Supabase logging of screening results | ⏳ Not started |
| 3 | Resend email delivery of the report | ⏳ Not started |
| 4 | Practical skills assessment | ❌ **Deferred** — see below |
| 5 | Recommendation engine (CV-gap based) | ⏳ Not started |
| 6 | Unified report (CV + recommendations) | ⏳ Not started |

### Phase 4 — deferred

The practical assessment system is being redesigned from scratch and will be specified in a separate prompt later. This build intentionally does **not** include any `labs.sarathg.me` integration, placeholder assessment UI, or lab-score callback endpoint — that's a deliberate scope decision, not a gap that was missed. A `lab_scores` table may exist as an empty/unused stub once Phase 2's migrations land, purely to keep a clean seam for later; there is no integration code against it.

## Folder structure

```
app/
  api/screen/route.ts   # POST /api/screen — CV upload + scoring
  components/           # Frontend UI components
  page.tsx              # CV screener page
lib/
  scoring/               # Pure, unit-testable scoring engine
  parsing/               # PDF/DOCX text extraction
data/
  corpus.json            # Job-posting keyword corpus (weights by category)
supabase/
  migrations/            # SQL migrations (added in Phase 2)
```

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

## Applying Supabase migrations

(Added in Phase 2.) SQL migration files live in `supabase/migrations/`. Apply them via the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste the migration SQL directly into the Supabase SQL editor.
