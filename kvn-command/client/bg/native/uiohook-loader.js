/**
 * uiohook-loader.js — minimal, dependency-free loader for the uiohook-napi
 * native addon (https://github.com/SnosMe/uiohook-napi, MIT, see
 * ./UIOHOOK-NAPI-LICENSE), used to detect the global keyboard shortcut
 * that opens KVN Command.
 *
 * The upstream package resolves its prebuilt binary at require-time via
 * the `node-gyp-build` package. We don't bundle that resolver: CEP's
 * embedded Node module resolution inside a --mixed-context extension is
 * unusual enough (no real node_modules tree, no npm install step for end
 * users) that depending on a second package's own `require()` chain
 * working correctly there is one more thing that could silently fail.
 * Instead this file picks the right prebuilt `.node` file itself, from
 * `process.platform` + `process.arch`, and re-implements the same
 * `.start()` / event-emitter surface uiohook-napi's dist/index.js
 * provides, using the exact same UiohookKey table (values are raw
 * libuiohook/Windows-scancode-style keycodes, verified against the
 * published dist/index.d.ts).
 *
 * Only darwin-arm64, darwin-x64, win32-x64 and win32-arm64 binaries are
 * bundled — Premiere Pro doesn't ship for Linux, so those prebuilds
 * (also present upstream) aren't needed here.
 */

var path = require("path");
var EventEmitter = require("events").EventEmitter;

var EventType = {
  EVENT_KEY_PRESSED: 4,
  EVENT_KEY_RELEASED: 5,
  EVENT_MOUSE_CLICKED: 6,
  EVENT_MOUSE_PRESSED: 7,
  EVENT_MOUSE_RELEASED: 8,
  EVENT_MOUSE_MOVED: 9,
  EVENT_MOUSE_WHEEL: 11,
};

var UiohookKey = {
  Backspace: 0x000e,
  Tab: 0x000f,
  Enter: 0x001c,
  CapsLock: 0x003a,
  Escape: 0x0001,
  Space: 0x0039,
  Ctrl: 0x001d, // Left
  CtrlRight: 0x0e1d,
  Alt: 0x0038, // Left
  AltRight: 0x0e38,
  Shift: 0x002a, // Left
  ShiftRight: 0x0036,
  Meta: 0x0e5b, // Left Cmd (mac) / Left Win (windows)
  MetaRight: 0x0e5c,
  A: 0x001e,
  B: 0x0030,
  C: 0x002e,
  D: 0x0020,
  E: 0x0012,
  F: 0x0021,
  G: 0x0022,
  H: 0x0023,
  I: 0x0017,
  J: 0x0024,
  K: 0x0025,
  L: 0x0026,
  M: 0x0032,
  N: 0x0031,
  O: 0x0018,
  P: 0x0019,
  Q: 0x0010,
  R: 0x0013,
  S: 0x001f,
  T: 0x0014,
  U: 0x0016,
  V: 0x002f,
  W: 0x0011,
  X: 0x002d,
  Y: 0x0015,
  Z: 0x002c,
};

function resolvePrebuildPath() {
  var platformArch = process.platform + "-" + process.arch;
  return path.join(__dirname, "prebuilds", platformArch, "uiohook-napi.node");
}

function UiohookNapi() {
  EventEmitter.call(this);
  this._lib = null;
}
UiohookNapi.prototype = Object.create(EventEmitter.prototype);
UiohookNapi.prototype.constructor = UiohookNapi;

UiohookNapi.prototype._ensureLib = function () {
  if (this._lib) return this._lib;
  var binPath = resolvePrebuildPath();
  this._lib = require(binPath);
  return this._lib;
};

UiohookNapi.prototype.handler = function (e) {
  this.emit("input", e);
  switch (e.type) {
    case EventType.EVENT_KEY_PRESSED:
      this.emit("keydown", e);
      break;
    case EventType.EVENT_KEY_RELEASED:
      this.emit("keyup", e);
      break;
    case EventType.EVENT_MOUSE_CLICKED:
      this.emit("click", e);
      break;
    case EventType.EVENT_MOUSE_MOVED:
      this.emit("mousemove", e);
      break;
    case EventType.EVENT_MOUSE_PRESSED:
      this.emit("mousedown", e);
      break;
    case EventType.EVENT_MOUSE_RELEASED:
      this.emit("mouseup", e);
      break;
    case EventType.EVENT_MOUSE_WHEEL:
      this.emit("wheel", e);
      break;
  }
};

UiohookNapi.prototype.start = function () {
  var lib = this._ensureLib();
  lib.start(this.handler.bind(this));
};

UiohookNapi.prototype.stop = function () {
  if (!this._lib) return;
  this._lib.stop();
};

module.exports = {
  EventType: EventType,
  UiohookKey: UiohookKey,
  uIOhook: new UiohookNapi(),
  isSupported: function () {
    try {
      require("fs").accessSync(resolvePrebuildPath());
      return true;
    } catch (err) {
      return false;
    }
  },
  supportedPlatformArch: function () {
    return process.platform + "-" + process.arch;
  },
};
