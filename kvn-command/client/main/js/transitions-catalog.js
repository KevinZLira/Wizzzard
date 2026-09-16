/**
 * transitions-catalog.js
 *
 * Mirrors effects-catalog.js's structure for transitions — a separate
 * host API (host/ppro.jsx's kvnListTransitions/kvnApplyTransition) with
 * different apply semantics (an edit point, not a whole clip), so it's
 * kept as its own catalog rather than forced into the effects one.
 */

window.KVN = window.KVN || {};

window.KVN.TransitionsCatalog = (function () {
  var bridge = window.KVN.PremiereBridge;
  var METADATA = window.KVN.TransitionsMetadata;
  var normalize = window.KVN.SearchEngine.normalize;

  var cachedRawTransitions = null;
  var lastAudioSupported = false;
  var lastError = null;
  var lastDebug = null;

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

  function transitionId(hostTransition) {
    return "transition:" + hostTransition.kind + ":" + hostTransition.displayName;
  }

  async function loadRawTransitions(options) {
    var forceRefresh = options && options.forceRefresh;
    if (cachedRawTransitions && !forceRefresh) return cachedRawTransitions;

    var result = await bridge.listHostTransitions();
    lastAudioSupported = result.audioSupported;
    lastDebug = result.debug || null;
    lastError =
      result.transitions.length === 0
        ? result.error || (result.debug ? "Host reported zero transitions. debug: " + JSON.stringify(result.debug) : null)
        : null;

    var index = getMetadataIndex();
    cachedRawTransitions = result.transitions.map(function (t) {
      return {
        displayName: t.displayName,
        kind: t.kind,
        id: transitionId(t),
        meta: index[normalize(t.displayName)] || null,
      };
    });
    return cachedRawTransitions;
  }

  function isAudioSupported() {
    return lastAudioSupported;
  }

  function getLastError() {
    return lastError;
  }

  /** Same shape as effects-catalog's buildSearchPool entries, plus type: "transition". */
  function buildSearchPool(rawTransitions, opts) {
    var settings = opts.settings;
    var favorites = opts.favorites;
    var hidden = opts.hidden;
    var recent = opts.recent;

    return rawTransitions
      .filter(function (t) {
        return settings.showAudioEffects || t.kind !== bridge.MediaKind.AUDIO;
      })
      .filter(function (t) {
        return settings.showHiddenEffects || hidden.indexOf(t.id) === -1;
      })
      .map(function (t) {
        var isFavorite = favorites.indexOf(t.id) !== -1;
        var recentIndex = recent.indexOf(t.id);
        var isHidden = hidden.indexOf(t.id) !== -1;
        return {
          id: t.id,
          type: "transition",
          kind: t.kind,
          displayName: t.displayName,
          primaryText: t.displayName,
          category: (t.meta && t.meta.category) || "Transitions",
          keywords: (t.meta && t.meta.keywords) || [],
          aliases: [],
          isFavorite: isFavorite,
          isHidden: isHidden,
          isRecent: recentIndex !== -1,
          boost: (isFavorite ? 60 : 0) + (recentIndex !== -1 ? 30 - recentIndex : 0),
        };
      });
  }

  return {
    loadRawTransitions: loadRawTransitions,
    buildSearchPool: buildSearchPool,
    transitionId: transitionId,
    isAudioSupported: isAudioSupported,
    getLastError: getLastError,
  };
})();
