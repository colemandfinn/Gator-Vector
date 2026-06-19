// Table Reading — grid generator + lookup.
//
// Per research/TableReading_Spec.md "Grid model" and "Item generation
// algorithm": a grid is built ONCE per drill session; many (X, Y) items are
// then drawn against that same grid. The grid is a `size x size` array stored
// as grid[row][col] with 0-based indices (0..34). Axis labels (-17..+17) map to
// indices ONLY through the shared labelToIndex helper — this file never
// re-derives the `+ axisRange` conversion (that off-by-one is the spec's flagged
// most-likely defect, kept in one place on purpose).
//
// Lookup convention (locked, spec "Lookup definition"): X = column, Y = row, so
// the value at label (X, Y) is grid.cells[yIndex][xIndex].

(function (root) {
  // Resolve the shared label<->index helper from Node (require) or the browser
  // global that labelIndex.js installed via a prior <script> tag.
  var labelToIndex;
  if (typeof module !== "undefined" && module.exports) {
    labelToIndex = require("./labelIndex.js").labelToIndex;
  } else {
    labelToIndex = root.TableReading.labelToIndex;
  }

  // Spec config defaults ("Config parameters table").
  var DEFAULT_AXIS_RANGE = 17;
  var DEFAULT_CELL_VALUE_RANGE = [0, 99];

  // Uniform random integer in [min, max] inclusive, using an injectable RNG so
  // drills can later be made reproducible (spec keeps rng injectable rather than
  // calling a global directly). Defaults to Math.random.
  function randInt(min, max, rng) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  // Build the grid once per session. Returns a self-describing grid object:
  //   { axisRange, cellValueRange, size, cells }
  // where cells is a size x size array of grid[row][col].
  function generateGrid(config) {
    config = config || {};
    var axisRange = config.axisRange !== undefined ? config.axisRange : DEFAULT_AXIS_RANGE;
    var cellValueRange = config.cellValueRange || DEFAULT_CELL_VALUE_RANGE;
    var rng = config.rng || Math.random;

    var min = cellValueRange[0];
    var max = cellValueRange[1];
    var size = 2 * axisRange + 1; // 35 for axisRange 17

    var cells = new Array(size);
    for (var row = 0; row < size; row++) {
      var cols = new Array(size);
      for (var col = 0; col < size; col++) {
        // Independent uniform draw per cell — no structure across the grid, so
        // every item demands a genuine lookup rather than estimation.
        cols[col] = randInt(min, max, rng);
      }
      cells[row] = cols;
    }

    return {
      axisRange: axisRange,
      cellValueRange: cellValueRange,
      size: size,
      cells: cells,
    };
  }

  // Look up the value at axis labels (x, y). Routes BOTH labels through the
  // shared helper so the +axisRange conversion lives in exactly one place.
  function lookup(grid, x, y) {
    var xIndex = labelToIndex(x, grid.axisRange); // X = column
    var yIndex = labelToIndex(y, grid.axisRange); // Y = row
    return grid.cells[yIndex][xIndex];
  }

  var api = { generateGrid: generateGrid, lookup: lookup };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TableReading = root.TableReading || {};
    root.TableReading.generateGrid = generateGrid;
    root.TableReading.lookup = lookup;
  }
})(typeof window !== "undefined" ? window : this);
