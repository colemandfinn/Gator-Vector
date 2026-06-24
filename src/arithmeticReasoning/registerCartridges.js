// Arithmetic Reasoning — default cartridge wiring.
//
// The AR engine knows no math and hardcodes no cartridge names (mirrors MK §2.1).
// THIS module is the wiring layer: it registers the slice-1 cartridge into the AR
// engine so the drill UI (arithmetic.html) and the test harness get a populated
// registry from one place. Adding the next AR cartridge later means adding one
// line here — the engine, drill loop, scoring, and review stay untouched (§4.3).
//
// Idempotent: safe to load more than once (browser <script> + Node require).

(function (root) {
  var AR, engine, defaults;
  if (typeof module !== "undefined" && module.exports) {
    engine = require("./engine.js");
    defaults = [
      require("./rateTimeDistance.js"),
      require("./percentages.js"),
      require("./proportions.js"),
    ];
  } else {
    AR = root.ArithmeticReasoning || {};
    engine = AR.engine;
    defaults = [AR.rateTimeDistance, AR.percentages, AR.proportions];
  }

  for (var i = 0; i < defaults.length; i++) {
    var cart = defaults[i];
    if (cart && !engine.byId(cart.id)) engine.register(cart);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = engine; // convenience: a populated engine for Node callers
  }
})(typeof window !== "undefined" ? window : this);
