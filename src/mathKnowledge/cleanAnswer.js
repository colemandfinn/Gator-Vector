// Math Knowledge — clean-answer machinery.
//
// Per research/MathKnowledge_Spec.md §3 ("HIGHEST-RISK DETAIL — clean-answer
// constraints"): a no-calculator test (§1, dossier §4.4 Strategies bullet)
// demands that every CORRECT answer be reachable by hand. The universal fix the
// spec names is "work backward from a clean answer; do not pick all inputs
// randomly and hope."
//
// This module is the MK analogue of Table Reading's labelIndex.js: the single
// source of truth for the one detail most likely to produce defects. It owns
//   (a) what "clean" MEANS, and
//   (b) the canonical solve for ax + b = c,
// so the linear cartridge and the test harness both check against ONE
// definition instead of re-deriving it. It contains no distractor logic, so it
// does not violate §2.2's "no shared distractor code" rule — cartridges still
// own their own wrong-answer catalogs.

(function (root) {
  // For this slice, "clean" = a finite integer. The spec allows "simple
  // fractions/decimals a person can reach by hand" (§1); later cartridges may
  // widen this, but the linear cartridge solves to integers by construction, so
  // integer IS the clean definition here. Keep widening deliberate, not drift.
  function isCleanInteger(v) {
    return typeof v === "number" && Number.isFinite(v) && Number.isInteger(v);
  }

  // Canonical solve for ax + b = c  ->  x = (c - b) / a. Used to VERIFY the
  // backward construction: the cartridge builds c = a*x + b, and this recovers
  // x exactly. If a cartridge ever picked a, b, c independently (the bug §3
  // exists to prevent), isExactlySolvable() would catch the non-clean result.
  function solveLinear(a, b, c) {
    return (c - b) / a;
  }

  // True iff ax + b = c has an exact integer solution (a != 0 and a divides
  // c - b). The clean-answer test asserts this across many generated items.
  function isExactlySolvable(a, b, c) {
    return a !== 0 && (c - b) % a === 0;
  }

  var api = {
    isCleanInteger: isCleanInteger,
    solveLinear: solveLinear,
    isExactlySolvable: isExactlySolvable,
  };

  // Dual export: zero-tooling browser <script> global + Node require, matching
  // the Table Reading modules so the same file backs mathTest.html and any
  // future runner.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.MathKnowledge = root.MathKnowledge || {};
    root.MathKnowledge.cleanAnswer = api;
  }
})(typeof window !== "undefined" ? window : this);
