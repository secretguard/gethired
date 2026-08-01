# Agent State

status: in-progress

## Backlog
(reconciled against AGENT_MASTER_PROMPT.md, 2026-08-01)

### P0
1. [x] CV-matching pluralization/punctuation fix — done (commit e3d17b3, verified this session: 16/16 tests pass, build clean). Covers plural suffixes, ISO/IEC long form, slash-vs-x shift notation, dotted-acronym punctuation variants, with negative tests guarding against false positives on short acronyms.
2. [x] Advisory-framing fixes — done (commit bce560b). "Missing" -> "Worth adding" with explainer line in UI + email; education excluded from actionable recommendations and scoring, broadened degree corpus, reframed as informational.
3. [ ] Full visual/UX redesign (Tailwind) — NOT started. Current UI is default-Tailwind neutral-gray, Arial font stack, no distinctive typography/color system. In progress this session.

### P1
4. [ ] Practical assessment (checkpoint/flag-based scenarios) — not started. Depends on P0 being solid first.

### P2
5. [ ] Roadmap generator — not started, depends on P1.

### P3 (only after P0-P2 solid)
6. [ ] MCQ-style knowledge checks — not started.
7. [ ] Visual roadmap/mindmap view — not started.

### P4
8. [ ] Cross-link with sarathg.me (D:\web, github.com/secretguard/web) — not started. `D:\web` not yet cloned locally.

## Research notes
(none yet — will populate before P1 design work)

## Needs human input (blockers)
(none yet)

## Session log

### 2026-08-01 (session N)
- Found repo in a slightly inconsistent state at session start: `run-gethired-agent-loop.ps1` (the *harness* script that runs this agent loop, separate from the GetHired product itself) had an uncommitted change from a previous session adding proactive pause-before-rate-limit behavior. It was complete and safe, so committed it as-is rather than leaving it dangling.
- Verified the CV-matching fix that a previous session had left committed under a "WIP, in progress" message is actually complete and solid: ran the test suite (16/16 passing, covering plural forms, ISO/IEC punctuation, 24/7 vs 24x7, dotted acronyms like B.Tech, and negative cases for short acronyms like IDS/IPS not false-matching inside unrelated words) and a full production build (clean, no type errors). Marked P0 item 1 done.
- `AGENT_STATE.md` did not exist yet even though multiple prior sessions had run — created it now from the template and backfilled backlog status by reading git history, since this file is supposed to be the single source of truth for what's done.
- Starting P0 item 3 (visual/UX redesign) next.
