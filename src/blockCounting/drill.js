// Block Counting — drill loop (many items, each its own freshly-generated stack).
//
// Per research/BlockCounting_Spec.md "Item / drill shape": generateDrill has a
// default itemCount of 30; no two consecutive items share the same
// (heightMap, marked) — re-draw on collision. This mirrors the no-back-to-back
// rule in src/tableReading/drill.js (which compares the (X, Y) target); here the
// item's identity is its full (heightMap, marked) pair, so we compare a stable
// serialization of both. nextItem covers open-ended practice.
//
// Unlike Table Reading there is no per-session shared structure (no grid): every
// item generates its own stack, so generateDrill takes only options.

(function (root) {
  // Resolve shared deps from Node (require) or the browser globals installed by
  // the earlier <script> tags (itemGenerator.js).
  var generateItem;
  if (typeof module !== "undefined" && module.exports) {
    generateItem = require("./itemGenerator.js").generateItem;
  } else {
    generateItem = root.BlockCounting.generateItem;
  }

  // Spec config default ("Config parameters table": itemCount = 30).
  var DEFAULT_ITEM_COUNT = 30;

  // Stable identity for an item: its sorted height-map entries plus the marked
  // coordinate. Sorting the keys makes the comparison independent of object
  // insertion order, so two structurally identical stacks always collide.
  function itemKey(item) {
    var entries = [];
    for (var k in item.heightMap) {
      if (item.heightMap.hasOwnProperty(k)) entries.push(k + ":" + item.heightMap[k]);
    }
    entries.sort();
    return entries.join(";") + "|" + item.marked.join(",");
  }

  // Draw the next item whose (heightMap, marked) differs from prevItem's. Shared
  // by both the fixed-length drill and open-ended practice. prevItem null (the
  // first item) means "any item is fine". The guard caps attempts so a degenerate
  // config can't spin forever; a real collision is astronomically rare.
  function nextItem(prevItem, options) {
    var item = generateItem(options);
    var prevKey = prevItem ? itemKey(prevItem) : null;
    var attempts = 0;
    while (prevKey && itemKey(item) === prevKey) {
      item = generateItem(options);
      if (++attempts > 1000) break; // safety valve; effectively never hit
    }
    return item;
  }

  // Run a fixed-length drill. options: { itemCount, rng, ...generator config } —
  // everything but itemCount passes straight through to generateItem. Returns
  // { itemCount, items: [...] }.
  function generateDrill(options) {
    options = options || {};
    var itemCount = options.itemCount !== undefined ? options.itemCount : DEFAULT_ITEM_COUNT;

    var items = [];
    var prev = null; // previous accepted item, for the back-to-back check
    for (var i = 0; i < itemCount; i++) {
      var item = nextItem(prev, options);
      items.push(item);
      prev = item;
    }

    return { itemCount: itemCount, items: items };
  }

  var api = { generateDrill: generateDrill, nextItem: nextItem };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.BlockCounting = root.BlockCounting || {};
    root.BlockCounting.generateDrill = generateDrill;
    root.BlockCounting.nextItem = nextItem;
  }
})(typeof window !== "undefined" ? window : this);
