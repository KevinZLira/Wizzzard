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

/**
 * Whatever the host currently reports as installed video/audio filters.
 * Always includes a `debug` block (qe availability, raw item counts,
 * property names actually seen on the first item) so a zero-effects
 * result — which isn't an exception, so the normal `error` field stays
 * empty — is still diagnosable from the panel without another round trip.
 */
function kvnListEffects() {
  var debug = { qeDefinedBefore: typeof qe !== "undefined" };
  try {
    kvnEnsureQE();
    debug.qeDefinedAfterEnable = typeof qe !== "undefined";
    debug.qeProjectDefined = debug.qeDefinedAfterEnable && typeof qe.project !== "undefined";

    var result = { video: [], audio: [], audioSupported: false, debug: debug };

    var videoList = qe.project.getVideoEffectList();
    debug.videoListType = typeof videoList;
    debug.videoNumItems = videoList && typeof videoList.numItems !== "undefined" ? videoList.numItems : "no .numItems property";

    // .numItems wasn't there on a real host — dump everything we can see
    // on the returned object instead of guessing at another property name.
    if (videoList) {
      var videoListKeys = [];
      for (var vk in videoList) videoListKeys.push(vk);
      debug.videoListKeys = videoListKeys;

      if (videoList.reflect) {
        var reflectProps = [];
        if (videoList.reflect.properties) {
          for (var rp = 0; rp < videoList.reflect.properties.length; rp++) {
            reflectProps.push(String(videoList.reflect.properties[rp]));
          }
        }
        var reflectMethods = [];
        if (videoList.reflect.methods) {
          for (var rm = 0; rm < videoList.reflect.methods.length; rm++) {
            reflectMethods.push(String(videoList.reflect.methods[rm]));
          }
        }
        debug.videoListReflectProperties = reflectProps;
        debug.videoListReflectMethods = reflectMethods;
      }

      // Common alternates seen across different QE DOM builds/versions.
      var altCountKeys = ["length", "numEffects", "count"];
      for (var ak = 0; ak < altCountKeys.length; ak++) {
        var key = altCountKeys[ak];
        if (typeof videoList[key] !== "undefined") {
          debug["alt_" + key] = videoList[key];
        }
      }
    }

    // Single read each, not re-accessed inside the check — see the note
    // by the same pattern in kvnFindSelectedQeItems.
    var videoRawNumItems = videoList.numItems;
    var videoRawLength = videoList.length;
    var videoCount = 0;
    if (typeof videoRawNumItems === "number") {
      videoCount = videoRawNumItems;
    } else if (typeof videoRawLength === "number") {
      videoCount = videoRawLength;
    }

    for (var i = 0; i < videoCount; i++) {
      var vEffect = videoList[i];
      if (!vEffect) continue;

      // toJSON() turned out to return the (localized!) display name as a
      // bare string, not an object — confirmed on a live PT-BR Premiere,
      // where it returned "Substituição de cor" for one item. So the
      // items ARE real, .name/.matchName direct access just isn't it.
      var vDisplayName = null;
      if (typeof vEffect.toJSON === "function") {
        try {
          var vJson = vEffect.toJSON();
          vDisplayName = typeof vJson === "string" ? vJson : vJson && (vJson.name || vJson.displayName);
        } catch (toJsonErr) {
          // ignore, vDisplayName stays null
        }
      }
      if (!vDisplayName && typeof vEffect.name === "string") vDisplayName = vEffect.name;
      if (!vDisplayName && typeof vEffect.toString === "function") {
        var asString = vEffect.toString();
        if (asString && asString.indexOf("[object") !== 0) vDisplayName = asString;
      }

      // matchName still isn't confirmed — toJSON only gave us the name.
      // Try direct access, then fall back to reflect() introspection so
      // this is diagnosable instead of guessed at again.
      var vMatchName = typeof vEffect.matchName === "string" ? vEffect.matchName : null;

      if (i === 0) {
        debug.firstVideoItemToJsonType = typeof (vEffect.toJSON && vEffect.toJSON());
        debug.firstVideoItemDisplayName = vDisplayName;
        debug.firstVideoItemMatchName = vMatchName;
        if (vEffect.reflect) {
          var vReflectProps = [];
          if (vEffect.reflect.properties) {
            for (var vrp = 0; vrp < vEffect.reflect.properties.length; vrp++) {
              vReflectProps.push(String(vEffect.reflect.properties[vrp]));
            }
          }
          var vReflectMethods = [];
          if (vEffect.reflect.methods) {
            for (var vrm = 0; vrm < vEffect.reflect.methods.length; vrm++) {
              vReflectMethods.push(String(vEffect.reflect.methods[vrm]));
            }
          }
          debug.firstVideoItemReflectProperties = vReflectProps;
          debug.firstVideoItemReflectMethods = vReflectMethods;
        }
      }

      result.video.push({ displayName: vDisplayName, matchName: vMatchName });
    }

    if (typeof qe.project.getAudioEffectList === "function") {
      result.audioSupported = true;
      var audioList = qe.project.getAudioEffectList();
      var audioRawNumItems = audioList.numItems;
      var audioRawLength = audioList.length;
      var audioCount = 0;
      if (typeof audioRawNumItems === "number") {
        audioCount = audioRawNumItems;
      } else if (typeof audioRawLength === "number") {
        audioCount = audioRawLength;
      }
      for (var j = 0; j < audioCount; j++) {
        var aEffect = audioList[j];
        if (!aEffect) continue;
        var aData = aEffect;
        if (typeof aEffect.toJSON === "function") {
          try {
            aData = aEffect.toJSON();
          } catch (aToJsonErr) {
            aData = aEffect;
          }
        }
        result.audio.push({ displayName: aData.name || aData.displayName, matchName: aData.matchName });
      }
    }

    return kvnJsonStringify(result);
  } catch (err) {
    return kvnJsonStringify({ video: [], audio: [], audioSupported: false, error: String(err), debug: debug });
  }
}

/**
 * Finds the QE-indexed track items matching the documented DOM's
 * selected clips. QE's getItemAt() counts gaps between clips as items
 * too, so we walk the QE track item-by-item and rely on it exposing the
 * same clip name/start time as the documented API to line them up,
 * rather than assuming index parity outright.
 */
/**
 * Reads a field off a QE host object, trying direct access then toJSON().
 * Reads obj[fieldName] into a local exactly once — a nested-ternary bug
 * found earlier turned out to be this same class of issue: re-accessing
 * a property on these QE objects multiple times in one expression isn't
 * reliably idempotent, so every check here is against one captured read.
 */
function kvnReadQeField(obj, fieldName) {
  if (!obj) return undefined;

  var direct = obj[fieldName];
  if (typeof direct !== "undefined" && direct !== null) {
    return direct;
  }

  var toJsonFn = obj.toJSON;
  if (typeof toJsonFn === "function") {
    try {
      var data = obj.toJSON();
      if (data && typeof data === "object") {
        var fromJson = data[fieldName];
        if (typeof fromJson !== "undefined") return fromJson;
      }
    } catch (e) {
      // fall through
    }
  }
  return undefined;
}

function kvnFindSelectedQeItems(kind, debugOut) {
  var seq = app.project.activeSequence;
  var qeSeq = qe.project.getActiveSequence();
  var matches = [];

  var trackCount = kind === "video" ? seq.videoTracks.numTracks : seq.audioTracks.numTracks;
  debugOut.trackCount = trackCount;
  debugOut.perTrack = [];

  for (var t = 0; t < trackCount; t++) {
    var docTrack = kind === "video" ? seq.videoTracks[t] : seq.audioTracks[t];
    var qeTrack = kind === "video" ? qeSeq.getVideoTrackAt(t) : qeSeq.getAudioTrackAt(t);

    // docTrack.clips (the documented, non-QE DOM) lists ONLY real clips —
    // it has no concept of a "gap" the way QE's getItemAt() does. So
    // instead of matching QE items to documented clips by any field
    // value (time units turned out to differ between the two DOMs' time
    // objects — QE's "start" is a "QETime", not the documented TickTime,
    // and no confirmed shared unit was found), filter QE's gaps out and
    // correlate purely by ordinal position: the Nth real clip on a track
    // should be the Nth non-"Empty" QE item on that same track, since
    // both simply list the same real clips left-to-right.
    var selectedDocIndexes = [];
    for (var c = 0; c < docTrack.clips.numItems; c++) {
      if (docTrack.clips[c].isSelected()) selectedDocIndexes.push(c);
    }

    var rawNumItems = qeTrack.numItems;
    var rawLength = qeTrack.length;
    var qeItemCount = 0;
    if (typeof rawNumItems === "number") {
      qeItemCount = rawNumItems;
    } else if (typeof rawLength === "number") {
      qeItemCount = rawLength;
    }

    var qeNonEmptyItems = [];
    for (var qi = 0; qi < qeItemCount; qi++) {
      var qeItem = qeTrack.getItemAt(qi);
      if (!qeItem) continue;
      var itemType = kvnReadQeField(qeItem, "type");
      if (itemType === "Empty") continue;
      qeNonEmptyItems.push(qeItem);
    }

    debugOut.perTrack.push({
      docClipCount: docTrack.clips.numItems,
      selectedDocIndexes: selectedDocIndexes,
      qeItemCount: qeItemCount,
      qeNonEmptyCount: qeNonEmptyItems.length,
    });

    for (var si = 0; si < selectedDocIndexes.length; si++) {
      var docIndex = selectedDocIndexes[si];
      if (qeNonEmptyItems[docIndex]) {
        // Pair the QE item with its documented-DOM counterpart so the
        // caller can verify addVideoEffect/addAudioEffect actually did
        // something (via the documented .components collection) instead
        // of trusting that no exception means it worked.
        matches.push({ qeItem: qeNonEmptyItems[docIndex], docClip: docTrack.clips[docIndex] });
      }
    }
  }

  return matches;
}

/**
 * Applies one effect (by matchName) to every currently selected clip of
 * the given kind. Returns { appliedTo, errors: [string] } as JSON.
 */
function kvnApplyEffect(effectName, kind) {
  try {
    kvnEnsureQE();

    if (kind === "audio" && typeof qe.project.getAudioEffectByName !== "function") {
      return kvnJsonStringify({
        appliedTo: 0,
        errors: ["Audio effect application isn't available via this Premiere version's QE API."],
      });
    }

    var debug = {};
    var targets = kvnFindSelectedQeItems(kind, debug);
    if (targets.length === 0) {
      return kvnJsonStringify({ appliedTo: 0, errors: ["NO_MATCHING_TARGET"], debug: debug });
    }

    // matchName was never resolvable — this is called with displayName
    // instead. The before/after component-count check showed
    // addVideoEffect() reporting no error yet adding nothing, which
    // means the "effect" object handed to it likely isn't a real,
    // usable effect even though it's truthy — introspect it directly
    // rather than assume, and try both boolean values for the second
    // arg (public examples only showed `true`; its actual meaning was
    // never confirmed — could be "isMatchName" and we're passing a
    // display name while claiming otherwise).
    var effectTrue =
      kind === "video" ? qe.project.getVideoEffectByName(effectName, true) : qe.project.getAudioEffectByName(effectName, true);
    var effectFalse =
      kind === "video"
        ? qe.project.getVideoEffectByName(effectName, false)
        : qe.project.getAudioEffectByName(effectName, false);

    function kvnDescribeEffectLookup(candidate) {
      var info = { type: typeof candidate, isTruthy: !!candidate };
      if (candidate) {
        var keys = [];
        for (var k in candidate) keys.push(k);
        info.enumerableKeys = keys;
        if (typeof candidate.toJSON === "function") {
          try {
            info.toJsonValue = candidate.toJSON();
          } catch (e5) {
            info.toJsonValue = "threw: " + String(e5);
          }
        }
        if (candidate.reflect) {
          var rProps = [];
          if (candidate.reflect.properties) {
            for (var rp2 = 0; rp2 < candidate.reflect.properties.length; rp2++) rProps.push(String(candidate.reflect.properties[rp2]));
          }
          info.reflectProperties = rProps;
        }
      }
      return info;
    }

    debug.effectLookupTrue = kvnDescribeEffectLookup(effectTrue);
    debug.effectLookupFalse = kvnDescribeEffectLookup(effectFalse);

    if (!effectTrue && !effectFalse) {
      return kvnJsonStringify({
        appliedTo: 0,
        errors: ['getVideoEffectByName/getAudioEffectByName("' + effectName + '") returned nothing for either boolean value.'],
        debug: debug,
      });
    }

    function kvnReadComponentCount(docClip) {
      try {
        return docClip.components.numItems;
      } catch (e6) {
        return "unreadable: " + String(e6);
      }
    }

    function kvnTryAddEffect(docClip, qeItem, candidate) {
      var before = kvnReadComponentCount(docClip);
      var caught = null;
      try {
        if (kind === "video") {
          qeItem.addVideoEffect(candidate);
        } else {
          qeItem.addAudioEffect(candidate);
        }
      } catch (e7) {
        caught = String(e7);
      }
      var after = kvnReadComponentCount(docClip);
      var worked = typeof before === "number" && typeof after === "number" && after > before;
      return { before: before, after: after, worked: worked, error: caught };
    }

    // The looked-up "effect" objects only expose a bare "name" property
    // (see effectLookupTrue/False above) — too little structure to trust
    // as a real, applyable effect reference. Rather than bet on one
    // candidate, try several against the FIRST target only, verifying
    // via the real component count each time, and use whichever one
    // actually works for the rest.
    var candidates = [
      { label: "effectTrue (object)", value: effectTrue },
      { label: "effectFalse (object)", value: effectFalse },
      { label: "raw effectName string", value: effectName },
    ];

    var firstTarget = targets[0];
    var candidateResults = [];
    var winningCandidate = null;

    for (var ci = 0; ci < candidates.length; ci++) {
      if (!candidates[ci].value) {
        candidateResults.push({ label: candidates[ci].label, skipped: "falsy, not attempted" });
        continue;
      }
      var attempt = kvnTryAddEffect(firstTarget.docClip, firstTarget.qeItem, candidates[ci].value);
      candidateResults.push({ label: candidates[ci].label, before: attempt.before, after: attempt.after, worked: attempt.worked, error: attempt.error });
      if (attempt.worked && !winningCandidate) {
        winningCandidate = candidates[ci].value;
      }
    }

    debug.candidateResults = candidateResults;

    if (!winningCandidate) {
      return kvnJsonStringify({ appliedTo: 0, errors: ["None of the candidate effect references actually changed the clip's component count."], debug: debug });
    }

    // First target is already done (that's how we found the winner);
    // apply the same winning candidate to any remaining targets.
    var appliedTo = 1;
    var errors = [];
    for (var i = 1; i < targets.length; i++) {
      var attempt2 = kvnTryAddEffect(targets[i].docClip, targets[i].qeItem, winningCandidate);
      if (attempt2.worked) {
        appliedTo++;
      } else {
        errors.push(attempt2.error || "Component count didn't change.");
      }
    }

    return kvnJsonStringify({ appliedTo: appliedTo, errors: errors, debug: debug });
  } catch (err) {
    return kvnJsonStringify({ appliedTo: 0, errors: [String(err)] });
  }
}
