/**
 * app.js — KVN Command panel controller.
 *
 * Renders the command-palette UI inside the UXP panel body and wires up
 * keyboard-first interaction: type -> instant results -> arrow keys ->
 * Enter to apply (#1, #4, #20). Falls back gracefully outside the host
 * (e.g. loaded in a plain browser for UI iteration) by treating the
 * Premiere bridge as unavailable rather than throwing.
 */

/* global require, document, localStorage */

/**
 * If anything below throws — during module load, during the first render,
 * or inside an async handler — write the error directly into the panel
 * instead of leaving a silent black rectangle. This is the only way to
 * see what broke without going through UDT's separate DevTools window.
 */
function renderFatalError(err) {
  const message = (err && err.stack) || String(err);
  console.error("[KVN Command] Fatal error:", err);
  try {
    document.body.innerHTML = "";
    const pre = document.createElement("pre");
    pre.style.cssText =
      "color:#ff5c5c;background:#080909;padding:14px;margin:0;white-space:pre-wrap;" +
      "font-family:monospace;font-size:11px;height:100vh;box-sizing:border-box;overflow:auto;";
    pre.textContent = `KVN Command failed to start:\n\n${message}`;
    document.body.appendChild(pre);
  } catch (renderErr) {
    console.error("[KVN Command] Failed to render fatal error UI:", renderErr);
  }
}

let search, store, loadRawEffects, buildSearchPool, bridge;

try {
  // NOTE: app.js is loaded via a plain <script src="js/app.js"> tag rather
  // than require()'d itself, so UXP resolves the require() calls made from
  // inside it relative to the plugin ROOT, not relative to js/ — hence the
  // "js/" prefix here (this bit us: "Module not found" pointing at parent
  // folder "./"). Files required from one another via require() (e.g.
  // effects-catalog.js requiring premiere-bridge.js) don't need this,
  // since normal relative resolution applies once you're inside the
  // require graph.
  ({ search } = require("./js/search-engine.js"));
  store = require("./js/store.js");
  ({ loadRawEffects, buildSearchPool } = require("./js/effects-catalog.js"));

  bridge = null;
  try {
    bridge = require("./js/premiere-bridge.js");
  } catch (err) {
    console.warn("[KVN Command] premierepro host module unavailable — running in preview mode.", err);
  }
} catch (err) {
  renderFatalError(err);
  throw err; // stop the rest of this module from running against a broken state
}

const state = {
  query: "",
  results: [],
  activeIndex: 0,
  view: "palette", // 'palette' | 'settings' | 'manage-favorites' | 'manage-hidden'
  context: { items: [], kind: "unknown" },
  userState: store.load(),
  rawEffects: [],
  loading: true,
};

let rootEl = null;

function groupByCategory(results) {
  const groups = new Map();
  for (const r of results) {
    if (!groups.has(r.category)) groups.set(r.category, []);
    groups.get(r.category).push(r);
  }
  return groups;
}

function contextLabel() {
  if (!bridge) return "PREVIEW MODE — connect inside Premiere Pro to apply effects.";
  if (state.context.items.length === 0) return null;
  if (state.context.kind === "video") return "VIDEO CLIP SELECTED";
  if (state.context.kind === "audio") return "AUDIO CLIP SELECTED";
  return "MIXED SELECTION";
}

function computeResults() {
  if (!state.userState.settings.showRecent && state.query.trim() === "") {
    // Recent-off + empty query: just show a light prompt, not a dump of everything.
    state.results = [];
    return;
  }

  const pool = buildSearchPool(state.rawEffects, {
    settings: state.userState.settings,
    favorites: state.userState.favorites,
    hidden: state.userState.hidden,
    recent: state.userState.recent,
  });

  // Prioritize the selected clip's media kind, without hiding the other
  // kind entirely — the user may still want to search across both (#10).
  const kindBoost = (entry) => {
    if (state.context.kind === "video" && entry.kind === "video") return 20;
    if (state.context.kind === "audio" && entry.kind === "audio") return 20;
    return 0;
  };
  const boosted = pool.map((e) => ({ ...e, boost: (e.boost || 0) + kindBoost(e) }));

  let results;
  if (state.query.trim() === "") {
    // Empty query: surface Recent first (#9), then favorites, then rest.
    results = boosted
      .filter((e) => e.isRecent || e.isFavorite)
      .sort((a, b) => b.boost - a.boost)
      .slice(0, state.userState.settings.resultLimit);
  } else {
    results = search(boosted, state.query, state.userState.settings.resultLimit);
  }

  state.results = results;
  state.activeIndex = 0;
}

async function refreshContext() {
  if (!bridge) {
    state.context = { items: [], kind: "unknown" };
    return;
  }
  try {
    state.context = await bridge.getSelectionContext();
  } catch (err) {
    console.error("[KVN Command] Failed to read selection context:", err);
    state.context = { items: [], kind: "unknown" };
  }
}

async function refreshEffects({ forceRefresh = false } = {}) {
  if (!bridge) {
    state.rawEffects = [];
    state.loading = false;
    return;
  }
  try {
    state.rawEffects = await loadRawEffects({ forceRefresh });
  } catch (err) {
    console.error("[KVN Command] Failed to load host effects:", err);
    state.rawEffects = [];
  }
  state.loading = false;
}

/* ---------------------------- rendering ---------------------------- */

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (children) {
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child == null) continue;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    }
  }
  return node;
}

function renderPalette(container) {
  const palette = el("div", "kvn-palette");

  // Search row
  const searchRow = el("div", "kvn-search-row");
  const prompt = el("span", "kvn-prompt", ">");
  const input = el("input", "kvn-input");
  input.type = "text";
  input.placeholder = "search effects...";
  input.value = state.query;
  input.autofocus = true;

  const shortcutBadge = el("span", "kvn-shortcut-badge", state.userState.settings.shortcutHint);
  const settingsBtn = el("button", "kvn-settings-btn", "⚙");
  settingsBtn.title = "Settings";
  settingsBtn.addEventListener("click", () => {
    state.view = "settings";
    render();
  });

  searchRow.appendChild(prompt);
  searchRow.appendChild(input);
  const context = contextLabel();
  if (context) {
    const contextBadge = el("span", "kvn-shortcut-badge", context);
    contextBadge.title = "Current clip context";
    searchRow.appendChild(contextBadge);
  }
  searchRow.appendChild(shortcutBadge);
  searchRow.appendChild(settingsBtn);
  palette.appendChild(searchRow);

  // Results
  const resultsEl = el("div", "kvn-results");
  renderResultsInto(resultsEl);
  palette.appendChild(resultsEl);

  // Footer hints (contextual, per spec #18)
  const footer = el("div", "kvn-footer", [
    el("span", null, [el("kbd", null, "↑"), el("kbd", null, "↓"), " navigate"]),
    el("span", null, [el("kbd", null, "↵"), " apply"]),
    el("span", null, [el("kbd", null, "esc"), " clear"]),
  ]);
  palette.appendChild(footer);

  const toast = el("div", "kvn-toast");
  palette.appendChild(toast);

  container.appendChild(palette);

  input.addEventListener("input", () => {
    state.query = input.value;
    computeResults();
    renderResultsInto(resultsEl);
  });

  input.addEventListener("keydown", (e) => handleKeydown(e, resultsEl, input, toast));

  // Keyboard-first: focus immediately on open (#4, #19).
  requestAnimationFrame(() => input.focus());
}

function renderResultsInto(resultsEl) {
  resultsEl.innerHTML = "";

  if (bridge && state.context.items.length === 0) {
    resultsEl.appendChild(
      el("div", "kvn-context-banner", [
        el("strong", null, "NO TARGET SELECTED"),
        "Select a clip to apply an effect. You can still search below.",
      ])
    );
  }

  if (state.loading) {
    resultsEl.appendChild(el("div", "kvn-empty", "Indexing effects..."));
    return;
  }

  if (state.results.length === 0) {
    resultsEl.appendChild(
      el(
        "div",
        "kvn-empty",
        state.query.trim()
          ? `No effects found for "${state.query}".`
          : "Start typing to search video and audio effects."
      )
    );
    return;
  }

  const groups = groupByCategory(state.results);
  let flatIndex = 0;
  for (const [category, items] of groups) {
    resultsEl.appendChild(el("div", "kvn-category", category.toUpperCase()));
    for (const item of items) {
      const isActive = flatIndex === state.activeIndex;
      const row = el("div", `kvn-item${isActive ? " kvn-active" : ""}`);
      row.dataset.index = String(flatIndex);

      const indicator = el("div", "kvn-item-indicator");
      const body = el("div", "kvn-item-body", [
        el("div", "kvn-item-name", item.displayName),
        el("div", "kvn-item-sub", item.isRecent ? "Recently used" : item.category),
      ]);
      const star = el("button", `kvn-item-star${item.isFavorite ? " kvn-starred" : ""}`, item.isFavorite ? "★" : "☆");
      star.title = item.isFavorite ? "Remove from favorites" : "Add to favorites";
      star.addEventListener("click", (evt) => {
        evt.stopPropagation();
        state.userState = store.toggleFavorite(state.userState, item.id);
        computeResults();
        renderResultsInto(resultsEl);
      });

      row.appendChild(indicator);
      row.appendChild(body);
      row.appendChild(star);

      row.addEventListener("mouseenter", () => {
        state.activeIndex = flatIndex;
        renderResultsInto(resultsEl);
      });
      row.addEventListener("click", () => applyActive());

      resultsEl.appendChild(row);
      flatIndex += 1;
    }
  }
}

function showToast(toastEl, message, isError) {
  toastEl.textContent = message;
  toastEl.className = `kvn-toast kvn-show${isError ? " kvn-error" : ""}`;
  setTimeout(() => {
    toastEl.className = "kvn-toast";
  }, 1100);
}

async function applyActive() {
  const effect = state.results[state.activeIndex];
  if (!effect) return;

  const toastEl = rootEl.querySelector(".kvn-toast");
  const input = rootEl.querySelector(".kvn-input");

  if (!bridge) {
    showToast(toastEl, "Preview mode — open inside Premiere Pro to apply.", true);
    return;
  }

  if (state.context.items.length === 0) {
    showToast(toastEl, "No target selected.", true);
    return;
  }

  try {
    const { appliedTo, errors } = await bridge.applyEffectToSelection(effect, state.context);
    if (appliedTo > 0) {
      state.userState = store.pushRecent(state.userState, effect.id);
      showToast(toastEl, `Applied ${effect.displayName}`, false);
      // Fast repeat workflow (#15): clear query, keep palette open, refocus.
      state.query = "";
      if (input) input.value = "";
      computeResults();
      renderResultsInto(rootEl.querySelector(".kvn-results"));
      if (input) input.focus();
    } else {
      const reason = errors[0] ? errors[0].reason : "Effect could not be applied.";
      showToast(toastEl, `Could not apply: ${reason}`, true);
    }
  } catch (err) {
    const message =
      err && err.message === "NO_MATCHING_TARGET"
        ? `${effect.displayName} is a ${effect.kind} effect — selection doesn't match.`
        : "Could not apply effect.";
    showToast(toastEl, message, true);
  }
}

function handleKeydown(e, resultsEl, input, toast) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (state.results.length === 0) return;
    state.activeIndex = (state.activeIndex + 1) % state.results.length;
    renderResultsInto(resultsEl);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (state.results.length === 0) return;
    state.activeIndex = (state.activeIndex - 1 + state.results.length) % state.results.length;
    renderResultsInto(resultsEl);
  } else if (e.key === "Enter") {
    e.preventDefault();
    applyActive();
  } else if (e.key === "Escape") {
    e.preventDefault();
    if (state.query) {
      state.query = "";
      input.value = "";
      computeResults();
      renderResultsInto(resultsEl);
    } else {
      input.blur();
    }
  }
}

/* ---------------------------- settings view ---------------------------- */

function settingsRow(labelText, hintText, controlEl) {
  const row = el("div", "kvn-setting-row");
  const label = el("div", null, [el("label", null, labelText), hintText ? el("span", "kvn-setting-hint", hintText) : null]);
  row.appendChild(label);
  row.appendChild(controlEl);
  return row;
}

function renderSettings(container) {
  const wrap = el("div", "kvn-settings");

  const back = el("button", "kvn-back-btn", "← Back to search");
  back.addEventListener("click", () => {
    state.view = "palette";
    render();
  });
  wrap.appendChild(back);

  wrap.appendChild(el("h2", null, "Settings"));

  const shortcutHint = el("input", "kvn-number-input");
  shortcutHint.style.width = "110px";
  shortcutHint.value = state.userState.settings.shortcutHint;
  shortcutHint.addEventListener("change", () => {
    state.userState = store.updateSettings(state.userState, { shortcutHint: shortcutHint.value });
  });
  wrap.appendChild(
    settingsRow(
      "Shortcut reminder",
      "Premiere Pro's UXP panels can't register a global shortcut yet. Bind one via Premiere ▸ Keyboard Shortcuts ▸ Panels ▸ KVN Command — this field is just a label shown next to the search box.",
      shortcutHint
    )
  );

  const resultLimit = el("input", "kvn-number-input");
  resultLimit.type = "number";
  resultLimit.min = "3";
  resultLimit.max = "20";
  resultLimit.value = String(state.userState.settings.resultLimit);
  resultLimit.addEventListener("change", () => {
    const value = Math.max(3, Math.min(20, Number(resultLimit.value) || 8));
    state.userState = store.updateSettings(state.userState, { resultLimit: value });
  });
  wrap.appendChild(settingsRow("Result limit", null, resultLimit));

  wrap.appendChild(
    settingsRow("Show recent", null, toggleInput(state.userState.settings.showRecent, (checked) => {
      state.userState = store.updateSettings(state.userState, { showRecent: checked });
    }))
  );

  wrap.appendChild(
    settingsRow("Show audio effects", null, toggleInput(state.userState.settings.showAudioEffects, (checked) => {
      state.userState = store.updateSettings(state.userState, { showAudioEffects: checked });
    }))
  );

  wrap.appendChild(
    settingsRow("Show hidden effects", null, toggleInput(state.userState.settings.showHiddenEffects, (checked) => {
      state.userState = store.updateSettings(state.userState, { showHiddenEffects: checked });
    }))
  );

  const manageRow = el("div", null);
  const favBtn = el("button", "kvn-link-btn", "Manage Favorites");
  favBtn.addEventListener("click", () => {
    state.view = "manage-favorites";
    render();
  });
  const hiddenBtn = el("button", "kvn-link-btn", "Manage Hidden Effects");
  hiddenBtn.addEventListener("click", () => {
    state.view = "manage-hidden";
    render();
  });
  manageRow.appendChild(favBtn);
  manageRow.appendChild(hiddenBtn);
  wrap.appendChild(manageRow);

  container.appendChild(wrap);
}

function toggleInput(checked, onChange) {
  const input = el("input", "kvn-toggle");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  return input;
}

function renderManageList(container, kind) {
  const wrap = el("div", "kvn-settings");
  const back = el("button", "kvn-back-btn", "← Back to settings");
  back.addEventListener("click", () => {
    state.view = "settings";
    render();
  });
  wrap.appendChild(back);
  wrap.appendChild(el("h2", null, kind === "favorites" ? "Favorites" : "Hidden Effects"));

  const pool = buildSearchPool(state.rawEffects, {
    settings: { ...state.userState.settings, showHiddenEffects: true, showAudioEffects: true },
    favorites: state.userState.favorites,
    hidden: state.userState.hidden,
    recent: state.userState.recent,
  });
  const list = kind === "favorites" ? pool.filter((e) => e.isFavorite) : pool.filter((e) => e.isHidden);

  if (list.length === 0) {
    wrap.appendChild(
      el("div", "kvn-empty", kind === "favorites" ? "No favorites yet." : "No hidden effects.")
    );
  }

  for (const item of list) {
    const row = el("div", "kvn-setting-row");
    row.appendChild(el("div", null, [el("label", null, item.displayName), el("span", "kvn-setting-hint", item.category)]));
    const btn = el(
      "button",
      "kvn-link-btn",
      kind === "favorites" ? "Remove" : "Unhide"
    );
    btn.addEventListener("click", () => {
      state.userState =
        kind === "favorites"
          ? store.toggleFavorite(state.userState, item.id)
          : store.toggleHidden(state.userState, item.id);
      render();
    });
    row.appendChild(btn);
    wrap.appendChild(row);
  }

  container.appendChild(wrap);
}

function render() {
  try {
    rootEl.innerHTML = "";
    if (state.view === "settings") {
      renderSettings(rootEl);
    } else if (state.view === "manage-favorites") {
      renderManageList(rootEl, "favorites");
    } else if (state.view === "manage-hidden") {
      renderManageList(rootEl, "hidden");
    } else {
      renderPalette(rootEl);
    }
  } catch (err) {
    renderFatalError(err);
  }
}

async function bootstrap(node) {
  try {
    rootEl = node;
    render(); // show shell immediately (fast open, #21)

    await Promise.all([refreshContext(), refreshEffects()]);
    computeResults();
    if (state.view === "palette") render();
  } catch (err) {
    renderFatalError(err);
  }
}

/* ---------------------------- UXP wiring ---------------------------- */

// Visible the instant this script executes, so a still-black panel later
// tells us the script itself never ran (wrong path, load error) rather
// than something failing after this point.
(function markScriptStarted() {
  const marker = document.getElementById("kvn-root") || document.body;
  if (marker) marker.textContent = "KVN Command — starting…";
})();

let uxpModule = null;
try {
  uxpModule = require("uxp");
} catch (err) {
  // Not running inside UXP (e.g. opened directly in a browser for layout
  // iteration) — mount straight into the page. The document has already
  // been parsed up to this script tag, so #kvn-root exists now; no need
  // to wait for DOMContentLoaded (which may have already fired).
  console.warn("[KVN Command] uxp module unavailable — mounting standalone.", err);
  bootstrap(document.getElementById("kvn-root"));
}

if (uxpModule) {
  try {
    uxpModule.entrypoints.setup({
      panels: {
        "kvn.command.panel": {
          create(rootNode) {
            bootstrap(rootNode);
          },
          async show() {
            // Panel regained focus/visibility: selection may have changed
            // while the user was elsewhere (#10).
            try {
              await refreshContext();
              computeResults();
              if (state.view === "palette") render();
            } catch (err) {
              renderFatalError(err);
            }
          },
        },
      },
    });
  } catch (err) {
    // A throw here is a real host-side problem (bad entrypoint id, wrong
    // setup() shape, ...) — surface it instead of leaving a black panel.
    renderFatalError(err);
  }

  // Watchdog: if the host never calls create() at all (id mismatch, a
  // panel entrypoint that silently isn't wired up, ...) there is no
  // exception to catch — the panel just stays empty forever. Say so
  // explicitly instead of leaving that indistinguishable from "still
  // starting".
  setTimeout(() => {
    if (!rootEl) {
      renderFatalError(
        new Error(
          "entrypoints.setup() ran with no error, but the host never called " +
            'create() for panel id "kvn.command.panel". Check that this id ' +
            "matches the panel entrypoint's \"id\" in manifest.json exactly, " +
            "and that Premiere Pro actually opened this panel (Window ▸ " +
            "Extensions ▸ KVN Command)."
        )
      );
    }
  }, 4000);
}
