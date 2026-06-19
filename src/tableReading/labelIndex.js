// Table Reading — label <-> array-index helpers.
//
// Per research/TableReading_Spec.md "Grid model": the grid is stored as a
// 0-based array (indices 0..34) while the axes are *labeled* -17..+17. The
// conversion is `index = label + axisRange` (axisRange = 17), so:
//   label -17 -> index 0, label 0 -> index 17, label +17 -> index 34.
//
// The spec calls this "the single most likely defect in the whole subtest" and
// asks that the conversion live in ONE helper. This file is that single source
// of truth — every lookup in the subtest must route through here.

(function (root) {
  // Symmetric axis bound from the spec's `axisRange` config default.
  var AXIS_RANGE = 17;

  function labelToIndex(label, axisRange) {
    if (axisRange === undefined) axisRange = AXIS_RANGE;
    return label + axisRange;
  }

  function indexToLabel(index, axisRange) {
    if (axisRange === undefined) axisRange = AXIS_RANGE;
    return index - axisRange;
  }

  var api = { AXIS_RANGE: AXIS_RANGE, labelToIndex: labelToIndex, indexToLabel: indexToLabel };

  // Expose for both a zero-tooling browser <script> (global) and Node (require),
  // so the same file backs test.html today and any future runner.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TableReading = root.TableReading || {};
    root.TableReading.labelToIndex = labelToIndex;
    root.TableReading.indexToLabel = indexToLabel;
    root.TableReading.AXIS_RANGE = AXIS_RANGE;
  }
})(typeof window !== "undefined" ? window : this);
