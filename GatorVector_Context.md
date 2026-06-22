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
- **Phase 0 — Foundations:** tools installed, deploy pipeline proven, research filed, Table Reading spec locked.
- **Phase 1 — Table Reading vertical slice:** one subtest end to end (generator, timer, scoring, streak, local storage, one clean screen).
- **Phase 2 — Remaining procedural subtests:** Math Knowledge, Arithmetic Reasoning, then the rendered Block Counting & Instrument Comprehension.
- **Phase 3 — Content:** curated banks + authored items.
- **Phase 4 — Cross-cutting layer:** dashboard, composite estimator, spaced repetition, full-length sim, polish.
- **Phase 5 — Test & calibrate:** trial with cadets (incl. friends who've taken the AFOQT), tune difficulty, release.

## Tech stack
- **Build tools:** Claude Code (native installer, no Node.js required), VS Code, Git + GitHub.
- **App:** static web (HTML / CSS / JavaScript), runs client-side.
- **Hosting:** GitHub Pages.
- **Storage:** browser local storage + export/import.

## Current status
**Phase 1 complete — Table Reading vertical slice is done.** The full procedural engine is built and committed: label↔index helper, grid generator, item generator (v1 neighbor-based distractors), and the drill loop, each in its own file under `src/tableReading/`. The app (`tableReading.html`, reached from the `index.html` landing page) runs end to end client-side: a **timed drill** (40 items, 7:00 clock, test-conditions with no per-item feedback) and an **untimed practice mode** (immediate explanatory feedback, open-ended), plus number-correct scoring (no guessing penalty) and best-score persistence in local storage. Logic is covered by a zero-tooling test page (`test.html`) that loads the source directly and prints PASS/FAIL — all passing. Six commits so far. This proves the reusable pattern (generator → drill → timer/scoring → local storage → one clean screen) for the remaining procedural subtests.

**Next: Phase 2 — remaining procedural subtests:** Math Knowledge, then Arithmetic Reasoning, then the rendered Block Counting & Instrument Comprehension.

**Open flags carried forward (still need cadet-tester feedback)** — both from the Table Reading spec, neither a launch blocker:
- **Negative cell values** — unconfirmed whether real Form T tables ever contain negative numbers in cells (v1 uses non-negative 0–99; `cellValueRange` is the single knob to flip if confirmed).
- **Timing — paper vs. eAFOQT** — paper Table Reading is 40 items / 7 min, but eAFOQT per-section timing may differ and isn't independently confirmed (default 420 s; `timeLimitSeconds`/`itemCount` are configurable for exactly this reason).

*Foundations (Phase 0) done earlier: Mac with Xcode, GitHub account, VS Code, both research files complete, Table Reading spec locked.*
