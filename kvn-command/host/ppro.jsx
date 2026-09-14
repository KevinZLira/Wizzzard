/**
 * host/ppro.jsx — ExtendScript host bridge for KVN Command.
 *
 * ExtendScript here is plain ES3 (var/function only — no let/const, arrow
 * functions, template literals, or destructuring), and has no built-in
 * JSON, so `kvnJsonStringify` below is a tiny hand-written serializer
 * covering only the flat shapes this file actually returns (no attempt at
 * a general-purpose JSON library).
 *
 * Two real, verified APIs are combined here because neither alone is
 * enough:
 *   - Reading the CURRENT SELECTION uses the officially documented
 *     Premiere Pro scripting DOM: TrackItem.isSelected() on
 *     app.project.activeSequence.videoTracks/audioTracks (Premiere Pro
 *     Scripting Guide, https://ppro-scripting.docsforadobe.dev).
 *   - APPLYING an effect has no documented API at all. The only way to do
 *     it from ExtendScript is the undocumented, unsupported "QE DOM"
 *     (app.enableQE(); qe.project...), confirmed by multiple independent
 *     public sources (Adobe community threads, vakago-tools.com's
 *     ExtendScript tutorials) — not something invented for this plugin.
 *     QE track items are addressed by index, and that index has to line
 *     up with the documented DOM's index (including gaps between clips —
 *     see kvnFindSelectedQeItems below), which is the standard, if
 *     awkward, bridging technique for this.
 *   - Only VIDEO effect enumeration/application (getVideoEffectList,
 *     getVideoEffectByName, addVideoEffect) is confirmed by those
 *     sources. An audio-side mirror (getAudioEffectList /
 *     getAudioEffectByName / addAudioEffect) is plausible by symmetry but
 *     NOT independently confirmed, so every audio QE call here is
 *     feature-detected with typeof before use — if your Premiere/QE
 *     version doesn't have it, kvnListEffects simply omits audio effects
 *     and kvnApplyEffect reports a clear error instead of guessing.
 */

function kvnJsonStringify(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") {
    return (
      '"' +
      value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r") +
      '"'
    );
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Array) {
    var items = [];
    for (var i = 0; i < value.length; i++) {
      items.push(kvnJsonStringify(value[i]));
    }
    return "[" + items.join(",") + "]";
  }
  if (typeof value === "object") {
    var pairs = [];
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        pairs.push(kvnJsonStringify(key) + ":" + kvnJsonStringify(value[key]));
      }
    }
    return "{" + pairs.join(",") + "}";
  }
  return "null";
}

function kvnEnsureQE() {
  if (typeof qe === "undefined" || !qe) {
    app.enableQE();
  }
}

/**
 * Reports what's currently selected in the active sequence using the
 * documented DOM only (no QE needed just to read selection state).
 */
function kvnGetContext() {
  try {
    var seq = app.project.activeSequence;
    if (!seq) return kvnJsonStringify({ kind: "none", count: 0 });

    var hasVideo = false;
    var hasAudio = false;
    var count = 0;

    var vTrackCount = seq.videoTracks.numTracks;
    for (var vt = 0; vt < vTrackCount; vt++) {
      var vTrack = seq.videoTracks[vt];
      var vClipCount = vTrack.clips.numItems;
      for (var vc = 0; vc < vClipCount; vc++) {
        if (vTrack.clips[vc].isSelected()) {
          hasVideo = true;
          count++;
        }
      }
    }

    var aTrackCount = seq.audioTracks.numTracks;
    for (var at = 0; at < aTrackCount; at++) {
      var aTrack = seq.audioTracks[at];
      var aClipCount = aTrack.clips.numItems;
      for (var ac = 0; ac < aClipCount; ac++) {
        if (aTrack.clips[ac].isSelected()) {
          hasAudio = true;
          count++;
        }
      }
    }

    var kind = "none";
    if (hasVideo && hasAudio) kind = "mixed";
    else if (hasVideo) kind = "video";
    else if (hasAudio) kind = "audio";

    return kvnJsonStringify({ kind: kind, count: count });
  } catch (err) {
    return kvnJsonStringify({ kind: "none", count: 0, error: String(err) });
  }
}

/** Whatever the host currently reports as installed video/audio filters. */
function kvnListEffects() {
  try {
    kvnEnsureQE();
    var result = { video: [], audio: [], audioSupported: false };

    var videoList = qe.project.getVideoEffectList();
    for (var i = 0; i < videoList.numItems; i++) {
      var vEffect = videoList[i];
      result.video.push({ displayName: vEffect.name, matchName: vEffect.matchName });
    }

    if (typeof qe.project.getAudioEffectList === "function") {
      result.audioSupported = true;
      var audioList = qe.project.getAudioEffectList();
      for (var j = 0; j < audioList.numItems; j++) {
        var aEffect = audioList[j];
        result.audio.push({ displayName: aEffect.name, matchName: aEffect.matchName });
      }
    }

    return kvnJsonStringify(result);
  } catch (err) {
    return kvnJsonStringify({ video: [], audio: [], audioSupported: false, error: String(err) });
  }
}

/**
 * Finds the QE-indexed track items matching the documented DOM's
 * selected clips. QE's getItemAt() counts gaps between clips as items
 * too, so we walk the QE track item-by-item and rely on it exposing the
 * same clip name/start time as the documented API to line them up,
 * rather than assuming index parity outright.
 */
function kvnFindSelectedQeItems(kind) {
  var seq = app.project.activeSequence;
  var qeSeq = qe.project.getActiveSequence();
  var matches = [];

  var trackCount = kind === "video" ? seq.videoTracks.numTracks : seq.audioTracks.numTracks;

  for (var t = 0; t < trackCount; t++) {
    var docTrack = kind === "video" ? seq.videoTracks[t] : seq.audioTracks[t];
    var qeTrack = kind === "video" ? qeSeq.getVideoTrackAt(t) : qeSeq.getAudioTrackAt(t);

    var selectedStartTimes = {};
    for (var c = 0; c < docTrack.clips.numItems; c++) {
      var clip = docTrack.clips[c];
      if (clip.isSelected()) {
        selectedStartTimes[String(clip.start.seconds)] = true;
      }
    }

    var qeItemCount = qeTrack.numItems;
    for (var qi = 0; qi < qeItemCount; qi++) {
      var qeItem = qeTrack.getItemAt(qi);
      // Gaps report type "Empty"; skip them explicitly rather than
      // guessing by name/time alone.
      if (qeItem.type && qeItem.type === "Empty") continue;
      if (selectedStartTimes[String(qeItem.start.seconds)]) {
        matches.push(qeItem);
      }
    }
  }

  return matches;
}

/**
 * Applies one effect (by matchName) to every currently selected clip of
 * the given kind. Returns { appliedTo, errors: [string] } as JSON.
 */
function kvnApplyEffect(matchName, kind) {
  try {
    kvnEnsureQE();

    if (kind === "audio" && typeof qe.project.getAudioEffectByName !== "function") {
      return kvnJsonStringify({
        appliedTo: 0,
        errors: ["Audio effect application isn't available via this Premiere version's QE API."],
      });
    }

    var targets = kvnFindSelectedQeItems(kind);
    if (targets.length === 0) {
      return kvnJsonStringify({ appliedTo: 0, errors: ["NO_MATCHING_TARGET"] });
    }

    var effect =
      kind === "video"
        ? qe.project.getVideoEffectByName(matchName, true)
        : qe.project.getAudioEffectByName(matchName, true);

    var appliedTo = 0;
    var errors = [];

    for (var i = 0; i < targets.length; i++) {
      try {
        if (kind === "video") {
          targets[i].addVideoEffect(effect);
        } else {
          targets[i].addAudioEffect(effect);
        }
        appliedTo++;
      } catch (itemErr) {
        errors.push(String(itemErr));
      }
    }

    return kvnJsonStringify({ appliedTo: appliedTo, errors: errors });
  } catch (err) {
    return kvnJsonStringify({ appliedTo: 0, errors: [String(err)] });
  }
}
