# AFOQT Form T — Comprehensive Research Dossier for a Free Local-First Prep Web App

*Research only. No application was built. This document is a standalone, relocatable Markdown reference. Current as of June 5, 2026.*

---

## 1. Executive Summary

The **Air Force Officer Qualifying Test (AFOQT) Form T** is the operational version of the U.S. Air Force/Space Force officer aptitude battery, effective **August 1, 2014** and still current in 2026. It is the gatekeeper exam for every officer accession source (OTS, AFROTC, USAFA transfers) and for rated-track selection (Pilot, Combat Systems Officer, Air Battle Manager, RPA).

**The user requested coverage of 12 subtests, and this is CORRECT for Form T.** Form T has **12 subtests**, confirmed by the official AFPC AFOQT Information Pamphlet. An Air Force Research Laboratory technical report (DTIC AD1157021, cleared AFRL-2022-0175, 13 Jan 2022) characterizes these as **10 cognitive subtests + 2 non-cognitive assessments**, of which **9 cognitive subtests feed the six operational composites**. Three subtests — **Physical Science, Situational Judgment, and the Self-Description Inventory** — do **not** feed any operational composite.

**Item-count conflict (resolved):** Sources cite 470, 516, or 550 total items. The truth: the official paper pamphlet's per-subtest schedule sums to **550**; the current **computer-based eAFOQT administered by Pearson VUE totals 516** (confirmed verbatim by Pearson VUE: *"The AFOQT exam is composed of 516 multiple-choice questions... divided into 12 subtests"*), the difference being entirely that the **Situational Judgment subtest was reduced from 50 items (paper) to 16 (eAFOQT)** — Pearson VUE lists Situational Judgment as *"(35 minutes, 16 questions)."* The "470" figure appears to be an error (an iPREP miscalculation) unsupported by any authoritative breakdown. For an app targeting current test-takers, **treat 516 (Pearson VUE / eAFOQT) as the operational total**, while noting the paper pamphlet remains the most detailed official source for item formats.

**For the app build:** Five subtests are strongly **procedurally generable** (Table Reading, Block Counting, Instrument Comprehension, Arithmetic Reasoning, Math Knowledge); the rest require **authored content** (Word Knowledge, Verbal Analogies, Reading Comprehension, Aviation Information, Physical Science, Situational Judgment, Self-Description Inventory). There is **no guessing penalty** (number-correct scoring), **no calculator allowed**, and scores are reported as **percentiles (1–99)** across **six composites** (Pilot, CSO, ABM, Academic Aptitude, Verbal, Quantitative).

> **Sourcing & copyright note:** All item structures below are described as *original templates/patterns* for writing fresh practice questions. No copyrighted AFOQT items are reproduced. Authoritative anchors are the **AFPC AFOQT Information Pamphlet (AFPT-997)**, **Pearson VUE's AFOQT page**, **DAFMAN 36-2664 (Personnel Assessment Program)**, **AFROTCI 36-2011V3**, **AFPC PCSM/TBAS pages**, and an **AFRL DTIC technical report**. Commercial prep providers (BogiDope, AFOQTGuide, Mometrix, Peterson's, iPREP, JobTestPrep) corroborate format details but occasionally disagree; disagreements are flagged inline.

---

## 2. Quick-Reference Subtest Table (Form T)

Item counts and times below follow the **official AFPC Information Pamphlet (paper Form T)**. Where the computer-based eAFOQT differs, it is flagged. Order is the official testing order.

| # | Subtest | Items (paper) | Time (min) | What it measures | Procedural vs. Authored | Composites fed |
|---|---------|--------------|-----------|------------------|------------------------|----------------|
| 1 | Verbal Analogies | 25 | 8 | Word-relationship reasoning | **Authored** (hybrid: template + curated vocab) | ABM, Academic, Verbal |
| 2 | Arithmetic Reasoning | 25 | 29 | Math word problems | **Procedural** (hybrid: needs natural-language framing) | Academic, Quantitative |
| 3 | Word Knowledge | 25 | 5 | Vocabulary / synonyms | **Authored** | CSO, Academic, Verbal |
| 4 | Math Knowledge | 25 | 22 | Algebra, geometry, math principles | **Procedural** | Pilot, CSO, ABM, Academic, Quantitative |
| 5 | Reading Comprehension | 25 | 38 (paper) / ~24 (some sources) | Reading & inference | **Authored** | Academic, Verbal |
| 6 | Situational Judgment | 50 (paper) / **16 (eAFOQT)** | 35 | Officer interpersonal judgment | **Authored** | None (non-operational) |
| 7 | Self-Description Inventory | 240 | 45 | Personality inventory | **Authored** (non-scored) | None |
| 8 | Physical Science | 20 | 10 | Physical-science concepts | **Authored** | None (non-operational) |
| 9 | Table Reading | 40 | 7 | Speed/accuracy of grid lookup | **Procedural** (pure) | Pilot, CSO, ABM |
| 10 | Instrument Comprehension | 25 | 5 | Reading attitude/heading instruments | **Procedural** (with rendered art) | Pilot, ABM |
| 11 | Block Counting | 30 | 4.5 | 3-D spatial visualization | **Procedural** (with rendered art) | CSO, ABM |
| 12 | Aviation Information | 20 | 8 | Aviation/aeronautics knowledge | **Authored** | Pilot, ABM |

**Totals:** Paper pamphlet schedule = **550 items**, ~3 h 36.5 min of testing time, ~4 h 47.5 min total seat time including breaks/admin. Computer-based eAFOQT (Pearson VUE) = **516 items** with **3 h 23 min** to answer questions (per Mometrix: *"about five hours including breaks, with 3 hours and 23 minutes to answer questions"*), Situational Judgment counted as 16.

**Answer choices:** 4 or 5 per question, varying by subtest (most have 5; some spatial/aviation items have 4). **No penalty for guessing** — answer every item.

---

## 3. The Form T vs. Form S Question — What Changed

The user's instinct to verify is well-founded. Historically the AFOQT existed in many forms (M, N, O, P, … S, T). The transition from **Form S to Form T** (effective Aug 1, 2014) made these changes:

- **Removed:** *Hidden Figures* and *Rotated Blocks* subtests (both gone from Form T — do not study them).
- **Added:** *Reading Comprehension* (feeds Verbal & Academic) and *Situational Judgment* (non-operational; implemented 2015).
- **Renamed/revised:** *General Science* → *Physical Science* (refocused on physical sciences). On Form S, General Science was a factor in the Navigator composite; on Form T, Physical Science feeds **no** composite.
- **Updated:** *Instrument Comprehension* graphics modernized to current aircraft; updated items throughout.

So Form T's 12 subtests are: Verbal Analogies, Arithmetic Reasoning, Word Knowledge, Math Knowledge, Reading Comprehension, Situational Judgment, Self-Description Inventory, Physical Science, Table Reading, Instrument Comprehension, Block Counting, Aviation Information. **This matches the user's requested list of 12.**

> **Flag (genuine uncertainty):** One commercial source (practicetestgeeks.com) claims "Form T, introduced in 2023, Reading Block replaced Reading Comprehension." This is **not corroborated** by the official AFPC pamphlet (which dates Form T to 2014 and names the subtest "Reading Comprehension") or by the AFRL report. Treat the "2023/Reading Block" claim as unreliable. Also note many prep sites still circulate Form-S-era composite definitions (e.g., "Navigator-Technical" using General Science) — these are outdated.

---

## 4. Each Subtest in Detail

For each: official description, items/time, question types, what it measures, difficulty, strategy, and an **original item-structure template** for writing fresh questions.

### 4.1 Verbal Analogies
- **Items/Time:** 25 items / 8 min (~19 sec each). 5 answer choices.
- **Measures:** Ability to reason and see relationships among words.
- **Question types/sub-formats:** Two structural variants:
  1. **Complete-the-pair:** "A is to B as C is to ___" — you supply the 4th term.
  2. **Pair-to-pair:** "A is to B as ___" — you choose a complete word pair matching the relationship.
- **Relationship categories (per Peterson's):** synonyms/definitions, antonyms, function/relationship, classification (type/category), and part-to-whole. (Practical decks also include use/tool, cause/effect, degree/intensity, sequence.)
- **Difficulty:** Moderate; vocabulary is usually not obscure — the challenge is precision of relationship under time pressure.
- **Strategies:** Build a "bridge sentence" capturing the precise relationship of the stem pair, then plug each option in. Preserve parts of speech and tense. Use elimination. Move fast (~19 sec/item).
- **Original template:**
  - *Stem (complete-the-pair):* `[WORD1] is to [WORD2] as [WORD3] is to ____` where rel(WORD1,WORD2) = rel(WORD3,answer).
  - *Stem (pair-to-pair):* `[WORD1] is to [WORD2] as` → 5 options each a `[X] is to [Y]` pair; exactly one preserves the relationship; distractors invert direction, change category, or share surface association only.

### 4.2 Arithmetic Reasoning
- **Items/Time:** 25 items / 29 min (~70 sec each). 5 answer choices.
- **Measures:** Solving real-world math word problems.
- **Content:** rate/time/distance, proportions, ratios, mixtures, percentages, work problems, integers, geometry-in-context (volume/area). Scratch paper provided; **no calculator**; some common formulas provided in the booklet.
- **Difficulty:** Moderate; the hard part is translating prose to equations, not the computation itself. Generous time relative to other subtests.
- **Strategies:** Translate words to equations carefully; watch units; back-solve from answer choices; estimate to eliminate.
- **Original template:** Generate a real-world scenario (travel, purchasing, mixing, work-rate) with random integer/decimal parameters constrained so the answer is clean; produce 5 numeric options with distractors derived from common errors (unit mistakes, off-by-one, wrong operation).

### 4.3 Word Knowledge
- **Items/Time:** 25 items / 5 min (~12 sec each). 5 answer choices.
- **Measures:** Vocabulary — choosing the word closest in meaning (synonym) to a capitalized stem word.
- **Format:** Single capitalized stem word → choose the closest synonym from 5 options.
- **Difficulty:** Moderate-high *because of speed* (5 problems/min), not difficulty of words.
- **Strategies:** Trust first instinct; analyze Greek/Latin roots when stumped; discipline to guess-and-move; daily vocab (Anki) builds the only durable advantage.
- **Original template:** `[STEM WORD]` → 5 options, one a clear synonym; distractors include near-synonyms of a *different* sense, antonyms, and phonetically/orthographically similar decoys.

### 4.4 Math Knowledge
- **Items/Time:** 25 items / 22 min (~53 sec each). 5 answer choices.
- **Measures:** Mathematical terms and principles (decontextualized math, vs. AR's word problems).
- **Content:** algebra (equations, inequalities, systems, factoring, exponents, radicals, absolute value), geometry (area/volume, Pythagorean theorem, triangles, circles, properties of shapes), number theory, basic trigonometry (SOH-CAH-TOA), functions, probability. No full calculus.
- **Difficulty:** Moderate; **highest-leverage subtest** — feeds 5 of 6 composites (Pilot, CSO, ABM, Academic, Quantitative).
- **Strategies:** Memorize formulas cold (no reference sheet, no calculator); back-solve from options; estimate/bound; SOH-CAH-TOA automatic.
- **Original template:** Direct computation ("solve 3x+7=22"), expression simplification, geometric property, or formula application; randomize coefficients with integer-clean answers; distractors from sign errors, order-of-operations slips, formula confusions.

### 4.5 Reading Comprehension
- **Items/Time:** 25 items / **38 min per official pamphlet** (some commercial sources list 24 min — flag). 5 answer choices.
- **Measures:** Reading and understanding written material, including implied meaning; uses PME-style (Professional Military Education) passages. No outside knowledge needed.
- **Question types:** main idea/primary purpose, vocabulary-in-context ("X most nearly means"), explicit detail, inference, author's-attitude/agreement.
- **Difficulty:** Moderate; dense passages but generous time (per the 38-min figure).
- **Strategies:** Read for structure; answer from the passage only; for vocab-in-context, substitute options back into the sentence; for inference, stay tethered to text.
- **Original template:** Write an original 300–500-word expository passage (numbered lines) + 4–5 questions spanning the question types above; distractors are true-but-irrelevant, too-broad, too-narrow, or contradicted statements.

### 4.6 Situational Judgment (SJT)
- **Items/Time:** **50 items / 35 min (paper)**; **16 questions (eAFOQT)**. 5 response options per scenario.
- **Format:** A workplace scenario faced by a junior officer (O1–O3), then **two questions per scenario**: pick the **MOST EFFECTIVE** and the **LEAST EFFECTIVE** action from 5 options. (The "50 items" paper count = 25 scenarios × 2 responses.)
- **Measures:** Judgment across **seven officership competencies**. Per Lentz et al. in *Military Psychology* (PMC10790796), an AFPC/DSYX initiative surveying **4,436 officers** identified seven: (i) Displaying Integrity, Ethical Behavior, and Professionalism; (ii) Leading Others; (iii) Decision-Making and Managing Resources; (iv) Communication Skills; (v) Leading Innovation; plus mentoring and the remaining competency. The SJT was implemented in **2015**. Scored against the **consensus of experienced/high-potential USAF officers**, not a single keyed answer.
- **Composite:** **None** — non-operational. Still mandatory; boards may see it; used for officer-classification research. Per AFRL-RH-WP-TR-2021-0080 (DTIC AD1157021, cleared AFRL-2022-0175, 13 Jan 2022): *"the SJT was found to be relatively easy, with low-to-moderate ability to differentiate among the test-takers... and low-to-moderate internal consistency,"* at a ~9–10th-grade reading level, correlating more with cognitive subtests than with personality.
- **Difficulty:** Subjective; "easy or confusing," cannot be crammed.
- **Strategies:** Favor responses showing integrity, gathering information, using the chain of command appropriately, and direct-but-respectful communication; avoid extreme/passive/blame-shifting actions.
- **Original template:** Author an original leadership dilemma + 5 plausible actions spanning a quality gradient; designate consensus most/least effective with rationale tied to the seven competencies.

### 4.7 Self-Description Inventory (SDI)
- **Items/Time:** 240 items / 45 min. Likert agree–disagree scale.
- **Format:** Self-report statements rated from strongly agree to strongly disagree. **Not scored / no right answers**; designed to profile personality (commercial sources map it to the Big Five — Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism). Non-operational composite.
- **Strategies:** Answer honestly and consistently; respond quickly (gut feeling); easily finished in time.
- **Original template (for app practice only):** Generate first-person trait statements across Big Five facets with a 5-point Likert response; emphasize that there is no scoring key.

### 4.8 Physical Science
- **Items/Time:** 20 items / 10 min (~30 sec each). 5 answer choices.
- **Measures:** Concepts central to the physical sciences. Per iPREP/commercial guides: physics (force, motion, simple machines, physical laws, sound/light), chemistry (atomic structure, bonding, reactions, acids/bases, states of matter), plus earth science/astronomy/meteorology. High-school level; non-calculation/conceptual.
- **Composite:** **None** — non-operational on Form T (was part of Navigator on Form S as General Science).
- **Difficulty:** Moderate; broad recall under time pressure.
- **Strategies:** Broad conceptual review; elimination; don't over-invest since it feeds no composite (but it's mandatory).
- **Original template:** Conceptual stem + 5 options across physics/chem/earth-science; distractors are common misconceptions.

### 4.9 Table Reading
- **Items/Time:** 40 items / 7 min (~10.5 sec each). 5 answer choices.
- **Format:** A large grid with an **X-axis (horizontal)** and **Y-axis (vertical)**, each running through negative and positive integers (e.g., −20 to +20). Each item gives an **(X, Y) coordinate**; you find the cell value at that intersection and select it from 5 options. On the eAFOQT the table is fully on-screen (no printout), no straightedge allowed.
- **Measures:** Perceptual speed and accuracy.
- **Difficulty:** Conceptually trivial but a brutal **speed/focus** test (6–7 items/min). Most candidates do not finish.
- **Strategies:** Use a fingertip/cursor; track X first then Y (or vice versa) consistently; don't second-guess; the 5 options usually cluster near the true value, so read carefully.
- **Original template:** Generate an N×M integer grid with labeled axes; pick a target (X,Y); correct answer = grid[X][Y]; 4 distractors are adjacent-cell values. **Fully procedural.**

### 4.10 Instrument Comprehension
- **Items/Time:** 25 items / 5 min (~12 sec each). Typically 4 aircraft-silhouette options.
- **Format:** Each item shows **two dials** — an **artificial horizon** (showing climb/dive via the fuselage marker relative to the horizon line, and bank via the pointer/"carrot" position) and a **compass** (showing heading) — plus **four small aircraft silhouettes** in different attitudes/headings. You select the silhouette matching the attitude+heading indicated by the dials.
- **Measures:** Ability to determine aircraft attitude (climb/dive, bank) and heading from instruments.
- **Conventions (per AFOQTGuide):** Climbing → fuselage marker between horizon line and pointer; diving → marker below; bank left → pointer right of center; bank right → pointer left of center. Compass gives the heading the nose points toward.
- **Difficulty:** Hard for novices; very learnable with practice. Extreme time pressure.
- **Strategies:** Read climb/dive first, then bank, then heading; eliminate silhouettes that fail any one dimension; learn the dial conventions cold.
- **Original template:** Randomize (heading, pitch sign, bank direction); render two dials accordingly; render 4 silhouettes — 1 correct, 3 differing in exactly one attribute. **Procedural logic + rendered art.**

### 4.11 Block Counting
- **Items/Time:** 30 items / 4.5 min (~9 sec each). 5 answer choices (commonly 2–6).
- **Format:** A 3-D pictorial **stack of identical blocks**, several of which are **numbered**. For each numbered block you determine **how many other blocks it touches** (adjacency on any face, including blocks above, below, left, right, and within the stack).
- **Measures:** Spatial visualization — "seeing into" a 3-D stack.
- **Difficulty:** Moderate; the trick is counting hidden/internal contacts. Severe time pressure.
- **Strategies:** Systematically count contacts by direction (above/below/left/right/front-back); visualize hidden neighbors implied by the stack geometry.
- **Original template:** Build a 3-D block lattice in code; choose target blocks; correct answer = count of face-adjacent neighbors; distractors = ±1/±2 from true count. **Procedural with rendered isometric art.**

### 4.12 Aviation Information
- **Items/Time:** 20 items / 8 min (~24 sec each). 5 answer choices.
- **Format:** Incomplete statement or direct question + 5 options. Knowledge-based.
- **Content:** flight control surfaces (ailerons/elevator/rudder; primary vs. secondary controls), axes of motion (roll/pitch/yaw), aerodynamics (lift/drag/thrust/weight, stalls, adverse yaw), altitude types (indicated/true/pressure/density), aircraft components, FAA rules, aviation history/facts. Sources commonly point to the **FAA Pilot's Handbook of Aeronautical Knowledge (PHAK)** as the best study base.
- **Composite:** Pilot, ABM (rated-only relevance).
- **Difficulty:** Easy if you know aviation, hard if not; pure prior-knowledge recall.
- **Strategies:** Study FAA PHAK fundamentals; memorize control surfaces and axes; learn instrument and aerodynamics basics.
- **Original template:** Author fact-based stems across the content list with 5 options; distractors are plausible aviation terms in the wrong role.

---

## 5. Procedural-Generation vs. Authored-Content Analysis (for the App)

This is the core build-planning question. Classification rationale per subtest:

**Strongly procedural (deterministic rules; an algorithm can generate unlimited fresh, correct items):**
- **Table Reading — PURE procedural.** Generate a random labeled grid; pick (X,Y); the answer is deterministic; distractors are neighboring cells. Trivial to generate and auto-grade. *Highest ROI for code generation.*
- **Block Counting — procedural + rendering.** Generate a 3-D lattice; adjacency counts are deterministic. Requires an isometric/3-D renderer, but logic and answer key are fully algorithmic.
- **Instrument Comprehension — procedural + rendering.** Randomize attitude/heading parameters; render the two dials and the four silhouettes from those parameters; correct answer is deterministic. Needs vector art but no human item-writing.
- **Math Knowledge — procedural.** Parameterized templates (linear/quadratic equations, geometric formulas, exponent/radical simplification) with constraints for clean answers; distractors from canonical error patterns. Some item *types* (proofs, "which statement is false") need authored scaffolds, so call it ~90% procedural.
- **Arithmetic Reasoning — procedural-hybrid.** Numeric scenarios are easy to parameterize, but the **natural-language framing** needs templated prose to read naturally. Logic/answers procedural; wording semi-authored. ~75% procedural.

**Authored (require curated human content, domain facts, judgment, or language nuance):**
- **Word Knowledge — authored.** Needs a curated synonym bank with sense-disambiguated distractors. Could be semi-automated from a thesaurus + frequency list, but quality control is human. Hybrid-leaning-authored.
- **Verbal Analogies — authored-hybrid.** The *structure* is templatable ("A:B::C:?"), but valid relationships and clean distractors require a curated word-pair knowledge base. Generation is possible from a relationship-tagged lexicon, but human review is essential.
- **Reading Comprehension — authored.** Passages must be written (or sourced as original/public-domain) and questions hand-crafted; not meaningfully procedural. (LLM-assisted authoring + human edit is the realistic path.)
- **Aviation Information — authored.** Fact-based; requires a curated question bank grounded in FAA PHAK content. Facts are finite, so a fixed authored bank is the right model.
- **Physical Science — authored.** Curated conceptual question bank across physics/chem/earth science.
- **Situational Judgment — authored.** Requires scenario writing + a defensible "consensus" key; cannot be auto-generated credibly.
- **Self-Description Inventory — authored but trivial.** Generate Likert trait statements; no scoring key needed (non-scored).

**Build recommendation:** Prioritize a procedural engine for **Table Reading, Block Counting, Instrument Comprehension, Math Knowledge, Arithmetic Reasoning** (these also include the four rated-composite spatial/quant subtests, maximizing value for pilot/CSO/ABM users), and an **authored content bank** (LLM-assisted + human-reviewed, original only) for the verbal/knowledge/judgment subtests.

---

## 6. Composite Scores — Exact Subtest Mapping

Per the **official AFPC Information Pamphlet (Table 1, "Construction of AFOQT Composites")**. Six composites; rated composites in **bold**.

| Composite | Subtests that feed it | Minimum required score |
|-----------|----------------------|------------------------|
| **Pilot** | Math Knowledge, Table Reading, Instrument Comprehension, Aviation Information | 25 (rated/pilot) |
| **CSO (Combat Systems Officer)** | Word Knowledge, Math Knowledge, Table Reading, Block Counting | 25 (for CSO track); 10 (for pilot applicants' secondary minimum) |
| **ABM (Air Battle Manager)** | Verbal Analogies, Math Knowledge, Table Reading, Instrument Comprehension, Block Counting, Aviation Information | 25 (ABM track) |
| Academic Aptitude | Verbal Analogies, Arithmetic Reasoning, Word Knowledge, Math Knowledge, Reading Comprehension | None |
| Verbal | Verbal Analogies, Word Knowledge, Reading Comprehension | 15 (all officers) |
| Quantitative | Arithmetic Reasoning, Math Knowledge | 10 (all officers) |

**Not in any composite:** Physical Science, Situational Judgment, Self-Description Inventory.

**Key observations:**
- **Math Knowledge** is the single highest-leverage subtest (5 of 6 composites).
- **Table Reading** feeds all three rated composites (Pilot, CSO, ABM).
- **Academic Aptitude** = the union of Verbal + Quantitative subtests.

> **Flag (common error in secondary sources):** Many prep sites give **Form S–era** mappings (e.g., "Pilot = Instrument Comprehension + Aviation Information + Arithmetic Reasoning," or "Navigator-Technical with General Science"). The authoritative Form T mapping is the table above from the AFPC pamphlet. Also note AFOQTGuide states that although six composites are computed, examinees historically received **five** on their report because **ABM was not released** to the candidate; community reports in 2026 show some candidates seeing all six (Pilot/CSO/ABM/Academic/Verbal/Quant). Verify against your current score report.

---

## 7. Scoring System & Percentiles

- **Number-correct scoring; NO guessing penalty.** Your score is based only on correct answers; you lose nothing for wrong guesses. **Always answer every item.**
- **Raw → percentile:** Each subtest raw score (number correct) is combined into composite raw scores, then converted via normative tables to a **percentile (1–99)** relative to a reference/normative sample. A composite of 85 means you scored as well as or better than 85% of the normative group. Internally, raw scores are standardized (commercial descriptions cite a mean-50/SD-10 standard-score step) before percentile conversion; the **exact composite weighting is proprietary/confidential**.
- **Important percentile caveat (from AFROTC guidance):** Because scores are percentiles, a low number does **not** mean you missed that fraction of questions. Per AFROTC (Rutgers): *"Many examinees (approximately 1 in 100) will receive a Quant score of 1, even though nearly all of these examinees would have answered much more than 1% of the math questions correctly."* Percentiles compress a narrow raw-score band at the extremes.
- **Score validity:** Commonly cited as valid **for life / indefinitely** by several sources; UCMJ cites a 5-year validity in some contexts. **Flag conflict** — confirm with the accessions source, since validity may depend on the score version accepted by the current board.

---

## 8. Score Requirements & Selection Rules

**Universal minimums (all officer candidates, rated and non-rated), per DAFMAN 36-2664:**
- **Verbal ≥ 15** and **Quantitative ≥ 10.** Miss either and no board can consider you, regardless of GPA or flight hours.

**Rated minimums:**
- **Pilot:** Pilot ≥ 25 **and** CSO ≥ 10.
- **CSO:** CSO ≥ 25 (with Pilot ≥ 10 cited by some sources as the paired minimum).
- **ABM:** ABM ≥ 25.

**The "combined Pilot + CSO ≥ 50" rule (verify by component):** This legacy rule (from AFI 36-2605) required pilot applicants to have Pilot ≥ 25, CSO ≥ 10, **and** a combined Pilot + Nav/CSO total ≥ 50. Per a 2026 prep source, **DAFMAN 36-2664 (17 Jan 2025) removed the combined-50 threshold at the active-duty/AFRC level**, but **many Air National Guard and Air Force Reserve rated units still enforce the legacy combined-50 rule**. **Flag:** treat the combined-50 as unit-dependent; confirm with the specific board. (Other sources still cite combined-50 as active — genuine disagreement reflecting the transition.)

**Competitive (not minimum) scores:** Minimums merely make you eligible. Community/detachment reporting (BogiDope, r/airforceOTS) indicates competitive rated selectees commonly sit at **Pilot ~70th percentile or higher**, with top packages clustering **90+**. The commissioning-minimum pass rate (Verbal 15 / Quant 10) is high (~85–95% clear on first attempt per prep-source estimates).

---

## 9. PCSM, TBAS, and How the AFOQT Pilot Composite Fits

**PCSM (Pilot Candidate Selection Method)** is a single **1–99 percentile** score predicting pilot/RPA training success. Per AFPC, it combines three inputs:
1. **AFOQT Pilot composite** (superscored — see §10),
2. **TBAS (Test of Basic Aviation Skills)** performance, and
3. **Documented flying hours** (FAA-loggable; dual instruction counts; simulator time does not).

- **TBAS** is a separate ~1 h 15 min computerized **psychomotor / spatial / multi-tasking** battery (joystick, rudder pedals, headphones), administered on dedicated hardware. It has **nine subtests**, per the official AFPC PCSM page (access.afpc.af.mil/pcsmdmz/TBASInfo.html): *"Detailed instructions for each of the nine subtests will appear on the computer screen."* The DTIC validation report (Carretta, ADA442563) names them: 3-Digit Listening, 5-Digit Listening, Airplane Tracking, Horizontal Tracking, combined AHTT, AHTT3, AHTT5, Emergency Scenario, and UAV Test. TBAS scores are never reported directly and are **not superscored** (a worse retake becomes your new PCSM input). You must have taken the AFOQT (or EPQT) first or PCSM won't compute. Per AFROTC guidance, **three TBAS attempts** are allowed, ≥90 days apart.
- **PCSM algorithm:** proprietary/confidential. Updated in 2013 ("PCSM 2.0") to weight **flight hours much more heavily**; per OpenExamPrep's 2026 guide citing DAFMAN 36-2664 §3.8.2, the flight-hour component is **capped at 41 hours** (*"Logged civilian flight hours (FAA-loggable) — capped at 41 hours in the PCSM algorithm. Logging a 42nd hour yields zero additional PCSM points"*), and ~70 is roughly the ceiling achievable with zero flight time. Earlier (pre-2013) the algorithm weighted flight hours lightly (≤10 points at 201+ hours).
- **No minimum PCSM** is set Air-Force-wide, though some Guard/Reserve units set their own floors; competitive pilot boards commonly see **PCSM ≥ 60, top tier 85+** (community reporting). PCSM is **rated-only** (non-rated applicants skip TBAS/PCSM).

---

## 10. Retake, Superscore & Attempt Rules

- **Lifetime attempts:** **2** for most applicants; a **3rd requires an AFPC waiver** (documented qualifying reason such as completing a relevant college course; request via AFPC Testing, 1-800-525-0102 / haf.portal@us.af.mil).
- **Waiting period:** **150 days** between attempts for general applicants. **AFROTC cadets: 90 days** per **AFROTCI 36-2011V3** (cadets get **up to 3 attempts**; first attempt by end of first term in program; any 3rd attempt by end of Fall of the AS300/junior year). **Flag conflict:** some sources cite 90 days generally, and an outlier cites 180 days; Study.com and most sources say 150 days for general applicants. **Best reading:** **150 days general / 90 days AFROTC cadets.** Confirm with your TCO.
- **Superscoring (current policy):** Per **DAFMAN 36-2664** (and an AFGM to the former AFMAN 36-2664), the Air Force now uses your **highest composite score from ANY administration** as the score of record — composites **can be mixed across sittings**. Example: Pilot 85 (attempt 1) + Verbal 72 (attempt 2) → both kept. This **replaced** the old "most-recent-score-wins" rule. *Strategic implication:* once a composite is strong, retakes should target only the weak composites.
- **Reporting:** All attempts remain visible in your record; boards typically use the superscore/most-recent, but evaluators **can see prior attempts**. (Some sources still describe "most recent score used" — this reflects the pre-superscore regime; superscore is current.)

---

## 11. Test Logistics

- **Total seat time:** ~**5 hours** including check-in, instructions, and breaks. **Testing (answering) time:** ~**3 h 36 min** (paper pamphlet) / ~**3 h 23 min** (Pearson VUE eAFOQT figure, per Mometrix).
- **Breaks (paper schedule):** the official schedule has a **10-min break after Reading Comprehension** (mid Part A) and a **15-min break between Part A and Part B**, plus ~15 min of demographics and pretest activities. The eAFOQT commonly includes a **15-min break after Situational Judgment, before the Self-Description Inventory**.
- **Delivery:** Transitioning from **paper-and-pencil (Scantron, pencil)** to **computer-based eAFOQT via Pearson VUE**. Both still exist depending on site. AFROTC cadets often test at their detachment on cadre dates; others test at **Pearson VUE third-party centers** (or MEPS/base education centers).
- **Registration:** You **cannot self-register**; a recruiter, ROTC detachment, or accession source provides a **voucher/authorization code**; you then schedule at Pearson VUE. Government photo ID required; some centers use palm-vein check-in (limited PII).
- **Cost:** **Free** to the candidate.
- **Calculators:** **NOT permitted.** Scratch paper provided; some common formulas appear in the booklet. (A Reddit anecdote notes a Pearson center mistakenly almost issued a calculator — it is not allowed.) No personal electronics; phones/watches/tablets prohibited per the official AFPC "What to Expect" briefing.
- **Answer choices:** 4 or 5 per item (varies by subtest). **No guessing penalty.**
- **eAFOQT mechanics:** click-to-answer (faster than bubbling); hotkeys for next/previous; **Table Reading is fully on-screen** (no printout). Scores typically post in **2–3 business days** (some report Wednesday→Friday).

---

## 12. Recommendations (for Planning the Prep App)

**Stage 1 — Build the procedural engine first (highest ROI, infinite fresh items, auto-grading):**
1. **Table Reading** (pure algorithmic grid generator) — ship first; trivial and high-value.
2. **Math Knowledge** + **Arithmetic Reasoning** (parameterized templates with clean-answer constraints and error-pattern distractors).
3. **Block Counting** and **Instrument Comprehension** (algorithmic logic + a vector/isometric renderer). These complete the rated-composite spatial set.

**Stage 2 — Authored banks (original content only; LLM-assisted + human review):**
4. **Word Knowledge** (curated synonym/distractor bank), **Verbal Analogies** (relationship-tagged lexicon + template), **Reading Comprehension** (original/public-domain passages), **Aviation Information** (FAA PHAK-grounded facts), **Physical Science** (conceptual bank), **Situational Judgment** (scenario bank + consensus key), **Self-Description Inventory** (non-scored Likert generator).

**Stage 3 — Scoring & UX modeling:**
5. Implement **number-correct scoring, no guessing penalty**, strict **per-subtest timers** matching Form T (this is the single biggest realism factor — speed is the test), and a **composite-mapping layer** (§6) that shows users which subtests drive their target composite. Surface **Math Knowledge** and **Table Reading** as priority drills for rated users.
6. Report results as **percentile-style composites** with an explicit disclaimer that true percentiles require the AF normative sample (your app can only show relative-to-your-own-history or a synthetic norm).
7. Add a **superscore simulator** (best composite across attempts) and a **PCSM explainer** (Pilot composite + TBAS + flight hours) for rated users — but make clear TBAS/PCSM are administered separately and the algorithm is proprietary.

**Benchmarks/thresholds that should change the plan:**
- If the user base is **rated-track heavy**, weight build effort toward the procedural spatial/quant subtests and Aviation Information.
- If **non-rated**, prioritize Verbal Analogies, Word Knowledge, Reading Comprehension, Arithmetic Reasoning, Math Knowledge (the Verbal + Quant + Academic composites).
- If you can only verify one official fact before launch, **confirm the current per-subtest timing and the eAFOQT item counts directly from Pearson VUE / your detachment TCO**, since paper vs. computer schedules differ.

---

## 13. Caveats, Conflicts & Uncertainties

- **Total item count:** 470 vs 516 vs 550. **Resolution:** paper pamphlet schedule = **550**; current eAFOQT (Pearson VUE) = **516** (Situational Judgment reduced 50→16); **470 is an unsupported error.** Use 516 for current test-takers.
- **Situational Judgment item count:** 50 (paper) vs 16 (eAFOQT). Both are real; depends on delivery mode.
- **Reading Comprehension time:** 38 min (official pamphlet) vs 24 min (several commercial sources). Flagged; the pamphlet is authoritative for paper, but eAFOQT timing may differ.
- **Retake interval:** 150 days (general) vs 90 days (AFROTC cadets, AFROTCI 36-2011V3) vs an outlier 180-day claim. Use 150/90.
- **Combined Pilot+CSO ≥ 50 rule:** reportedly removed at active-duty/AFRC level by DAFMAN 36-2664 (Jan 2025) but **still enforced by many ANG/AFRC units**. Verify per board.
- **Composites released to candidate:** historically 5 (ABM withheld); some 2026 reports show all 6. Verify on current score report.
- **Score validity:** "lifetime/indefinite" vs "5 years" — conflicting; depends on accepted score version. Confirm with accessions.
- **"Form T introduced 2023 / Reading Block" claim** (practicetestgeeks): **not corroborated**; official Form T date is **Aug 1, 2014** with subtest "Reading Comprehension." Treat as unreliable.
- **AFRL citation number:** the "10 cognitive + 2 non-cognitive, 9 feeding composites" characterization is verified in a DTIC AFRL report (AD1157021, cleared AFRL-2022-0175); a blog's "AFRL-2022-3233" number could not be matched (likely a typo) — the substance is sound.
- **Composite weighting & PCSM algorithm:** proprietary/confidential; any weighting claim by a prep site is inference, not official.
- **Source quality:** Official anchors (AFPC pamphlet, Pearson VUE, DAFMAN 36-2664, AFROTCI 36-2011V3, AFPC PCSM/TBAS pages, AFRL/DTIC) are authoritative. Commercial prep sites (BogiDope, AFOQTGuide, Mometrix, Peterson's, iPREP, JobTestPrep, practicetestgeeks, open-exam-prep) are useful for format/strategy but contain Form-S residue and occasional errors; treated as corroboration only.

---

## 14. Sources / References

**Authoritative / official:**
- AFPC **AFOQT Information Pamphlet (AFPT-997)**, Form T (effective 1 Aug 2014; updated 1 Aug 2015) — composite construction (Table 1), testing schedule (Table 2), directions, sample-item formats, no-guessing-penalty statement. (Hosted: afrotc.rutgers.edu; airforce.com; usf.edu.)
- **Pearson VUE — AFOQT** (pearsonvue.com/us/en/afoqt.html) — current eAFOQT 516-item count, Situational Judgment as 16 questions, logistics, ID/voucher policy.
- **DAFMAN 36-2664, Personnel Assessment Program** — minimum scores, superscoring, retake policy, PCSM §3.8.2 (e-publishing.af.mil).
- **AFROTCI 36-2011V3** — cadet attempt limits and 90-day interval.
- **AFPC PCSM / TBAS pages** (access.afpc.af.mil/pcsmdmz) — PCSM components, TBAS nine-subtest description.
- **AFRL technical report (DTIC AD1157021, cleared AFRL-2022-0175, AFRL-RH-WP-TR-2021-0080)** — Form T = 10 cognitive + 2 non-cognitive subtests; 9 cognitive feed composites; SJT psychometrics ("relatively easy").
- **TBAS validation report (DTIC ADA442563, Carretta)** — names the nine TBAS subtests.
- **AFROTC (Rutgers det.) AFOQT page** — raw-to-percentile explanation, superscore, minimums.
- **PMC/NIH — Lentz et al., *Military Psychology* (PMC10790796)** — SJT development, survey of 4,436 officers, seven officership competencies, 2015 implementation.

**Commercial / corroborating (format & strategy; flagged for Form-S residue):**
- BogiDope (AFOQT Explained Parts 1–2; PCSM Parts 1–2), AFOQTGuide.com (per-subtest study guides & format), Mometrix (3 h 23 min / 516 figure), Peterson's (verbal-analogy relationship categories), iPREP, JobTestPrep, practicetestgeeks, open-exam-prep (PCSM 41-hour cap, super-scoring), Study.com (retake policy, 550 figure), UCMJ.us, Frontline-Forge, AFOQTPractice.com.

*End of dossier.*
