/**
 * client/bg/app.js — invisible background extension.
 *
 * Runs continuously (AutoVisible in the manifest) with Node.js enabled.
 * It does two things:
 *
 * 1. On Windows only: hosts a global keyboard hook via the bundled
 *    uiohook-napi native addon (see ./native/uiohook-loader.js) so
 *    pressing Ctrl+Win+K opens/focuses the real KVN Command window — no
 *    OS-level shortcut configuration and no external app required.
 *
 *    Deliberately NOT attempted on macOS: confirmed via live testing
 *    that loading this same addon inside Premiere's own process fails
 *    with a hard macOS security error (`dlopen ... different Team IDs`)
 *    — hardened-runtime library validation blocks any native code not
 *    signed with Adobe's own Team ID from loading inside Premiere/CEP's
 *    process. This is an OS-level restriction, not a bug in this addon
 *    or its loader, and no code change here can work around it. (For
 *    reference: Dagger's "Spell Book" companion achieves a real macOS
 *    global hotkey via a *separate*, independently-signed standalone
 *    app — confirmed by inspecting its installed binary's own code
 *    signature, a Developer ID distinct from Adobe's — bridging into a
 *    CEP background extension of its own, the same shape as this one.
 *    Replicating that on macOS would need its own signed+notarized
 *    helper app, which needs an Apple Developer Program membership this
 *    project doesn't have. Decision: no macOS global hotkey for now —
 *    Window ▸ Extensions ▸ KVN Command is the only way to open the
 *    palette on macOS.)
 * 2. Hosts a plain local HTTP server via Node's built-in `http` module
 *    (`/ping`, `/open`) — kept for manual testing/debugging.
 *
 * Both call the same native window.__adobe_cep__.requestOpenExtension()
 * binding to open/focus the actual KVN Command window
 * (com.kvn.command.main).
 */

var http = require("http");
var path = require("path");

// __dirname here resolves to the EXTENSION ROOT, not this script's own
// client/bg/ folder — confirmed via live testing (a <script src>-loaded
// top-level file gets __dirname/__filename matching the *page's*
// location, not its own; the same class of surprise hit earlier in the
// abandoned UXP build). Build the path to the native loader explicitly
// from that root instead of a relative require().
var UIOHOOK_LOADER_PATH = path.join(__dirname, "client", "bg", "native", "uiohook-loader.js");

var PORT = 51234;
var HOST = "127.0.0.1";
var MAIN_EXTENSION_ID = "com.kvn.command.main";

// The native addon is only ever attempted on win32 — see the file header
// for why macOS is permanently excluded, not just currently disabled.
var GLOBAL_HOTKEY_SUPPORTED_PLATFORM = process.platform === "win32";

function openMainWindow() {
  if (!window.__adobe_cep__ || typeof window.__adobe_cep__.requestOpenExtension !== "function") {
    throw new Error("window.__adobe_cep__.requestOpenExtension is unavailable in this CEP host.");
  }
  window.__adobe_cep__.requestOpenExtension(MAIN_EXTENSION_ID, "");
}

// --- Global keyboard shortcut (uiohook-napi, Windows only) -------------

var hotkeyStatusEl = null;
var lastHotkeyStatus = "not initialized";

function setHotkeyStatus(text, isError) {
  lastHotkeyStatus = text;
  if (!hotkeyStatusEl) hotkeyStatusEl = document.getElementById("hotkey-status");
  if (!hotkeyStatusEl) return;
  hotkeyStatusEl.textContent = text;
  hotkeyStatusEl.style.color = isError ? "#ff5c5c" : "#7cff00";
}

function initGlobalHotkey() {
  var uiohook;
  try {
    uiohook = require(UIOHOOK_LOADER_PATH);
  } catch (err) {
    console.error("[KVN Command BG] Failed to load uiohook-loader:", err);
    setHotkeyStatus("Loader error: " + (err && err.message ? err.message : String(err)), true);
    return;
  }

  if (!uiohook.isSupported()) {
    console.warn("[KVN Command BG] No prebuilt uiohook-napi binary for " + uiohook.supportedPlatformArch());
    setHotkeyStatus("Global shortcut unavailable on " + uiohook.supportedPlatformArch() + ".", true);
    return;
  }

  // Ctrl+Win+K — matches store.js's shortcutHint for Windows. uiohook-napi's
  // keydown events already carry resolved ctrlKey/metaKey booleans
  // (metaKey = the Windows key here), so no manual modifier-state
  // tracking is needed.
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
    setHotkeyStatus("Global shortcut active (Ctrl+Win+K).", false);
  } catch (err) {
    console.error("[KVN Command BG] Failed to start uiohook:", err);
    setHotkeyStatus("Start error: " + (err && err.message ? err.message : String(err)), true);
  }
}

if (GLOBAL_HOTKEY_SUPPORTED_PLATFORM) {
  initGlobalHotkey();
} else {
  setHotkeyStatus("No global shortcut on " + process.platform + " — use Window ▸ Extensions.", false);
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

  // Reads the same status text the (normally invisible) bg window's
  // #hotkey-status line would show, without needing to open that window.
  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(lastHotkeyStatus);
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

var versionEl = document.getElementById("node-version");
if (versionEl) versionEl.textContent = "Node.js " + process.version;
