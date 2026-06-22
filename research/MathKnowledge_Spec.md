# Math Knowledge — Subtest Spec (Phase 2, Slice 1)

*Gator Vector. Locked spec — source of truth for the Math Knowledge vertical slice. Lock before implementation; change only by deliberate edit, not mid-build drift. Pairs with `GatorVector_AFOQT_Research.md` (§4.4, §5) and `GatorVector_Learning_Science__Research.md` (§2 retrieval/distractors, §5 speeded training).*

---

## 0. Status & scope

**Phase:** 2 (first procedural block after Table Reading).
**This slice:** Math Knowledge engine + **three** problem-type cartridges only. Arithmetic Reasoning is a *later* slice built on the same engine (its word-problem framing layers on top; not in scope here).

**The three cartridges in this slice** (chosen because they exercise three genuinely different distractor philosophies and three different clean-answer challenges — if the cartridge contract holds across these, it generalizes):
1. **Linear equations** — solve `ax + b = c` for `x`.
2. **Area** — circle and rectangle area.
3. **Exponent simplification** — apply exponent rules.

**Explicitly deferred to later MK cartridges** (named so scope is unambiguous, not forgotten): quadratics, systems, factoring, radicals, absolute value, Pythagorean theorem, triangle/circle properties beyond area, number theory, basic trig (SOH-CAH-TOA), functions, probability. Source for the full MK content domain: AFOQT dossier §4.4.

> **Citation-verification habit applies.** Where this spec cites a dossier section (e.g., "§4.4"), open `GatorVector_AFOQT_Research.md` and confirm it says what's claimed before relying on it. This spec's load-bearing AFOQT facts are: MK = 25 items / 22 min / **5 answer choices** (§4.4 Items/Time line), no calculator (§4.4 Strategies bullet), no guessing penalty (§2).

---

## 1. AFOQT facts this slice must honor

From `GatorVector_AFOQT_Research.md` (verify before building):
- **5 answer choices per item** → every item = **1 correct answer + 4 distractors**.
- **No calculator.** Answers must be clean (integers or simple fractions/decimals a person can reach by hand). This is the central generation constraint — see §3.
- **No guessing penalty** → drill UX answers every item; never penalize a blank differently than a wrong answer. (Mirrors Table Reading.)
- **Decontextualized math** (vs. Arithmetic Reasoning's word problems). MK items are bare math: "solve," "simplify," "find the area." No prose scenarios in this slice.

---

## 2. Architecture: engine + registry + self-contained cartridges

The design that keeps breadth from becoming a tangle. Mirrors the Table Reading separation, scaled to handle variety.

### 2.1 The shared engine knows no math
The engine owns the drill loop, timer, scoring, and review screen. It knows **nothing** about linear equations or areas. It talks to every cartridge through one fixed contract and is never edited when a new cartridge is added.

### 2.2 The cartridge contract
Each problem type is a **self-contained module** ("cartridge") that exposes exactly three capabilities:
1. **`generate(difficulty)`** → produces one problem (the displayable prompt + the internal parameters).
2. **correct answer** → the deterministic right value for that problem.
3. **`distractors(...)`** → produces 4 wrong options per the rules in §4, using error patterns specific to *this* type.

The engine calls these; it does not reach inside them. **No shared distractor code** between cartridges (decided: self-contained first — see §6). Common helpers may be extracted *later* only if real duplication appears; not before.

### 2.3 Why self-contained cartridges directly buy quality
Because distractor logic lives inside each cartridge, the linear-equation cartridge can model "forgot to flip the sign," and the area cartridge can model "used circumference instead of area / forgot to square the radius." Each type owns its own catalog of *authentic* wrong answers — which `GatorVector_Learning_Science__Research.md` §2 identifies as the thing that makes multiple-choice actually drive retrieval rather than pattern-matching.

### 2.4 Adding a cartridge later
Write a new module satisfying the contract; register it. Engine, timer, scoring, review untouched. This is the payoff of the design.

---

## 3. HIGHEST-RISK DETAIL — clean-answer constraints

> **This is the MK equivalent of Table Reading's `index = label + 17` mapping: the single detail most likely to produce defects. Implement and test it first.**

Randomly chosen coefficients almost always produce **ugly answers** (fractions, decimals, irrationals) that don't belong on a no-calculator test. The fix is universal across cartridges: **work backward from a clean answer; do not pick all inputs randomly and hope.**

- **Linear `ax + b = c`:** pick `a`, the *intended solution* `x`, and `b` as clean integers first, then **compute** `c = ax + b`. The answer is clean by construction. Never pick `a`, `b`, `c` independently.
- **Area:** constrain dimensions (and π handling — see §4.2) so the area is clean. For circles, decide up front whether answers are "in terms of π" or use a stated π approximation; constrain the radius accordingly.
- **Exponents:** constrain bases/exponents so the simplified result is expressible without a calculator.

**Test requirement:** the test harness (§5) must assert, across many generated items per cartridge, that **every** correct answer satisfies the cartridge's "clean" definition. A single ugly answer slipping through is the defect this section exists to prevent.

---

## 4. Distractor rules (the quality core)

Per-item: **1 correct + 4 distractors**, all five drawn so the set looks natural and the correct answer is **not** detectable by structure.

### 4.1 The hard rules
1. **Minimum 2 genuine error-pattern distractors per item.** Real mistakes a student would actually make on *this* problem. If a cartridge cannot reliably produce 2 real error patterns, the problem type is **too simple for MK** — reconsider it; do not paper over with fillers. (Built-in quality tripwire.)
2. **Fill to 4 with spread-matched near-miss fillers.** Remaining slots use plausible near-miss values — but generated to **match the spread of the error-pattern distractors**, never to hug the answer. No option may be an obvious geographic outlier.
3. **No clustering tell.** The correct answer must not be detectable as "the median of a tight cluster while one option sits far away." All five occupy a similar spread. The correct answer should land mid-pack as often as at an edge.
4. **Plausibility floor for fillers.** A filler is not "answer + 3." It must be a plausible *wrong answer to this specific problem*: same order of magnitude, same sign behavior, ideally looking like it could come from some miscalculation. For area items, fillers are themselves plausible areas; for equations, plausible solutions.
5. **Position randomization.** Correct answer's slot (A–E) is random per item. Guard against positional tells: the correct answer should not disproportionately land in any position, nor always be the numerically largest/smallest/middle value.
6. **Dedup.** No duplicate option values; if a distractor collides with the answer or another distractor, regenerate. (Same discipline as Table Reading.)
7. **All five options clean (§3).** Every one of the five options — the correct answer **and** all four distractors/fillers — must satisfy the §3 "clean" definition for the cartridge. No ugly value (a fraction, decimal, or irrational the student couldn't reach by hand) may appear in **any** slot. An error pattern that would yield an ugly number is skipped (or rendered in a clean equivalent form), and fillers are generated clean from the start. This is not only a no-calculator courtesy: a lone non-clean option is itself a structural tell — it can only be a wrong answer — so this rule also protects §4.1.3. The harness (§5.2) must assert cleanness across **all five** options of **every** item, not just the correct answer.

### 4.2 Per-cartridge error-pattern catalogs (starting sets)
**Linear equations (`ax + b = c`):** sign error (didn't flip sign when moving `b`); operation error (added instead of subtracted, or divided wrong); off-by-the-coefficient (forgot to divide by `a`); solved for the wrong intermediate value. *(Easily ≥3 real patterns.)*

**Area:**
- *Rectangle:* used **perimeter** instead of area; added sides instead of multiplying; multiplied wrong. *(Realistically ~2 rock-solid patterns — this is the cartridge that justifies the floor being **2**, not 3.)*
- *Circle:* used **circumference** (`2πr`) instead of area (`πr²`); **forgot to square** the radius (`πr` or `πd`); used **diameter** where radius was needed. *(≥3 real patterns.)*
- Decide π convention up front (in-terms-of-π vs. stated approximation) and keep it consistent within an item.

**Exponent simplification:** **added** exponents where they should multiply (or vice versa); mishandled a negative/zero exponent; applied the rule to the base instead of the exponent. *(≥3 real patterns.)*

### 4.3 Known-unknown — distractor realism
The truly robust test of "do these four look like a natural option set" requires real items we don't have. **Flag: perceived realism of each cartridge's distractor sets is pending cadet-tester validation.** AFOQT-taker friends eyeball generated items and report "feels real" vs. "I can see the seams." Build the §4.1 rules now; do not claim realism is solved from code alone.

---

## 5. Difficulty parameter & test harness

### 5.1 Difficulty knob (built in day one, default flagged)
Each cartridge's `generate(difficulty)` takes a level controlling its number ranges (e.g., small single-digit positive coefficients at easy; larger and/or negative at hard). 

> **Known-unknown — flag.** The mapping of difficulty level → actual AFOQT-realistic ranges is an **unvalidated default**, resolved by cadet-tester feedback, not hardcoded as fact. Same handling as Table Reading's open flags. Carry the knob; flag the default.

### 5.2 Test harness (mirror `test.html`)
Browser-based harness covering all pure logic, in the spirit of Phase 1's 21 passing tests. Minimum assertions:
- **Clean-answer (all five options):** every option of every item — the correct answer **and** all four distractors/fillers — satisfies the cartridge's clean definition (§3), across many samples per cartridge. Asserting only the correct answer is insufficient (§4.1.7).
- **Distractor count & uniqueness:** exactly 4 distractors, all distinct from each other and the answer.
- **Minimum real patterns:** ≥2 error-pattern distractors per item (§4.1.1).
- **Spread:** no option is an outlier beyond the defined spread tolerance (§4.1.3).
- **Position:** over many items, correct-answer position is roughly uniform across A–E (§4.1.5).
- **Determinism:** a given problem's correct answer is stable.

---

## 6. Locked design decisions (the forks already settled)

1. **Sequence:** shared engine + Math Knowledge first; Arithmetic Reasoning layered on the same engine later.
2. **First slice width:** narrow — 3 cartridges (linear / area / exponents), prove the architecture, then scale (matches Table Reading approach).
3. **Distractor fallback:** near-miss fillers allowed **(option a)** — but governed by the §4 spread/clustering rules so they never create a tell.
4. **Minimum real distractors:** **2** (floor that every cartridge can clear honestly; keeps worst-case items half-real; trips a quality alarm when a type is too trivial).
5. **Cartridge independence:** **self-contained** distractors, zero shared distractor code; extract helpers later only if real duplication appears.
6. **Difficulty:** configurable knob from day one; default range mapping flagged unvalidated.

---

## 7. Open flags (pending cadet-tester feedback — do not hardcode as resolved)

- **F-1.** Difficulty-level → number-range mapping is an unvalidated default (§5.1).
- **F-2.** Distractor-set realism per cartridge — "do these look like real options?" (§4.3).
- **F-3.** Content emphasis: does real Form T MK lean more algebra or geometry? Affects which cartridges to prioritize *after* this slice. (Confirm with AFOQT-taker testers; dossier §4.4 lists the domain but not the operational mix.)
- **F-4.** π convention on circle items — confirm whether real items present "in terms of π" or with an approximation (§4.2).

---

## 8. Build order (suggested, for the implementation prompts to Claude Code)

1. **Clean-answer machinery + linear cartridge** (the highest-risk detail first), with harness assertions for clean answers.
2. **Distractor engine for the linear cartridge** (≥2 real patterns + spread-matched fillers + position randomization), with harness assertions.
3. **Area cartridge** (the one that stress-tests the 2-pattern floor).
4. **Exponent cartridge** (a third, different distractor family).
5. **Engine + drill loop + timer + scoring + review**, reusing Phase 1 patterns where they transfer.
6. **Commit each component before the next** (the established safety net; "accept edits on" is active).

*End of spec.*
