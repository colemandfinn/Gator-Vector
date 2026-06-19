// Table Reading — drill loop (many items against ONE session grid).
//
// Per research/TableReading_Spec.md: a grid is generated once per session
// (gridGenerator.js) and a drill draws `itemCount` items (default 40) against
// it. Spec note (line 54): items should avoid exact-duplicate COORDINATES
// back-to-back — track the last (X, Y) and re-draw on collision so the same
// lookup never repeats immediately. Duplicate option *values* across items are
// fine; only the (X, Y) target must differ from the previous item.

(function (root) {
  // Resolve shared deps from Node (require) or the browser globals installed by
  // the earlier <script> tags.
  var generateItem;
  if (typeof module !== "undefined" && module.exports) {
    generateItem = require("./itemGenerator.js").generateItem;
  } else {
    generateItem = root.TableReading.generateItem;
  }

  // Spec config default ("Config parameters table": itemCount = 40).
  var DEFAULT_ITEM_COUNT = 40;

  // Run a drill against an already-built grid. options: { itemCount, rng,
  // cellValueRange } — rng/cellValueRange pass straight through to generateItem.
  // Returns { itemCount, items: [...] }.
  function generateDrill(grid, options) {
    options = options || {};
    var itemCount = options.itemCount !== undefined ? options.itemCount : DEFAULT_ITEM_COUNT;

    var items = [];
    var prev = null; // previous accepted item, for the back-to-back check

    for (var i = 0; i < itemCount; i++) {
      var item = generateItem(grid, options);

      // Re-draw while the new target matches the immediately preceding one.
      // The guard caps attempts so a degenerate (tiny) grid can't spin forever;
      // on a 35x35 grid a collision is rare and clears in a draw or two.
      var attempts = 0;
      while (prev && item.x === prev.x && item.y === prev.y) {
        item = generateItem(grid, options);
        if (++attempts > 1000) break; // safety valve; effectively never hit
      }

      items.push(item);
      prev = item;
    }

    return { itemCount: itemCount, items: items };
  }

  var api = { generateDrill: generateDrill };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TableReading = root.TableReading || {};
    root.TableReading.generateDrill = generateDrill;
  }
})(typeof window !== "undefined" ? window : this);
