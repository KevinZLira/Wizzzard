# KVN Command

A Spotlight-inspired command palette for Adobe Premiere Pro: search for an
effect by name, keyword, or (loose) typo, and apply it straight to the
selected clip — no Effects panel, no dragging.

`KVN Command` is a separate product from `KVN Library`. Library answers
*"which asset do I want?"*; Command answers *"what do I want to do?"* and
turns the answer into an action. Command has no runtime dependency on
Library's code.

## Architecture: CEP, not UXP

This plugin is a **CEP** (Common Extensibility Platform) extension —
ExtendScript host + an HTML/JS panel, the same technology real, currently
shipping Premiere Pro extensions use. This wasn't the first attempt: an
earlier build targeted UXP, which is Adobe's newer platform, but hit
enough real, unresolved friction in a live Premiere Pro 26.3.2 test
(silent blank panels, an undocumented root-relative `require()` quirk,
manifest validation quirks) that it was abandoned in favor of the
architecture actually proven to work end-to-end — confirmed in practice
by inspecting the manifest of a real, commercially signed third-party
Premiere extension (structure only; see "About the reference extension"
below for what that did and didn't involve).

## Verified capabilities (grounded, not assumed)

- **Reading the current selection** uses Premiere's officially documented
  ExtendScript DOM: `TrackItem.isSelected()` on
  `app.project.activeSequence.videoTracks`/`audioTracks`
  (Premiere Pro Scripting Guide, https://ppro-scripting.docsforadobe.dev).
- **Applying an effect has no documented API at all.** The only way to do
  it from ExtendScript is the undocumented, unsupported "QE DOM"
  (`app.enableQE()`, then `qe.project...`), confirmed independently by
  multiple public sources (Adobe community threads, vakago-tools.com's
  ExtendScript tutorials) — not something invented for this plugin.
  Several specifics differed from those public examples on this actual
  host and were only nailed down by direct, verified testing (a change
  never trusted until a real before/after side effect confirmed it —
  see `kvnFindSelectedQeItems`/`kvnApplyEffect` in `host/ppro.jsx`):
  - QE track items are addressed by index, which doesn't line up with
    the documented DOM's clip list directly (QE counts gaps between
    clips as items too). Matching by the two DOMs' respective time
    values didn't work — QE's item `.start` is a different object
    ("QETime") than the documented `TickTime`, and no shared unit was
    found between them. Matching by **ordinal position** instead (the
    Nth real clip in the documented list is the Nth non-"Empty" QE item
    on that track) works and needs no field-value guessing at all.
  - Several QE objects (effect list entries, track items) don't expose
    their real fields as normal enumerable/direct-access properties —
    some only work through `.toJSON()`, and even that can return a bare
    string (a localized display name) rather than an object.
  - `matchName` is not obtainable from this host's effect list at all —
    `displayName` is what's actually used throughout, including to look
    up and apply the effect.
  - `getVideoEffectByName`/`getAudioEffectByName`'s second argument
    means "treat the name as a matchName": passing `true` with a display
    name silently returns a non-functional stub object (no error) rather
    than the real effect, so this always calls it with `false`.
- **Video effect enumeration/application**
  (`getVideoEffectList`/`getVideoEffectByName`/`addVideoEffect`) is
  confirmed working end-to-end, verified by applying a real effect and
  checking the clip's own `.components` count changed. **Audio's mirror**
  (`getAudioEffectList`/`getAudioEffectByName`/`addAudioEffect`) is
  plausible by symmetry but NOT independently confirmed — so every audio
  QE call is feature-detected with `typeof` before use. If your
  Premiere/QE build doesn't have it, the panel simply reports audio
  effects as unsupported instead of guessing. Settings shows this status.
- **No documented API exists for Premiere's Effects-panel categories**
  (Blur & Sharpen, Distort, Keying, ...). The categories/keywords/aliases
  used for smart search in `client/main/js/effects-metadata.js` are a
  curated overlay on top of the host's real effect names — cosmetic
  grouping, not host data. Effects the host reports that aren't in that
  table still work; they fall back to plain fuzzy-matching on their own
  name (this is also what keeps third-party filter plug-ins usable
  without inventing anything about them — whatever `getVideoEffectList()`
  reports, including third-party AE/PR-compatible filters if the host
  lists them, gets indexed the same way).
- **No true OS-global keyboard shortcut is wired up.** See "Opening the
  window" below for exactly what is and isn't real here.

## About the reference extension

While debugging the UXP build, a real commercial Premiere Pro extension
("Dagger") was made available for inspection. Its `CSXS/manifest.xml` —
Adobe's own public XML schema, not anyone's proprietary content — showed
two things worth acting on: CEP is still a fully viable, currently
shipping path, and its panel is a `Type="Custom"` floating window rather
than a docked panel, which is closer to a Spotlight-style overlay than a
tabbed Extensions panel. That structural fact shaped the manifest here.

Its actual code was **not** used. `host/PPRO.jsx` in that package is
JSXBIN — Adobe's compiled ExtendScript bytecode, not readable source —
and its JS panels weren't inspected either, since that product is
signed and commercially distributed; reading its minified/compiled
internals further would have crossed into reverse-engineering paid
software, which this project doesn't do. Everything in `host/ppro.jsx`
and the `client/main/js/` files here was written from scratch against
publicly documented Adobe APIs and independently-published community
research (cited above), not derived from that package's code.

## Opening the window

There's no way for a CEP extension to register a true OS-global hotkey
through any *documented* Adobe API, and Premiere's own Keyboard Shortcuts
editor doesn't expose individual extensions as bindable commands either
(confirmed by testing — searching "KVN Command" or "extension" there
finds nothing, only the generic "Find Extensions on Exchange..." item).
The solution differs by platform, for a confirmed technical reason (not
a preference):

### Windows — real global hotkey, no setup

`client/bg/` is a second, invisible companion CEP extension
(`com.kvn.command.bg`) that starts with Premiere (`AutoVisible: false` +
`<StartOn>` the `AppOnline` event — the correct pattern for an
always-running `Custom`-type extension; `AutoVisible: true` alone only
reliably auto-launches `Panel`-type extensions) and, with Node.js
enabled via `--enable-nodejs --mixed-context`, loads a bundled native
addon that installs a real OS-level global keyboard hook:
[`uiohook-napi`](https://github.com/SnosMe/uiohook-napi) (MIT-licensed
N-API bindings for libuiohook). Prebuilt binaries are bundled directly
under `client/bg/native/prebuilds/` (Node-API is ABI-stable, so these
run unmodified across Node major versions — no compilation step for any
user). `client/bg/native/uiohook-loader.js` is a small dependency-free
loader that picks the right binary for `process.platform`/`process.arch`
and re-exposes the same event-emitter API as the upstream package (no
`node-gyp-build` dependency needed, since there's no real `node_modules`
resolution inside a CEP extension folder).

`client/bg/app.js` only attempts this on `process.platform === "win32"`.
It listens for `keydown` and checks for `Ctrl+Win+K` (`ctrlKey` +
`metaKey`, the Windows key, + the `K` keycode — all resolved for us by
uiohook-napi), then calls the native
`window.__adobe_cep__.requestOpenExtension("com.kvn.command.main", "")`
binding to open/focus the real window.

**Not yet independently confirmed on a live Windows Premiere install** —
verified so far only by inspecting the published npm package's contents
and Node-API's documented ABI-stability guarantees, not by an actual
keypress. If it ever fails to load on a given machine, the bg extension
degrades gracefully (logs the failure, shows it in the bg window's
`#hotkey-status`) without crashing or blocking the rest of the plugin.

### macOS — no addon, by design

Confirmed via live testing that loading this same addon inside
Premiere's own process fails with a hard macOS security error
(`dlopen ... different Team IDs`): hardened-runtime library validation
blocks any native code not signed with Adobe's own Team ID from loading
inside Premiere/CEP's process. This is an OS-level restriction, not a
bug — no amount of path or signing tweaks on our side works around it.
`client/bg/app.js` therefore never attempts the addon on `darwin`.

(For reference, this is how Dagger's "Spell Book" gets a real macOS
global hotkey: inspecting its *installed app's own code signature*
— not its code — shows it's a separate, independently-signed standalone
app (`/Applications/Spell Book.app`, `TeamIdentifier=42564W9252`,
distinct from Adobe's), running as its own process, bridging into a CEP
background extension of its own — the same shape as `client/bg/` here.
Replicating that needs a comparable signed+notarized helper app, which
needs an Apple Developer Program membership.)

Until that helper app exists, **macOS uses the OS's own native shortcut
feature** — no external app, no extra binary, just Premiere + a
one-time setting:

**System Settings ▸ Keyboard ▸ Keyboard Shortcuts ▸ App Shortcuts ▸ +**,
Application: Adobe Premiere Pro, Menu Title: `KVN Command` (exactly as
it reads under Window ▸ Extensions), then set the key combo (confirmed
working). Plain `Cmd+K` is already Premiere's own Cut shortcut, so pick
something else (e.g. `Ctrl+Cmd+K`).

### Always available, both platforms

**Window ▸ Extensions ▸ KVN Command**, no setup, works everywhere.

The "Shortcut reminder" field in Settings is still just a label next to
the search box (`Ctrl+Cmd+K`) — a reminder, not a rebind control, and it
doesn't know which of the above (if any) you've set up.

## Architecture

```
CSXS/manifest.xml         CEP manifest — two extensions: the visible
                           "Custom" (floating) command palette, and an
                           invisible companion for the global hotkey bridge
host/ppro.jsx              ExtendScript host — the ONLY file that touches
                            Premiere's scripting DOM/QE DOM directly
icons/*.png                 Flat placeholder squares — swap for KVN's mark
client/bg/
  index.html, app.js        Invisible companion extension: installs a
                             real OS-global keyboard hook (bundled
                             uiohook-napi native addon) that opens the
                             real window on Ctrl+Cmd/Win+K, plus a plain
                             Node http server kept for manual debugging
                             — see "Opening the window" below
  native/
    uiohook-loader.js        Dependency-free loader: picks the right
                              prebuilt binary for process.platform/arch
                              and re-exposes uiohook-napi's event API
    prebuilds/<platform-arch>/uiohook-napi.node
                              Bundled prebuilt native addons (mac +
                              Windows only — Premiere doesn't ship for
                              Linux), no compilation needed for any user
client/main/
  index.html                Loads css + js/*.js in dependency order
  css/palette.css            KVN visual identity: #080909 bg, off-white
                              text, #7CFF00 accent used only for
                              selection/state/focus
  js/
    host-bridge.js            Wraps the native window.__adobe_cep__
                               .evalScript binding (the same call Adobe's
                               own CSInterface.js wraps) in a Promise —
                               the only file that knows CEP's calling
                               convention exists
    premiere-bridge.js         JS-side counterpart to host/ppro.jsx:
                                getSelectionContext / listHostEffects /
                                applyEffectToSelection / listHostTransitions /
                                applyTransitionToSelection
    effects-metadata.js         Curated aliases/keywords/category overlay
                                 for effects — data, not code branches
    effects-catalog.js          Merges host effects + metadata + user
                                 state (favorites/hidden/recent) into
                                 search-ready entries (type: "effect");
                                 caches the host round-trip per session
    transitions-metadata.js     Same idea as effects-metadata.js, for
                                 Premiere's "classic" transition set
    transitions-catalog.js      Mirrors effects-catalog.js for
                                 transitions (type: "transition") — kept
                                 separate since applying one is a
                                 different host call with different
                                 semantics (an edit point, not a whole
                                 clip), merged into one search pool in
                                 app.js
    search-engine.js            Dependency-free fuzzy search: exact →
                                 substring → subsequence → edit-distance
                                 typo fallback (typo fallback only applies
                                 to an effect's own name/aliases, not
                                 loose keyword hints, to avoid coincidental
                                 false positives)
    store.js                    localStorage-backed settings/favorites/
                                 hidden/recent
    app.js                      UI controller: renders the palette, wires
                                 keyboard nav (↑↓, Enter, Esc), settings,
                                 and the manage-favorites/manage-hidden
                                 sub-views
```

Every `client/main/js/*.js` file attaches itself to `window.KVN.*` and is
loaded via a plain `<script src>` tag in `index.html`, in dependency
order — no `require()`/CommonJS graph on the browser side. This was a
deliberate choice after the UXP build broke on an undocumented
root-relative `require()` resolution quirk for `<script>`-tagged entry
files; CEP with Node integration might resolve relative `require()` paths
more intuitively, but that wasn't verifiable without a live host, and a
flat global namespace has no path resolution to get wrong.

Effects are treated as data end-to-end: `{ id, kind, matchName,
displayName, category, keywords, aliases, isFavorite, isHidden, isRecent,
boost }`. Nothing branches on an effect's name — search, ranking, and
rendering are all table-driven.

## Loading the extension in Premiere Pro

CEP extensions loaded outside the Adobe Marketplace need Premiere's debug
mode enabled, since this one isn't signed:

**macOS:**
```
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
```
(bump `CSXS.9` to match your Premiere's CSXS version if different — 9 is
what this manifest declares.)

**Windows:** add a `PlayerDebugMode` string value set to `1` under
`HKEY_CURRENT_USER\Software\Adobe\CSXS.9` in the Registry.

Then copy (or symlink) the `kvn-command/` folder into Adobe's CEP
extensions directory:
- macOS: `~/Library/Application Support/Adobe/CEP/extensions/`
- Windows: `%APPDATA%\Adobe\CEP\extensions\`

### Live debugging (Chrome DevTools)

With `PlayerDebugMode` enabled, CEP also opens a remote-debugging port
per extension, declared in `.debug` at the extension root (already
included in this repo — `com.kvn.command.main` on port 8088,
`com.kvn.command.bg` on 8089). After Premiere is running with the
extension loaded:

1. Open **Chrome** (not Safari — this is CEF's own remote-debugging
   protocol, which Chrome speaks natively) and go to
   `http://localhost:8089` (or 8088 for the main window).
2. Click through to the listed page to get a real DevTools console —
   this shows actual thrown errors, `console.log`/`console.error`
   output, and lets you run expressions (e.g. `require("./native/uiohook-loader.js")`)
   directly in that extension's live context, instead of round-tripping
   through curl endpoints one hypothesis at a time.

This is the fastest way to debug `client/bg/app.js`, since that
extension's own window is normally invisible by design (see "Opening
the window" above).

Restart Premiere Pro, then **Window ▸ Extensions ▸ KVN Command**.

## What's implemented

Core search+apply loop for both **effects** and **transitions**, context
awareness (video/audio/none selected), smart + fuzzy search (typo
tolerance, PT-BR aliases), apply feedback and fast repeat workflow,
favorites/hidden/recently-used, settings UI, and the KVN dark/acid-green
visual identity. Architecture is fully data-driven per the design goal
of not hardcoding effect-specific branches.

Transitions apply at the **start** of the selected clip by default (an
"opening" transition), spanning the cut, at a fixed ~30-frame duration —
see the note in `host/ppro.jsx`'s `kvnApplyTransition` about this being
a timebase-naive first version, not reading the sequence's actual frame
rate. Scoped to Premiere's documented "classic" transitions
(`transitions-metadata.js`); newer bundled Film Impact-branded ones
aren't in the curated list but are still searchable by their own name if
your Premiere has them, same as any effect not in `effects-metadata.js`.

## What's intentionally NOT implemented yet

- Rebinding the Windows global shortcut from the UI — it's hardcoded to
  Ctrl+Win+K in `client/bg/app.js`; see "Opening the window" above for
  how the hook works and what's still unconfirmed live.
- A macOS global hotkey without a one-time System Settings ▸ App
  Shortcuts step — needs a separately signed+notarized helper app (an
  Apple Developer Program membership this project doesn't have yet); see
  "Opening the window" above.
- Reading/applying user-imported **effect presets** (`.prfpset` files) —
  confirmed via Adobe community reports that these do not appear in
  `getVideoEffectList()` at all, so they're invisible to this plugin's
  search. The documented workaround (parse the preset's XML directly,
  apply the base effect, then set each parameter from the file) is real
  but unimplemented.
- Transition duration/position aren't user-configurable yet (always
  "start of clip, ~1 second, spanning the cut").
- Turning this into a general Premiere command palette ("add adjustment
  layer", "nest sequence", "export", "marker") — deferred on purpose:
  get search+apply solid first. A future action would just be another
  kind of entry in the same search pool, executed differently on Enter.

## Local iteration without Premiere

`client/main/js/host-bridge.js` resolves to `null` when
`window.__adobe_cep__` isn't present (e.g. opening `client/main/index.html`
directly in a browser), and every layer above it treats that as "no
selection, no effects" rather than crashing — so the palette UI, search,
and settings can be iterated on without the host. It just runs in a
"preview mode" banner and can't apply effects.
