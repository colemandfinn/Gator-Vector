# Block Counting — Subtest Generator Spec (v1)

## Purpose
Procedurally generate Block Counting items: a 3-D stack of identical cubes with
one cube marked; the test-taker counts how many OTHER cubes the marked one
touches. Fully deterministic answer logic plus a rendered isometric figure.
Feeds the **CSO** and **ABM** composites.

## Provenance / citations
- Item format, timing, distractor band: `research/GatorVector_AFOQT_Research.md`
  §4.11 — 30 items / 4.5 min (paper); 5 answer choices; face-adjacency
  ("blocks above, below, left, right, and within the stack"); distractors
  ±1/±2 of the true count.
- Composite mapping (CSO, ABM): §6.
- Every figure is an ORIGINAL generated stack — no real AFOQT items reproduced.

## Contact rule (locked)
A "contact" is a shared **face**. Each cube has six orthogonal neighbour
positions (±x, ±y, ±z); the answer is how many of those are occupied.
Diagonal / edge-only adjacency does **not** count. (Confirm against real Form T —
flag **BC-F-2**.)

## Stack model — "skyline" construction (locked; resolves BC-F-4)
Stacks are solid height-map skylines: a footprint of columns, each filled from
the base (z = 0) up to some height ≥ 1, with **no floating cubes, no overhangs,
and no internal cavities**. This construction is what makes every cube's
neighbours **deducible from the drawing** without a separate per-cube predicate:
because columns are solid and gravity-supported, the visible surface determines
the entire solid. (BC-F-4 — "unambiguity" — is therefore handled by the shape
itself.)
- Representation: `heightMap`, keyed `"x,y" -> height`. Occupancy = every
  `(x, y, z)` with `z < heightMap["x,y"]`.

## Marked-block selection + answer range (locked)
The marked cube is a **top-of-column** cube whose top face is not occluded by a
nearer column (its top-face centre is tested against the projected faces of
every cube drawn in front of it). The marker ("1") is drawn on that visible top
face.
- True contact count runs **0–5, not 0–6.** Reasoning (our derivation —
  flag **BC-F-5**): to display a marker a cube needs a **visible** face, and a
  visible face means an **empty** neighbour slot on that side — so a cube
  touching all six is fully enclosed and cannot be marked at all. Maximum
  contacts for any markable cube = 5.

## Distractor algorithm (v1; resolves BC-F-3)
Given correct count `c`: candidate distractors from `{c±1, c±2}` (then `c±3,
c±4` as fillers), filtered to `[0, 8]` and de-duplicated. Take 5 total, **sort
ascending**, and record `correctIndex` = position of `c`. The correct value is
never leaked (asserted in the test page).

## Item / drill shape (matches the other subtests)
- `item = { heightMap, marked: [x, y, z], options: [5 ascending ints], correctIndex }`.
- `generateDrill`: default `itemCount` 30; no two consecutive items share the
  same `(heightMap, marked)` — re-draw on collision (mirrors Table Reading's
  no-back-to-back rule). `nextItem` for open-ended practice.
- Scoring: number-correct, no guessing penalty; `scoreDrill` / `reviewMissed`
  are index-based, identical contract to Table Reading's.

## Config parameters table
| param        | default      | note |
|--------------|--------------|------|
| maxHeight    | 3            | tallest a column can be |
| footprint    | 2–3 per side | random per item |
| optionCount  | 5            | answer choices |
| itemCount    | 30           | per timed drill (paper figure) |
| sessionTime  | 270 s        | 4:30 paper figure — eAFOQT unconfirmed |

## Open flags — verify with testers (do not guess)
- **BC-F-1** — eAFOQT timing for the 30 items (paper says 4:30).
- **BC-F-2** — does real Form T count ONLY full-face contact, or edge/corner too?
- **BC-F-5** — can a marked cube ever show 6 contacts, or is 5 the ceiling (above)?
- **BC-F-6** — do real stacks ever have overhangs / tucked-under cubes, or are
  they always solid skylines like these? (Overhangs would require reinstating a
  per-cube deducibility predicate.)
- **BC-F-7** — real option count: 5, or other? (Dossier: "5" vs "commonly 2–6".)
- **BC-F-8** — do the rendered figures read unambiguously to someone who has
  actually taken the test?

## Phase acceptance checklist — what "done" looks like
- `blockCountingTest.html`: every generated item recomputes to a 0–5 count, has
  5 unique ascending options, the correct value present at `correctIndex`, and
  no leak — **ALL PASS**.
- `blockCounting.html`: timed Drill + untimed Practice; stacks render
  unambiguously; Practice shows the contact breakdown; best score persists in
  `localStorage`; visually matches the other drill pages.
- `index.html`: a Block Counting card links to the drill.
