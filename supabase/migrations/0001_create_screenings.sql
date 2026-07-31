-- Phase 2: CV screening results storage.
--
-- Row Level Security is enabled with no policies defined for anon/authenticated
-- roles, so all reads/writes are denied by default for those roles. The
-- service role key (used only in server-side API routes) bypasses RLS
-- entirely, which is how POST /api/screen persists rows.

create extension if not exists "pgcrypto";

create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  overall_score integer not null,
  category_breakdown jsonb not null,
  matched_keywords jsonb not null,
  missing_keywords jsonb not null
);

alter table public.screenings enable row level security;

comment on table public.screenings is
  'One row per CV screening. id is also the shared identifier a future practical-assessment result can link back to.';

-- Stub for the Phase 4 practical assessment (deferred — see README). Not
-- referenced by any application code yet; kept here only so Phase 2's schema
-- doesn't need to change shape again once that system is scoped.
create table if not exists public.lab_scores (
  id uuid primary key default gen_random_uuid(),
  screening_id uuid not null references public.screenings (id) on delete cascade,
  created_at timestamptz not null default now(),
  score jsonb not null
);

alter table public.lab_scores enable row level security;

comment on table public.lab_scores is
  'Unused stub for the Phase 4 practical assessment (deferred). No application code writes to this table yet.';
