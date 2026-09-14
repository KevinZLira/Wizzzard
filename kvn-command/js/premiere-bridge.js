/**
 * premiere-bridge.js
 *
 * Thin wrapper around the real Premiere Pro UXP scripting surface
 * (require("premierepro")). This is the ONLY file that talks to the
 * host API directly — everything else in the plugin deals with plain
 * JS objects, so the moment Adobe changes/extends the API, only this
 * file needs to change.
 *
 * Verified API surface used here (Premiere Pro UXP, host module
 * "premierepro" — see @adobe/premierepro-types):
 *   - premierepro.Project.getActiveProject()
 *   - project.getActiveSequence()
 *   - sequence.getSelection() -> TrackItemSelection
 *   - trackItemSelection.getTrackItems() -> (VideoClipTrackItem|AudioClipTrackItem)[]
 *   - premierepro.VideoFilterFactory.getDisplayNames() / .getMatchNames() / .createComponent(matchName)
 *   - premierepro.AudioFilterFactory.getDisplayNames() / .createComponentByDisplayName(name, trackItem)
 *     (audio's factory is NOT symmetrical with video's: it has no
 *     confirmed getMatchNames()/createComponent(matchName) pair, and
 *     createComponentByDisplayName needs the target track item itself —
 *     presumably to build a channel-compatible component. We key audio
 *     effects by displayName instead of matchName for this reason.)
 *   - trackItem.getComponentChain() -> VideoComponentChain | AudioComponentChain
 *   - chain.createAppendComponentAction(component) -> Action
 *   - project.executeTransaction(cb, undoString)
 *
 * IMPORTANT — real constraints (do not assume beyond these):
 *   - There is no host API to enumerate effects by category (Blur/Sharpen/
 *     Color Correction/etc). Premiere's native "Effects" panel categories
 *     are not exposed to scripting. Categories/keywords/aliases used for
 *     search come from our own curated metadata (effects-catalog.js) and
 *     are layered on top of the names the host actually reports.
 *   - Third-party effect plug-ins (Sapphire, etc.) are not enumerated via
 *     any special API — they simply show up in VideoFilterFactory /
 *     AudioFilterFactory's lists IF the host itself lists them as
 *     installed filters. We never hardcode or invent third-party effects;
 *     whatever the factory returns is what we index.
 *   - Premiere Pro's UXP panels currently cannot register a global/OS
 *     keyboard shortcut (unlike Photoshop UXP). See README for the actual
 *     workaround (Premiere's own Keyboard Shortcuts editor, "Panels"
 *     category) — the in-app "shortcut" setting in this plugin is a
 *     reminder label, not an enforced binding.
 */

/* global require */

let premierepro = null;
try {
  // Only resolvable inside the actual Premiere Pro UXP host.
  premierepro = require("premierepro");
} catch (err) {
  console.warn("[KVN Command] 'premierepro' host module not found — not running inside Premiere Pro.");
}

const MediaKind = Object.freeze({
  VIDEO: "video",
  AUDIO: "audio",
  UNKNOWN: "unknown",
});

/**
 * VideoClipTrackItem exposes isAdjustmentLayer()/isSpeedReversed(), which
 * AudioClipTrackItem does not. Rather than depend on an undocumented
 * Constants.MediaType guid, we duck-type on that method — it's stable
 * against the actually-published type definitions.
 */
function kindOfTrackItem(trackItem) {
  if (!trackItem) return MediaKind.UNKNOWN;
  if (typeof trackItem.isAdjustmentLayer === "function") return MediaKind.VIDEO;
  if (typeof trackItem.getComponentChain === "function") return MediaKind.AUDIO;
  return MediaKind.UNKNOWN;
}

async function getSelectionContext() {
  if (!premierepro) {
    return { project: null, sequence: null, items: [], kind: MediaKind.UNKNOWN };
  }

  const project = await premierepro.Project.getActiveProject();
  if (!project) {
    return { project: null, sequence: null, items: [], kind: MediaKind.UNKNOWN };
  }

  const sequence = await project.getActiveSequence();
  if (!sequence) {
    return { project, sequence: null, items: [], kind: MediaKind.UNKNOWN };
  }

  const selection = await sequence.getSelection();
  const items = selection ? await selection.getTrackItems() : [];

  let kind = MediaKind.UNKNOWN;
  if (items.length > 0) {
    const kinds = new Set(items.map(kindOfTrackItem));
    kind = kinds.size === 1 ? kinds.values().next().value : MediaKind.UNKNOWN;
  }

  return { project, sequence, items, kind };
}

/**
 * Reads whatever effects the host currently reports for video and audio.
 * Returns raw {displayName, matchName, kind} entries — no categorization,
 * that happens in effects-catalog.js.
 */
async function listHostEffects() {
  const results = [];
  if (!premierepro) return results;

  try {
    const [videoNames, videoMatches] = await Promise.all([
      premierepro.VideoFilterFactory.getDisplayNames(),
      premierepro.VideoFilterFactory.getMatchNames(),
    ]);
    videoNames.forEach((displayName, i) => {
      results.push({
        displayName,
        matchName: videoMatches[i],
        kind: MediaKind.VIDEO,
      });
    });
  } catch (err) {
    console.error("[KVN Command] Failed to read video effects from host:", err);
  }

  try {
    const audioNames = await premierepro.AudioFilterFactory.getDisplayNames();
    audioNames.forEach((displayName) => {
      results.push({
        displayName,
        matchName: null, // audio components are created by display name, see applyEffectToSelection
        kind: MediaKind.AUDIO,
      });
    });
  } catch (err) {
    console.error("[KVN Command] Failed to read audio effects from host:", err);
  }

  return results;
}

/**
 * Applies one effect (by matchName) to every selected track item whose
 * kind matches the effect's kind. Returns { appliedTo: number, errors: [] }.
 */
async function applyEffectToSelection(effect, context) {
  const { project, items } = context;
  if (!project || !items || items.length === 0) {
    throw new Error("NO_TARGET_SELECTED");
  }

  const targets = items.filter((item) => kindOfTrackItem(item) === effect.kind);
  if (targets.length === 0) {
    throw new Error("NO_MATCHING_TARGET");
  }

  const errors = [];
  let appliedTo = 0;

  for (const trackItem of targets) {
    try {
      const component =
        effect.kind === MediaKind.VIDEO
          ? await premierepro.VideoFilterFactory.createComponent(effect.matchName)
          : await premierepro.AudioFilterFactory.createComponentByDisplayName(
              effect.displayName,
              trackItem
            );

      const chain = await trackItem.getComponentChain();

      const ok = await project.executeTransaction((compoundAction) => {
        const action = chain.createAppendComponentAction(component);
        compoundAction.addAction(action);
      }, `Apply Effect: ${effect.displayName}`);

      if (ok) appliedTo += 1;
      else errors.push({ trackItem, reason: "TRANSACTION_FAILED" });
    } catch (err) {
      errors.push({ trackItem, reason: err && err.message ? err.message : String(err) });
    }
  }

  return { appliedTo, errors };
}

module.exports = {
  MediaKind,
  getSelectionContext,
  listHostEffects,
  applyEffectToSelection,
};
