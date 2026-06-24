// Arithmetic Reasoning — shared engine + cartridge registry.
//
// DELIBERATE COPY of src/mathKnowledge/engine.js per
// research/ArithmeticReasoning_Spec.md §3 (Option B): AR rides the SAME engine
// design as Math Knowledge, but on its OWN copy so the two cartridge registries
// never mix. The Math Knowledge engine is not touched, and nothing here is
// shared at runtime — only the behavior is identical.
//
// As in MK, the engine KNOWS NO MATH: it owns item assembly, the registry, the
// drill loop, scoring, and review, and it talks to every cartridge through the
// one fixed contract — generate(difficulty) / correct answer /
// distractors(...) / explain(problem). It is never edited to add a cartridge;
// a cartridge is just registered. The AR-new authored-prose layer lives in the
// cartridges, not here (§3/§4.1).
//
// This module also owns the 5-option ASSEMBLY (shuffle + pooling +
// correctIndex), in ONE spot, instead of duplicated across cartridges.

(function (root) {
  // ---- item assembly (lifted out of the cartridges) ----------------------
  // Call the cartridge contract and assemble the displayable item: shuffle the
  // correct answer in among its 4 distractors so its A–E slot is uniformly
  // random, record correctIndex, attach optionMeta and the cartridge's own
  // method explanation. Generation options (rng, and any forcing fields like
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

  // ---- registry: knows no math, just routes ------------------------------
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
    if (registry.length === 0) throw new Error("ArithmeticReasoning engine: no cartridges registered");
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

  // ---- drill loop with INTERLEAVING --------------------------------------
  // Round-robin over a per-cycle reshuffled cartridge order, so all types
  // appear evenly mixed and never blocked (no long run of one type) — stronger
  // than pure-random selection, which can clump. Default 25 items = the real AR
  // subtest length (ArithmeticReasoning_Spec.md). Difficulty defaults to
  // "medium" (the level→range mapping is an unvalidated default).
  var DEFAULT_ITEM_COUNT = 25;
  var DEFAULT_DIFFICULTY = "medium";
  function generateDrill(options) {
    options = options || {};
    var rng = options.rng || Math.random;
    var difficulty = options.difficulty || DEFAULT_DIFFICULTY;
    var itemCount = options.itemCount !== undefined ? options.itemCount : DEFAULT_ITEM_COUNT;
    if (registry.length === 0) throw new Error("ArithmeticReasoning engine: no cartridges registered");

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
  // Number-correct, NO guessing penalty: an unanswered item is just wrong.
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
    root.ArithmeticReasoning = root.ArithmeticReasoning || {};
    root.ArithmeticReasoning.engine = api;
  }
})(typeof window !== "undefined" ? window : this);
