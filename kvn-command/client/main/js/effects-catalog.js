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
  var normalize = window.KVN.SearchEngine.normalize;

  var cachedRawEffects = null; // host round-trip result, cached for the panel session
  var lastAudioSupported = false;
  var lastError = null;
  var lastDebug = null; // kept even on a "successful" load — useful when items load but with bad/empty fields

  // Premiere returns effect names in whatever language it's running in
  // (confirmed: a PT-BR host returns PT-BR display names), so metadata
  // entries can't be keyed by a single displayName string the way a
  // single-language product could. Build a normalize()d name -> entry
  // index from EffectsMetadata's `names` lists instead, once, so a
  // Portuguese OR English (or whichever names are listed) display name
  // both resolve to the same enrichment.
  var metadataIndex = null;
  function getMetadataIndex() {
    if (metadataIndex) return metadataIndex;
    metadataIndex = {};
    METADATA.forEach(function (entry) {
      entry.names.forEach(function (name) {
        metadataIndex[normalize(name)] = entry;
      });
    });
    return metadataIndex;
  }

  function effectId(hostEffect) {
    // matchName is null for every effect on this host (see host/ppro.jsx)
    // — using it here would collide every effect of a given kind onto
    // the same id, breaking favorites/hidden/recent entirely. displayName
    // is what's actually confirmed working.
    return hostEffect.kind + ":" + hostEffect.displayName;
  }

  async function loadRawEffects(options) {
    var forceRefresh = options && options.forceRefresh;
    if (cachedRawEffects && !forceRefresh) return cachedRawEffects;

    var result = await bridge.listHostEffects();
    lastAudioSupported = result.audioSupported;
    lastDebug = result.debug || null;
    if (result.effects.length === 0) {
      lastError = result.error || (result.debug ? "Host reported zero effects. debug: " + JSON.stringify(result.debug) : null);
    } else {
      lastError = null;
    }
    var index = getMetadataIndex();
    cachedRawEffects = result.effects.map(function (e) {
      return {
        displayName: e.displayName,
        matchName: e.matchName,
        kind: e.kind,
        id: effectId(e),
        meta: index[normalize(e.displayName)] || null,
      };
    });
    return cachedRawEffects;
  }

  function isAudioSupported() {
    return lastAudioSupported;
  }

  function getLastError() {
    return lastError;
  }

  function getLastDebug() {
    return lastDebug;
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
          type: "effect",
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

  return {
    loadRawEffects: loadRawEffects,
    buildSearchPool: buildSearchPool,
    effectId: effectId,
    isAudioSupported: isAudioSupported,
    getLastError: getLastError,
    getLastDebug: getLastDebug,
  };
})();
