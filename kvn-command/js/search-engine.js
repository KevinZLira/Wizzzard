/**
 * search-engine.js
 *
 * Small, dependency-free fuzzy search over an in-memory index. Built for
 * "instant while typing" (#4/#21): no network calls, no heavy libs — just
 * a subsequence-matching scorer with word-boundary bonuses plus a cheap
 * edit-distance fallback for near-miss typos ("gausian" -> "gaussian").
 */

function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // strip accents (desfoque/borrão -> desfoque/borrao)
}

/**
 * Subsequence fuzzy match: every character of `query` must appear in
 * `text` in order (not necessarily contiguous). Returns a score (higher
 * is better) or -Infinity if no match.
 */
function subsequenceScore(query, text) {
  if (query.length === 0) return 0;

  let score = 0;
  let textIndex = 0;
  let queryIndex = 0;
  let consecutiveRun = 0;
  let matchedAtWordStart = false;

  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      consecutiveRun += 1;
      score += 1 + consecutiveRun * 2; // reward consecutive runs heavily

      const isWordStart = textIndex === 0 || /[\s\-_/]/.test(text[textIndex - 1]);
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

/** Cheap Levenshtein distance, capped for performance on short strings. */
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Scores one searchable field (name, alias, keyword...) against a query.
 * Tries exact/substring/subsequence first; falls back to token-level
 * typo tolerance so "gausian blur" still finds "Gaussian Blur".
 */
function scoreField(query, field, weight) {
  const q = normalize(query);
  const f = normalize(field);
  if (!q) return 0;

  if (f === q) return 1000 * weight;
  if (f.startsWith(q)) return 500 * weight;
  if (f.includes(q)) return 250 * weight;

  const sub = subsequenceScore(q, f);
  if (sub > -Infinity) return sub * weight;

  // Typo tolerance only applies to the effect's own name/aliases — running
  // edit-distance against loose keyword/category hints throws up
  // coincidental matches (e.g. "zoom" landing 1 edit from "room").
  if (weight < 2) return 0;

  const qTokens = q.split(/\s+/);
  const fTokens = f.split(/\s+/);
  let typoScore = 0;
  for (const qt of qTokens) {
    if (qt.length < 3) continue;
    for (const ft of fTokens) {
      const maxAllowed = qt.length <= 4 ? 1 : 2;
      const dist = levenshtein(qt, ft);
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
function search(entries, query, limit = 8) {
  const trimmed = query.trim();
  if (!trimmed) {
    return entries
      .slice()
      .sort((a, b) => (b.boost || 0) - (a.boost || 0))
      .slice(0, limit);
  }

  const scored = [];
  for (const entry of entries) {
    let best = scoreField(trimmed, entry.primaryText, 3);
    for (const alias of entry.aliases || []) {
      best = Math.max(best, scoreField(trimmed, alias, 2.5));
    }
    for (const kw of entry.keywords || []) {
      best = Math.max(best, scoreField(trimmed, kw, 1.5));
    }
    if (entry.category) {
      best = Math.max(best, scoreField(trimmed, entry.category, 1));
    }

    if (best > 0) {
      scored.push({ ...entry, _score: best + (entry.boost || 0) });
    }
  }

  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, limit);
}

module.exports = { search, normalize, subsequenceScore, levenshtein };
