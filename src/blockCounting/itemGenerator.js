// Block Counting — item generator (one marked-cube question against a fresh stack).
//
// Per research/BlockCounting_Spec.md "Marked-block selection + answer range
// (locked)": the marked cube is a TOP-OF-COLUMN cube whose top face is NOT
// occluded by a nearer column. Occlusion is the same test the standalone drill
// uses — the column's top-face centre is projected to isometric screen space and
// tested against the projected faces of every cube drawn in front of it. Because
// a markable cube must have a visible top face, it has at least one empty
// neighbour slot, so its true contact count runs 0-5, never 6 (the spec's BC-F-5
// derivation).
//
// Per research/BlockCounting_Spec.md "Distractor algorithm (v1)": given correct
// count c, candidate distractors come from {c±1, c±2} (then {c±3, c±4} as
// fillers), filtered to [0, 8] and de-duplicated. Take 5 total, SORT ASCENDING,
// and record correctIndex = position of c. The correct value is never leaked.
//
// Per research/BlockCounting_Spec.md "Item / drill shape": generateItem returns
//   { heightMap, marked: [x, y, z], options: [5 ascending ints], correctIndex }.

(function (root) {
  // Resolve shared deps from Node (require) or the browser globals that the
  // earlier <script> tags installed (generator.js).
  var generateHeightMap, occupancy, countContacts;
  if (typeof module !== "undefined" && module.exports) {
    var gen = require("./generator.js");
    generateHeightMap = gen.generateHeightMap;
    occupancy = gen.occupancy;
    countContacts = gen.countContacts;
  } else {
    generateHeightMap = root.BlockCounting.generateHeightMap;
    occupancy = root.BlockCounting.occupancy;
    countContacts = root.BlockCounting.countContacts;
  }

  // Spec config defaults: 5 answer choices, true count band [0, 8] for options.
  var OPT_COUNT = 5;
  var MIN_OPT = 0, MAX_OPT = 8;

  // --- isometric projection (pure geometry, no DOM) ---------------------------
  // These mirror the standalone exactly so marked-block selection here makes the
  // SAME visibility decision the rendered figure does. The constants are the
  // drill's tile/body dimensions; only their ratios matter for occlusion.
  var TW = 60, TH = 30, BH = 38; // tile width, tile height (2:1 iso), body height

  function topCenter(x, y, z) {
    return { cx: (x - y) * (TW / 2), cy: (x + y) * (TH / 2) - z * BH };
  }

  // The three visible faces of a cube as screen-space polygons, plus the top
  // face's centre point.
  function faces(x, y, z) {
    var c = topCenter(x, y, z), cx = c.cx, cy = c.cy;
    var tTop = [cx, cy - TH / 2], tR = [cx + TW / 2, cy], tB = [cx, cy + TH / 2], tL = [cx - TW / 2, cy];
    return {
      top: [tTop, tR, tB, tL],
      left: [tL, [tL[0], tL[1] + BH], [tB[0], tB[1] + BH], tB],
      right: [tB, [tB[0], tB[1] + BH], [tR[0], tR[1] + BH], tR],
      center: [cx, cy],
    };
  }

  // Point-in-polygon by ray casting.
  function pointInPoly(px, py, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  // Every cube position, sorted back-to-front for painter's-order drawing.
  function cubeList(heightMap) {
    var c = [];
    for (var k in heightMap) {
      if (!heightMap.hasOwnProperty(k)) continue;
      var p = k.split(","), x = +p[0], y = +p[1], h = heightMap[k];
      for (var z = 0; z < h; z++) c.push([x, y, z]);
    }
    c.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]; });
    return c;
  }

  // The set of column-top cubes whose top face is not hidden behind a nearer
  // block. A column's top face is markable only if its centre isn't covered by
  // any cube drawn in front of it (greater paint order). Never empty: the
  // front-most column's top is always clear.
  function visibleTops(heightMap) {
    var cubes = cubeList(heightMap), vis = [];
    function ord(x, y, z) { return (x + y) * 100 + z; }
    for (var k in heightMap) {
      if (!heightMap.hasOwnProperty(k)) continue;
      var p = k.split(","), x = +p[0], y = +p[1], h = heightMap[k], z = h - 1;
      var ctr = topCenter(x, y, z), my = ord(x, y, z), occluded = false;
      for (var i = 0; i < cubes.length; i++) {
        var cx = cubes[i][0], cy = cubes[i][1], cz = cubes[i][2];
        if (cx === x && cy === y && cz === z) continue;
        if (ord(cx, cy, cz) <= my) continue; // behind / same — can't cover it
        var f = faces(cx, cy, cz);
        if (pointInPoly(ctr.cx, ctr.cy, f.top) ||
            pointInPoly(ctr.cx, ctr.cy, f.left) ||
            pointInPoly(ctr.cx, ctr.cy, f.right)) {
          occluded = true;
          break;
        }
      }
      if (!occluded) vis.push([x, y, z]);
    }
    return vis;
  }

  // --- distractor algorithm ---------------------------------------------------
  // Build the 5 answer options for a true count c, sorted ascending, with the
  // index of c recorded so the correct value is never positionally leaked.
  function buildOptions(c) {
    var seen = {}, chosen = [c];
    seen[c] = true;
    var near = [c - 1, c + 1, c - 2, c + 2, c + 3, c - 3, c + 4, c - 4];
    for (var i = 0; i < near.length && chosen.length < OPT_COUNT; i++) {
      var v = near[i];
      if (v >= MIN_OPT && v <= MAX_OPT && !seen[v]) { seen[v] = true; chosen.push(v); }
    }
    // Fallback fillers (only fire when c sits near an edge of [0, 8]): walk the
    // range and top up with any unused value, still deduped.
    for (var f = MIN_OPT; f <= MAX_OPT && chosen.length < OPT_COUNT; f++) {
      if (!seen[f]) { seen[f] = true; chosen.push(f); }
    }
    var options = chosen.sort(function (a, b) { return a - b; });
    return { options: options, correctIndex: options.indexOf(c) };
  }

  // Generate one item. options: { rng, maxHeight, footprint, fillProbability,
  // minColumns } — all optional; rng/config pass straight through to
  // generateHeightMap. Returns { heightMap, marked, options, correctIndex }.
  function generateItem(options) {
    options = options || {};
    var rng = options.rng || Math.random;

    var heightMap = generateHeightMap(options); // reads rng + any config off options
    var set = occupancy(heightMap);
    var vis = visibleTops(heightMap);
    var marked = vis[Math.floor(rng() * vis.length)];
    var count = countContacts(set, marked[0], marked[1], marked[2]).count;
    var built = buildOptions(count);

    return {
      heightMap: heightMap,
      marked: marked,
      options: built.options,
      correctIndex: built.correctIndex,
    };
  }

  var api = {
    generateItem: generateItem,
    buildOptions: buildOptions,
    visibleTops: visibleTops,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.BlockCounting = root.BlockCounting || {};
    root.BlockCounting.generateItem = generateItem;
    root.BlockCounting.buildOptions = buildOptions;
    root.BlockCounting.visibleTops = visibleTops;
  }
})(typeof window !== "undefined" ? window : this);
