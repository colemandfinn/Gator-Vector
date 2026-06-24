// Arithmetic Reasoning — clean-answer machinery.
//
// Per research/ArithmeticReasoning_Spec.md §4.2 ("Clean-answer policy — keep
// MK's strict integer invariant for v1"): every answer option — correct and all
// four distractors — is a clean integer, identical to MathKnowledge_Spec.md
// §4.1.7. AR keeps the all-integer policy for v1 (a money/decimals mode is a
// later, deliberate addition; see flag AR-F-3), so the no-calculator constraint
// holds and MK's QC machinery is reused directly.
//
// This module is the AR analogue of mathKnowledge/cleanAnswer.js: the single
// source of truth for the one detail most likely to produce defects. It owns
//   (a) what "clean" MEANS, and
//   (b) the canonical rate/time/distance relationship,
// so the future RTD cartridge and the AR test harness both check against ONE
// definition instead of re-deriving it. It contains no distractor logic, so it
// does not violate the engine's "no shared distractor code" rule — cartridges
// still own their own wrong-answer catalogs.

(function (root) {
  // For this slice, "clean" = a finite integer. The spec keeps the strict
  // integer invariant for v1 (§4.2); later cartridges may widen this, but the
  // RTD cartridge solves to integers by construction, so integer IS the clean
  // definition here. Keep widening deliberate, not drift.
  function isCleanInteger(v) {
    return typeof v === "number" && Number.isFinite(v) && Number.isInteger(v);
  }

  // Canonical rate/time/distance relationship: d = r * t. Used to VERIFY the
  // backward construction — the cartridge builds d = r*t, and these recover r,
  // t, d exactly (the AR analogue of MK's solveLinear/isExactlySolvable). If a
  // cartridge ever picked d, r, t independently (the bug §4.2 exists to
  // prevent), isExactlyDivisible() would catch the non-clean result.
  function solveDistance(r, t) { return r * t; }   // d = r * t
  function solveSpeed(d, t)    { return d / t; }    // r = d / t
  function solveTime(d, r)     { return d / r; }    // t = d / r

  // True iff num / den has an exact integer value (den != 0 and den divides
  // num). The clean-answer test asserts this across many generated items so
  // recovered r and t are always clean integers.
  function isExactlyDivisible(num, den) {
    return den !== 0 && num % den === 0;
  }

  var api = {
    isCleanInteger: isCleanInteger,
    solveDistance: solveDistance,
    solveSpeed: solveSpeed,
    solveTime: solveTime,
    isExactlyDivisible: isExactlyDivisible,
  };

  // Dual export: zero-tooling browser <script> global + Node require, matching
  // the Math Knowledge / Table Reading modules so the same file backs the AR
  // test harness and any future runner.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.ArithmeticReasoning = root.ArithmeticReasoning || {};
    root.ArithmeticReasoning.cleanAnswer = api;
  }
})(typeof window !== "undefined" ? window : this);
