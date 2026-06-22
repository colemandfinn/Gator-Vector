// Math Knowledge — default cartridge wiring.
//
// The engine knows no math and hardcodes no cartridge names (§2.1). THIS module
// is the wiring layer: it registers the three slice-1 cartridges into the engine
// so the drill UI (math.html) and the test harness get a populated registry from
// one place. Adding a cartridge later means adding one line here — the engine,
// drill loop, scoring, and review stay untouched (§2.4).
//
// Idempotent: safe to load more than once (browser <script> + Node require).

(function (root) {
  var MK, engine, defaults;
  if (typeof module !== "undefined" && module.exports) {
    engine = require("./engine.js");
    defaults = [
      require("./linearEquation.js"),
      require("./area.js"),
      require("./exponents.js"),
    ];
  } else {
    MK = root.MathKnowledge || {};
    engine = MK.engine;
    defaults = [MK.linearEquation, MK.area, MK.exponents];
  }

  for (var i = 0; i < defaults.length; i++) {
    var cart = defaults[i];
    if (cart && !engine.byId(cart.id)) engine.register(cart);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = engine; // convenience: a populated engine for Node callers
  }
})(typeof window !== "undefined" ? window : this);
