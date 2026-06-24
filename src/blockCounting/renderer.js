// Block Counting — SVG isometric renderer.
//
// Per research/BlockCounting_Spec.md: draws a skyline height-map as an isometric
// stack of identical cubes into an <svg>, with one cube marked. Painter's order
// (back-to-front) so nearer cubes overdraw farther ones; the viewBox auto-fits
// the figure's bounding box; the marked cube is amber-highlighted and its "1"
// marker is drawn LAST so it always sits on top of the (visible) marked face.
//
// This is the visual twin of itemGenerator.js's visible-top selection — the
// projection constants (TW/TH/BH) and the topCenter/faces geometry MUST match
// that module so the cube the engine marks is exactly the cube whose top face is
// drawn unoccluded here. Keep them in sync.
//
// Colours read on the app's LIGHT theme (not the dark standalone): mid-slate
// cubes with a dark edge stroke, and the amber highlight kept for the marked cube.
//
// Browser-only at call time (it touches document/SVG), but wrapped in the same
// IIFE / dual-export shape as the other src/blockCounting modules.

(function (root) {
  var NS = "http://www.w3.org/2000/svg";

  // Isometric projection — identical to itemGenerator.js's occlusion geometry.
  var TW = 60, TH = 30, BH = 38; // tile width, tile height (2:1 iso), body height

  function topCenter(x, y, z) {
    return { cx: (x - y) * (TW / 2), cy: (x + y) * (TH / 2) - z * BH };
  }

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

  // Light-theme cube colours. Normal cubes are mid-slate with darker side faces;
  // the marked cube keeps the standalone's amber. A dark stroke gives every cube
  // a crisp edge on the light (#fff / #fafafa) background.
  var STROKE = "#26303d";
  var NORMAL = { top: "#c2cfde", left: "#94a6bd", right: "#7e92ab" };
  var MARKED = { top: "#f2b65a", left: "#cf8a2c", right: "#b3771f" };

  function svgPoly(svg, poly, fill) {
    var el = document.createElementNS(NS, "polygon"), pts = "";
    for (var i = 0; i < poly.length; i++) pts += poly[i][0].toFixed(1) + "," + poly[i][1].toFixed(1) + " ";
    el.setAttribute("points", pts.trim());
    el.setAttribute("fill", fill);
    el.setAttribute("stroke", STROKE);
    el.setAttribute("stroke-width", "1.4");
    el.setAttribute("stroke-linejoin", "round");
    svg.appendChild(el);
  }

  // Render heightMap into svgEl, marking cube `marked` ([x, y, z]).
  function renderStack(svgEl, heightMap, marked) {
    var cubes = cubeList(heightMap);

    // Auto-fit viewBox to the figure's bounding box (over every drawn face).
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < cubes.length; i++) {
      var f = faces(cubes[i][0], cubes[i][1], cubes[i][2]);
      var all = f.top.concat(f.left, f.right);
      for (var j = 0; j < all.length; j++) {
        var px = all[j][0], py = all[j][1];
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
    var pad = 16;
    svgEl.setAttribute("viewBox",
      (minX - pad).toFixed(1) + " " + (minY - pad).toFixed(1) + " " +
      ((maxX - minX) + 2 * pad).toFixed(1) + " " + ((maxY - minY) + 2 * pad).toFixed(1));

    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    for (var c = 0; c < cubes.length; c++) {
      var x = cubes[c][0], y = cubes[c][1], z = cubes[c][2];
      var hot = (x === marked[0] && y === marked[1] && z === marked[2]);
      var col = hot ? MARKED : NORMAL;
      var fc = faces(x, y, z);
      svgPoly(svgEl, fc.left, col.left);
      svgPoly(svgEl, fc.right, col.right);
      svgPoly(svgEl, fc.top, col.top);
    }

    // Marker drawn last so it always sits on top of the (visible) marked face.
    var fn = faces(marked[0], marked[1], marked[2]);
    var t = document.createElementNS(NS, "text");
    t.setAttribute("x", fn.center[0].toFixed(1));
    t.setAttribute("y", (fn.center[1] + 5).toFixed(1));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", "17");
    t.setAttribute("font-weight", "800");
    t.setAttribute("fill", "#1a1205");
    t.setAttribute("font-family", "ui-sans-serif,system-ui,sans-serif");
    t.textContent = "1";
    svgEl.appendChild(t);
  }

  var api = { renderStack: renderStack };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.BlockCounting = root.BlockCounting || {};
    root.BlockCounting.renderStack = renderStack;
  }
})(typeof window !== "undefined" ? window : this);
