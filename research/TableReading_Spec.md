# Table Reading — Subtest Generator Spec (v1)

*Design spec only. No implementation code. Locks the Phase 0 Table Reading spec called for in `GatorVector_Context.md`. Pair with `GatorVector_AFOQT_Research.md` §4.9 (Table Reading) and §5 (procedural-generation analysis).*

---

## Purpose

Table Reading is the **first subtest built end-to-end** (Phase 1 vertical slice) because it is the highest-ROI item to code: per `GatorVector_AFOQT_Research.md` §5 it is **pure procedural** — a random labeled grid, an (X, Y) lookup, a deterministic answer, and distractors drawn from neighboring cells. It needs no authored content, no rendered art, and auto-grades trivially. It also feeds **all three rated composites** (Pilot, CSO, ABM), so it carries real value for rated users while we prove the app's architecture.

What Table Reading measures: **perceptual speed and accuracy**, not reasoning. The item is conceptually trivial; the difficulty is doing it *fast, repeatedly, under a clock* (~10.5 sec/item). The generator's job is to produce unlimited fresh, unambiguous lookup items with plausible near-value distractors, and to do so within the project's locked constraints (`GatorVector_Context.md`): local-first, client-side only, **no runtime AI** (items generated in-browser by code), no backend, no personal data.

This spec covers generation and grading logic only. Renderer styling, fonts, and the exact screen layout are downstream of the Phase 1 acceptance checklist below.

---

## Grid model

- **Dimensions:** 35 × 35 cells (locked). Configurable via `axisRange`.
- **Axes:** both X and Y run **−17 to +17 inclusive** (35 labels each: −17…−1, 0, 1…17). Derived from `axisRange = 17` as the symmetric bound; `2 × 17 + 1 = 35`.
- **Orientation (locked):**
  - **X = columns**, labels printed along the **top**.
  - **Y = rows**, labels printed along the **left**.
- **Cell contents:** non-negative integers **0–99** (locked v1). Configurable via `cellValueRange = [0, 99]`.
  - **FLAG:** whether real Form T tables ever contain **negative** cell values is **unconfirmed**. v1 uses non-negative only. Must verify with cadet testers before treating as final (see Open Questions). `cellValueRange` is the single knob to flip if negatives are confirmed.
- **Indexing convention (internal):** store the grid as `grid[row][col]` where `row` and `col` are **0-based array indices** (0…34). Axis *labels* map to indices by `index = label + axisRange` (so label −17 → index 0, label 0 → index 17, label +17 → index 34). Keep label↔index conversion in one helper to avoid off-by-one bugs — this is the single most likely defect in the whole subtest.
- **Lookup definition (locked):** a question presents a coordinate **(X, Y)**; the answer is the value at **column X, row Y**, i.e. `grid[yIndex][xIndex]`.

Cell values are populated independently at random within `cellValueRange`. No structure, gradient, or pattern across the grid — randomness is what forces genuine per-item lookup rather than estimation.

---

## Item generation algorithm (step by step)

A **grid** is generated once per drill session (or per configurable refresh); **items** are individual (X, Y) questions drawn against that grid. One generated grid can supply many items.

**Build the grid (once per session):**
1. Read config: `axisRange` (17), `cellValueRange` ([0, 99]).
2. Compute `size = 2 × axisRange + 1` (35).
3. Allocate a `size × size` array.
4. For each cell, draw a uniform random integer in `cellValueRange` inclusive. No constraint against repeats — repeats are realistic and fine.
5. Store the label↔index mapping (`index = label + axisRange`).

**Generate one item (per question):**
1. Draw a target **X label** uniformly from `[−axisRange, +axisRange]` and a target **Y label** likewise.
2. Convert to indices: `xIndex = X + axisRange`, `yIndex = Y + axisRange`.
3. Look up the **correct answer**: `correct = grid[yIndex][xIndex]`.
4. Generate **4 distractors** via the Distractor algorithm (v1) below, passing the grid and `(xIndex, yIndex)`.
5. Assemble the **5 options** = `[correct, ...4 distractors]`, then **sort ascending** (`optionOrder: "ascending"`, locked — matches real AFOQT format, which presents numeric options in ascending order and removes any positional tell).
6. Record the correct option's index (its position in the sorted list) for grading.
7. Emit the item: `{ x: X, y: Y, options: [...5], correctIndex }`.

**Notes:**
- Items within a session should avoid exact-duplicate **coordinates** back-to-back (track recently used (X, Y) and re-draw on collision) so the same lookup doesn't repeat immediately. Duplicate *values* across items are fine.
- Generation must be deterministic given a seed if we later want reproducible drills (optional — not required for v1, but keep the RNG injectable rather than calling a global directly).

---

## Distractor algorithm (v1)

**Principle (from `GatorVector_AFOQT_Research.md` §4.9):** real Table Reading options "usually cluster near the true value." v1 builds distractors from the target cell's **immediate neighbors**, which naturally produces near-miss values a careless or mis-tracking reader would land on.

**Goal:** return exactly **4 distinct values**, each different from `correct` and from each other.

**Neighbor priority order:**
1. **Orthogonal neighbors first** — up, down, left, right (the 4 cells sharing an edge). These model the most common error: tracking one row/column off.
2. **Diagonal neighbors to fill** — the 4 corner-adjacent cells, used if orthogonals don't yield 4 distinct usable values.
3. **Widen the ring at edges** — if the target sits on or near a grid border, some neighbors don't exist; expand to the next ring out (distance-2 cells) in the same priority spirit (orthogonal-ish before diagonal) until 4 distinct values are collected.

**Procedure:**
1. Collect candidate neighbor cells in priority order (orthogonal ring → diagonal ring → distance-2 ring …), skipping any index that falls outside `[0, size−1]` on either axis.
2. For each candidate, take its cell value. **Discard** it if it equals `correct` or duplicates a value already chosen.
3. Stop once **4 distinct distractors** are collected.
4. **Fallback (degenerate grids):** if widening rings is exhausted (e.g., a tiny configured grid, or a region where neighbors happen to all collide with `correct`/each other), fill remaining slots with random integers in `cellValueRange`, still deduped against `correct` and chosen distractors. Log/flag this path in dev builds — on a 35×35 grid with `cellValueRange` 0–99 it should essentially never fire, so hitting it signals a config or logic problem.

**Edge-case handling summary:**
- **Corner target** (e.g., label (−17, −17), index (0,0)): only 3 in-grid neighbors at distance 1 → ring-widening supplies the rest.
- **Edge target** (one axis at the bound): 5 in-grid distance-1 neighbors → usually enough.
- **Value collisions:** dedupe is mandatory; two neighbors sharing a value, or a neighbor equal to `correct`, must not produce duplicate or give-away options.
- **Determinism:** same injectable RNG seed + same grid + same (X, Y) → same 4 distractors and same shuffle.

---

## Config parameters table

| Parameter | v1 default | Meaning | Notes / flags |
|---|---|---|---|
| `axisRange` | `17` | Symmetric axis bound; grid is `(2·axisRange+1)²` → 35×35, labels −17…+17 | Locked for v1 |
| `cellValueRange` | `[0, 99]` | Inclusive min/max for cell contents | **FLAG:** negatives unconfirmed for real Form T — verify with testers |
| `itemCount` | `40` | Items per timed drill | Matches Form T paper count (§4.9) |
| `timeLimitSeconds` | `420` | Drill time limit (7 min) | **FLAG:** paper vs eAFOQT timing conflict (see Open Questions) |
| `optionCount` | `5` | Options per item (1 correct + 4 distractors) | Locked; Table Reading is 5-choice |
| `optionOrder` | `"ascending"` | Sort order of the 5 presented options | Locked — matches real AFOQT numeric-ascending format; tester-overridable |
| *(internal)* `rng` | injectable | Seedable RNG for reproducible drills | Not user-facing |

All defaults live in one config object so a single edit re-tunes the subtest without touching generator logic.

---

## Open questions / flags to verify with testers

1. **Negative cell values.** Does the real Form T table ever contain negative numbers in cells, or only the axis labels go negative? v1 assumes **cells are non-negative (0–99)**. Confirm with cadets who've taken the AFOQT; if confirmed negative, widen `cellValueRange`. *(Tied to the "no real test items — difficulty is approximated, then validated against real outcomes" limitation in `GatorVector_Context.md`.)*
2. **Timing — paper vs. eAFOQT.** `GatorVector_AFOQT_Research.md` §4.9/§11 lock the paper figure at **40 items / 7 min**, but eAFOQT per-section timing "may differ" and is not independently confirmed. Default to 420 s; ask testers what the on-screen clock actually showed. `timeLimitSeconds` and `itemCount` are configurable precisely because of this conflict.
3. **Axis range realism.** Is −17…+17 representative of the real table's label range and grid size? Sources don't pin an exact size; 35×35 is a reasonable locked choice. Confirm the real table "feels" the same scale to testers.
4. **Cell-value range realism.** Are real cell values roughly 2-digit (0–99)? Verify the magnitude so distractor near-misses feel authentic.
5. **Distractor authenticity.** Do v1 neighbor-based distractors match the "options cluster near the true value" feel testers remember? Their answer drives whether/when we add v2 (below).

> Per `GatorVector_Context.md`, this is an **unofficial study aid** — difficulty is an approximation validated against real outcomes over time. Every flag above is a calibration target, not a launch blocker.

---

## v2 enhancements (deferred — document only, do not build yet)

1. **Same-row / same-column near-miss distractors.** In addition to immediate neighbors, draw distractors from **other cells in the same row or same column** as the target — modeling the error of tracking the correct line but stopping at the wrong cell along it. Per the task's locked decision, the **mix ratio** between neighbor-based (v1) and row/column-based distractors is **set by cadet feedback**, not guessed now.
2. **Optional negative cell values** if Open Question 1 resolves that way.
3. **Difficulty/pacing telemetry** feeding the Elo/Glicko ability model described in `GatorVector_Learning_Science__Research.md` §9 — response-time-weighted, since Table Reading is a speeded subtest. (Cross-cutting; lands in Phase 4, not here.)

v2 is intentionally held until v1 ships and real cadet feedback exists. Do not pre-build it.

---

## Phase 1 acceptance checklist — what "done" looks like

Table Reading is the **vertical slice** that proves the whole app pattern (`GatorVector_Context.md`, Phase 1). "Done" = all of the following work end-to-end on one clean screen, client-side only, with no backend and no personal data collected:

- [ ] **Generator** — produces a valid 35×35 grid and unlimited fresh items; every item has exactly 5 options (1 correct + 4 distinct distractors); correct answer is `grid[yIndex][xIndex]`; edge/corner targets handled; no duplicate or give-away options.
- [ ] **Grading** — number-correct scoring, **no guessing penalty** (per §7); unanswered = wrong but never penalized beyond the missed point; correct-option index tracked through shuffle.
- [ ] **Timer** — per-drill countdown defaulting to **420 s**, configurable; drill ends on time-out or after `itemCount` items; clock is visible and authentic (speed *is* the test).
- [ ] **Local storage** — drill results (score, items attempted, timing, date) persist in browser local storage; survives reload; **export/import** path stubbed or working per the project's backup/move-between-devices requirement (`GatorVector_Context.md`); no accounts, no PII.
- [ ] **One clean screen** — a single, visually unambiguous screen showing the grid (X labels top, Y labels left), the current (X, Y) question, 5 selectable options, score, and the timer. Renders unambiguously (the "rendered subtests must be visually unambiguous" standard from `GatorVector_Context.md` Known Limitations applies to the grid too).
- [ ] **Practice vs. timed** — at minimum a timed drill; ideally an untimed practice mode with immediate explanatory feedback (per learning-science §6) so the slice also exercises the feedback path.
- [ ] **Streak / honest progress** — a basic, non-coercive progress signal (no dark-pattern streak mechanics per learning-science §7); accurate, calibration-honest.
- [ ] **No runtime AI / no API keys / static-hostable** — runs fully client-side, deployable to GitHub Pages as a static bundle.

When every box is checked, the architecture (generator interface, timer, scoring, local-storage persistence, screen layout) is proven and reusable for the Phase 2 procedural subtests.
