// Arithmetic Reasoning — percentages cartridge.  P = W × R ÷ 100.
//
// Per research/ArithmeticReasoning_Spec.md §9 (roadmap: percentages after RTD)
// and §4.2/§4.4/§6 (the patterns). SELF-CONTAINED cartridge (§5, mirroring MK
// §2.2): it exposes generate(difficulty), the correct answer, distractors(...),
// and explain(...), and owns its OWN error-pattern catalog with zero shared
// distractor code (§4.4). It depends only on AR's cleanAnswer.js — the §4.2
// clean-answer guard, NOT distractor logic.
//
// Clean answer by construction (§4.2/§6): pick a percent R as a multiple of 5
// and a whole W as a multiple of 20 FIRST, then COMPUTE the part P = W × R ÷ 100.
// Because W is a multiple of 20 and R a multiple of 5, W×R is always a multiple
// of 100, so P is an exact integer — and the two derived forms recover clean
// integers too:
//     part:    give R, W → answer P = W×R/100
//     percent: give P, W → answer R = 100×P/W   (= the picked R, exact)
//     whole:   give P, R → answer W = 100×P/R   (= the picked W, exact)
// Never pick all three independently and hope. The draw is also constrained so
// the answer is never equal to either given quantity (no leak / ambiguity).
//
// AR-new layer (§4.1): pre-authored prose variants per form with light real-world
// contexts, filled from the generated numbers. No runtime AI. The prompt never
// states the asked quantity (a "percent" item never prints the percent, etc.).
//
// Distractors (§4.4): percentage errors are about WRONG BASE / WRONG OPERATION /
// percent slips on the right numbers. Two always-integer genuine error patterns
// are guaranteed per form; the set is filled to four with farthest-point,
// spread-matched fillers. Option position is randomized per item by the engine.

(function (root) {
  // Resolve the shared clean-answer guard from Node or the browser global.
  var cleanAnswer;
  if (typeof module !== "undefined" && module.exports) {
    cleanAnswer = require("./cleanAnswer.js");
  } else {
    cleanAnswer = root.ArithmeticReasoning.cleanAnswer;
  }

  // --- difficulty -> number ranges -----------------------------------------
  // FLAG AR-F-1 (§6, §8): this mapping is an UNVALIDATED DEFAULT, pending
  // cadet-tester feedback — carried as a knob, not asserted as AFOQT-accurate.
  // Every percent is a multiple of 5 and every whole a multiple of 20 (wholeMult
  // × 20), which is what guarantees clean-integer answers in all three forms.
  // Easier tiers = rounder percents / smaller wholes; harder = wider sets.
  var RANGES = {
    easy:   { percents: [10, 20, 25, 50, 75],                                      wholeMult: [1, 5]  }, // wholes 20–100
    medium: { percents: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80],               wholeMult: [2, 10] }, // wholes 40–200
    hard:   { percents: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 90], wholeMult: [3, 20] }, // wholes 60–400
  };

  // Solve forms: which quantity the item asks for (§6 analogue).
  var FORMS = ["part", "percent", "whole"];

  // Prose variants — 3 phrasings per form (§4.1) with light real-world contexts,
  // so repeats don't read identically. Each template references ONLY the two
  // given quantities for its form, never the asked one (no answer leak).
  var TEMPLATES = {
    part: [
      "A class of {whole} students took an exam, and {percent}% of them passed. How many students passed?",
      "A store stocks {whole} items, and {percent}% of them are on sale. How many items are on sale?",
      "In a survey of {whole} people, {percent}% said they exercise daily. How many people said they exercise daily?",
    ],
    percent: [
      "A student answered {part} of {whole} questions correctly. What percent of the questions did the student get right?",
      "A team won {part} of its {whole} games. What percent of its games did the team win?",
      "Of {whole} seats in a theater, {part} were filled. What percent of the seats were filled?",
    ],
    whole: [
      "A student answered {part} questions correctly, which was {percent}% of the test. How many questions were on the test?",
      "{part} people in a town own a bicycle, which is {percent}% of the population. How many people live in the town?",
      "A shopper paid {part} dollars in tax, which was {percent}% of the purchase price. What was the purchase price, in dollars?",
    ],
  };

  function normalizeDifficulty(d) {
    if (d === 1 || d === "easy") return "easy";
    if (d === 2 || d === "medium") return "medium";
    if (d === 3 || d === "hard") return "hard";
    return "easy"; // default
  }

  // --- small rng helpers (self-contained; not shared with other cartridges) --
  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }
  function pickFrom(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  // --- display formatting (real minus signs, like the other cartridges) ------
  function fmt(n) { return String(n).replace("-", "−"); }

  function buildPrompt(form, vals, rng) {
    var variants = TEMPLATES[form];
    var tpl = variants[Math.floor(rng() * variants.length)];
    return tpl
      .replace(/{whole}/g, fmt(vals.whole))
      .replace(/{percent}/g, fmt(vals.percent))
      .replace(/{part}/g, fmt(vals.part));
  }

  // The two quantities a form GIVES (and may show in the prompt). The asked
  // quantity is the remaining one — never printed.
  function givensFor(form, part, whole, percent) {
    if (form === "percent") return [part, whole];
    if (form === "whole") return [part, percent];
    return [whole, percent]; // part
  }

  // A draw is valid iff all three pieces and the answer are clean integers, the
  // asked form is exactly divisible (assert-by-construction), and the answer is
  // not equal to either given (no leak / ambiguity).
  function validDraw(part, whole, percent, form, answer) {
    if (!cleanAnswer.isCleanInteger(part) ||
        !cleanAnswer.isCleanInteger(whole) ||
        !cleanAnswer.isCleanInteger(percent) ||
        !cleanAnswer.isCleanInteger(answer)) return false;
    if (form === "part" && !cleanAnswer.isExactlyDivisible(whole * percent, 100)) return false;
    if (form === "percent" && !cleanAnswer.isExactlyDivisible(100 * part, whole)) return false;
    if (form === "whole" && !cleanAnswer.isExactlyDivisible(100 * part, percent)) return false;
    var g = givensFor(form, part, whole, percent);
    if (answer === g[0] || answer === g[1]) return false;
    return true;
  }

  // --- generate(difficulty) -> one problem (§6 analogue) --------------------
  // options (optional): { rng, percent, whole, part, form } — forcing fields for
  // deterministic tests. Provide any two of percent/whole/part to pin the
  // numbers; form pins the asked quantity; omit for the normal random draw.
  function generate(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var level = normalizeDifficulty(difficulty);
    var R = RANGES[level];

    var hasP = options.percent !== undefined;
    var hasW = options.whole !== undefined;
    var hasPart = options.part !== undefined;
    // "Fully pinned" = two of three numbers forced, so the triple is determined;
    // honor it exactly (skip the redraw). One-or-zero forced still redraws.
    var fullyPinned = (hasP ? 1 : 0) + (hasW ? 1 : 0) + (hasPart ? 1 : 0) >= 2;

    var percent, whole, part, form, answer;
    var attempts = 0;
    do {
      // Resolve the triple, honoring whichever fields are forced.
      percent = hasP ? options.percent : pickFrom(R.percents, rng);
      whole = hasW ? options.whole : 20 * randInt(R.wholeMult[0], R.wholeMult[1], rng);
      if (hasPart && hasW) { part = options.part; percent = 100 * part / whole; }
      else if (hasPart && hasP) { part = options.part; whole = 100 * part / percent; }
      else if (hasPart) { part = options.part; whole = 100 * part / percent; } // part + random percent
      else { part = whole * percent / 100; }

      form = options.form !== undefined ? options.form
                                        : FORMS[Math.floor(rng() * FORMS.length)];
      // The asked quantity is recovered from the other two — exact by construction.
      if (form === "percent") answer = 100 * part / whole;       // = percent
      else if (form === "whole") answer = 100 * part / percent;  // = whole
      else { form = "part"; answer = part; }                     // = part (default)

      attempts++;
    } while (!fullyPinned && !validDraw(part, whole, percent, form, answer) && attempts < 200);

    return {
      cartridge: "pct",
      difficulty: level,
      part: part, whole: whole, percent: percent,
      form: form,
      answer: answer,            // correct answer (§5), clean by construction
      prompt: buildPrompt(form, { part: part, whole: whole, percent: percent }, rng),
    };
  }

  // --- distractors(problem) -> 4 wrong options (§4.4) ------------------------
  // Returns [{ value, kind, pattern }] of length 4: kind is "error" (a genuine
  // percentage mistake on THIS item) or "filler" (spread-matched near-miss). The
  // candidate list per form leads with two ALWAYS-INTEGER genuine errors, so the
  // >= 2 real-pattern floor holds regardless of which optional patterns land
  // clean. Every value is forced to a clean integer, distinct from the answer and
  // each other, by the same filter the other cartridges use.
  function distractors(problem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var part = problem.part, whole = problem.whole, percent = problem.percent, form = problem.form;
    var correct = problem.answer;
    var div = cleanAnswer.isExactlyDivisible;

    var candidates;
    if (form === "part") {
      // answer = part = whole × percent ÷ 100; givens whole, percent.
      candidates = [
        { value: percent,      pattern: "used-percent-as-answer" }, // answered the percent number
        { value: 10 * correct, pattern: "decimal-slip" },           // ÷10 instead of ÷100
      ];
      candidates.push({ value: whole * (percent + 5) / 100, pattern: "percent-step" }); // neighbor percent up
      if (percent > 5) candidates.push({ value: whole * (percent - 5) / 100, pattern: "percent-step" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    } else if (form === "percent") {
      // answer = percent; givens part, whole.
      candidates = [
        { value: correct + 5,   pattern: "percent-step" },  // neighbor percent up
        { value: 100 - correct, pattern: "complement" },    // the "didn't" percent
      ];
      if (correct > 5) candidates.push({ value: correct - 5, pattern: "percent-step" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (div(100 * whole, part)) candidates.push({ value: 100 * whole / part, pattern: "inverted-ratio" }); // swapped part/whole
    } else {
      // whole: answer = whole = 100 × part ÷ percent; givens part, percent.
      candidates = [
        { value: part,         pattern: "answered-part" },   // gave the part, not the whole
        { value: 2 * correct,  pattern: "scaled-wrong" },    // doubled the whole
      ];
      if (div(part * percent, 100)) candidates.push({ value: part * percent / 100, pattern: "wrong-operation" }); // took percent OF the part
      if (div(100 * part, percent + 5)) candidates.push({ value: 100 * part / (percent + 5), pattern: "percent-step" });
      if (percent > 5 && div(100 * part, percent - 5)) candidates.push({ value: 100 * part / (percent - 5), pattern: "percent-step" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    }

    var errors = [];
    var used = {};
    used[correct] = true;
    for (var i = 0; i < candidates.length && errors.length < 3; i++) {
      var v = candidates[i].value;
      if (!cleanAnswer.isCleanInteger(v)) continue; // forced clean (§4.2/§4.4)
      if (v <= 0) continue;                          // a count/percent must be positive
      if (used[v]) continue;                         // distinct from answer and each other
      used[v] = true;
      errors.push({ value: v, kind: "error", pattern: candidates[i].pattern });
    }

    // Fill to 4 with spread-matched fillers. The error values set the spread;
    // fillers are placed by farthest-point insertion so they break the largest
    // gaps rather than hug the answer — no clustering tell.
    var need = 4 - errors.length;
    var anchors = [correct];
    for (var e = 0; e < errors.length; e++) anchors.push(errors[e].value);
    var fillerValues = farthestPointFill(anchors, used, need, rng);
    var fillers = fillerValues.map(function (val) {
      return { value: val, kind: "filler", pattern: "near-miss" };
    });

    return errors.concat(fillers);
  }

  // Choose `need` integer fillers that maximize spread. Anchors are the values
  // already in play (answer + error distractors); `used` is a set of all values
  // taken so far. Each pick is the in-range integer farthest from every taken
  // value (ties broken by rng), which avoids hugging the answer and minimizes
  // the largest gap. Cartridge-LOCAL copy (§4.4 — no shared distractor code).
  function farthestPointFill(anchors, used, need, rng) {
    var lo = Math.min.apply(null, anchors);
    var hi = Math.max.apply(null, anchors);
    // Guarantee enough room for distinct, well-separated fillers: a span of at
    // least 6 yields >= 7 integer slots for at most 5 options.
    var span = hi - lo;
    if (span < 6) {
      var deficit = 6 - span;
      var down = Math.ceil(deficit / 2);
      lo -= down;
      hi += deficit - down;
    }
    if (lo < 1) { hi += (1 - lo); lo = 1; } // keep fillers positive (counts/percents)

    var takenList = anchors.slice();
    var picks = [];
    for (var k = 0; k < need; k++) {
      var bestDist = -1, ties = [];
      for (var v = lo; v <= hi; v++) {
        if (used[v]) continue;
        var minDist = Infinity;
        for (var tk = 0; tk < takenList.length; tk++) {
          var dd = Math.abs(v - takenList[tk]);
          if (dd < minDist) minDist = dd;
        }
        if (minDist > bestDist) { bestDist = minDist; ties = [v]; }
        else if (minDist === bestDist) { ties.push(v); }
      }
      var choice = ties[Math.floor(rng() * ties.length)];
      picks.push(choice);
      used[choice] = true;
      takenList.push(choice);
    }
    return picks;
  }

  // --- explain(problem) -> one-line method (untimed practice feedback, §6) ---
  // The cartridge owns the math, so it owns the explanation; the shared engine
  // stays math-free. About the ITEM, not the person.
  function explain(problem) {
    var part = fmt(problem.part), whole = fmt(problem.whole), percent = fmt(problem.percent);
    if (problem.form === "percent")
      return "Percent = part ÷ whole × 100 = " + part + " ÷ " + whole + " × 100 = " + percent + "%.";
    if (problem.form === "whole")
      return "Whole = part ÷ percent × 100 = " + part + " ÷ " + percent + " × 100 = " + whole + ".";
    return "Part = whole × percent ÷ 100 = " + whole + " × " + percent + " ÷ 100 = " + part + ".";
  }

  var cartridge = {
    id: "pct",
    name: "Percentages",
    RANGES: RANGES,
    generate: generate,
    distractors: distractors,
    explain: explain,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = cartridge;
  } else {
    root.ArithmeticReasoning = root.ArithmeticReasoning || {};
    root.ArithmeticReasoning.percentages = cartridge;
  }
})(typeof window !== "undefined" ? window : this);
