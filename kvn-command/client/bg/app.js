/**
 * client/bg/app.js — invisible background extension.
 *
 * Runs continuously (AutoVisible in the manifest) with Node.js enabled
 * so it can host a plain local HTTP server via Node's built-in `http`
 * module — no native addon, no compilation, nothing that needs to match
 * CEP's embedded Node ABI. An external tool (AutoHotkey on Windows, an
 * Automator Quick Action on macOS) hits this server when the user's OS
 * global hotkey fires; this then calls the native
 * window.__adobe_cep__.requestOpenExtension() binding to open/focus the
 * actual KVN Command window (com.kvn.command.main).
 *
 * This is the same shape of solution used by a real, working open-source
 * project doing the exact same AutoHotkey-to-CEP bridging
 * (sebinside/AHK2PremiereCEP: a local HTTP/WebSocket server inside a CEP
 * extension, triggered by curl from AutoHotkey) — not invented from
 * scratch here, and confirmed as a real pattern rather than the fragile
 * native-global-hotkey-addon route this project considered and dropped
 * earlier for being unverifiable without a live Premiere install.
 */

var http = require("http");

var PORT = 51234;
var HOST = "127.0.0.1";
var MAIN_EXTENSION_ID = "com.kvn.command.main";

function openMainWindow() {
  if (!window.__adobe_cep__ || typeof window.__adobe_cep__.requestOpenExtension !== "function") {
    throw new Error("window.__adobe_cep__.requestOpenExtension is unavailable in this CEP host.");
  }
  window.__adobe_cep__.requestOpenExtension(MAIN_EXTENSION_ID, "");
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
