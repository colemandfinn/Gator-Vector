// Math Knowledge — exponent-simplification cartridge.  Third/last cartridge of
// slice 1.
//
// Per research/MathKnowledge_Spec.md. SELF-CONTAINED (§2.2): exposes
// generate(difficulty), the correct answer, and distractors(...), owns its OWN
// error catalog, shares NO distractor code. Its only dependency is
// cleanAnswer.js, used purely as the §4.1.7 clean-value GUARD.
//
// THE TRAP this cartridge has to dodge (§3): exponents blow up fast and
// negative/zero exponents are where fractions sneak in. The discipline that
// keeps EVERY option a clean integer a person can reach without a calculator:
//
//   * Negative exponents are NOT allowed at all. a^(-n) = 1/a^n is a fraction
//     by definition, so it can never satisfy §4.1.7. Excluded outright.
//   * Zero exponents ARE allowed: a^0 = 1 is an integer, and "mishandled the
//     zero exponent" is a genuine §4.2 mistake — so there is a dedicated
//     zero sub-type.
//   * Every item evaluates to a^E for a small base (<=10) and a small whole
//     exponent, and every genuine distractor is itself an integer power of a
//     (or a hand-product like a^m * n). A generate-time validation loop
//     regenerates unless the answer is within a difficulty value-cap, all
//     option values are within an option-cap, and >=2 distinct genuine
//     patterns survive — which also auto-handles algebraic collisions (e.g.
//     m=n=2, where multiply- and add-exponents coincide).

(function (root) {
  // Resolve the shared clean-answer GUARD only (no distractor logic shared).
  var cleanAnswer;
  if (typeof module !== "undefined" && module.exports) {
    cleanAnswer = require("./cleanAnswer.js");
  } else {
    cleanAnswer = root.MathKnowledge.cleanAnswer;
  }

  // --- difficulty -> bases / exponents / magnitude caps --------------------
  // FLAG F-1 (§5.1, §7): UNVALIDATED DEFAULT pending cadet-tester feedback.
  // valueCap bounds the (hand-reachable) ANSWER; optionCap bounds any option
  // so a blow-up distractor (e.g. multiply-exponents) is dropped, not shown.
  var RANGES = {
    easy:   { bases: [2, 3, 5, 10],          exp: [1, 3], valueCap: 1000,   optionCap: 5000 },
    medium: { bases: [2, 3, 4, 5, 6, 10],    exp: [1, 4], valueCap: 10000,  optionCap: 60000 },
    hard:   { bases: [2, 3, 4, 5, 6, 7],     exp: [1, 5], valueCap: 100000, optionCap: 1000000 },
  };

  function normalizeDifficulty(d) {
    if (d === 1 || d === "easy") return "easy";
    if (d === 2 || d === "medium") return "medium";
    if (d === 3 || d === "hard") return "hard";
    return "easy"; // default
  }

  // --- small rng / math helpers (self-contained) ---------------------------
  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }
  // Integer power by repeated multiply — avoids any float drift from Math.pow.
  function ipow(base, exp) {
    var r = 1;
    for (var i = 0; i < exp; i++) r *= base;
    return r;
  }
  var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
              "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function sup(n) {
    return String(n).split("").map(function (d) { return SUP[d]; }).join("");
  }

  function pickSubtype(rng) {
    var r = rng();
    if (r < 0.4) return "product";
    if (r < 0.8) return "power";
    return "zero";
  }

  // --- correct value + genuine error patterns (pure fns of the problem) -----
  // Both generate() (to validate the floor) and distractors() (to build) call
  // these, so the two can never drift apart.
  function correctValue(p) {
    if (p.subtype === "product") return ipow(p.a, p.m + p.n); // a^(m+n)
    if (p.subtype === "power")   return ipow(p.a, p.m * p.n); // a^(m*n)
    return ipow(p.a, p.m);                                    // zero: a^m * a^0 = a^m
  }

  // Real mistakes a student makes on THIS item, all integer by construction.
  function genuinePatterns(p) {
    if (p.subtype === "product") {
      return [
        { value: ipow(p.a, p.m * p.n),            pattern: "multiply-exponents" },   // add<->multiply
        { value: ipow(p.a, Math.abs(p.m - p.n)),  pattern: "subtract-exponents" },   // confused w/ quotient rule
      ];
    }
    if (p.subtype === "power") {
      return [
        { value: ipow(p.a, p.m + p.n),  pattern: "add-exponents" },                  // multiply<->add
        { value: ipow(p.a, p.m) * p.n,  pattern: "multiplied-not-raised" },          // operated on value, not exponent
      ];
    }
    // zero: a^m * a^0  (correct = a^m)
    return [
      { value: 0,                  pattern: "zero-makes-zero" },                      // thought a^0 = 0
      { value: ipow(p.a, p.m + 1), pattern: "zero-as-base" },                         // thought a^0 = a
    ];
  }

  // Filter genuine patterns to the ones that are clean, in-range, and distinct
  // from the answer and each other (§4.1.6/§4.1.7). Shared by generate + distractors.
  function cleanGenuine(p, correct, optionCap) {
    var out = [];
    var seen = {};
    seen[correct] = true;
    var pats = genuinePatterns(p);
    for (var i = 0; i < pats.length; i++) {
      var v = pats[i].value;
      if (!cleanAnswer.isCleanInteger(v)) continue;
      if (v < 0 || v > optionCap) continue;
      if (seen[v]) continue;
      seen[v] = true;
      out.push({ value: v, kind: "error", pattern: pats[i].pattern });
    }
    return out;
  }

  function promptFor(p) {
    var lead = "Simplify and evaluate:  ";
    if (p.subtype === "product") return lead + p.a + sup(p.m) + " · " + p.a + sup(p.n);
    if (p.subtype === "power")   return lead + "(" + p.a + sup(p.m) + ")" + sup(p.n);
    return lead + p.a + sup(p.m) + " · " + p.a + sup(0); // zero: a^m · a^0
  }

  // --- generate(difficulty) -> one problem (§2.2.1) -------------------------
  // options (optional): { rng, subtype } — subtype forces "product"|"power"|
  // "zero" for tests; omit for a weighted random draw.
  function generate(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var level = normalizeDifficulty(difficulty);
    var R = RANGES[level];
    var subtype = options.subtype || pickSubtype(rng);

    // Validation loop (§3): keep drawing until the answer is a clean integer
    // within valueCap AND >=2 genuine clean-integer patterns survive. This is
    // what guarantees both "clean by construction" and the §4.1.1 floor.
    var p, correct, genuine, tries = 0;
    do {
      var a = R.bases[randInt(0, R.bases.length - 1, rng)];
      var m = randInt(R.exp[0], R.exp[1], rng);
      var n = subtype === "zero" ? 0 : randInt(R.exp[0], R.exp[1], rng);
      p = { cartridge: "exponents", subtype: subtype, difficulty: level, a: a, m: m, n: n };
      correct = correctValue(p);
      genuine = cleanGenuine(p, correct, R.optionCap);
      tries++;
    } while (
      (!cleanAnswer.isCleanInteger(correct) || correct < 1 || correct > R.valueCap || genuine.length < 2) &&
      tries < 400
    );

    p.answer = correct;
    p.prompt = promptFor(p);
    return p;
  }

  // --- distractors(problem) -> 4 wrong options (§2.2.3, §4) ------------------
  function distractors(problem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var correct = problem.answer;
    var R = RANGES[problem.difficulty];

    // >=2 by construction (generate validated it); cap at 3 to keep a filler.
    var errors = cleanGenuine(problem, correct, R.optionCap).slice(0, 3);
    var used = {};
    used[correct] = true;
    for (var e = 0; e < errors.length; e++) used[errors[e].value] = true;

    var need = 4 - errors.length;
    var anchors = [correct];
    for (var k = 0; k < errors.length; k++) anchors.push(errors[k].value);
    var fillerValues = farthestPointFill(anchors, used, need, rng);
    var fillers = fillerValues.map(function (val) {
      return { value: val, kind: "filler", pattern: "near-miss" };
    });

    return errors.concat(fillers);
  }

  // Spread-matched fillers via farthest-point insertion. NOTE: this is the same
  // technique the linear and area cartridges use, deliberately DUPLICATED here
  // to keep cartridges self-contained (§2.2/§6.5). If a third copy proving the
  // duplication is real, THIS is the moment the spec sanctions extracting a
  // shared helper — flagged for that future refactor, not done pre-emptively.
  function farthestPointFill(anchors, used, need, rng) {
    var lo = Math.min.apply(null, anchors);
    var hi = Math.max.apply(null, anchors);
    var span = hi - lo;
    var margin = Math.max(2, Math.round(span * 0.4));
    lo = Math.max(1, lo - margin); // values are positive; keep fillers >= 1
    hi = hi + margin;

    var takenList = anchors.slice();
    var picks = [];
    for (var k = 0; k < need; k++) {
      var bestDist = -1, ties = [];
      for (var v = lo; v <= hi; v++) {
        if (used[v]) continue;
        var minDist = Infinity;
        for (var t = 0; t < takenList.length; t++) {
          var d = Math.abs(v - takenList[t]);
          if (d < minDist) minDist = d;
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

  // --- buildItem(difficulty) -> full 5-option item --------------------------
  // Assembles correct + 4 distractors, randomizes position (§4.1.5), records
  // correctIndex. Assembly lives here for now (self-contained, testable); a
  // candidate to lift into the shared engine later (§2.4), once it exists.
  function buildItem(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var problem = generate(difficulty, options);
    var dists = distractors(problem, { rng: rng });

    var pool = [{ value: problem.answer, kind: "correct", pattern: null, correct: true }];
    for (var i = 0; i < dists.length; i++) {
      pool.push({ value: dists[i].value, kind: dists[i].kind, pattern: dists[i].pattern, correct: false });
    }

    // Fisher-Yates shuffle so the correct slot (A-E) is uniformly random.
    for (var j = pool.length - 1; j > 0; j--) {
      var rr = Math.floor(rng() * (j + 1));
      var tmp = pool[j]; pool[j] = pool[rr]; pool[rr] = tmp;
    }

    var optionValues = pool.map(function (pp) { return pp.value; });
    var correctIndex = -1;
    for (var m = 0; m < pool.length; m++) if (pool[m].correct) correctIndex = m;

    return {
      problem: problem,
      subtype: problem.subtype,
      prompt: problem.prompt,
      answer: problem.answer,
      options: optionValues,
      correctIndex: correctIndex,
      optionMeta: pool,
    };
  }

  var cartridge = {
    id: "exponents",
    name: "Exponent simplification",
    RANGES: RANGES,
    generate: generate,
    distractors: distractors,
    buildItem: buildItem,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = cartridge;
  } else {
    root.MathKnowledge = root.MathKnowledge || {};
    root.MathKnowledge.exponents = cartridge;
  }
})(typeof window !== "undefined" ? window : this);
