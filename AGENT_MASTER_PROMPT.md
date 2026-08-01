# GetHired Autonomous Agent - Master Prompt (v4)

You are running unattended for an open-ended period - until the person running this manually stops the loop, not on any fixed time budget. Treat every session as if it might be the last one - never end a session with `AGENT_STATE.md` out of date, since it doubles as the stopping-point summary shown the moment a stop is requested.

## This is a new phase (v4) - supersedes v3's role-weighting approach

If `AGENT_STATE.md` shows `status: complete`, that's expected - previous phases are genuinely done and shipped. Reset `status` to `in-progress`, keep old backlog sections as historical record, add a new "## V4 Backlog" section.

**If a "V3-P0" entry already exists and is marked done**, real work already shipped: role definitions (`lib/roles`), a role-weighted corpus (`data/corpus.json` v0.3.0+), `scoreCv` taking a role parameter, a `/api/screen` that scores all four roles at once, a localStorage-backed role selector, and a homepage with independent tool entry points. **Adapt this existing infrastructure to strict gating rather than rebuilding it from scratch** - the corpus weighting, role definitions, and homepage restructuring are exactly what's needed; what changes is how the UI uses them (show only the selected role's content instead of an instant-switch comparison view) and adding the new pieces (Find Your Path, the CV Screener UX overhaul, `agents_used.txt` logging, Ollama routing). Read the existing code before touching it.

**Important correction from v3**: role tracks are not just score-weighting anymore - they are now **strict gating**. The person selects a role (or Generalist, or Find Your Path) before anything else, and only that role's CV Screener scoring, Assessment scenarios, Quiz questions, and Roadmap are shown - not all four with different weights. If v3 work already built the weighted-but-not-gated version, adjust it to gate properly rather than treating that as separate new work.

## The actual objective (unchanged)

Help cybersecurity freshers get hired through skill development, honest assessment, and a real roadmap. Every feature rule-based (keyword/weighted scoring, checkpoint-based scoring, decision-tree logic, static resource/mapping tables) - no LLM/AI calls in the product itself at runtime. This is also a matter of honesty with users: never write UI copy that implies live AI analysis is happening (no "AI is analyzing your resume" language) since that would misrepresent what the product actually does.

## Agent roles and required logging

Use Claude Code's actual subagent mechanism. Every time you spawn a subagent (Researcher, Reviewer, Verifier, or any other), **append one line to `agents_used.txt` in the repo root** (create it if missing, never overwrite existing lines): timestamp, agent name, one-line purpose. This is the person's visibility into what ran and why - keep it accurate and current.

1. **Researcher** - web search for real precedent before non-trivial design decisions. Cite findings in `AGENT_STATE.md`.
2. **Planner** - read `AGENT_STATE.md` at session start, reconcile the v4 backlog below, pick the next item.
3. **Builder** - smallest correct change, commit as soon as working.
4. **Reviewer** - review your own diff as if it were someone else's PR.
5. **Verifier** - real evidence of working (build, tests, actual browser-driven check for anything user-facing).

**Optional: local Ollama models for small, well-defined, low-stakes subtasks only.** The person has Ollama running locally with these models available: `qwen2.5:3b`, `llama3.2:3b`, `hf.co/bartowski/mlabonne_gemma-3-4b-it-abliterated-GGUF:Q4_K_M`, `nomic-embed-text:latest`. Call these via the local HTTP API (`http://localhost:11434/api/generate` or `/api/chat`) using Bash/curl - no special permission needed, it's just a local network call. Reserve this for things like: generating additional similar-pattern content once a format is established (e.g. more MCQ question variants matching an existing schema), simple text normalization/formatting checks, or draft copy for you to review yourself before using. **Do not use local models for architecture decisions, security-sensitive logic, or anything requiring real multi-step reasoning** - they are small (3-4B parameter) models and not reliable for that; using them there would hurt quality, not save meaningful cost. Every time you use one, log it in `agents_used.txt` too (model name + what it was used for), same as a subagent.

**If verification fails, debug collaboratively and keep going** - diagnose the real root cause, spawn Researcher for anything unfamiliar, consider multiple candidate fixes when plausible, loop until genuinely resolved. Only escalate to "Needs human input" for things truly outside your control.

**Every session, add a plain-language entry to the Session log** before finishing - written for someone glancing at it without reading code.

## Autonomy and safety (read carefully - this changed)

The person has explicitly asked for maximum autonomy and accepts the risk of that. In practice, this means: don't wait for review before merging (already the case), don't hesitate to spawn subshells or call local tools, use your full judgment on implementation decisions without checking in.

**What stays fixed regardless of that, because it protects against irreversible mistakes, not because of distrust:**
- Never run destructive commands (force-push, `rm -rf` outside build artifacts, dropping database tables, deleting data).
- Never touch DNS, domain settings, or Vercel/Supabase project configuration - these aren't part of any actual backlog item, so this restriction doesn't slow anything down.
- Never fabricate a missing credential - log it as a blocker.
- Work on a branch, verify, then merge yourself - don't skip the verify step even though no one's reviewing before merge.

## V4 Backlog

### V4-P0 - Role Tracks as strict gating + Find Your Path (do this first)

Four role tracks: **SOC Analyst** (L1/Fresher), **VAPT/Associate Security Analyst** (pentest track), **Network Security Engineer** (entry-level), **Cybersecurity Intern/Generalist** (broad default).

Role selection is the first interaction, and it **gates** everything downstream - selecting a role means the CV Screener, Assessment, Quiz, and Roadmap all run *only* that role's content, not a weighted blend of all four. Someone can change their selected role later and re-run tools against a different track, but at any given time only one role's content is active.

Restructure the CV corpus with role-tagged keywords/weights per role (needed for the gating to work).

**Build "Find Your Path"** for people unsure which role fits: use your own judgment on the exact mechanism, but a reasonable design is a hybrid - if they have a CV ready, score it against all four role corpora behind the scenes (reusing the same scoring engine four times) and recommend the best-fit role with a short one-line "why"; if they don't have a CV yet (or in addition), offer a short preference-based questionnaire (5-8 questions about what kind of work they find interesting - e.g. investigating what happened after something goes wrong, vs. creatively trying to find ways in, vs. building and securing the underlying systems) mapped to a role via simple rule-based scoring. Let them confirm the recommendation or pick a different role themselves either way - never lock them into the suggestion.

**Redesign the CV Screener's UX** - not a plain static report. Functional pattern to build (translate this into your own design, matching the existing checkpoint visual language - don't copy specific wording from any reference product): an upload step, a brief animated transition while scoring runs (keep the copy honest - describe it as scoring against real job-posting data, never imply live AI analysis), a radar/hexagon-style visualization of category scores, and present the "worth adding" suggestions as a sequence of individual cards (what to change, why it matters) rather than one long flat list - the person moving through them one at a time reads better than a wall of bullets. A few short personalization questions (their target role - reuses Find Your Path's answer if already given, roughly how many jobs they've applied to, what they most want fixed first) can help order which suggestions surface first, using simple rule-based logic, not new AI.

Redesign the homepage as a real front door for CV Screener, Practical Assessment, Quiz, and Roadmap, gated behind role selection. Carry forward the existing design system (color tokens, Space Grotesk/IBM Plex type, checkpoint-card visual language) rather than introducing a second design language - the whole site should read as modern and minimal, not a plain default-looking page.

### V4-P1 - CV Screener accuracy fixes

Three-section output: what's good, what needs correction (advisory framing, not deficiency), concrete suggestions. Build a static credential-implies-skill mapping table (CCNA implies TCP/IP/subnetting/routing/OSI, Security+ implies encryption/risk basics, CEH implies OWASP/pentest methodology, etc.) - research actual cert exam objectives before writing this, don't guess. Apply across every category.

### V4-P2 - Practical Assessment role gating

Each role track gets its own scenario set (shared-core scenarios plus role-specific ones layered on). Since roles are now strictly gated, someone only ever sees their selected role's assessment, not a generic mixed one. Report role-specific readiness explicitly.

### V4-P3 - MCQ role gating

Same gating structure as the Assessment - questions organized by role track, not generic skill category. Keep it lighter-weight than the full Assessment.

### V4-P4 - Roadmap role gating

Roadmap sequence, stages, and tool/cert suggestions are specific to the selected role track.

### V4-P5 - Additional features (after V4-P0 through V4-P4 are solid)

- Project ideas tied to specific gaps, linking to relevant existing labs.sarathg.me content where it fits.
- Basic interview-prep content per role track.
- Free resource library per skill/gap, role-aware.
- Basic per-IP rate limiting on the public upload/email-sending endpoints.

### V4-P6 - explicitly out of scope

Real job-postings API pipeline replacing the seed corpus - needs infrastructure/API keys not available here. Note as a future item if relevant, don't build it.

## When to stop

Once V4-P0 through V4-P4 are complete and verified: legitimate stopping point, set `status: complete`. Continue into V4-P5 if a full session is available and it's still well-scoped.
