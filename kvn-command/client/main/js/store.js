/**
 * store.js
 *
 * Local persistence for user state: favorites, hidden effects, recently
 * used, and settings. Uses localStorage — the CEP panel is a standard
 * Chromium webview, and this is per-user, per-machine preference data
 * with no need for project-file portability.
 */

window.KVN = window.KVN || {};

window.KVN.Store = (function () {
  var STORAGE_KEY = "kvn-command:v1";

  var DEFAULT_SETTINGS = {
    resultLimit: 8,
    showRecent: true,
    showAudioEffects: true,
    showHiddenEffects: false,
    shortcutHint: "Ctrl+Cmd+K", // reminder label only — Cmd+K alone is Premiere's own Cut shortcut; see README re: the real bg-extension hotkey setup
  };

  var MAX_RECENT = 12;

  function readRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error("[KVN Command] Failed to read local store:", err);
      return null;
    }
  }

  function writeRaw(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("[KVN Command] Failed to persist local store:", err);
    }
  }

  function load() {
    var raw = readRaw();
    return {
      settings: Object.assign({}, DEFAULT_SETTINGS, raw && raw.settings),
      favorites: (raw && raw.favorites) || [],
      hidden: (raw && raw.hidden) || [],
      recent: (raw && raw.recent) || [],
    };
  }

  function save(state) {
    writeRaw(state);
  }

  function toggleFavorite(state, effectId) {
    var isFav = state.favorites.indexOf(effectId) !== -1;
    var favorites = isFav
      ? state.favorites.filter(function (id) {
          return id !== effectId;
        })
      : state.favorites.concat([effectId]);
    var next = Object.assign({}, state, { favorites: favorites });
    save(next);
    return next;
  }

  function toggleHidden(state, effectId) {
    var isHidden = state.hidden.indexOf(effectId) !== -1;
    var hidden = isHidden
      ? state.hidden.filter(function (id) {
          return id !== effectId;
        })
      : state.hidden.concat([effectId]);
    var next = Object.assign({}, state, { hidden: hidden });
    save(next);
    return next;
  }

  function pushRecent(state, effectId) {
    var recent = [effectId]
      .concat(
        state.recent.filter(function (id) {
          return id !== effectId;
        })
      )
      .slice(0, MAX_RECENT);
    var next = Object.assign({}, state, { recent: recent });
    save(next);
    return next;
  }

  function updateSettings(state, patch) {
    var next = Object.assign({}, state, { settings: Object.assign({}, state.settings, patch) });
    save(next);
    return next;
  }

  return {
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    load: load,
    save: save,
    toggleFavorite: toggleFavorite,
    toggleHidden: toggleHidden,
    pushRecent: pushRecent,
    updateSettings: updateSettings,
  };
})();
