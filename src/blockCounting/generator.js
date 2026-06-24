// Block Counting — skyline stack generator + contact counting.
//
// Per research/BlockCounting_Spec.md "Stack model — skyline construction": a
// stack is a solid height-map skyline — a footprint of columns, each filled from
// the base (z = 0) up to some height >= 1, with NO floating cubes, NO overhangs,
// and NO internal cavities. That construction is what makes every cube's
// neighbours deducible from the drawing without a separate per-cube predicate
// (the spec's BC-F-4 "unambiguity" guarantee is handled by the shape itself).
// Representation: heightMap keyed "x,y" -> height; occupancy = every (x, y, z)
// with z < heightMap["x,y"].
//
// Per research/BlockCounting_Spec.md "Contact rule (locked)": a "contact" is a
// shared FACE. Each cube has six orthogonal neighbour positions (+/-x, +/-y,
// +/-z); the answer is how many of those are occupied. Diagonal / edge-only
// adjacency does NOT count.
//
// rng is injectable (defaults to Math.random) so drills can later be made
// reproducible, matching the convention in src/tableReading/*.

(function (root) {
  // Spec config defaults ("Config parameters table").
  var DEFAULT_MAX_HEIGHT = 3;      // tallest a column can be
  var DEFAULT_FOOTPRINT = [2, 3];  // per-side min/max, random per item
  var DEFAULT_FILL_PROB = 0.8;     // chance a footprint cell holds a column
  var DEFAULT_MIN_COLUMNS = 4;     // keep figures non-trivial

  // Uniform random integer in [min, max] inclusive, using an injectable rng.
  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function key(x, y, z) {
    return x + "," + y + "," + z;
  }

  // Build one skyline height-map, keyed "x,y" -> height (>= 1). Columns are
  // placed across a random footprint; sparse cells (fillProbability) leave gaps
  // so figures aren't always solid blocks. Re-draws until at least minColumns
  // columns exist so no trivial 1-3 cube figure slips through (the standalone
  // recurses; here a bounded loop avoids any chance of unbounded recursion on a
  // degenerate config).
  function generateHeightMap(config) {
    config = config || {};
    var maxHeight = config.maxHeight !== undefined ? config.maxHeight : DEFAULT_MAX_HEIGHT;
    var footprint = config.footprint || DEFAULT_FOOTPRINT;
    var fillProb = config.fillProbability !== undefined ? config.fillProbability : DEFAULT_FILL_PROB;
    var minColumns = config.minColumns !== undefined ? config.minColumns : DEFAULT_MIN_COLUMNS;
    var rng = config.rng || Math.random;

    var hm = {};
    for (var attempt = 0; attempt < 1000; attempt++) {
      var fw = randInt(footprint[0], footprint[1], rng);
      var fd = randInt(footprint[0], footprint[1], rng);
      hm = {};
      var cols = 0;
      for (var x = 0; x < fw; x++) {
        for (var y = 0; y < fd; y++) {
          if (rng() < fillProb) {
            hm[x + "," + y] = 1 + randInt(0, maxHeight - 1, rng); // 1..maxHeight
            cols++;
          }
        }
      }
      if (cols >= minColumns) return hm;
    }
    return hm; // safety valve only; the loop above effectively always succeeds
  }

  // Expand a height-map into an occupancy set: every solid cube position keyed
  // "x,y,z" -> 1. This is the lookup the contact rule tests against.
  function occupancy(heightMap) {
    var set = {};
    for (var k in heightMap) {
      if (!heightMap.hasOwnProperty(k)) continue;
      var p = k.split(","), x = +p[0], y = +p[1], h = heightMap[k];
      for (var z = 0; z < h; z++) set[key(x, y, z)] = 1;
    }
    return set;
  }

  // The six orthogonal face-neighbour offsets (the contact rule's only neighbours).
  var DIRS = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1],
  ];

  // Count how many of (x, y, z)'s six face-neighbours are occupied. Returns the
  // count plus a breakdown (below / sides / above) for the practice feedback.
  function countContacts(set, x, y, z) {
    var count = 0;
    var breakdown = { above: 0, below: 0, sides: 0 };
    for (var i = 0; i < DIRS.length; i++) {
      var d = DIRS[i];
      if (set[key(x + d[0], y + d[1], z + d[2])]) {
        count++;
        if (d[2] === 1) breakdown.above++;
        else if (d[2] === -1) breakdown.below++;
        else breakdown.sides++;
      }
    }
    return { count: count, breakdown: breakdown };
  }

  var api = {
    generateHeightMap: generateHeightMap,
    occupancy: occupancy,
    countContacts: countContacts,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.BlockCounting = root.BlockCounting || {};
    root.BlockCounting.generateHeightMap = generateHeightMap;
    root.BlockCounting.occupancy = occupancy;
    root.BlockCounting.countContacts = countContacts;
  }
})(typeof window !== "undefined" ? window : this);
