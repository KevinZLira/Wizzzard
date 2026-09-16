/**
 * app.js — KVN Command panel controller (CEP).
 *
 * Renders the command-palette UI and wires up keyboard-first interaction:
 * type -> instant results -> arrow keys -> Enter to apply. No require()
 * graph here (this build had bitten us once already under UXP's
 * root-relative resolution) — every module attaches itself to
 * `window.KVN.*`, loaded via plain <script> tags in dependency order from
 * index.html, so there is nothing to resolve at runtime.
 */

function renderFatalError(err) {
  var message = (err && err.stack) || String(err);
  console.error("[KVN Command] Fatal error:", err);
  try {
    document.body.innerHTML = "";
    var pre = document.createElement("pre");
    pre.style.cssText =
      "color:#ff5c5c;background:#080909;padding:14px;margin:0;white-space:pre-wrap;" +
      "font-family:monospace;font-size:11px;height:100vh;box-sizing:border-box;overflow:auto;";
    pre.textContent = "KVN Command failed to start:\n\n" + message;
    document.body.appendChild(pre);
  } catch (renderErr) {
    console.error("[KVN Command] Failed to render fatal error UI:", renderErr);
  }
}

/**
 * Same idea as renderFatalError but for errors that happen AFTER startup
 * (a click handler throwing, an unhandled promise rejection) — those
 * don't get caught by any try/catch we wrote, since they happen inside
 * an event callback or a detached async chain. Rather than staying
 * silent (which is exactly the "click and nothing happens" symptom this
 * exists to rule out), show them in a small fixed banner that doesn't
 * wipe the rest of the UI and isn't affected by the palette's own
 * layout/sizing.
 */
function showGlobalError(message) {
  console.error("[KVN Command] Unhandled error:", message);
  var el = document.getElementById("kvn-global-error");
  if (!el) {
    el = document.createElement("div");
    el.id = "kvn-global-error";
    el.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;background:#2a0a0a;color:#ff8a8a;" +
      "font-family:monospace;font-size:10px;padding:6px 8px;white-space:pre-wrap;" +
      "max-height:50vh;overflow:auto;border-bottom:1px solid #ff5c5c;";
    document.body.appendChild(el);
  }
  el.textContent = String(message);
}

window.addEventListener("error", function (event) {
  showGlobalError((event.error && event.error.stack) || event.message);
});
window.addEventListener("unhandledrejection", function (event) {
  var reason = event.reason;
  showGlobalError((reason && reason.stack) || String(reason));
});

(function () {
  try {
    var search = window.KVN.SearchEngine.search;
    var store = window.KVN.Store;
    var bridge = window.KVN.PremiereBridge;
    var catalog = window.KVN.EffectsCatalog;
    var isPreview = !window.__adobe_cep__;

    var state = {
      query: "",
      results: [],
      activeIndex: 0,
      view: "palette", // 'palette' | 'settings' | 'manage-favorites' | 'manage-hidden'
      context: { count: 0, kind: "unknown" },
      userState: store.load(),
      rawEffects: [],
      loading: true,
    };

    var rootEl = null;

    var WINDOW_WIDTH = 520;
    var MIN_HEIGHT = 56;
    var MAX_HEIGHT = 560;

    /**
     * Spotlight-style: the window starts as just the search row and grows
     * to fit content as results/settings appear, via CEP's
     * resizeContent() — confirmed supported for Custom/modeless windows
     * in Premiere Pro (the "not supported" restriction documented in
     * Adobe's CEP cookbook is specific to the "Panel" UI type, not this
     * one). No-ops outside a CEP host (e.g. static preview).
     */
    function scheduleResize() {
      if (!window.__adobe_cep__ || typeof window.__adobe_cep__.resizeContent !== "function") return;
      requestAnimationFrame(function () {
        var measured = document.body.scrollHeight;
        var height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, measured));
        window.__adobe_cep__.resizeContent(WINDOW_WIDTH, height);
      });
    }

    function groupByCategory(results) {
      var groups = [];
      var index = {};
      results.forEach(function (r) {
        if (!(r.category in index)) {
          index[r.category] = [];
          groups.push([r.category, index[r.category]]);
        }
        index[r.category].push(r);
      });
      return groups;
    }

    function contextLabel() {
      if (isPreview) return "PREVIEW MODE — open inside Premiere Pro to apply.";
      if (state.context.count === 0) return null;
      if (state.context.kind === "video") return "VIDEO CLIP SELECTED";
      if (state.context.kind === "audio") return "AUDIO CLIP SELECTED";
      return "MIXED SELECTION";
    }

    function computeResults() {
      if (!state.userState.settings.showRecent && state.query.trim() === "") {
        state.results = [];
        return;
      }

      var pool = catalog.buildSearchPool(state.rawEffects, {
        settings: state.userState.settings,
        favorites: state.userState.favorites,
        hidden: state.userState.hidden,
        recent: state.userState.recent,
      });

      var kind = state.context.kind;
      var boosted = pool.map(function (e) {
        var kindBoost = kind === e.kind ? 20 : 0;
        return Object.assign({}, e, { boost: (e.boost || 0) + kindBoost });
      });

      var results;
      if (state.query.trim() === "") {
        results = boosted
          .filter(function (e) {
            return e.isRecent || e.isFavorite;
          })
          .sort(function (a, b) {
            return b.boost - a.boost;
          })
          .slice(0, state.userState.settings.resultLimit);
      } else {
        results = search(boosted, state.query, state.userState.settings.resultLimit);
      }

      state.results = results;
      state.activeIndex = 0;
    }

    async function refreshContext() {
      try {
        state.context = await bridge.getSelectionContext();
      } catch (err) {
        console.error("[KVN Command] Failed to read selection context:", err);
        state.context = { count: 0, kind: "unknown" };
      }
    }

    async function refreshEffects(opts) {
      try {
        state.rawEffects = await catalog.loadRawEffects(opts || {});
      } catch (err) {
        console.error("[KVN Command] Failed to load host effects:", err);
        state.rawEffects = [];
      }
      state.loading = false;
    }

    /* ---------------------------- rendering ---------------------------- */

    function el(tag, className, children) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (children) {
        (Array.isArray(children) ? children : [children]).forEach(function (child) {
          if (child == null) return;
          node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
        });
      }
      return node;
    }

    function renderPalette(container) {
      var palette = el("div", "kvn-palette");

      var searchRow = el("div", "kvn-search-row");
      var prompt = el("span", "kvn-prompt", ">");
      var input = el("input", "kvn-input");
      input.type = "text";
      input.placeholder = "search effects...";
      input.value = state.query;

      var shortcutBadge = el("span", "kvn-shortcut-badge", state.userState.settings.shortcutHint);
      var settingsBtn = el("button", "kvn-settings-btn", "⚙");
      settingsBtn.title = "Settings";
      settingsBtn.addEventListener("click", function () {
        state.view = "settings";
        render();
      });

      searchRow.appendChild(prompt);
      searchRow.appendChild(input);
      var context = contextLabel();
      if (context) {
        var contextBadge = el("span", "kvn-shortcut-badge", context);
        contextBadge.title = "Current clip context";
        searchRow.appendChild(contextBadge);
      }
      searchRow.appendChild(shortcutBadge);
      searchRow.appendChild(settingsBtn);
      palette.appendChild(searchRow);

      var resultsEl = el("div", "kvn-results");
      renderResultsInto(resultsEl);
      palette.appendChild(resultsEl);

      var toast = el("div", "kvn-toast");
      palette.appendChild(toast);

      container.appendChild(palette);

      input.addEventListener("input", function () {
        state.query = input.value;
        computeResults();
        renderResultsInto(resultsEl);
      });

      input.addEventListener("keydown", function (e) {
        handleKeydown(e, resultsEl, input);
      });

      requestAnimationFrame(function () {
        input.focus();
      });
    }

    function renderResultsInto(resultsEl) {
      try {
        renderResultsIntoBody(resultsEl);
      } finally {
        scheduleResize();
      }
    }

    function renderResultsIntoBody(resultsEl) {
      resultsEl.innerHTML = "";

      // No target selected is already communicated by the badge in the
      // search row — an idle query with no results shouldn't grow the
      // window with a redundant banner (keeps the at-rest state a single
      // line, Spotlight-style).
      if (!isPreview && state.context.count === 0 && state.query.trim() !== "") {
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

      if (!isPreview && state.rawEffects.length === 0) {
        var loadError = catalog.getLastError();
        resultsEl.appendChild(
          el("div", "kvn-context-banner", [
            el("strong", null, "COULDN'T LOAD EFFECTS FROM PREMIERE"),
            loadError || "host/ppro.jsx didn't return anything usable.",
          ])
        );
        return;
      }

      if (state.results.length === 0) {
        resultsEl.appendChild(
          el(
            "div",
            "kvn-empty",
            state.query.trim()
              ? 'No effects found for "' + state.query + '".'
              : "Start typing to search video and audio effects."
          )
        );
        return;
      }

      var groups = groupByCategory(state.results);
      var flatIndex = 0;
      groups.forEach(function (pair) {
        var category = pair[0];
        var items = pair[1];
        resultsEl.appendChild(el("div", "kvn-category", category.toUpperCase()));
        items.forEach(function (item) {
          var isActive = flatIndex === state.activeIndex;
          var row = el("div", "kvn-item" + (isActive ? " kvn-active" : ""));
          row.dataset.index = String(flatIndex);
          var thisIndex = flatIndex;

          var indicator = el("div", "kvn-item-indicator");
          var body = el("div", "kvn-item-body", [
            el("div", "kvn-item-name", item.displayName),
            el("div", "kvn-item-sub", item.isRecent ? "Recently used" : item.category),
          ]);
          var star = el("button", "kvn-item-star" + (item.isFavorite ? " kvn-starred" : ""), item.isFavorite ? "★" : "☆");
          star.title = item.isFavorite ? "Remove from favorites" : "Add to favorites";
          star.addEventListener("click", function (evt) {
            evt.stopPropagation();
            state.userState = store.toggleFavorite(state.userState, item.id);
            computeResults();
            renderResultsInto(resultsEl);
          });

          row.appendChild(indicator);
          row.appendChild(body);
          row.appendChild(star);

          row.addEventListener("mouseenter", function () {
            // Only swap the active class/indicator on the two affected
            // rows — a full renderResultsInto() rebuild here used to
            // replace every row's DOM node on every hover, including the
            // one the cursor was over. If that swap landed between a
            // click's mousedown and mouseup, the browser doesn't fire a
            // "click" at all (it requires the same element for both) —
            // that was the real cause of "clicking a result does
            // nothing" even though Enter (no mouse involved) worked.
            var prevActive = resultsEl.querySelector(".kvn-item.kvn-active");
            if (prevActive && prevActive !== row) prevActive.classList.remove("kvn-active");
            row.classList.add("kvn-active");
            state.activeIndex = thisIndex;
          });
          row.addEventListener("click", function () {
            applyActive();
          });

          resultsEl.appendChild(row);
          flatIndex += 1;
        });
      });
    }

    function showToast(toastEl, message, isError) {
      if (!toastEl) {
        showGlobalError("showToast called with no toast element found — tried to show: " + message);
        return;
      }
      toastEl.textContent = message;
      toastEl.className = "kvn-toast kvn-show" + (isError ? " kvn-error" : "");
      setTimeout(function () {
        toastEl.className = "kvn-toast";
      }, 1100);
    }

    async function applyActive() {
      console.log("[KVN Command] applyActive fired, activeIndex=", state.activeIndex);
      var effect = state.results[state.activeIndex];
      if (!effect) {
        showGlobalError("applyActive: no effect at activeIndex " + state.activeIndex + " (results.length=" + state.results.length + ")");
        return;
      }

      var toastEl = rootEl.querySelector(".kvn-toast");
      var input = rootEl.querySelector(".kvn-input");

      if (isPreview) {
        showToast(toastEl, "Preview mode — open inside Premiere Pro to apply.", true);
        return;
      }

      if (state.context.count === 0) {
        showToast(toastEl, "No target selected.", true);
        return;
      }

      function showApplyDebug(debugData) {
        if (!debugData) return;
        var resultsForDebug = rootEl.querySelector(".kvn-results");
        if (resultsForDebug) {
          resultsForDebug.appendChild(
            el("div", "kvn-context-banner", [el("strong", null, "APPLY DEBUG"), JSON.stringify(debugData)])
          );
          scheduleResize();
        }
      }

      try {
        var result = await bridge.applyEffectToSelection(effect, state.context);
        if (result.appliedTo > 0) {
          state.userState = store.pushRecent(state.userState, effect.id);
          showToast(toastEl, "Applied " + effect.displayName, false);
          // Wait for the toast to actually be seen before clearing the
          // query — clearing immediately shrinks the window (see
          // scheduleResize()) out from under a toast that's positioned
          // relative to the now-gone results area.
          setTimeout(function () {
            state.query = "";
            if (input) input.value = "";
            computeResults();
            renderResultsInto(rootEl.querySelector(".kvn-results"));
            if (input) input.focus();
          }, 900);
        } else {
          var reason = result.errors[0] || "Effect could not be applied.";
          showToast(toastEl, "Could not apply: " + reason, true);
          if (result.debug) {
            showApplyDebug(result.debug);
          }
        }
      } catch (err) {
        var message =
          err && err.message === "NO_MATCHING_TARGET"
            ? effect.displayName + " is a " + effect.kind + " effect — selection doesn't match."
            : "Could not apply effect.";
        showToast(toastEl, message, true);
      }
    }

    function handleKeydown(e, resultsEl, input) {
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
      var row = el("div", "kvn-setting-row");
      var label = el("div", null, [el("label", null, labelText), hintText ? el("span", "kvn-setting-hint", hintText) : null]);
      row.appendChild(label);
      row.appendChild(controlEl);
      return row;
    }

    function toggleInput(checked, onChange) {
      var input = el("input", "kvn-toggle");
      input.type = "checkbox";
      input.checked = checked;
      input.addEventListener("change", function () {
        onChange(input.checked);
      });
      return input;
    }

    function renderSettings(container) {
      var wrap = el("div", "kvn-settings");

      var back = el("button", "kvn-back-btn", "← Back to search");
      back.addEventListener("click", function () {
        state.view = "palette";
        render();
      });
      wrap.appendChild(back);

      wrap.appendChild(el("h2", null, "Settings"));

      var shortcutHint = el("input", "kvn-number-input");
      shortcutHint.style.width = "110px";
      shortcutHint.value = state.userState.settings.shortcutHint;
      shortcutHint.addEventListener("change", function () {
        state.userState = store.updateSettings(state.userState, { shortcutHint: shortcutHint.value });
      });
      wrap.appendChild(
        settingsRow(
          "Shortcut reminder",
          "CEP extension windows aren't listed in Premiere's Keyboard Shortcuts editor the way docked panels are, so this is a label only — see the README for the real way to trigger this window.",
          shortcutHint
        )
      );

      var resultLimit = el("input", "kvn-number-input");
      resultLimit.type = "number";
      resultLimit.min = "3";
      resultLimit.max = "20";
      resultLimit.value = String(state.userState.settings.resultLimit);
      resultLimit.addEventListener("change", function () {
        var value = Math.max(3, Math.min(20, Number(resultLimit.value) || 8));
        state.userState = store.updateSettings(state.userState, { resultLimit: value });
      });
      wrap.appendChild(settingsRow("Result limit", null, resultLimit));

      wrap.appendChild(
        settingsRow(
          "Show recent",
          null,
          toggleInput(state.userState.settings.showRecent, function (checked) {
            state.userState = store.updateSettings(state.userState, { showRecent: checked });
          })
        )
      );

      wrap.appendChild(
        settingsRow(
          "Show audio effects",
          catalog.isAudioSupported() ? null : "This Premiere/QE version didn't report audio filter support.",
          toggleInput(state.userState.settings.showAudioEffects, function (checked) {
            state.userState = store.updateSettings(state.userState, { showAudioEffects: checked });
          })
        )
      );

      wrap.appendChild(
        settingsRow(
          "Show hidden effects",
          null,
          toggleInput(state.userState.settings.showHiddenEffects, function (checked) {
            state.userState = store.updateSettings(state.userState, { showHiddenEffects: checked });
          })
        )
      );

      var manageRow = el("div", null);
      var favBtn = el("button", "kvn-link-btn", "Manage Favorites");
      favBtn.addEventListener("click", function () {
        state.view = "manage-favorites";
        render();
      });
      var hiddenBtn = el("button", "kvn-link-btn", "Manage Hidden Effects");
      hiddenBtn.addEventListener("click", function () {
        state.view = "manage-hidden";
        render();
      });
      manageRow.appendChild(favBtn);
      manageRow.appendChild(hiddenBtn);
      wrap.appendChild(manageRow);

      container.appendChild(wrap);
    }

    function renderManageList(container, kind) {
      var wrap = el("div", "kvn-settings");
      var back = el("button", "kvn-back-btn", "← Back to settings");
      back.addEventListener("click", function () {
        state.view = "settings";
        render();
      });
      wrap.appendChild(back);
      wrap.appendChild(el("h2", null, kind === "favorites" ? "Favorites" : "Hidden Effects"));

      var pool = catalog.buildSearchPool(state.rawEffects, {
        settings: Object.assign({}, state.userState.settings, { showHiddenEffects: true, showAudioEffects: true }),
        favorites: state.userState.favorites,
        hidden: state.userState.hidden,
        recent: state.userState.recent,
      });
      var list = pool.filter(function (e) {
        return kind === "favorites" ? e.isFavorite : e.isHidden;
      });

      if (list.length === 0) {
        wrap.appendChild(el("div", "kvn-empty", kind === "favorites" ? "No favorites yet." : "No hidden effects."));
      }

      list.forEach(function (item) {
        var row = el("div", "kvn-setting-row");
        row.appendChild(el("div", null, [el("label", null, item.displayName), el("span", "kvn-setting-hint", item.category)]));
        var btn = el("button", "kvn-link-btn", kind === "favorites" ? "Remove" : "Unhide");
        btn.addEventListener("click", function () {
          state.userState =
            kind === "favorites" ? store.toggleFavorite(state.userState, item.id) : store.toggleHidden(state.userState, item.id);
          render();
        });
        row.appendChild(btn);
        wrap.appendChild(row);
      });

      container.appendChild(wrap);
    }

    function render() {
      try {
        rootEl.innerHTML = "";
        if (state.view === "settings") {
          renderSettings(rootEl);
          scheduleResize();
        } else if (state.view === "manage-favorites") {
          renderManageList(rootEl, "favorites");
          scheduleResize();
        } else if (state.view === "manage-hidden") {
          renderManageList(rootEl, "hidden");
          scheduleResize();
        } else {
          renderPalette(rootEl); // schedules its own resize via renderResultsInto
        }
      } catch (err) {
        renderFatalError(err);
      }
    }

    async function bootstrap(node) {
      try {
        rootEl = node;
        render(); // show shell immediately

        await Promise.all([refreshContext(), refreshEffects()]);
        computeResults();
        if (state.view === "palette") render();
      } catch (err) {
        renderFatalError(err);
      }
    }

    document.getElementById("kvn-root").textContent = "KVN Command — starting…";
    bootstrap(document.getElementById("kvn-root"));

    // The floating window has no dock/show lifecycle callbacks like a UXP
    // panel — refresh selection state whenever it regains OS focus
    // (covers "I selected a different clip, then came back").
    window.addEventListener("focus", function () {
      refreshContext().then(function () {
        computeResults();
        if (state.view === "palette") render();
      });
    });
  } catch (err) {
    renderFatalError(err);
  }
})();
