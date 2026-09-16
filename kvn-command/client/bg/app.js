/**
 * client/bg/app.js — invisible background extension.
 *
 * Runs continuously (AutoVisible in the manifest) with Node.js enabled.
 * It does two things:
 *
 * 1. Hosts a global keyboard hook via the bundled uiohook-napi native
 *    addon (see ./native/uiohook-loader.js) so pressing the KVN Command
 *    shortcut (Ctrl+Cmd+K on mac, Ctrl+Win+K on Windows) opens/focuses
 *    the real KVN Command window — no OS-level shortcut configuration
 *    and no external app required, satisfying the "only Premiere + the
 *    plugin" constraint.
 * 2. Hosts a plain local HTTP server via Node's built-in `http` module,
 *    kept for manual testing/debugging (`/ping`, `/open`) since it needs
 *    no native binary and is trivial to curl by hand.
 *
 * Both call the same native window.__adobe_cep__.requestOpenExtension()
 * binding to open/focus the actual KVN Command window
 * (com.kvn.command.main).
 */

var http = require("http");

var PORT = 51234;
var HOST = "127.0.0.1";
var MAIN_EXTENSION_ID = "com.kvn.command.main";

// KILL SWITCH: after bundling the native uiohook-napi addon, the whole bg
// extension window stopped appearing at all (not even the static HTML),
// on both a menu-triggered manual open and presumably auto-start. A JS
// try/catch cannot catch a native crash (segfault) — if requiring or
// starting that addon crashes the process, the entire renderer disappears
// with it, which matches the symptom exactly. Defaulting this to false
// restores the working bg extension (HTTP bridge only) while the native
// addon is debugged in isolation. Flip to true only for that debugging.
var ENABLE_GLOBAL_HOTKEY = false;

function openMainWindow() {
  if (!window.__adobe_cep__ || typeof window.__adobe_cep__.requestOpenExtension !== "function") {
    throw new Error("window.__adobe_cep__.requestOpenExtension is unavailable in this CEP host.");
  }
  window.__adobe_cep__.requestOpenExtension(MAIN_EXTENSION_ID, "");
}

// --- Global keyboard shortcut (uiohook-napi) --------------------------

var hotkeyStatusEl = null;

function setHotkeyStatus(text, isError) {
  if (!hotkeyStatusEl) hotkeyStatusEl = document.getElementById("hotkey-status");
  if (!hotkeyStatusEl) return;
  hotkeyStatusEl.textContent = text;
  hotkeyStatusEl.style.color = isError ? "#ff5c5c" : "#7cff00";
}

function initGlobalHotkey() {
  var uiohook;
  try {
    uiohook = require("./native/uiohook-loader.js");
  } catch (err) {
    console.error("[KVN Command BG] Failed to load uiohook-loader:", err);
    setHotkeyStatus("Global shortcut unavailable (loader error).", true);
    return;
  }

  if (!uiohook.isSupported()) {
    console.warn("[KVN Command BG] No prebuilt uiohook-napi binary for " + uiohook.supportedPlatformArch());
    setHotkeyStatus("Global shortcut unavailable on " + uiohook.supportedPlatformArch() + ".", true);
    return;
  }

  // Ctrl+Cmd+K (mac) / Ctrl+Win+K (windows) — matches store.js's
  // shortcutHint. uiohook-napi's keydown events already carry resolved
  // ctrlKey/altKey/shiftKey/metaKey booleans (metaKey = Cmd on mac, the
  // Windows key on Windows), so no manual modifier-state tracking is
  // needed here.
  var TARGET_KEYCODE = uiohook.UiohookKey.K;
  var lastTriggerAt = 0;
  var DEBOUNCE_MS = 400;

  uiohook.uIOhook.on("keydown", function (e) {
    if (e.keycode !== TARGET_KEYCODE) return;
    if (!e.ctrlKey || !e.metaKey) return;

    var now = Date.now();
    if (now - lastTriggerAt < DEBOUNCE_MS) return;
    lastTriggerAt = now;

    try {
      openMainWindow();
    } catch (err) {
      console.error("[KVN Command BG] Failed to open main window from hotkey:", err);
    }
  });

  try {
    uiohook.uIOhook.start();
    console.log("[KVN Command BG] Global hotkey listener started (" + uiohook.supportedPlatformArch() + ").");
    setHotkeyStatus("Global shortcut active (Ctrl+Cmd/Win+K).", false);
  } catch (err) {
    console.error("[KVN Command BG] Failed to start uiohook:", err);
    setHotkeyStatus("Global shortcut failed to start.", true);
  }
}

if (ENABLE_GLOBAL_HOTKEY) {
  initGlobalHotkey();
} else {
  setHotkeyStatus("Global shortcut disabled (debugging a native-addon startup crash).", true);
}

var server = http.createServer(function (req, res) {
  if (req.url === "/open") {
    try {
      openMainWindow();
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
    } catch (err) {
      console.error("[KVN Command BG] Failed to open main window:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("error: " + (err && err.message ? err.message : String(err)));
    }
    return;
  }

  if (req.url === "/ping") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("kvn-command-bg alive, node " + process.version);
    return;
  }

  // Debug-only: trigger the native addon load on demand, after the window
  // is already open and responding, instead of at page-load time. If this
  // request never gets a response (curl hangs / connection drops) while
  // the bg window disappears, that confirms a native crash rather than a
  // catchable JS error — a JS error here would still return a 500 below.
  if (req.url === "/enable-hotkey") {
    try {
      initGlobalHotkey();
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("hotkey init attempted, check the bg window's status line");
    } catch (err) {
      console.error("[KVN Command BG] initGlobalHotkey threw:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("error: " + (err && err.message ? err.message : String(err)));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("not found");
});

server.on("error", function (err) {
  // Most likely EADDRINUSE — another instance already running (e.g. two
  // Premiere windows/processes), which is fine, that instance handles it.
  console.error("[KVN Command BG] Server error:", err);
});

server.listen(PORT, HOST, function () {
  console.log("[KVN Command BG] Listening on http://" + HOST + ":" + PORT + " (Node " + process.version + ")");
});

// Surfaced in the (currently still manually-openable, for debugging)
// window itself — this is the concrete data point needed to know which
// native global-hotkey library (if any) could actually run here, since
// CEP's embedded Node version varies by CEP release and native addons
// are Node-ABI-sensitive.
var versionEl = document.getElementById("node-version");
if (versionEl) versionEl.textContent = "Node.js " + process.version;
