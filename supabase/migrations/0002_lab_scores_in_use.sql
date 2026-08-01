-- Phase P1: the practical assessment now writes real rows to lab_scores via
-- POST /api/assessment (see lib/supabase/labScores.ts). No schema change —
-- 0001's shape (screening_id FK, score jsonb) already fit — just correcting
-- the now-stale "unused stub" comment.

comment on table public.lab_scores is
  'One row per completed practical assessment, linked to the CV screening it was taken alongside. score is a serialized AssessmentResult (overall score + per-category breakdown). Written by POST /api/assessment.';
