// Arithmetic Reasoning — rate/time/distance cartridge.  d = r × t.
//
// Per research/ArithmeticReasoning_Spec.md §6 (first AR cartridge). This is a
// SELF-CONTAINED cartridge (§5, mirroring MK §2.2): it exposes
// generate(difficulty), the correct answer, distractors(...), and explain(...),
// and it owns its OWN error-pattern catalog with zero shared distractor code
// (§4.4). It depends only on AR's cleanAnswer.js — the §4.2 clean-answer guard,
// NOT distractor logic.
//
// Clean answer by construction (§6): pick integer r (speed) and integer t
// (time) FIRST, then COMPUTE d = r × t. Whichever variable the item asks for is
// derived from the other two, so every division is exact and the answer is
// always a clean integer — never pick d, r, t independently and hope.
//
// AR-new layer (§4.1): a small set of pre-authored prose variants per solve form
// plus a noun bank, filled from the generated numbers. No runtime AI.
//
// Distractors (§4.4): AR errors are about CHOOSING THE WRONG OPERATION on the
// right numbers (wrong op, off-by-one factor, doubled/halved, combined). Two
// always-integer genuine error patterns are guaranteed per form; the set is
// filled to four with farthest-point, spread-matched fillers. Option position is
// randomized per item by the engine.

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
  // `medium` IS the v1 canonical band from §6 (r 30–75 mph, t 2–9 h, integers,
  // units miles / hours / mph); easy/hard just narrow/widen around it.
  var RANGES = {
    easy:   { r: [30, 50], t: [2, 5]  },
    medium: { r: [30, 75], t: [2, 9]  },
    hard:   { r: [30, 90], t: [2, 12] },
  };

  // Solve forms: which variable the item asks for (§6). d is built as r*t, so
  // each derived answer is an exact integer.
  var FORMS = ["speed", "distance", "time"];

  // Noun bank (§6): vehicles whose realistic speed covers the 30–75 mph band.
  // FLAG AR-F-4 (§8): banded nouns (cyclist/walker/aircraft) with their own
  // speed ranges are a later refinement.
  var NOUNS = ["car", "truck", "train", "bus", "van"];

  // Prose variants — 3 phrasings per form (§4.1) so repeated items don't read
  // identically. {noun}/{r}/{t}/{d} slots are filled from the generated numbers.
  var TEMPLATES = {
    speed: [
      "A {noun} travels {d} miles in {t} hours. What is its average speed in miles per hour?",
      "A {noun} covers {d} miles in {t} hours. What is its average speed in miles per hour?",
      "Over {t} hours, a {noun} travels {d} miles. What is its average speed in miles per hour?",
    ],
    distance: [
      "A {noun} travels at {r} miles per hour for {t} hours. How far does it travel, in miles?",
      "A {noun} drives at {r} miles per hour for {t} hours. How many miles does it cover?",
      "Moving at {r} miles per hour, a {noun} travels for {t} hours. How far does it go, in miles?",
    ],
    time: [
      "A {noun} covers {d} miles at {r} miles per hour. How many hours does the trip take?",
      "A {noun} travels {d} miles at {r} miles per hour. How many hours does the trip take?",
      "Driving at {r} miles per hour, a {noun} covers {d} miles. How many hours does the trip take?",
    ],
  };

  function normalizeDifficulty(d) {
    if (d === 1 || d === "easy") return "easy";
    if (d === 2 || d === "medium") return "medium";
    if (d === 3 || d === "hard") return "hard";
    return "easy"; // default
  }

  // --- small rng helper (self-contained; not shared with other cartridges) ---
  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  // --- display formatting (real minus signs, like the other cartridges) ------
  function fmt(n) { return String(n).replace("-", "−"); }

  function buildPrompt(form, vals, rng) {
    var variants = TEMPLATES[form];
    var tpl = variants[Math.floor(rng() * variants.length)];
    return tpl
      .replace(/{noun}/g, vals.noun)
      .replace(/{r}/g, fmt(vals.r))
      .replace(/{t}/g, fmt(vals.t))
      .replace(/{d}/g, fmt(vals.d));
  }

  // --- generate(difficulty) -> one problem (§6) -----------------------------
  // options (optional): { rng, r, t, form, noun } — r/t/form/noun force values
  // for deterministic tests; omit them for the normal random draw.
  function generate(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var level = normalizeDifficulty(difficulty);
    var R = RANGES[level];

    // Work backward (§6): choose r, t clean, then compute d = r * t.
    var r = options.r !== undefined ? options.r : randInt(R.r[0], R.r[1], rng);
    var t = options.t !== undefined ? options.t : randInt(R.t[0], R.t[1], rng);
    var d = cleanAnswer.solveDistance(r, t); // d = r * t, clean by construction

    var form = options.form !== undefined ? options.form
                                          : FORMS[Math.floor(rng() * FORMS.length)];
    var noun = options.noun !== undefined ? options.noun
                                          : NOUNS[Math.floor(rng() * NOUNS.length)];

    // Whichever variable is asked is recovered from the other two — always exact
    // because d was built as r*t.
    var answer;
    if (form === "speed") answer = cleanAnswer.solveSpeed(d, t);   // = r
    else if (form === "time") answer = cleanAnswer.solveTime(d, r); // = t
    else { form = "distance"; answer = cleanAnswer.solveDistance(r, t); } // = d

    return {
      cartridge: "rtd",
      difficulty: level,
      r: r, t: t, d: d,
      form: form,
      noun: noun,
      answer: answer,            // correct answer (§5), clean by construction
      prompt: buildPrompt(form, { r: r, t: t, d: d, noun: noun }, rng),
    };
  }

  // --- distractors(problem) -> 4 wrong options (§4.4) ------------------------
  // Returns [{ value, kind, pattern }] of length 4: kind is "error" (a genuine
  // word-problem mistake on THIS item) or "filler" (spread-matched near-miss).
  // The candidate list per form leads with two ALWAYS-INTEGER genuine errors, so
  // the >= 2 real-pattern floor holds regardless of which optional patterns land
  // clean. Every value is forced to a clean integer, distinct from the answer
  // and each other, by the same filter MK uses.
  function distractors(problem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var r = problem.r, t = problem.t, d = problem.d, form = problem.form;
    var correct = problem.answer;

    // Genuine error patterns in priority order. For each form the first two are
    // always integers and always distinct from the answer.
    var candidates;
    if (form === "speed") {
      // answer = r = d ÷ t
      candidates = [
        { value: d * t, pattern: "wrong-operation" }, // multiplied instead of divided
        { value: d - t, pattern: "combined" },        // subtracted instead of divided
      ];
      if (cleanAnswer.isExactlyDivisible(d, t - 1)) candidates.push({ value: cleanAnswer.solveSpeed(d, t - 1), pattern: "off-by-one" });
      if (cleanAnswer.isExactlyDivisible(d, t + 1)) candidates.push({ value: cleanAnswer.solveSpeed(d, t + 1), pattern: "off-by-one" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    } else if (form === "time") {
      // answer = t = d ÷ r
      candidates = [
        { value: d * r, pattern: "wrong-operation" }, // multiplied instead of divided
        { value: d - r, pattern: "combined" },        // subtracted instead of divided
      ];
      if (cleanAnswer.isExactlyDivisible(d, r - 1)) candidates.push({ value: cleanAnswer.solveTime(d, r - 1), pattern: "off-by-one" });
      if (cleanAnswer.isExactlyDivisible(d, r + 1)) candidates.push({ value: cleanAnswer.solveTime(d, r + 1), pattern: "off-by-one" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    } else {
      // distance: answer = d = r × t
      candidates = [
        { value: r + t,       pattern: "wrong-operation" }, // added instead of multiplied
        { value: (r + 1) * t, pattern: "off-by-one" },      // r off by one
      ];
      candidates.push({ value: r * (t - 1), pattern: "off-by-one" });    // t off by one
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    }

    var errors = [];
    var used = {};
    used[correct] = true;
    for (var i = 0; i < candidates.length && errors.length < 3; i++) {
      var v = candidates[i].value;
      if (!cleanAnswer.isCleanInteger(v)) continue; // forced clean (§4.2/§4.4)
      if (used[v]) continue;                        // distinct from answer and each other
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
    var r = fmt(problem.r), t = fmt(problem.t), d = fmt(problem.d);
    if (problem.form === "speed")
      return "Speed = distance ÷ time = " + d + " ÷ " + t + " = " + r + " mph.";
    if (problem.form === "time")
      return "Time = distance ÷ speed = " + d + " ÷ " + r + " = " + t + " hours.";
    return "Distance = speed × time = " + r + " × " + t + " = " + d + " miles.";
  }

  var cartridge = {
    id: "rtd",
    name: "Rate / time / distance",
    RANGES: RANGES,
    generate: generate,
    distractors: distractors,
    explain: explain,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = cartridge;
  } else {
    root.ArithmeticReasoning = root.ArithmeticReasoning || {};
    root.ArithmeticReasoning.rateTimeDistance = cartridge;
  }
})(typeof window !== "undefined" ? window : this);
