// Math Knowledge — area cartridge.  Rectangle and circle area.
//
// Per research/MathKnowledge_Spec.md. SELF-CONTAINED (§2.2): exposes
// generate(difficulty), the correct answer, and distractors(...), owns its OWN
// error-pattern catalog, and shares NO distractor code with other cartridges
// (§2.3, §6.5). Its only dependency is cleanAnswer.js, used purely as the §3
// clean-value GUARD — not for any distractor logic.
//
// This is the cartridge that stress-tests the §4.1.1 floor: a rectangle has
// only ~2 rock-solid student mistakes (perimeter-instead-of-area, add-instead-
// of-multiply), so it must clear a floor of exactly 2 genuine patterns, not 3.
// The circle clears 3 comfortably.
//
// Clean answers by construction (§3):
//   Rectangle: integer length x width -> integer area, trivially.
//   Circle: π convention is 22/7 (FLAG F-4), and the radius is constrained to
//   multiples of 7 (r = 7k). Then area = (22/7)(7k)^2 = 154k^2 is an EXACT
//   integer — no rounding — and every distractor pattern is integer too
//   (circumference 44k, forgot-square 22k, diameter-as-radius 616k^2). This is
//   the convention that keeps circle answers clean integers (§4.1.7).

(function (root) {
  // Resolve the shared clean-answer GUARD only (no distractor logic shared).
  var cleanAnswer;
  if (typeof module !== "undefined" && module.exports) {
    cleanAnswer = require("./cleanAnswer.js");
  } else {
    cleanAnswer = root.MathKnowledge.cleanAnswer;
  }

  // π = 22/7 (FLAG F-4, §4.2/§7): the convention chosen so circle answers are
  // exact clean integers. Kept consistent within every circle item.
  var PI_NUM = 22, PI_DEN = 7;

  // --- difficulty -> number ranges -----------------------------------------
  // FLAG F-1 (§5.1, §7): UNVALIDATED DEFAULT pending cadet-tester feedback —
  // carried as a knob, not asserted as AFOQT-accurate. Rectangle sides are >= 2
  // (a 1-wide rectangle is degenerate); circle uses k where radius = 7k.
  var RANGES = {
    easy:   { rect: { L: [2, 12], W: [2, 12] }, circle: { k: [1, 3] } },
    medium: { rect: { L: [3, 20], W: [3, 20] }, circle: { k: [1, 5] } },
    hard:   { rect: { L: [5, 40], W: [5, 40] }, circle: { k: [2, 8] } },
  };

  function normalizeDifficulty(d) {
    if (d === 1 || d === "easy") return "easy";
    if (d === 2 || d === "medium") return "medium";
    if (d === 3 || d === "hard") return "hard";
    return "easy"; // default
  }

  // --- small rng helpers (self-contained; not shared) -----------------------
  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }
  function fmt(n) { return String(n); } // areas/dimensions are positive integers

  // --- generate(difficulty) -> one problem (§2.2.1) -------------------------
  // options (optional): { rng, shape } — shape forces "rectangle"|"circle" for
  // tests; omit for a random 50/50 draw.
  function generate(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var level = normalizeDifficulty(difficulty);
    var R = RANGES[level];
    var shape = options.shape || (rng() < 0.5 ? "rectangle" : "circle");

    if (shape === "rectangle") {
      // Pick L, W so the two genuine patterns (perimeter, added-sides) are both
      // distinct from the area and each other — otherwise the rectangle could
      // dip BELOW the §4.1.1 floor of 2. Collisions (e.g., 3x6: area 18 =
      // perimeter 18) are rare, so a small resample loop suffices.
      var L, W, area, per, add, tries = 0;
      do {
        L = randInt(R.rect.L[0], R.rect.L[1], rng);
        W = randInt(R.rect.W[0], R.rect.W[1], rng);
        area = L * W; per = 2 * (L + W); add = L + W;
        tries++;
      } while ((area === per || area === add) && tries < 200);

      return {
        cartridge: "area",
        shape: "rectangle",
        difficulty: level,
        L: L, W: W,
        answer: area,
        prompt: "Find the area of a rectangle with length " + fmt(L) + " and width " + fmt(W) + ".",
      };
    }

    // circle: radius = 7k keeps (22/7)r^2 an exact integer.
    var k = randInt(R.circle.k[0], R.circle.k[1], rng);
    var r = 7 * k;
    var circleArea = 154 * k * k; // (22/7)(7k)^2, computed exactly via k
    return {
      cartridge: "area",
      shape: "circle",
      difficulty: level,
      k: k, r: r, piNum: PI_NUM, piDen: PI_DEN,
      answer: circleArea,
      prompt: "Find the area of a circle with radius " + fmt(r) + ".  (Use π = 22/7.)",
    };
  }

  // --- per-shape genuine error-pattern catalogs (§4.2) ----------------------
  // Each returns [{ value, pattern }] of REAL mistakes for this shape. All
  // values are integers by construction (rectangle: integer dims; circle:
  // r = 7k), which is what lets every option stay clean (§4.1.7).
  function genuinePatterns(problem) {
    if (problem.shape === "rectangle") {
      var L = problem.L, W = problem.W;
      // The ~2 rock-solid rectangle mistakes — this is why the floor is 2.
      return [
        { value: 2 * (L + W), pattern: "perimeter-not-area" }, // used perimeter
        { value: L + W,       pattern: "added-sides" },        // added instead of multiplied
      ];
    }
    // circle: r = 7k, so every value below is an exact integer.
    var k = problem.k;
    return [
      { value: 44 * k,       pattern: "circumference-not-area" }, // 2πr instead of πr^2
      { value: 22 * k,       pattern: "forgot-square-radius" },   // πr (forgot to square)
      { value: 616 * k * k,  pattern: "diameter-as-radius" },     // π(2r)^2 = 4·area
    ];
  }

  // --- distractors(problem) -> 4 wrong options (§2.2.3, §4) ------------------
  // Returns [{ value, kind, pattern }] of length 4: kind "error" (a genuine
  // mistake on THIS item) or "filler" (spread-matched near-miss). Guarantees
  // >= 2 "error" (§4.1.1), all options clean integers (§4.1.7), distinct (§4.1.6).
  function distractors(problem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var correct = problem.answer;

    var candidates = genuinePatterns(problem);
    var errors = [];
    var used = {};
    used[correct] = true;
    // Accept genuine patterns that are clean (§4.1.7 guard via cleanAnswer) and
    // distinct from the answer and each other. Cap at 3 so at least one filler
    // is always present for spread variety; the rectangle naturally yields 2.
    for (var i = 0; i < candidates.length && errors.length < 3; i++) {
      var v = candidates[i].value;
      if (!cleanAnswer.isCleanInteger(v)) continue; // never let an ugly value in
      if (used[v]) continue;
      used[v] = true;
      errors.push({ value: v, kind: "error", pattern: candidates[i].pattern });
    }

    // Fill to 4 with spread-matched fillers (§4.1.2), placed by farthest-point
    // insertion so they break the largest gaps rather than hug the answer
    // (§4.1.3). The sampling range is extended a little past the anchors on both
    // sides so the correct answer isn't pinned as the numeric max/min (§4.1.5).
    var need = 4 - errors.length;
    var anchors = [correct];
    for (var e = 0; e < errors.length; e++) anchors.push(errors[e].value);
    var fillerValues = farthestPointFill(anchors, used, need, rng);
    var fillers = fillerValues.map(function (val) {
      return { value: val, kind: "filler", pattern: "near-miss" };
    });

    return errors.concat(fillers);
  }

  // Choose `need` clean-integer fillers maximizing spread. NOTE: this is the
  // same farthest-point technique the linear cartridge uses, deliberately
  // DUPLICATED here to keep cartridges self-contained (§2.2/§6.5) — a candidate
  // for extraction later only if the duplication proves real across cartridges.
  function farthestPointFill(anchors, used, need, rng) {
    var lo = Math.min.apply(null, anchors);
    var hi = Math.max.apply(null, anchors);
    var span = hi - lo;
    // Extend past the anchors so fillers can land above the answer (areas are
    // all positive, so the floor is 1) — keeps the answer off the extremes.
    var margin = Math.max(2, Math.round(span * 0.4));
    lo = Math.max(1, lo - margin);
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

  // --- explain(problem) -> one-line method (practice-mode feedback) ---------
  // The cartridge owns the math; the engine stays math-free. Assembly (shuffle /
  // 5-option pooling / correctIndex) now lives in the shared engine, lifted out
  // of every cartridge per §2.4/§6.5.
  function explain(problem) {
    if (problem.shape === "rectangle") {
      return "Rectangle area = length × width = " + problem.L + " × " + problem.W +
        " = " + problem.answer + ".  (Using the perimeter 2(L+W) is the classic slip.)";
    }
    return "Circle area = πr², with π = 22/7 and r = " + problem.r + ":  " +
      "(22/7) × " + problem.r + "² = " + problem.answer + ".  (Circumference 2πr is the trap.)";
  }

  var cartridge = {
    id: "area",
    name: "Area (rectangle & circle)",
    RANGES: RANGES,
    PI_NUM: PI_NUM,
    PI_DEN: PI_DEN,
    generate: generate,
    distractors: distractors,
    explain: explain,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = cartridge;
  } else {
    root.MathKnowledge = root.MathKnowledge || {};
    root.MathKnowledge.area = cartridge;
  }
})(typeof window !== "undefined" ? window : this);
