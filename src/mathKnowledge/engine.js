// Math Knowledge — shared engine + cartridge registry.
//
// Per research/MathKnowledge_Spec.md §2. The engine KNOWS NO MATH (§2.1): it
// owns item assembly, the registry, the drill loop, scoring, and review, and it
// talks to every cartridge through the one fixed contract (§2.2) —
// generate(difficulty) / correct answer / distractors(...) / explain(problem).
// It is never edited to add a cartridge (§2.4); a cartridge is just registered.
//
// This module also now owns the 5-option ASSEMBLY (shuffle + pooling +
// correctIndex) that each cartridge used to carry. That logic was flagged in the
// cartridges as a future-extraction candidate (§2.4/§6.5); with the engine in
// place it lives here, in ONE spot, instead of duplicated three times.
//
// Mirrors the Table Reading separation: drill.js (generateDrill / nextItem) and
// scoring.js (scoreDrill / reviewMissed), folded into one engine because the MK
// registry, assembly, and drill loop are small and tightly coupled.

(function (root) {
  // ---- item assembly (lifted out of the cartridges) ----------------------
  // Call the cartridge contract and assemble the displayable item: shuffle the
  // correct answer in among its 4 distractors so its A–E slot is uniformly
  // random (§4.1.5), record correctIndex, attach optionMeta and the cartridge's
  // own method explanation. Generation options (rng, and any forcing fields like
  // shape/subtype) pass straight through to the cartridge.
  function buildItem(cartridge, difficulty, options) {
    options = options || {};
    if (!options.rng) options = assign({}, options, { rng: Math.random });
    var rng = options.rng;

    var problem = cartridge.generate(difficulty, options);
    var dists = cartridge.distractors(problem, options);

    var pool = [{ value: problem.answer, kind: "correct", pattern: null, correct: true }];
    for (var i = 0; i < dists.length; i++) {
      pool.push({ value: dists[i].value, kind: dists[i].kind, pattern: dists[i].pattern, correct: false });
    }
    // Fisher-Yates shuffle (the same technique each cartridge used).
    for (var j = pool.length - 1; j > 0; j--) {
      var r = Math.floor(rng() * (j + 1));
      var tmp = pool[j]; pool[j] = pool[r]; pool[r] = tmp;
    }

    var optionValues = pool.map(function (p) { return p.value; });
    var correctIndex = -1;
    for (var m = 0; m < pool.length; m++) if (pool[m].correct) correctIndex = m;

    return {
      cartridge: cartridge.id,
      problem: problem,
      prompt: problem.prompt,
      answer: problem.answer,
      options: optionValues,
      correctIndex: correctIndex,
      optionMeta: pool,
      explain: typeof cartridge.explain === "function" ? cartridge.explain(problem) : "",
    };
  }

  // Minimal Object.assign shim (older browsers); engine avoids hard deps.
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }

  // ---- registry (§2.1/§2.2): knows no math, just routes ------------------
  var registry = [];
  function register(cartridge) { registry.push(cartridge); return cartridge; }
  function cartridges() { return registry.slice(); }
  function clearRegistry() { registry.length = 0; }            // for tests
  function byId(id) {
    for (var i = 0; i < registry.length; i++) if (registry[i].id === id) return registry[i];
    return null;
  }

  // Pull ONE random item: choose a registered cartridge, build via the contract.
  function randomItem(difficulty, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    if (registry.length === 0) throw new Error("MathKnowledge engine: no cartridges registered");
    var cart = registry[Math.floor(rng() * registry.length)];
    return buildItem(cart, difficulty, options);
  }

  function shuffleInPlace(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var r = Math.floor(rng() * (i + 1));
      var t = arr[i]; arr[i] = arr[r]; arr[r] = t;
    }
    return arr;
  }

  // ---- drill loop with INTERLEAVING (spec's interleaving intent) ---------
  // Round-robin over a per-cycle reshuffled cartridge order, so all three types
  // appear evenly mixed and never blocked (no long run of one type) — stronger
  // than pure-random selection, which can clump. Default 25 items = the real MK
  // subtest length (dossier §4.4). Difficulty defaults to "medium" (knob still
  // F-1: the level→range mapping is an unvalidated default).
  var DEFAULT_ITEM_COUNT = 25;
  var DEFAULT_DIFFICULTY = "medium";
  function generateDrill(options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var difficulty = options.difficulty || DEFAULT_DIFFICULTY;
    var itemCount = options.itemCount !== undefined ? options.itemCount : DEFAULT_ITEM_COUNT;
    if (registry.length === 0) throw new Error("MathKnowledge engine: no cartridges registered");

    var items = [];
    var order = [];
    while (items.length < itemCount) {
      if (order.length === 0) order = shuffleInPlace(cartridges(), rng); // fresh cycle
      var cart = order.shift();
      items.push(buildItem(cart, difficulty, { rng: rng }));
    }
    return { itemCount: itemCount, difficulty: difficulty, items: items };
  }

  // ---- practice: next item (open-ended), avoiding an exact back-to-back ---
  // Mirrors Table Reading's nextItem no-immediate-repeat rule, here keyed on the
  // displayed prompt so practice never shows the identical problem twice running.
  function nextItem(prevItem, options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var difficulty = options.difficulty || DEFAULT_DIFFICULTY;
    var item = randomItem(difficulty, { rng: rng });
    var attempts = 0;
    while (prevItem && item.prompt === prevItem.prompt) {
      item = randomItem(difficulty, { rng: rng });
      if (++attempts > 1000) break; // safety valve
    }
    return item;
  }

  // ---- scoring + review (mirror Table Reading scoring.js) ----------------
  // Number-correct, NO guessing penalty (§1): an unanswered item is just wrong.
  function scoreDrill(items, answers) {
    answers = answers || [];
    var correct = 0;
    for (var i = 0; i < items.length; i++) if (answers[i] === items[i].correctIndex) correct++;
    return correct;
  }

  function reviewMissed(items, answers) {
    answers = answers || [];
    var missed = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var chosenIndex = answers[i];
      if (chosenIndex === item.correctIndex) continue;
      missed.push({
        number: i + 1,
        prompt: item.prompt,
        chosen: (chosenIndex === null || chosenIndex === undefined) ? null : item.options[chosenIndex],
        correct: item.options[item.correctIndex],
        explain: item.explain,
      });
    }
    return missed;
  }

  var api = {
    register: register,
    cartridges: cartridges,
    clearRegistry: clearRegistry,
    byId: byId,
    buildItem: buildItem,
    randomItem: randomItem,
    generateDrill: generateDrill,
    nextItem: nextItem,
    scoreDrill: scoreDrill,
    reviewMissed: reviewMissed,
    DEFAULT_ITEM_COUNT: DEFAULT_ITEM_COUNT,
    DEFAULT_DIFFICULTY: DEFAULT_DIFFICULTY,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.MathKnowledge = root.MathKnowledge || {};
    root.MathKnowledge.engine = api;
  }
})(typeof window !== "undefined" ? window : this);
