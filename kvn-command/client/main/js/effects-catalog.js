/**
 * effects-catalog.js
 *
 * Builds and caches the searchable effect index. Combines the host's
 * real effect list (premiere-bridge) with the local metadata overlay
 * (effects-metadata) and the user's favorites/hidden/recent state
 * (store) into flat, search-ready entries.
 *
 * "Effects as data": nothing here branches on an effect's name;
 * everything is table-driven.
 */

window.KVN = window.KVN || {};

window.KVN.EffectsCatalog = (function () {
  var bridge = window.KVN.PremiereBridge;
  var METADATA = window.KVN.EffectsMetadata;

  var cachedRawEffects = null; // host round-trip result, cached for the panel session
  var lastAudioSupported = false;

  function effectId(hostEffect) {
    return hostEffect.kind + ":" + hostEffect.matchName;
  }

  async function loadRawEffects(options) {
    var forceRefresh = options && options.forceRefresh;
    if (cachedRawEffects && !forceRefresh) return cachedRawEffects;

    var result = await bridge.listHostEffects();
    lastAudioSupported = result.audioSupported;
    cachedRawEffects = result.effects.map(function (e) {
      return {
        displayName: e.displayName,
        matchName: e.matchName,
        kind: e.kind,
        id: effectId(e),
        meta: METADATA[e.displayName] || null,
      };
    });
    return cachedRawEffects;
  }

  function isAudioSupported() {
    return lastAudioSupported;
  }

  /**
   * Produces the list of searchable entries, respecting user settings
   * (show audio effects, show hidden effects) and annotating
   * favorite/recent status.
   */
  function buildSearchPool(rawEffects, opts) {
    var settings = opts.settings;
    var favorites = opts.favorites;
    var hidden = opts.hidden;
    var recent = opts.recent;

    return rawEffects
      .filter(function (e) {
        return settings.showAudioEffects || e.kind !== bridge.MediaKind.AUDIO;
      })
      .filter(function (e) {
        return settings.showHiddenEffects || hidden.indexOf(e.id) === -1;
      })
      .map(function (e) {
        var isFavorite = favorites.indexOf(e.id) !== -1;
        var recentIndex = recent.indexOf(e.id);
        var isHidden = hidden.indexOf(e.id) !== -1;
        return {
          id: e.id,
          kind: e.kind,
          matchName: e.matchName,
          displayName: e.displayName,
          primaryText: e.displayName,
          category: (e.meta && e.meta.category) || (e.kind === bridge.MediaKind.AUDIO ? "Audio Effects" : "Video Effects"),
          keywords: (e.meta && e.meta.keywords) || [],
          aliases: [],
          isFavorite: isFavorite,
          isHidden: isHidden,
          isRecent: recentIndex !== -1,
          // Favorites and recently-used surface first when relevant
          // without drowning out a strong text match — a modest additive
          // boost, not a hard sort override.
          boost: (isFavorite ? 60 : 0) + (recentIndex !== -1 ? 30 - recentIndex : 0),
        };
      });
  }

  return { loadRawEffects: loadRawEffects, buildSearchPool: buildSearchPool, effectId: effectId, isAudioSupported: isAudioSupported };
})();
