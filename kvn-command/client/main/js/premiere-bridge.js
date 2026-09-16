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
    if (!response) {
      return {
        effects: [],
        audioSupported: false,
        error: bridge.lastError || "No response from host (evalScript returned nothing parseable).",
      };
    }

    var effects = [];
    (response.video || []).forEach(function (e) {
      effects.push({ displayName: e.displayName, matchName: e.matchName, kind: MediaKind.VIDEO });
    });
    (response.audio || []).forEach(function (e) {
      effects.push({ displayName: e.displayName, matchName: e.matchName, kind: MediaKind.AUDIO });
    });

    return {
      effects: effects,
      audioSupported: !!response.audioSupported,
      error: response.error || null,
      debug: response.debug || null,
    };
  }

  async function applyEffectToSelection(effect, context) {
    if (!context || context.count === 0) {
      throw new Error("NO_TARGET_SELECTED");
    }
    if (context.kind !== effect.kind && context.kind !== MediaKind.MIXED) {
      throw new Error("NO_MATCHING_TARGET");
    }

    // matchName isn't resolvable from the host's effect list (see
    // host/ppro.jsx) — displayName is what's actually confirmed working,
    // so that's what gets looked up on the host side too.
    var response = await bridge.callHostJson("kvnApplyEffect", [effect.displayName, effect.kind]);
    if (!response) throw new Error("HOST_UNAVAILABLE");
    return { appliedTo: response.appliedTo || 0, errors: response.errors || [], debug: response.debug || null };
  }

  async function listHostTransitions() {
    var response = await bridge.callHostJson("kvnListTransitions", []);
    if (!response) {
      return {
        transitions: [],
        audioSupported: false,
        error: bridge.lastError || "No response from host (evalScript returned nothing parseable).",
      };
    }

    var transitions = [];
    (response.video || []).forEach(function (t) {
      transitions.push({ displayName: t.displayName, kind: MediaKind.VIDEO });
    });
    (response.audio || []).forEach(function (t) {
      transitions.push({ displayName: t.displayName, kind: MediaKind.AUDIO });
    });

    return { transitions: transitions, audioSupported: !!response.audioSupported, error: response.error || null };
  }

  async function applyTransitionToSelection(transition, context, position) {
    if (!context || context.count === 0) {
      throw new Error("NO_TARGET_SELECTED");
    }
    if (context.kind !== transition.kind && context.kind !== MediaKind.MIXED) {
      throw new Error("NO_MATCHING_TARGET");
    }

    var response = await bridge.callHostJson("kvnApplyTransition", [transition.displayName, transition.kind, position || "start"]);
    if (!response) throw new Error("HOST_UNAVAILABLE");
    return { appliedTo: response.appliedTo || 0, errors: response.errors || [] };
  }

  return {
    MediaKind: MediaKind,
    getSelectionContext: getSelectionContext,
    listHostEffects: listHostEffects,
    applyEffectToSelection: applyEffectToSelection,
    listHostTransitions: listHostTransitions,
    applyTransitionToSelection: applyTransitionToSelection,
  };
})();
