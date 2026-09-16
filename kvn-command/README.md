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

There is no built-in global hotkey. Two real options exist, and neither
is a "fake it" workaround:

1. **Window ▸ Extensions ▸ KVN Command**, every time. Works today, no
   setup.
2. **A genuinely global OS-level hotkey is technically possible** for a
   CEP extension: bundle a second, invisible "background" CEP extension
   (`AutoVisible: false`) that runs continuously with Node.js integration
   enabled (`--enable-nodejs`), and have it load a native Node
   global-hotkey-listening addon, then message the main window to show
   itself. This is a documented CEP capability (Node integration in
   mixed-context extensions), not something invented here — but a native
   addon has to be compiled against the exact Node/Chromium ABI Premiere's
   CEP runtime embeds, which is brittle and genuinely needs a real
   Premiere install to build and verify against. It was **not**
   implemented in this pass rather than shipped unverified; the manifest
   and file layout don't block adding a `bg` extension for this later.

The "Shortcut reminder" field in Settings is exactly that — a label next
to the search box, not a binding. It's honest about this in the panel
itself, not just in this doc.

## Architecture

```
CSXS/manifest.xml         CEP manifest — one "Custom" (floating) extension
host/ppro.jsx              ExtendScript host — the ONLY file that touches
                            Premiere's scripting DOM/QE DOM directly
icons/*.png                 Flat placeholder squares — swap for KVN's mark
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
                                applyEffectToSelection
    effects-metadata.js         Curated aliases/keywords/category overlay
                                 — data, not code branches
    effects-catalog.js          Merges host effects + metadata + user
                                 state (favorites/hidden/recent) into
                                 search-ready entries; caches the host
                                 round-trip per session
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

Restart Premiere Pro, then **Window ▸ Extensions ▸ KVN Command**.

## What's implemented

Core search+apply loop, context awareness (video/audio/none selected),
smart + fuzzy search (typo tolerance, PT-BR aliases), apply feedback and
fast repeat workflow, favorites/hidden/recently-used, settings UI, and
the KVN dark/acid-green visual identity. Architecture is fully
data-driven per the design goal of not hardcoding effect-specific
branches.

## What's intentionally NOT implemented yet

- A real global OS-level hotkey (see "Opening the window" above — the
  path is understood, not shipped unverified).
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
