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
  corpus.json            # Fresher cybersecurity job-posting corpus (weights by category)
  recommendations-config.json  # Thresholds, top-N, and copy for the recommendation engine
supabase/
  migrations/            # SQL migrations
```

## CV-screening corpus

`data/corpus.json` (v0.2.1) is scoped specifically to **entry-level / 0-1 year experience cybersecurity roles in India**: SOC Analyst (L1/Fresher), Associate Security Analyst / VAPT Analyst, Cybersecurity Intern, entry-level Network Security Engineer, and fresher-tagged Information Security Analyst postings. It deliberately excludes GRC Analyst and Cloud Security Engineer roles (both typically require 3+ years) and any L2/L3/senior/lead SOC roles.

Weights are derived from how often each skill appeared across ~120+ real fresher postings researched from Glassdoor India, Indeed (India/US), Naukri-aggregated reports, and Foundit.in, spanning Chennai, Bangalore, Mumbai, Pune, Kerala, and Hyderabad. The file's own `corpus_meta` block documents the full methodology, sample-size caveats, and known limitations (see `data/corpus.json` directly — it's designed to be read, not just consumed by the app) — the intent is for this to be replaced by a continuously-refreshed job-postings API pipeline (a planned GitHub Action) rather than treated as a final, statistically rigorous dataset.

Six categories: **certifications**, **tools**, **concepts_frameworks**, **scripting_programming**, **soft_skills**, **education**. Each entry is `{ keyword, weight, count_basis? }` — `count_basis` is a documentation-only research note and never affects scoring.

### Matching against real CV text

Corpus keywords are written for human readability, not literal CV matching (e.g. `"SIEM (generic + Splunk specifically)"`, `"Firewall / IDS / IPS platforms"`, `"TCP/IP & core networking"`). `lib/scoring/deriveMatchTerms.ts` derives the actual substrings checked against CV text from each keyword at load time — splitting enumerations, pulling abbreviations out of parentheses, stripping generic trailing words ("methodology", "basics", "skills", etc.) and common lead-in phrases ("willingness to work", "exposure to", etc.), while protecting known compounds like `TCP/IP` from being split apart. It also denies a small list of short, common-English-word abbreviations (e.g. "IT", "CC") as standalone terms so they can't false-positive-match ordinary prose. This is a deliberate heuristic tuned against this specific corpus, not a general NLP solution — if you add new corpus entries with unusual phrasing, sanity-check the derived match terms (there's a quick way to inspect them: temporarily log `corpus` from `lib/scoring/corpus.ts`).

### Education is informational, not scored

Recommending a specific cert, tool, or skill is reasonable career advice; recommending someone change or acquire a specific degree is not — it isn't actionable in any short/medium timeframe, and plenty of legitimate fresher candidates come from non-traditional backgrounds (B.Sc, diploma, self-taught, career switchers). So `education` is treated differently from the other five categories throughout the app:

- **Excluded from the overall match percentage** — `lib/scoring/corpus.ts` exports `OVERALL_SCORE_CATEGORIES` (all categories except `education`), and `scoreCv` only aggregates that subset into `overallScore`. The full per-category breakdown (including education) is still returned for display.
- **Excluded from recommendations entirely** — `lib/recommendations/engine.ts` filters `education` out before generating any "next step" suggestions, and `data/recommendations-config.json` has no `education` entry (its thresholds/messages maps are `Partial`, not `Record`, to reflect that this is deliberate, not an oversight). No user is ever told to pursue a different degree.
- **Displayed informationally, not evaluatively** — the UI (`EducationCard` in `ResultsView.tsx`) and the email (`educationSection` in `lib/email/template.ts`) show only what was *detected* on the CV (e.g. "B.Sc (Computer Science, IT, Physics, or Mathematics)") with an "Informational — not scored" badge, or a neutral note if nothing matched. There's no percentage and no "worth adding" list for this category.

The corpus entries themselves were also broadened in v0.2.1 — the original single combined keyword only recognized B.Tech/B.E./BCA/MCA/Diploma streams. It's now six separate entries (`B.Tech / B.E.`, `BCA / MCA`, `B.Sc (...)`, `Diploma (technical field)`, a self-taught/certification-based entry, and the existing final-year-eligible entry) so a match on any one of them counts, without unfairly narrowing who "counts" as qualified.

### "Worth adding," not "Missing"

Every unmatched corpus keyword is framed as advisory, not a deficiency: the UI and email both use a "Worth adding (N)" heading (never "Missing"), plus a one-line explainer — `"Worth adding" isn't a checklist of requirements — these show up often in postings for this role and could strengthen your profile.` Recommendation copy in `data/recommendations-config.json` is written the same way ("Consider studying for...", "Get hands-on practice with...") rather than as gap callouts.

## Supabase schema (Phase 2)

`supabase/migrations/0001_create_screenings.sql` creates:

- **`screenings`** — one row per CV screening (`overall_score`, `category_breakdown`, `matched_keywords`, `missing_keywords`). `id` is the result ID returned to the frontend, and is also the identifier a future practical-assessment result would link back to.
- **`lab_scores`** — an unused stub table for the deferred Phase 4 practical assessment (see below). No application code reads or writes it yet.

Row Level Security is enabled on both tables with no policies for `anon`/`authenticated`, so all client-side access is denied by default. Only the server-side Supabase client (authenticated with the service-role/secret key in `lib/supabase/server.ts`, which is never imported into a client component) can read or write — it bypasses RLS entirely, which is standard Supabase behavior for the service role.

If Supabase isn't configured (or the insert fails for any reason), `POST /api/screen` still returns the scoring result to the user — it just logs the error server-side and returns `resultId: null`. Screening still works standalone even without a Supabase project wired up.

## Email report (Phase 3)

`POST /api/send-report` takes `{ resultId, email }`, looks the screening up in Supabase, renders an inline-styled HTML email (score + category breakdown), and sends it via Resend. The frontend only shows the "email me this report" field when a `resultId` came back from `/api/screen` (i.e. Supabase persistence succeeded).

### Sender address

`lib/email/resend.ts` reads the sender address from `RESEND_FROM_EMAIL` and falls back to Resend's shared test address (`onboarding@resend.dev`) if it isn't set, so local dev works without any domain verification. To send from your own domain, verify a domain in the Resend dashboard (e.g. a subdomain of sarathg.me like `mail.gethired.sarathg.me`), then set `RESEND_FROM_EMAIL` to an address on that domain (e.g. `reports@gethired.sarathg.me`) in both `.env.local` and Vercel.

## Recommendation engine (Phase 5)

`lib/recommendations` is a pure, rule-based (no ML) module: `generateRecommendations(cvGaps, labScores?)` takes the CV screening's per-category breakdown and, for every category whose score falls below that category's threshold, recommends its top-N highest-weight missing items. The whole list is then sorted by weight so the highest-impact gaps surface first regardless of category.

- **Thresholds, top-N, and per-category copy templates** live in `data/recommendations-config.json` — tune them without touching code.
- **`labScores` is accepted but unused today** — it's a placeholder parameter so wiring in the future practical assessment (Phase 4, deferred) won't require changing this function's signature. Every current call site omits it.
- **`education` never produces a recommendation** — see "Education is informational, not scored" above.

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
RESEND_FROM_EMAIL=
```

`RESEND_FROM_EMAIL` is optional — leave it empty locally and it falls back to Resend's shared test address (see "Sender address" above).

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
