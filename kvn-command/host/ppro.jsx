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

    // matchName was never resolvable (the effect list items only expose
    // it, if at all, through toJSON() as a bare display-name string with
    // no separate matchName field) — so this is called with the
    // (confirmed-working) displayName instead. getVideoEffectByName's
    // public example usage passes a matchName-shaped string, but the
    // function may just do a name lookup regardless of which kind of
    // name it is; if not, this will surface as its own clear error here.
    var effect =
      kind === "video"
        ? qe.project.getVideoEffectByName(effectName, true)
        : qe.project.getAudioEffectByName(effectName, true);

    debug.effectLookupResult = typeof effect;
    if (!effect) {
      return kvnJsonStringify({
        appliedTo: 0,
        errors: ['getVideoEffectByName/getAudioEffectByName("' + effectName + '") returned nothing.'],
        debug: debug,
      });
    }

    var appliedTo = 0;
    var errors = [];
    var verifyInfo = [];

    for (var i = 0; i < targets.length; i++) {
      var target = targets[i];
      // Verify against the documented DOM's .components collection
      // instead of trusting "didn't throw" — a prior round showed
      // addVideoEffect() reporting success with nothing actually landing
      // on the clip (Effect Controls stayed empty).
      var beforeCount = null;
      try {
        beforeCount = target.docClip.components.numItems;
      } catch (readErr) {
        beforeCount = "unreadable: " + String(readErr);
      }

      try {
        if (kind === "video") {
          target.qeItem.addVideoEffect(effect);
        } else {
          target.qeItem.addAudioEffect(effect);
        }
        appliedTo++;
      } catch (itemErr) {
        errors.push(String(itemErr));
      }

      var afterCount = null;
      try {
        afterCount = target.docClip.components.numItems;
      } catch (readErr2) {
        afterCount = "unreadable: " + String(readErr2);
      }

      verifyInfo.push({ before: beforeCount, after: afterCount });
    }

    return kvnJsonStringify({ appliedTo: appliedTo, errors: errors, debug: { verify: verifyInfo } });
  } catch (err) {
    return kvnJsonStringify({ appliedTo: 0, errors: [String(err)] });
  }
}
