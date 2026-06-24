# Arithmetic Reasoning — Subtest Spec (LOCKED)

Source-of-truth spec for the Gator Vector Arithmetic Reasoning (AR) subtest. Pair with
`GatorVector_AFOQT_Research.md` (the dossier) and `MathKnowledge_Spec.md` (the engine this
rides on). One logical change per commit; trace every implementation decision back to a
cited section here.

**Status:** Locked, v1 (first slice = one cartridge, rate/time/distance).
**Architecture:** Rides the Math Knowledge engine. AR = MK's number generation + a new
authored-prose layer. No new engine; one new content layer plus two policy calls.

---

## 1. Provenance / citations

Every load-bearing fact below is tagged to its source. Citations marked **Dossier §X**
refer to `GatorVector_AFOQT_Research.md`. The clean-integer invariant is inherited from
`MathKnowledge_Spec.md §4.1.7`. Verify any citation by opening the cited file before
implementing against it.

| Claim | Source |
|---|---|
| 25 items / 29 min (~70 sec/item), 5 answer choices | Dossier §2, §4.2 |
| No calculator; scratch paper; some formulas printed in the booklet | Dossier §4.2, §11 |
| No guessing penalty (answer every item) | Dossier §2, §4.2, §11 |
| Feeds **Quantitative** (AR + MK) and **Academic Aptitude** | Dossier §6 |
| All-officer minimum **Quantitative ≥ 10** | Dossier §6, §8 |
| Content: rate/time/distance, proportions, ratios, mixtures, percentages, work, geometry-in-context | Dossier §4.2 |
| Classified **procedural-hybrid (~75%)** — math is procedural, prose is authored | Dossier §5 |
| Distractors derived from word-problem errors (wrong operation, unit mistakes, off-by-one) | Dossier §4.2 |
| 29 min is the **paper-pamphlet** figure; eAFOQT timing can differ | Dossier §2 (eAFOQT note), §11 |
| Clean-integer invariant (every option a clean integer) | `MathKnowledge_Spec.md §4.1.7` |

---

## 2. Why AR matters in the build

- Finishing AR **closes the Quantitative composite** (AR + MK). Quant ≥ 10 is a hard gate
  for *every* officer candidate, rated or not (Dossier §6, §8), so AR has value for the
  whole detachment, not just rated cadets.
- It is the lowest-lift next subtest: the math is the MK engine already proven; only the
  prose layer is new (Dossier §5). It keeps the build in procedural territory rather than
  jumping to the renderer work that Block Counting / Instrument Comprehension require.

---

## 3. What is reused vs. new

**Reused from the MK engine (no change):** parameterized number generation, the
clean-integer invariant (`MathKnowledge_Spec.md §4.1.7`), engine-side answer-shuffle and
option assembly, distractor filtering, timed/untimed modes, local-storage persistence,
missed-item review, the test-harness pattern.

**New for AR (the only new work):** an authored **prose layer** — pre-written
word-problem templates with parameter slots, filled by the engine from the generated
numbers. This is the "authored templates + procedural numbers" hybrid the dossier
anticipates (§5). No runtime AI — all prose is pre-authored and filled in-browser.

---

## 4. The four locked decisions

### 4.1 Prose layer — pre-authored templates with parameter slots
Each cartridge ships a small set of **phrasing variants** (target 3–5) and a small
**noun bank**; the engine picks a variant and a noun and fills the generated numbers.
Rationale: no-runtime-AI means prose can't be generated live; a single template makes every
item read identically, so multiple variants + a noun bank give enough variety to not feel
canned while staying fully offline. (Dossier §5.)

### 4.2 Clean-answer policy — keep MK's strict integer invariant for v1
Every answer option — correct and all four distractors — is a **clean integer**, identical
to `MathKnowledge_Spec.md §4.1.7`. Each cartridge constrains its parameters so the solved
answer and all distractors are integers. Rationale: reuses MK's QC machinery directly and is
the safest thing to validate first. **Logged as an explicit decision, not silently
inherited** — real AR problems can produce money/decimals/fractions; a money/2-decimal mode
is a *later* addition, added only when a cartridge genuinely needs it (see flag AR-F-3).

### 4.3 First slice — one cartridge end-to-end
Prove the pattern with a single cartridge (**rate/time/distance**) fully wired — generator,
prose layer, timed + untimed modes, scoring, review, tests — before fanning out. Mirrors the
Table Reading Phase-1 vertical-slice move: get the *new* thing (prose-on-MK-engine) right on
one cartridge before replicating. The new risk in AR is the prose layer, not the math, so the
slice exists to de-risk prose, not the math.

### 4.4 Distractors — error-derived, then forced to clean integers
Distractors model the **word-problem errors** the dossier names (§4.2): wrong operation,
unit/which-way-division mistakes, off-by-one on a factor. Each cartridge defines its own
error-pattern pool; the engine filters candidates to clean, distinct integers that differ
from the answer (same filtering MK already does). This differs from MK's sign/order-of-ops
error model — AR errors are about *choosing the wrong operation on the right numbers*.

---

## 5. Cartridge model

A cartridge is the same shape as an MK cartridge, plus prose. It provides:

1. **Parameter generator** — random integers within stated ranges, constrained so the
   answer and all distractors are clean integers (§4.2).
2. **Solve forms** — which variable the item asks for (a cartridge may have several).
3. **Prose variants** — 3–5 phrasings with `{slot}` placeholders for the parameters and a
   `{noun}` slot.
4. **Noun bank** — nouns whose realism matches the generated parameter ranges.
5. **Distractor rules** — error patterns (§4.4) producing integer candidates; the engine
   filters to clean/distinct/≠answer.
6. **Method explanation** — the worked rule shown in untimed practice (e.g. "speed =
   distance ÷ time").

The engine consumes a cartridge exactly as it consumes an MK cartridge; answer-shuffle and
option assembly stay in the engine, never in the cartridge.

---

## 6. First cartridge — Rate / Time / Distance (`d = r × t`)

**Generation strategy (guarantees clean integers in all forms):** generate integer
`r` (speed) and integer `t` (time), then compute `d = r × t`. Whichever variable the item
asks for is derived from the other two, so the answer is always an integer:

- **Solve speed:** give `d`, `t` → answer `r = d ÷ t`.
- **Solve distance:** give `r`, `t` → answer `d = r × t`.
- **Solve time:** give `d`, `r` → answer `t = d ÷ r`.

Because `d` is built as `r × t`, every division comes out integer. No constraint-solving
needed beyond picking `r` and `t` from their ranges.

**Parameter ranges (v1, plausible + integer-clean):**
- `r` (speed): 30–75 mph, integer.
- `t` (time): 2–9 hours, integer.
- `d` (distance): derived, `r × t` (range ~60–675 miles).
- Units fixed and stated: miles, hours, miles per hour. Keep units consistent within an
  item (no mixed unit conversions in v1 — that is a later cartridge).

**Noun bank (v1):** vehicles whose realistic speed covers the 30–75 mph band — e.g. car,
truck, train, bus, van. (Cyclist/walker/aircraft are excluded from v1 because their
plausible speed band differs; adding banded nouns is a later refinement — flag AR-F-4.)

**Prose variants (illustrative; final wording in code):**
- Solve speed: "A {noun} travels {d} miles in {t} hours. What is its average speed?"
- Solve distance: "A {noun} travels at {r} miles per hour for {t} hours. How far does it go?"
- Solve time: "A {noun} travels {d} miles at {r} miles per hour. How long does the trip take?"
- (Provide 1–2 additional phrasings per solve form so repeated items don't read identically.)

**Distractor patterns (each forced to a clean, distinct integer ≠ answer):**
- *Wrong operation:* used `×` where `÷` was needed, or vice versa (e.g. solve-speed answers
  `d × t` instead of `d ÷ t`).
- *Off-by-one factor:* computed with `t±1` or `r±1`.
- *Doubled / halved:* `2×answer` or `answer÷2` (only when it lands on an integer).
- *Combined instead of operated:* `d − t`, `r + t`, etc., when integer and plausible.
The engine selects 4 distinct integer candidates within a sane range, distinct from the
answer and each other — same filter MK uses.

**Method explanation (untimed practice):** show the triangle `d = r × t` and the form used,
e.g. "speed = distance ÷ time = {d} ÷ {t} = {r}."

---

## 7. Modes & UX (mirror MK)

- **Learn → practice (untimed, explained) → timed drill → review**, identical flow to MK.
- **Timed drill:** **25 items / 29:00** for AR (Dossier §2, §4.2) — note this differs from
  MK's 25 items / 22:00. Per-section timing is the single biggest realism lever; match Form T.
- **Untimed practice:** immediate explanatory feedback with the worked method (§6).
- **Review:** missed-item review, same as MK / Table Reading.
- All timing values are **config**, not hardcoded (see AR-F-1).

---

## 8. Open flags (log; resolve via tester / TCO, don't guess)

- **AR-F-1 — Timing, paper vs eAFOQT.** 29:00 is the paper-pamphlet figure (Dossier §2,
  §4.2); the computer-based eAFOQT timing may differ (Dossier §11). Ship 29:00 as a config
  value; confirm the current eAFOQT figure with the detachment TCO. (Same class of unknown
  as the Table Reading timing flag.)
- **AR-F-2 — On-screen formula reference.** The real booklet provides *some* formulas
  (Dossier §4.2, §11). Decide whether AR (and MK) surface a formula reference on-screen.
  Ties directly to the open MK F-5 question. Defer to a single cross-subtest decision.
- **AR-F-3 — Clean-answer policy.** v1 enforces all-integer options (§4.2). Money/decimal/
  fraction problems are real AR content; a money/2-decimal mode is added later only when a
  cartridge needs it. Logged so the integer constraint is a visible choice, not a silent
  inheritance.
- **AR-F-4 — Banded nouns.** v1 RTD noun bank is limited to vehicles in the 30–75 mph band.
  Adding nouns with different plausible bands (cyclist, walker, aircraft) requires per-noun
  speed ranges. Minor refinement after the slice is validated.

---

## 9. Roadmap (after the RTD slice is validated)

1. **Rate / time / distance** ← v1 slice (this spec).
2. **Percentages** (discount/markup/percent-of), then **proportions / ratios** — both
   parameterize cleanly to integer answers and reuse the same prose+filter pattern.
3. **Mixtures, work problems, geometry-in-context** — later; some may need the money/decimal
   mode (AR-F-3) or unit handling.
4. Wire AR's per-subtest estimate into the eventual Quantitative composite (AR + MK) and the
   dashboard (Dossier §6).

---

*Locked v1. Implementation order: this cartridge end-to-end on the MK engine, one logical
commit at a time, harness green, validated by playing the UI before fan-out.*
