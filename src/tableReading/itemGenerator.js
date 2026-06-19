// Table Reading — item generator (one (X, Y) question against a grid).
//
// Per research/TableReading_Spec.md "Item generation algorithm" and "Distractor
// algorithm (v1)". A grid is built once per session (gridGenerator.js); this
// draws individual items against it:
//   1. random target X, Y labels in [-axisRange, +axisRange]
//   2. correct = value at (X, Y) via the shared lookup/labelToIndex path
//   3. 4 distinct distractors from the target cell's neighbors (orthogonal ring
//      first, then diagonal, then wider rings; random fallback only on
//      degenerate grids), each != correct and != each other
//   4. 5 options = [correct, ...4 distractors] sorted ASCENDING (optionOrder)
//   5. record correctIndex = position of correct in the sorted list
//
// All label<->index work routes through labelToIndex (never re-derived here).

(function (root) {
  // Resolve shared deps from Node (require) or the browser globals that the
  // earlier <script> tags installed.
  var labelToIndex, lookup;
  if (typeof module !== "undefined" && module.exports) {
    labelToIndex = require("./labelIndex.js").labelToIndex;
    lookup = require("./gridGenerator.js").lookup;
  } else {
    labelToIndex = root.TableReading.labelToIndex;
    lookup = root.TableReading.lookup;
  }

  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  // Neighbor offsets ordered by the spec's priority: closest ring first
  // (Chebyshev distance), and within a ring "orthogonal-ish before diagonal"
  // (Manhattan distance), with a fixed deterministic tiebreak. Computed once per
  // maxDistance and cached, since it's the same for every item on a given grid.
  var offsetCache = {};
  function neighborOffsets(maxDistance) {
    if (offsetCache[maxDistance]) return offsetCache[maxDistance];
    var offs = [];
    for (var dy = -maxDistance; dy <= maxDistance; dy++) {
      for (var dx = -maxDistance; dx <= maxDistance; dx++) {
        if (dx === 0 && dy === 0) continue;
        offs.push([dx, dy]);
      }
    }
    offs.sort(function (a, b) {
      var chebA = Math.max(Math.abs(a[0]), Math.abs(a[1]));
      var chebB = Math.max(Math.abs(b[0]), Math.abs(b[1]));
      if (chebA !== chebB) return chebA - chebB;             // ring: nearest first
      var manA = Math.abs(a[0]) + Math.abs(a[1]);
      var manB = Math.abs(b[0]) + Math.abs(b[1]);
      if (manA !== manB) return manA - manB;                 // orthogonal before diagonal
      if (a[1] !== b[1]) return a[1] - b[1];                 // deterministic tiebreak
      return a[0] - b[0];
    });
    offsetCache[maxDistance] = offs;
    return offs;
  }

  // Collect exactly 4 distinct distractors for the target cell, all different
  // from `correct` and from each other. Returns { values, usedFallback }.
  function buildDistractors(grid, X, Y, correct, rng, cellValueRange) {
    var size = grid.size;
    var xIndex = labelToIndex(X, grid.axisRange);
    var yIndex = labelToIndex(Y, grid.axisRange);

    var chosen = [];
    var seen = {};
    seen[correct] = true; // never let a distractor equal the correct answer

    // Walk neighbors in priority order, skipping out-of-grid cells and
    // value-collisions, until 4 distinct distractors are gathered.
    var offsets = neighborOffsets(size - 1); // furthest reachable ring
    for (var i = 0; i < offsets.length && chosen.length < 4; i++) {
      var nx = xIndex + offsets[i][0];
      var ny = yIndex + offsets[i][1];
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
      var v = grid.cells[ny][nx];
      if (seen[v]) continue;
      seen[v] = true;
      chosen.push(v);
    }

    // Fallback (degenerate grids only): top up with random in-range values,
    // still deduped. On a 35x35 grid over 0-99 this should never fire.
    var usedFallback = false;
    var guard = 0;
    var min = cellValueRange[0];
    var max = cellValueRange[1];
    while (chosen.length < 4) {
      var rv = randInt(min, max, rng);
      if (!seen[rv]) {
        seen[rv] = true;
        chosen.push(rv);
        usedFallback = true;
      }
      if (++guard > 100000) break; // safety: impossible unless range too small
    }

    return { values: chosen, usedFallback: usedFallback };
  }

  // Generate one item against `grid`. options: { rng, cellValueRange, x, y }.
  // x/y are an optional escape hatch to force a target (tests/determinism);
  // omit them for the normal random draw the spec describes.
  function generateItem(grid, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var cellValueRange = options.cellValueRange || grid.cellValueRange;
    var axisRange = grid.axisRange;

    var X = options.x !== undefined ? options.x : randInt(-axisRange, axisRange, rng);
    var Y = options.y !== undefined ? options.y : randInt(-axisRange, axisRange, rng);

    var correct = lookup(grid, X, Y);
    var dist = buildDistractors(grid, X, Y, correct, rng, cellValueRange);

    if (dist.usedFallback && typeof console !== "undefined" && console.warn) {
      console.warn("TableReading: distractor fallback fired at (" + X + "," + Y + ")");
    }

    // 5 options sorted ascending (optionOrder: "ascending", locked).
    var opts = [correct].concat(dist.values).sort(function (a, b) { return a - b; });
    var correctIndex = opts.indexOf(correct); // correct is unique among options

    return { x: X, y: Y, options: opts, correctIndex: correctIndex };
  }

  var api = { generateItem: generateItem, buildDistractors: buildDistractors };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TableReading = root.TableReading || {};
    root.TableReading.generateItem = generateItem;
    root.TableReading.buildDistractors = buildDistractors;
  }
})(typeof window !== "undefined" ? window : this);
