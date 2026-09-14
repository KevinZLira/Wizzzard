# KVN Command

A Spotlight-inspired command palette for Adobe Premiere Pro: search for an
effect by name, keyword, or (loose) typo, and apply it straight to the
selected clip — no Effects panel, no dragging.

`KVN Command` is a separate product from `KVN Library`. Library answers
*"which asset do I want?"*; Command answers *"what do I want to do?"* and
turns the answer into an action. Command has no runtime dependency on
Library's code.

## What this is built on

This is a **UXP** plugin (Premiere Pro 24+), not a CEP/ExtendScript
extension. That choice was deliberate and based on what was actually
verified against Adobe's published UXP type declarations
(`@adobe/premierepro-types`) before writing any code — see "Verified
capabilities" below. CEP is being phased out and its effect-application
path (the unofficial "QE DOM", `qe.project...addVideoEffect`) is explicitly
unsupported by Adobe and has broken across Premiere updates before. UXP's
`VideoFilterFactory` / `AudioFilterFactory` are the documented, current
way to do this.

## Verified capabilities (grounded, not assumed)

Everything below was confirmed against Adobe's own UXP type declarations
before being relied on:

- **Enumerating effects is real and native.** `premierepro.VideoFilterFactory.getDisplayNames()` / `.getMatchNames()` and `premierepro.AudioFilterFactory.getDisplayNames()` return whatever the host currently has installed — including third-party AE/PR-compatible filter plug-ins, if the host lists them as installed filters. We never hardcode Premiere's effect list; `js/premiere-bridge.js` reads it live. This is also the honest answer to "search third-party plugins" (#13 in the spec): we don't need a special API for that — it falls out of the factory enumeration for free, for whatever plug-ins are actually installed and registered with Premiere. We did not fabricate this; it's exactly what `getDisplayNames()`/`getMatchNames()` are documented to return.
- **Applying an effect is real.** Video: `VideoFilterFactory.createComponent(matchName)` → `trackItem.getComponentChain()` → `chain.createAppendComponentAction(component)` → `project.executeTransaction(cb, undoLabel)`. Audio follows the same shape but creates components via `AudioFilterFactory.createComponentByDisplayName(displayName, trackItem)` instead (its factory is not symmetrical with video's — no confirmed `matchName`-based creation for audio).
- **Reading the current selection is real.** `Project.getActiveProject()` → `getActiveSequence()` → `getSelection()` → `getTrackItems()`.
- **What is NOT exposed:** Premiere's Effects-panel *categories* (Blur & Sharpen, Distort, Keying, ...) are not part of the scripting API. The categories/keywords/aliases used for smart search in `js/effects-metadata.js` are our own curated overlay on top of the host's real effect names — cosmetic grouping, not host data. Effects the host reports that aren't in that table still work; they just fall back to plain fuzzy-matching on their own name.
- **Global keyboard shortcuts are NOT currently supported for Premiere Pro UXP panels** (unlike Photoshop UXP, where the manifest's `shortcut` field is functional). We do not fake this. See "Opening the palette" below for the real, working alternative.

## Opening the palette

Because Premiere's UXP host doesn't yet let a panel bind a global hotkey,
`⌘K` (or any other combo) has to be assigned the way Premiere lets you
bind a key to *any* panel:

1. Premiere Pro ▸ Keyboard Shortcuts…
2. Category: **Panels**
3. Find **KVN Command** and assign your combo (e.g. `Cmd/Ctrl+K`).

The "Shortcut reminder" field in the plugin's Settings is exactly that —
a label shown next to the search box so the badge always reflects
whatever you actually bound. It does not itself bind anything (there is
currently no API for that), and the UI is honest about this in-panel.
The moment Adobe ships shortcut support for Premiere UXP panels, only
`js/app.js`'s settings wiring needs to change — the rest of the
architecture is unaffected.

Once open, the palette auto-focuses its search input immediately.

## Architecture

```
manifest.json          UXP manifest — one "panel" entrypoint
index.html              Loads js/app.js only (see note below)
css/palette.css         KVN visual identity: #080909 bg, off-white text,
                         #7CFF00 accent used only for selection/state/focus
js/
  premiere-bridge.js     The ONLY file that touches the host API
                          (require("premierepro")). Everything else deals
                          in plain JS objects.
  effects-metadata.js    Curated aliases/keywords/category overlay —
                          data, not code branches (#23).
  effects-catalog.js     Merges host effects + metadata + user state
                          (favorites/hidden/recent) into search-ready
                          entries. Caches the host round-trip per session.
  search-engine.js       Dependency-free fuzzy search: exact → substring →
                          subsequence → edit-distance typo fallback
                          (typo fallback only applies to an effect's own
                          name/aliases, not loose keyword hints, to avoid
                          coincidental false positives).
  store.js               localStorage-backed settings/favorites/hidden/
                          recent. Per-user, per-machine — no reason to use
                          anything heavier.
  app.js                 UI controller: renders the palette, wires
                          keyboard nav (↑↓, Enter, Esc), settings, and the
                          manage-favorites/manage-hidden sub-views.
```

`index.html` only loads `js/app.js` via `<script src>`. UXP only wraps
files pulled in through `require()` as CommonJS modules (`module`,
`exports` are only defined in that context) — a plain `<script src>` tag
runs as a bare global script with no `module` object. So every other file
is `require()`'d from `app.js` (or transitively), never `<script>`-tagged.

Effects are treated as data end-to-end: `{ id, kind, matchName, displayName,
category, keywords, aliases, isFavorite, isHidden, isRecent, boost }`.
Nothing branches on an effect's name — search, ranking, and rendering are
all table-driven, so adding a new metadata source later (e.g. a future
"actions" source per the Future section below) means adding another
producer of these objects, not new conditionals.

## What's implemented

Sections 1–4 (core search+apply loop), 5 (shortcut, with the real
constraint above), 6–10 (palette UI, context awareness), 11–12 (smart +
fuzzy search), 13 (native third-party enumeration, as far as the host
exposes it), 14–15 (apply feedback, repeat workflow), 16–22 (visual
identity, microinteractions, settings), 23 (data-driven architecture).

## What's intentionally NOT implemented yet

Section 24 (turning this into a general Premiere command palette — "add
adjustment layer", "nest sequence", "export", "marker") is explicitly
deferred per the spec's own instruction: get search+apply rock solid
first. The architecture doesn't block it — a future action would just be
another kind of entry in the same search pool, executed differently on
Enter — but no half-built version of it exists here.

## Icons

`icons/*.png` are flat placeholder squares (solid accent green / near-black)
just so the manifest points at real files — swap them for KVN's actual
mark before shipping.

## Local iteration without Premiere

`js/app.js` and `js/premiere-bridge.js` both fall back gracefully when
`require("uxp")` / `require("premierepro")` aren't available (e.g. opening
`index.html` directly in a browser), so the palette UI, search, and
settings can be iterated on without the host — it just runs in a
"preview mode" banner and can't actually apply effects.
