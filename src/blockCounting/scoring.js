// Block Counting — scoring (pure functions).
//
// Per research/BlockCounting_Spec.md "Item / drill shape": scoring is
// number-correct with NO guessing penalty — identical contract to Table Reading
// (src/tableReading/scoring.js). An unanswered item is simply wrong. Each item
// carries `correctIndex` (the position of the true count in its sorted options);
// the user's answer for item i is the option index they chose, or null/undefined
// if they didn't answer.

(function (root) {
  // Count how many answers match their item's correctIndex. Pure: no state,
  // no DOM, no RNG — same inputs always give the same count.
  function scoreDrill(items, answers) {
    answers = answers || [];
    var correct = 0;
    for (var i = 0; i < items.length; i++) {
      if (answers[i] === items[i].correctIndex) correct++;
    }
    return correct;
  }

  // Pure helper for the results screen: the items the user got wrong (including
  // unanswered), with the value they chose and the correct value. No penalty
  // logic — just "what to review".
  function reviewMissed(items, answers) {
    answers = answers || [];
    var missed = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var chosenIndex = answers[i];
      if (chosenIndex === item.correctIndex) continue; // got it right
      missed.push({
        number: i + 1,
        marked: item.marked,
        chosen: (chosenIndex === null || chosenIndex === undefined)
          ? null
          : item.options[chosenIndex],
        correct: item.options[item.correctIndex],
      });
    }
    return missed;
  }

  var api = { scoreDrill: scoreDrill, reviewMissed: reviewMissed };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.BlockCounting = root.BlockCounting || {};
    root.BlockCounting.scoreDrill = scoreDrill;
    root.BlockCounting.reviewMissed = reviewMissed;
  }
})(typeof window !== "undefined" ? window : this);
