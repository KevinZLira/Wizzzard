/**
 * search-engine.js
 *
 * Small, dependency-free fuzzy search over an in-memory index. Built for
 * "instant while typing": no network calls, no heavy libs — just a
 * subsequence-matching scorer with word-boundary bonuses plus a cheap
 * edit-distance fallback for near-miss typos ("gausian" -> "gaussian").
 */

window.KVN = window.KVN || {};

window.KVN.SearchEngine = (function () {
  function normalize(str) {
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, ""); // strip accents (desfoque/borrão -> desfoque/borrao)
  }

  /**
   * Subsequence fuzzy match: every character of `query` must appear in
   * `text` in order (not necessarily contiguous). Returns a score
   * (higher is better) or -Infinity if no match.
   */
  function subsequenceScore(query, text) {
    if (query.length === 0) return 0;

    var score = 0;
    var textIndex = 0;
    var queryIndex = 0;
    var consecutiveRun = 0;
    var matchedAtWordStart = false;

    while (queryIndex < query.length && textIndex < text.length) {
      if (query[queryIndex] === text[textIndex]) {
        consecutiveRun += 1;
        score += 1 + consecutiveRun * 2; // reward consecutive runs heavily

        var isWordStart = textIndex === 0 || /[\s\-_/]/.test(text[textIndex - 1]);
        if (isWordStart) {
          score += 8;
          matchedAtWordStart = true;
        }
        queryIndex += 1;
      } else {
        consecutiveRun = 0;
      }
      textIndex += 1;
    }

    if (queryIndex < query.length) return -Infinity; // not all query chars matched

    // Prefer shorter targets (more specific match) and earlier matches overall.
    score -= text.length * 0.05;
    if (matchedAtWordStart) score += 4;

    return score;
  }

  /** Cheap Levenshtein distance. */
  function levenshtein(a, b) {
    var dp = [];
    for (var i = 0; i <= a.length; i++) {
      dp.push([i]);
    }
    for (var j = 0; j <= b.length; j++) dp[0][j] = j;
    for (var ii = 1; ii <= a.length; ii++) {
      for (var jj = 1; jj <= b.length; jj++) {
        dp[ii][jj] =
          a[ii - 1] === b[jj - 1]
            ? dp[ii - 1][jj - 1]
            : 1 + Math.min(dp[ii - 1][jj - 1], dp[ii - 1][jj], dp[ii][jj - 1]);
      }
    }
    return dp[a.length][b.length];
  }

  /**
   * Scores one searchable field (name, alias, keyword...) against a
   * query. Tries exact/substring/subsequence first; falls back to
   * token-level typo tolerance — but only for the effect's own
   * name/aliases (weight >= 2), not loose keyword/category hints, which
   * throw up coincidental matches (e.g. "zoom" landing 1 edit from
   * "room").
   */
  function scoreField(query, field, weight) {
    var q = normalize(query);
    var f = normalize(field);
    if (!q) return 0;

    if (f === q) return 1000 * weight;
    if (f.indexOf(q) === 0) return 500 * weight;
    if (f.indexOf(q) !== -1) return 250 * weight;

    var sub = subsequenceScore(q, f);
    if (sub > -Infinity) return sub * weight;

    if (weight < 2) return 0;

    var qTokens = q.split(/\s+/);
    var fTokens = f.split(/\s+/);
    var typoScore = 0;
    for (var qi = 0; qi < qTokens.length; qi++) {
      var qt = qTokens[qi];
      if (qt.length < 3) continue;
      for (var fi = 0; fi < fTokens.length; fi++) {
        var ft = fTokens[fi];
        var maxAllowed = qt.length <= 4 ? 1 : 2;
        var dist = levenshtein(qt, ft);
        if (dist <= maxAllowed) {
          typoScore += (100 - dist * 30) * weight;
        }
      }
    }
    return typoScore;
  }

  /**
   * entries: [{ id, primaryText, aliases: [...], keywords: [...], category, boost }]
   * Returns entries sorted by score desc, each annotated with `_score`.
   */
  function search(entries, query, limit) {
    limit = limit || 8;
    var trimmed = query.trim();
    if (!trimmed) {
      return entries
        .slice()
        .sort(function (a, b) {
          return (b.boost || 0) - (a.boost || 0);
        })
        .slice(0, limit);
    }

    var scored = [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var best = scoreField(trimmed, entry.primaryText, 3);
      (entry.aliases || []).forEach(function (alias) {
        best = Math.max(best, scoreField(trimmed, alias, 2.5));
      });
      (entry.keywords || []).forEach(function (kw) {
        best = Math.max(best, scoreField(trimmed, kw, 1.5));
      });
      if (entry.category) {
        best = Math.max(best, scoreField(trimmed, entry.category, 1));
      }

      if (best > 0) {
        var copy = {};
        for (var k in entry) copy[k] = entry[k];
        copy._score = best + (entry.boost || 0);
        scored.push(copy);
      }
    }

    scored.sort(function (a, b) {
      return b._score - a._score;
    });
    return scored.slice(0, limit);
  }

  return { search: search, normalize: normalize, subsequenceScore: subsequenceScore, levenshtein: levenshtein };
})();
