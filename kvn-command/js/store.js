/**
 * store.js
 *
 * Local persistence for user state: favorites, hidden effects, recently
 * used, and settings (#7, #8, #9, #22). Uses localStorage — UXP panels
 * run in a standard web view context, and this is per-user, per-machine
 * preference data with no need for project-file portability, so there's
 * no reason to reach for anything heavier (no server, no project data).
 */

const STORAGE_KEY = "kvn-command:v1";

const DEFAULT_SETTINGS = {
  resultLimit: 8,
  showRecent: true,
  showAudioEffects: true,
  showHiddenEffects: false,
  shortcutHint: "Cmd/Ctrl + K", // reminder label only, see README re: UXP shortcut limitation
};

const MAX_RECENT = 12;

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  const raw = readRaw();
  return {
    settings: { ...DEFAULT_SETTINGS, ...(raw && raw.settings) },
    favorites: (raw && raw.favorites) || [],
    hidden: (raw && raw.hidden) || [],
    recent: (raw && raw.recent) || [],
  };
}

function save(state) {
  writeRaw(state);
}

function toggleFavorite(state, effectId) {
  const isFav = state.favorites.includes(effectId);
  const favorites = isFav
    ? state.favorites.filter((id) => id !== effectId)
    : [...state.favorites, effectId];
  const next = { ...state, favorites };
  save(next);
  return next;
}

function toggleHidden(state, effectId) {
  const isHidden = state.hidden.includes(effectId);
  const hidden = isHidden
    ? state.hidden.filter((id) => id !== effectId)
    : [...state.hidden, effectId];
  const next = { ...state, hidden };
  save(next);
  return next;
}

function pushRecent(state, effectId) {
  const recent = [effectId, ...state.recent.filter((id) => id !== effectId)].slice(
    0,
    MAX_RECENT
  );
  const next = { ...state, recent };
  save(next);
  return next;
}

function updateSettings(state, patch) {
  const next = { ...state, settings: { ...state.settings, ...patch } };
  save(next);
  return next;
}

module.exports = {
  DEFAULT_SETTINGS,
  load,
  save,
  toggleFavorite,
  toggleHidden,
  pushRecent,
  updateSettings,
};
