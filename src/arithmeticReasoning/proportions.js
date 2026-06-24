// Arithmetic Reasoning — proportions cartridge.  a : b = c : d.
//
// Per research/ArithmeticReasoning_Spec.md §9 (roadmap: proportions after RTD &
// percentages) and §4.2/§4.4/§6 (the patterns). SELF-CONTAINED cartridge (§5,
// mirroring MK §2.2): it exposes generate(difficulty), the correct answer,
// distractors(...), and explain(...), and owns its OWN error-pattern catalog with
// zero shared distractor code (§4.4). It depends only on AR's cleanAnswer.js — the
// §4.2 clean-answer guard, NOT distractor logic.
//
// Clean answer by construction (§4.2/§6): pick a base ratio a:b of small integers
// (a ≠ b) and an integer scale k ≥ 2 FIRST, then build the four terms
//     a,  b,  c = a×k,  d = b×k       so  a/b = c/d  and  a×d === b×c.
// Whichever term the item asks for is recovered by cross-multiply:
//     ask a → (b×c)/d   ask b → (a×d)/c   ask c → (a×d)/b   ask d → (b×c)/a
// Because every term is integer base × integer scale, each recovery is exact — the
// answer is always a clean integer. Never pick four numbers and hope. The draw is
// also constrained so the answer is never equal to any given term (no leak).
//
// AR-new layer (§4.1): pre-authored prose variants per unknown position, with a
// light recipe-scaling context filled from the generated numbers. No runtime AI.
// The prompt never states the asked quantity (an item solving for d never prints d).
//
// Distractors (§4.4): proportion errors are about ADDITIVE-instead-of-multiplicative
// reasoning, INVERTED ratios, off-by-one scale, and swapped terms — all on the right
// numbers. Two genuine integer error patterns are guaranteed per unknown position;
// magnitudes are kept bounded so no option is a far outlier. The set is filled to
// four with farthest-point, spread-matched fillers. Option position is randomized
// per item by the engine.

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
  // Base terms start at 2 (a 1 makes a term coincide with the scaled term and
  // weakens distractors); easier tiers = smaller base ratios & scales.
  var RANGES = {
    easy:   { base: [2, 6],  scale: [2, 4] },
    medium: { base: [2, 9],  scale: [2, 6] },
    hard:   { base: [2, 12], scale: [2, 9] },
  };

  // Which of the four terms the item asks for (§6 analogue).
  var ASKS = ["a", "b", "c", "d"];

  // Noun pairs (nounA per nounB). Recipe-scaling contexts where an arbitrary
  // integer ratio reads plausibly. FLAG AR-F-4 (§8): the generated ratio is not
  // constrained to a noun's real-world ratio; per-noun ratio realism is a later
  // refinement (mirrors RTD's noun-band flag).
  var NOUN_PAIRS = [
    { a: "cookies", b: "eggs" },
    { a: "pancakes", b: "cups of milk" },
    { a: "loaves", b: "cups of flour" },
    { a: "muffins", b: "bananas" },
    { a: "waffles", b: "eggs" },
  ];

  // Prose variants — 3 phrasings per unknown position (§4.1). Each template
  // references ONLY the three given terms for its ask, never the asked one.
  var TEMPLATES = {
    a: [
      "{c} {nounA} need {d} {nounB}. At the same rate, how many {nounA} can be made with {b} {nounB}?",
      "If {c} {nounA} use {d} {nounB}, how many {nounA} can {b} {nounB} make at the same rate?",
      "A baker uses {d} {nounB} for {c} {nounA}. At that rate, how many {nounA} can be made with {b} {nounB}?",
    ],
    b: [
      "{c} {nounA} need {d} {nounB}. At the same rate, how many {nounB} do {a} {nounA} need?",
      "If {c} {nounA} use {d} {nounB}, how many {nounB} do {a} {nounA} use at the same rate?",
      "A baker uses {d} {nounB} for {c} {nounA}. At that rate, how many {nounB} are needed for {a} {nounA}?",
    ],
    c: [
      "{a} {nounA} need {b} {nounB}. At the same rate, how many {nounA} can be made with {d} {nounB}?",
      "If {a} {nounA} use {b} {nounB}, how many {nounA} can {d} {nounB} make at the same rate?",
      "A baker uses {b} {nounB} for {a} {nounA}. At that rate, how many {nounA} can be made with {d} {nounB}?",
    ],
    d: [
      "{a} {nounA} need {b} {nounB}. At the same rate, how many {nounB} do {c} {nounA} need?",
      "If {a} {nounA} use {b} {nounB}, how many {nounB} do {c} {nounA} use at the same rate?",
      "A baker uses {b} {nounB} for {a} {nounA}. At that rate, how many {nounB} are needed for {c} {nounA}?",
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

  function buildPrompt(ask, vals, rng) {
    var variants = TEMPLATES[ask];
    var tpl = variants[Math.floor(rng() * variants.length)];
    return tpl
      .replace(/{a}/g, fmt(vals.a))
      .replace(/{b}/g, fmt(vals.b))
      .replace(/{c}/g, fmt(vals.c))
      .replace(/{d}/g, fmt(vals.d))
      .replace(/{nounA}/g, vals.nounA)
      .replace(/{nounB}/g, vals.nounB);
  }

  // Solve the proportion a/b = c/d for the asked term (cross-multiply).
  function solveFor(ask, a, b, c, d) {
    if (ask === "a") return b * c / d;
    if (ask === "b") return a * d / c;
    if (ask === "c") return a * d / b;
    return b * c / a; // ask d
  }

  // The three terms a form GIVES (and may show in the prompt). The asked term is
  // the remaining one — never printed.
  function givensFor(ask, a, b, c, d) {
    if (ask === "a") return [b, c, d];
    if (ask === "b") return [a, c, d];
    if (ask === "c") return [a, b, d];
    return [a, b, c]; // ask d
  }

  // A draw is valid iff the base ratio is non-trivial (a ≠ b), all four terms and
  // the answer are clean integers, the asked term is exactly divisible (assert-by-
  // construction), and the answer differs from every given term (no leak).
  function validDraw(a, b, c, d, ask, answer) {
    if (a === b) return false;
    if (!cleanAnswer.isCleanInteger(a) || !cleanAnswer.isCleanInteger(b) ||
        !cleanAnswer.isCleanInteger(c) || !cleanAnswer.isCleanInteger(d) ||
        !cleanAnswer.isCleanInteger(answer)) return false;
    if (ask === "a" && !cleanAnswer.isExactlyDivisible(b * c, d)) return false;
    if (ask === "b" && !cleanAnswer.isExactlyDivisible(a * d, c)) return false;
    if (ask === "c" && !cleanAnswer.isExactlyDivisible(a * d, b)) return false;
    if (ask === "d" && !cleanAnswer.isExactlyDivisible(b * c, a)) return false;
    var g = givensFor(ask, a, b, c, d);
    if (answer === g[0] || answer === g[1] || answer === g[2]) return false;
    return true;
  }

  // --- generate(difficulty) -> one problem (§6 analogue) --------------------
  // options (optional): { rng, ratioA, ratioB, scale, ask|form, noun } — forcing
  // fields for deterministic tests. Provide all of ratioA/ratioB/scale to pin the
  // numbers; ask (or form) pins the unknown position; omit for the random draw.
  function generate(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var level = normalizeDifficulty(difficulty);
    var R = RANGES[level];

    var hasA0 = options.ratioA !== undefined;
    var hasB0 = options.ratioB !== undefined;
    var hasK = options.scale !== undefined;
    // "Fully pinned" = the whole base ratio and scale forced, so the four terms
    // are determined; honor it exactly (skip the redraw).
    var fullyPinned = hasA0 && hasB0 && hasK;

    var a, b, c, d, ask, answer;
    var attempts = 0;
    do {
      var a0 = hasA0 ? options.ratioA : randInt(R.base[0], R.base[1], rng);
      var b0 = hasB0 ? options.ratioB : randInt(R.base[0], R.base[1], rng);
      var k = hasK ? options.scale : randInt(R.scale[0], R.scale[1], rng);
      a = a0; b = b0; c = a0 * k; d = b0 * k;
      ask = options.ask !== undefined ? options.ask
          : options.form !== undefined ? options.form
          : pickFrom(ASKS, rng);
      if (ASKS.indexOf(ask) === -1) ask = "d"; // default for an unknown value
      answer = solveFor(ask, a, b, c, d);
      attempts++;
    } while (!fullyPinned && !validDraw(a, b, c, d, ask, answer) && attempts < 200);

    var noun = options.noun !== undefined ? options.noun : pickFrom(NOUN_PAIRS, rng);
    return {
      cartridge: "prop",
      difficulty: level,
      a: a, b: b, c: c, d: d,
      ask: ask,
      nounA: noun.a, nounB: noun.b,
      answer: answer,            // correct answer (§5), clean by construction
      prompt: buildPrompt(ask, { a: a, b: b, c: c, d: d, nounA: noun.a, nounB: noun.b }, rng),
    };
  }

  // --- distractors(problem) -> 4 wrong options (§4.4) ------------------------
  // Returns [{ value, kind, pattern }] of length 4: kind is "error" (a genuine
  // proportion mistake on THIS item) or "filler" (spread-matched near-miss). The
  // candidate list per unknown leads with two genuine integer errors, so the >= 2
  // real-pattern floor holds. Values over 3× the largest term are skipped so no
  // option becomes a far outlier; every value is forced clean, distinct from the
  // answer and each other, by the same filter the other cartridges use.
  function distractors(problem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var a = problem.a, b = problem.b, c = problem.c, d = problem.d, ask = problem.ask;
    var correct = problem.answer;
    var div = cleanAnswer.isExactlyDivisible;
    var cap = 3 * Math.max(c, d); // magnitude guard against outliers

    var candidates;
    if (ask === "d") {
      // answer = d = b×c ÷ a; scaled second-column term.
      candidates = [
        { value: b + (c - a), pattern: "additive" }, // assumed equal differences, not ratios
        { value: d - b,       pattern: "scale-off" }, // scaled by k−1
      ];
      candidates.push({ value: d + b, pattern: "scale-off" }); // scaled by k+1
      if (div(a * c, b)) candidates.push({ value: a * c / b, pattern: "inverted-ratio" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    } else if (ask === "c") {
      // answer = c = a×d ÷ b; scaled first-column term.
      candidates = [
        { value: a + (d - b), pattern: "additive" },
        { value: c - a,       pattern: "scale-off" },
      ];
      candidates.push({ value: c + a, pattern: "scale-off" });
      if (div(b * d, a)) candidates.push({ value: b * d / a, pattern: "inverted-ratio" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    } else if (ask === "b") {
      // answer = b = a×d ÷ c; base second-column term (small).
      candidates = [
        { value: a,     pattern: "swapped-terms" }, // used a where b goes (ratio inverted)
        { value: d / b, pattern: "used-scale" },     // answered the scale factor k = d/b
      ];
      if (div(a * c, d)) candidates.push({ value: a * c / d, pattern: "inverted-ratio" }); // flipped second ratio
      if (d - c + a > 0) candidates.push({ value: d - c + a, pattern: "additive" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    } else {
      // ask "a": answer = a = b×c ÷ d; base first-column term (small).
      candidates = [
        { value: b,     pattern: "swapped-terms" }, // used b where a goes (ratio inverted)
        { value: c / a, pattern: "used-scale" },     // answered the scale factor k = c/a
      ];
      if (div(b * d, c)) candidates.push({ value: b * d / c, pattern: "inverted-ratio" }); // flipped second ratio
      if (c - d + b > 0) candidates.push({ value: c - d + b, pattern: "additive" });
      candidates.push({ value: 2 * correct, pattern: "doubled" });
      if (correct % 2 === 0) candidates.push({ value: correct / 2, pattern: "halved" });
    }

    var errors = [];
    var used = {};
    used[correct] = true;
    for (var i = 0; i < candidates.length && errors.length < 3; i++) {
      var v = candidates[i].value;
      if (!cleanAnswer.isCleanInteger(v)) continue; // forced clean (§4.2/§4.4)
      if (v <= 0 || v > cap) continue;               // positive, and not a far outlier
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
  // value (ties broken by rng), which avoids hugging the answer and minimizes the
  // largest gap. Cartridge-LOCAL copy (§4.4 — no shared distractor code).
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
    if (lo < 1) { hi += (1 - lo); lo = 1; } // keep fillers positive (counts)

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
  // stays math-free. About the ITEM, not the person. The asked term shows as "?"
  // in the ratio, then the cross-multiply that recovers it.
  function ratioStr(ask, a, b, c, d) {
    return (ask === "a" ? "?" : fmt(a)) + "/" + (ask === "b" ? "?" : fmt(b)) +
      " = " + (ask === "c" ? "?" : fmt(c)) + "/" + (ask === "d" ? "?" : fmt(d));
  }
  function explain(problem) {
    var a = problem.a, b = problem.b, c = problem.c, d = problem.d, ask = problem.ask;
    var calc;
    if (ask === "a") calc = "(" + fmt(b) + " × " + fmt(c) + ") ÷ " + fmt(d);
    else if (ask === "b") calc = "(" + fmt(a) + " × " + fmt(d) + ") ÷ " + fmt(c);
    else if (ask === "c") calc = "(" + fmt(a) + " × " + fmt(d) + ") ÷ " + fmt(b);
    else calc = "(" + fmt(b) + " × " + fmt(c) + ") ÷ " + fmt(a);
    return "Equal ratios: " + ratioStr(ask, a, b, c, d) +
      ". Cross-multiply and solve for the missing term: " + calc + " = " + fmt(problem.answer) + ".";
  }

  var cartridge = {
    id: "prop",
    name: "Proportions",
    RANGES: RANGES,
    generate: generate,
    distractors: distractors,
    explain: explain,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = cartridge;
  } else {
    root.ArithmeticReasoning = root.ArithmeticReasoning || {};
    root.ArithmeticReasoning.proportions = cartridge;
  }
})(typeof window !== "undefined" ? window : this);
