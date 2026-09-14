/**
 * premiere-bridge.js (CEP)
 *
 * JS-side counterpart to host/ppro.jsx. Same responsibility as the old
 * UXP version — the only file that knows how the host is actually talked
 * to — just over evalScript instead of require("premierepro").
 */

window.KVN = window.KVN || {};

window.KVN.PremiereBridge = (function () {
  var MediaKind = Object.freeze({
    VIDEO: "video",
    AUDIO: "audio",
    MIXED: "mixed",
    UNKNOWN: "unknown",
  });

  var bridge = window.KVN.HostBridge;

  async function getSelectionContext() {
    var response = await bridge.callHostJson("kvnGetContext", []);
    if (!response) return { count: 0, kind: MediaKind.UNKNOWN };
    return { count: response.count || 0, kind: response.kind || MediaKind.UNKNOWN };
  }

  async function listHostEffects() {
    var response = await bridge.callHostJson("kvnListEffects", []);
    if (!response) return { effects: [], audioSupported: false };

    var effects = [];
    (response.video || []).forEach(function (e) {
      effects.push({ displayName: e.displayName, matchName: e.matchName, kind: MediaKind.VIDEO });
    });
    (response.audio || []).forEach(function (e) {
      effects.push({ displayName: e.displayName, matchName: e.matchName, kind: MediaKind.AUDIO });
    });

    return { effects: effects, audioSupported: !!response.audioSupported };
  }

  async function applyEffectToSelection(effect, context) {
    if (!context || context.count === 0) {
      throw new Error("NO_TARGET_SELECTED");
    }
    if (context.kind !== effect.kind && context.kind !== MediaKind.MIXED) {
      throw new Error("NO_MATCHING_TARGET");
    }

    var response = await bridge.callHostJson("kvnApplyEffect", [effect.matchName, effect.kind]);
    if (!response) throw new Error("HOST_UNAVAILABLE");
    return { appliedTo: response.appliedTo || 0, errors: response.errors || [] };
  }

  return { MediaKind: MediaKind, getSelectionContext: getSelectionContext, listHostEffects: listHostEffects, applyEffectToSelection: applyEffectToSelection };
})();
