# Gator Vector — Project Context

Quick-reference context for the Gator Vector build. Keep this in the project root so it — and Claude Code — always has the source of truth. Pair it with the two research files (see below).

## What it is
A free, local-first web app for AFOQT prep, built to share with an AFROTC detachment. Goal: give cadets the same quality of prep as the ~$70+ paid courses, for free.

## Who it's for
Mixed audience (rated and non-rated). Design goal: push every one of the six composite scores as high as possible — so **all 12 subtests are in scope, none trimmed**.

## Core design decisions (locked)
- **Local-first, client-side only.** No backend, no database, no accounts.
- **No AI calls at runtime** — all content is pre-generated or generated in-browser by code. Keeps the app free to run and build-cost bounded.
- **Progress in local storage**, with export/import for backup and moving between devices.
- **Static hosting on GitHub Pages** (shared by link).
- **Collect no personal data** (no names, emails, logins) — minimizes liability.
- **No API keys embedded** in the app.
- **Unofficial study aid** — not an Air Force product; run it past cadre before wide distribution.

## The test (Form T) — quick facts
12 timed subtests, ~516 items, ~3.5 hrs of testing. Six composites: Pilot, CSO, ABM, Academic Aptitude, Verbal, Quantitative. No guessing penalty (answer everything). Scored as percentiles. Super-scored across up to 3 attempts (90-day waits for AFROTC cadets), so retakes should target weak composites.
*Full detail: research/GatorVector_AFOQT_Research.md*

## Content strategy by subtest
- **Procedural engine (infinite generated items):** Arithmetic Reasoning, Math Knowledge, Table Reading, Block Counting, Instrument Comprehension.
- **Bank-assembled (curated data + auto distractors):** Word Knowledge, Physical Science, Aviation Information.
- **Authored + QC (written, finite, expandable):** Verbal Analogies, Reading Comprehension, Situational Judgment.
- **Explain only (not drilled):** Self-Description Inventory.

## Planned features
- Per-subtest flow: learn → practice (untimed, explained) → timed drill → review.
- Full-length simulation mode with authentic per-section timing.
- Home dashboard: six composite estimates, streak, "study this next" (weakest-first).
- Spaced repetition for memorization-heavy material (vocab, formulas, aviation facts).
- Composite percentile estimator, shown as a *range* and clearly labeled "practice estimate, not an official score."

## Learning-science principles (baked in)
Retrieval practice as the default interaction; spaced-repetition (FSRS-style) scheduler; interleaving of confusable item types; mastery-gated, weakest-first sequencing; immediate explanatory feedback during practice; realistic timed mode to train speed and reduce choking; honest, calibration-aware progress; need-supporting motivation with no dark-pattern streak mechanics.
*Full detail: research/GatorVector_Learning_Science__Research.md*

## Known limitations (design around honestly)
- No real test items — difficulty is approximated, then validated against real outcomes over time.
- SJT has no public answer key — any key is an approximation, labeled as such.
- SDI is a personality measure — explained, not practiced or gamed.
- Score estimates are educated approximations, not official scores.
- Rendered subtests (Block Counting, Instrument Comprehension) must be visually unambiguous — real engineering effort.
- Local-first means updates require re-download, not an automatic push.

## Build phases
- **Phase 0 — Foundations:** tools installed, deploy pipeline proven, research filed, Table Reading spec locked. ✅
- **Phase 1 — Table Reading vertical slice:** one subtest end to end (generator, timer, scoring, streak, local storage, one clean screen). ✅
- **Phase 2 — Remaining procedural subtests:** Math Knowledge, Arithmetic Reasoning, then the rendered Block Counting & Instrument Comprehension. *In progress — MK slice 1 complete.*
- **Phase 3 — Content:** curated banks + authored items.
- **Phase 4 — Cross-cutting layer:** dashboard, composite estimator, spaced repetition, full-length sim, polish.
- **Phase 5 — Test & calibrate:** trial with cadets (incl. friends who've taken the AFOQT), tune difficulty, release.

## Tech stack
- **Build tools:** Claude Code (native installer, no Node.js required), VS Code, Git + GitHub.
- **App:** static web (HTML / CSS / JavaScript), runs client-side.
- **Hosting:** GitHub Pages — repo `colemandfinn/Gator-Vector` (note capital G, V; case-sensitive). Live at `colemandfinn.github.io/Gator-Vector/`.
- **Storage:** browser local storage + export/import.
- **Push workflow note:** pushes go through VS Code's Source Control panel (it holds the GitHub login). The terminal/Claude Code keychain has no saved credentials, so terminal `git push` prompts for a token and fails — that's expected and not a real blocker; use the VS Code push button. Claude Code may report auth as "still pending" — that's stale; pushes are succeeding via VS Code.

## Site structure (as of Session 3)
- `index.html` — landing page ("Gator Vector"), lists available drills as cards. Site entry point / front door.
- `tableReading.html` — the Table Reading drill (was `index.html` through Phase 1; renamed via `git mv` when the landing page was added).
- `math.html` — the Math Knowledge drill (timed + practice modes).
- `src/tableReading/` — Table Reading engine (labelIndex, grid, item, drill loop, scoring).
- `src/mathKnowledge/` — MK engine: `cleanAnswer.js`, `linearEquation.js`, `area.js`, `exponents.js`, `engine.js` (registry + item assembly + interleaved drill + scoring/review), `registerCartridges.js`.
- `test.html` — Table Reading test harness (21 tests). `mathTest.html` — MK test harness.
- `research/` — `GatorVector_AFOQT_Research.md`, `GatorVector_Learning_Science__Research.md`, `TableReading_Spec.md`, `MathKnowledge_Spec.md`.

## Current status — end of Session 3
**Phase 2 in progress; Math Knowledge slice 1 complete and live.** Highlights this session:
- **Deployed.** App is live on GitHub Pages and shared with an ROTC cadet tester. Front-door landing page links to both drills.
- **Math Knowledge slice 1 built & test-hardened.** Engine + registry + three self-contained cartridges (linear equations, rectangle/circle area, exponent simplification), each with clean-answer-by-construction, ≥2 genuine error-pattern distractors, integers-only across all five options (§4.1.7 invariant), no clustering tell, randomized answer position. Timed drill (25 items / 22:00, real MK timing) + untimed practice mode with method explanations. `MathKnowledge_Spec.md` locked and citation-verified.
- **Architecture bet validated:** the self-contained-cartridge / math-free-engine design held across three genuinely different problem shapes. Assembly lifted from cartridges into the engine once the shared engine existed (deferred extraction done at the right time).

### Open flags — awaiting cadet-tester feedback (do NOT hardcode as resolved)
Table Reading:
- Whether negative cell values appear on real Form T.
- Paper vs. eAFOQT timing conflict.
- V1 distractor difficulty: a first cold run scored 40/40 in 6:02 — possibly too easy, possibly just a strong tester. V2 same-row/column near-miss distractors still deferred pending this.
- **UI:** the drill screen allowed scrolling to reach answers — may undercut the speed pressure that *is* the test. Tighten layout so grid + options sit on one screen.

Math Knowledge:
- **F-1:** difficulty-level → number-range mapping is an unvalidated default.
- **F-2:** distractor-set realism per cartridge ("do these look like real options?").
- **F-3:** does real Form T MK lean more algebra or geometry? (affects cartridge priority after slice 1).
- **F-4:** π convention on circle items (currently π=22/7, radii multiples of 7 to force clean integers).
- **F-5:** circle-area item *framing* may feel unfair under no-calculator conditions (surfaced by playing it). Options on the table: state the πr² formula on-screen, switch to "in terms of π" answers, or rectangles-only. The integer-clean construction is sound; only the presentation is unvalidated.

### Next session — natural starting points
- Resolve F-5 (and F-1/F-2/F-4) once the ROTC tester weighs in on the MK circle items.
- Act on Table Reading tester feedback (difficulty, scrolling-layout fix).
- Continue Phase 2: either **Arithmetic Reasoning** (layers word-problem framing onto the MK engine just built) or the **rendered spatial subtests** (Block Counting, Instrument Comprehension — real drawing/vector-art effort).

## Working patterns (keep)
- Design decisions worked through in chat first; implementation prompts then pasted into Claude Code.
- One logical component per commit (the real safety net with "accept edits on" active).
- Specs locked + citations verified before code references them ("where does that come from?").
- Known-unknowns get configurable parameters with explicit flags, not hardcoded guesses.
- Test the risky logic with assertions; test the UI by actually playing it (caught the F-5 circle-framing issue this way).
