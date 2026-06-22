// Math Knowledge — linear-equation cartridge.  Solve  ax + b = c  for x.
//
// Per research/MathKnowledge_Spec.md. This is a SELF-CONTAINED cartridge (§2.2):
// it exposes generate(difficulty), the correct answer, and distractors(...), and
// it owns its OWN error-pattern catalog with zero shared distractor code (§2.3,
// §6.5). It depends only on cleanAnswer.js, which is the shared §3 clean-answer
// guard, NOT distractor logic.
//
// Clean answer by construction (§3): we pick a, the intended solution x, and b
// as clean integers FIRST, then COMPUTE c = a*x + b. The answer is therefore a
// clean integer with no rounding — never pick a, b, c independently and hope.
//
// Distractors (§4): two ALWAYS-INTEGER genuine error patterns are guaranteed
// (forgot-to-divide -> a*x, sign-error -> -x), a third genuine pattern is used
// when it lands clean, and the set is filled to four with farthest-point,
// spread-matched fillers so the correct answer never sits as the lone median of
// a tight cluster (§4.1.3). Option position is randomized per item (§4.1.5).

(function (root) {
  // Resolve the shared clean-answer guard from Node or the browser global.
  var cleanAnswer;
  if (typeof module !== "undefined" && module.exports) {
    cleanAnswer = require("./cleanAnswer.js");
  } else {
    cleanAnswer = root.MathKnowledge.cleanAnswer;
  }

  // --- difficulty -> number ranges -----------------------------------------
  // FLAG F-1 (§5.1, §7): this mapping is an UNVALIDATED DEFAULT, pending
  // cadet-tester feedback — carried as a knob, not asserted as AFOQT-accurate.
  // Magnitudes are minimums of 1 for x/b (kept nonzero) and 2 for |a| (so the
  // "divide by a" step — and the forgot-to-divide distractor — is always real;
  // a == 1 would make the problem too trivial for MK per §4.1.1).
  var RANGES = {
    easy:   { a: [2, 5],  aNeg: false, x: [1, 9],  xNeg: false, b: [1, 9],  bNeg: false },
    medium: { a: [2, 7],  aNeg: true,  x: [1, 9],  xNeg: true,  b: [1, 15], bNeg: true },
    hard:   { a: [2, 12], aNeg: true,  x: [1, 15], xNeg: true,  b: [1, 40], bNeg: true },
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
  // Pick a value whose MAGNITUDE is in [range[0], range[1]] (both >= 1), with a
  // random sign when allowNeg. Never returns 0.
  function pickMagSign(range, allowNeg, rng) {
    var mag = randInt(range[0], range[1], rng);
    var sign = allowNeg && rng() < 0.5 ? -1 : 1;
    return mag * sign;
  }

  // --- display formatting (real minus signs, like Phase 1) ------------------
  function fmt(n) { return String(n).replace("-", "−"); }
  function coeffStr(a) {
    if (a === 1) return "x";
    if (a === -1) return "−x";
    return fmt(a) + "x";
  }
  function bStr(b) { // b is never 0
    return b < 0 ? " − " + Math.abs(b) : " + " + b;
  }

  // --- generate(difficulty) -> one problem (§2.2.1) -------------------------
  // options (optional): { rng, a, x, b } — a/x/b force values for deterministic
  // tests; omit them for the normal random draw.
  function generate(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var level = normalizeDifficulty(difficulty);
    var R = RANGES[level];

    // Work backward (§3): choose a, x, b clean, then compute c.
    var a = options.a !== undefined ? options.a : pickMagSign(R.a, R.aNeg, rng);
    var x = options.x !== undefined ? options.x : pickMagSign(R.x, R.xNeg, rng);
    var b = options.b !== undefined ? options.b : pickMagSign(R.b, R.bNeg, rng);
    var c = a * x + b;

    var equation = coeffStr(a) + bStr(b) + " = " + fmt(c);
    return {
      cartridge: "linear",
      difficulty: level,
      a: a, b: b, c: c, x: x,
      answer: x,                 // correct answer (§2.2.2), clean by construction
      equation: equation,
      prompt: "Solve for x:  " + equation,
    };
  }

  // --- distractors(problem) -> 4 wrong options (§2.2.3, §4) ------------------
  // Returns [{ value, kind, pattern }] of length 4: kind is "error" (a genuine
  // mistake a student makes on THIS problem) or "filler" (spread-matched
  // near-miss). At least two are "error" by construction (§4.1.1).
  function distractors(problem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var a = problem.a, b = problem.b, c = problem.c, x = problem.x;
    var correct = problem.answer;

    // Genuine error patterns in priority order. The first two are always
    // integers and always distinct from x (since |a| >= 2 and x != 0), which is
    // what guarantees the §4.1.1 floor of >= 2 real patterns.
    var candidates = [
      { value: c - b,    pattern: "forgot-divide" }, // solved a*x but never /a  -> a*x
      { value: -x,       pattern: "sign-error" },    // mishandled sign isolating x -> -x
    ];
    // Sign error MOVING b (added b instead of subtracting): (c + b)/a. Only a
    // genuine, clean option when a divides c + b; otherwise skipped.
    if ((c + b) % a === 0) {
      candidates.push({ value: (c + b) / a, pattern: "sign-error-b" });
    }

    var errors = [];
    var used = {};
    used[correct] = true;
    for (var i = 0; i < candidates.length && errors.length < 3; i++) {
      var v = candidates[i].value;
      if (used[v]) continue;             // distinct from answer and each other
      used[v] = true;
      errors.push({ value: v, kind: "error", pattern: candidates[i].pattern });
    }

    // Fill to 4 with spread-matched fillers (§4.1.2). The error values set the
    // spread; fillers are placed by farthest-point insertion so they break the
    // largest gaps rather than hug the answer — no clustering tell (§4.1.3).
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
  // value (ties broken by rng), which simultaneously avoids hugging the answer
  // and minimizes the largest gap in the final option set.
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
  // The cartridge owns the math, so it owns the explanation; the shared engine
  // stays math-free. About the ITEM, not the person — mirrors Table Reading
  // practice. NOTE: option assembly (shuffle / 5-option pooling / correctIndex)
  // now lives in the shared engine (engine.js), lifted out of every cartridge
  // per §2.4/§6.5 now that the engine exists.
  function explain(problem) {
    return "Isolate x — move the constant, then divide by the coefficient:  " +
      "x = (" + fmt(problem.c) + " − (" + fmt(problem.b) + ")) ÷ " + fmt(problem.a) +
      " = " + fmt(problem.c - problem.b) + " ÷ " + fmt(problem.a) + " = " + fmt(problem.answer) + ".";
  }

  var cartridge = {
    id: "linear",
    name: "Linear equations",
    RANGES: RANGES,
    generate: generate,
    distractors: distractors,
    explain: explain,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = cartridge;
  } else {
    root.MathKnowledge = root.MathKnowledge || {};
    root.MathKnowledge.linearEquation = cartridge;
  }
})(typeof window !== "undefined" ? window : this);
