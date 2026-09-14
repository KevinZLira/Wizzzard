/**
 * host-bridge.js
 *
 * Minimal wrapper around the native `window.__adobe_cep__.evalScript`
 * binding that every CEP panel gets injected automatically (this is the
 * same native call Adobe's own CSInterface.js wraps — documented in
 * Adobe's public CEP HTML Extension Cookbook). Written directly against
 * it here instead of vendoring the full CSInterface.js, since this
 * plugin only ever needs evalScript.
 *
 * Promise-wraps the callback style so premiere-bridge.js can read like
 * normal async code.
 */

window.KVN = window.KVN || {};

window.KVN.HostBridge = (function () {
  function evalScript(script) {
    return new Promise(function (resolve) {
      if (!window.__adobe_cep__) {
        resolve(null); // not running inside a CEP host (e.g. static preview)
        return;
      }
      window.__adobe_cep__.evalScript(script, function (result) {
        resolve(result);
      });
    });
  }

  /** Calls a host/ppro.jsx function with JSON-safe arguments and parses its JSON string result. */
  async function callHostJson(fnName, args) {
    var argsList = (args || []).map(function (a) {
      return JSON.stringify(a);
    });
    var script = fnName + "(" + argsList.join(",") + ")";
    var raw = await evalScript(script);
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error("[KVN Command] Failed to parse host response for", fnName, ":", raw, err);
      return null;
    }
  }

  return { evalScript: evalScript, callHostJson: callHostJson };
})();
