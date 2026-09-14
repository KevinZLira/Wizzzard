/**
 * effects-catalog.js
 *
 * Builds and caches the searchable effect index (#21: index once, not
 * per keystroke). Combines the host's real effect list (premiere-bridge)
 * with the local metadata overlay (effects-metadata) and the user's
 * favorites/hidden/recent state (store) into flat, search-ready entries.
 *
 * This is the "effects as data" layer from #23 — nothing here branches
 * on effect name via if/else; everything is table-driven.
 */

const { listHostEffects, MediaKind } = require("./premiere-bridge.js");
const { EFFECTS_METADATA } = require("./effects-metadata.js");

let cachedRawEffects = null; // host round-trip result, cached for the panel session

function effectId(hostEffect) {
  // Video effects have a stable matchName; audio ones don't (see
  // premiere-bridge.js), so fall back to kind+displayName as the key.
  return `${hostEffect.kind}:${hostEffect.matchName || hostEffect.displayName}`;
}

async function loadRawEffects({ forceRefresh = false } = {}) {
  if (cachedRawEffects && !forceRefresh) return cachedRawEffects;
  const hostEffects = await listHostEffects();
  cachedRawEffects = hostEffects.map((e) => ({
    ...e,
    id: effectId(e),
    meta: EFFECTS_METADATA[e.displayName] || null,
  }));
  return cachedRawEffects;
}

/**
 * Produces the list of searchable entries, respecting user settings
 * (show audio effects, show hidden effects) and annotating favorite/
 * recent status. Sorting/filtering by query happens in search-engine.js;
 * this just prepares the pool.
 */
function buildSearchPool(rawEffects, { settings, favorites, hidden, recent }) {
  return rawEffects
    .filter((e) => settings.showAudioEffects || e.kind !== MediaKind.AUDIO)
    .filter((e) => settings.showHiddenEffects || !hidden.includes(e.id))
    .map((e) => {
      const isFavorite = favorites.includes(e.id);
      const recentIndex = recent.indexOf(e.id);
      const isHidden = hidden.includes(e.id);
      return {
        id: e.id,
        kind: e.kind,
        matchName: e.matchName,
        displayName: e.displayName,
        primaryText: e.displayName,
        category: (e.meta && e.meta.category) || (e.kind === MediaKind.AUDIO ? "Audio Effects" : "Video Effects"),
        keywords: (e.meta && e.meta.keywords) || [],
        aliases: [],
        isFavorite,
        isHidden,
        isRecent: recentIndex !== -1,
        // Favorites and recently-used should surface first when relevant
        // (#7, #9) without drowning out a strong text match, so this is a
        // modest additive boost, not a hard sort override.
        boost: (isFavorite ? 60 : 0) + (recentIndex !== -1 ? 30 - recentIndex : 0),
      };
    });
}

module.exports = { loadRawEffects, buildSearchPool, effectId };
