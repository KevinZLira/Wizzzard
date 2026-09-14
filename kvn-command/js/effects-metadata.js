/**
 * effects-metadata.js
 *
 * Curated overlay of aliases/keywords/category for Premiere's own stock
 * effects. This is NOT the source of truth for which effects exist —
 * premiere-bridge.js's listHostEffects() is. This file only enriches
 * whatever the host reports so search feels smart (typos, PT-BR terms,
 * "zoom" -> Transform, etc.) per requirements #11/#12.
 *
 * Keyed by the host's exact displayName. Anything the host reports that
 * isn't in this table still works — it just falls back to fuzzy-matching
 * its own name with no extra keywords/category (this is what keeps
 * third-party plugin effects usable without us inventing anything about
 * them, see #13).
 *
 * category is a purely cosmetic grouping for search results — it does
 * NOT come from the host (there is no API for Premiere's own Effects
 * panel categories) and is best-effort based on Premiere's known stock
 * effect list.
 */

const EFFECTS_METADATA = {
  "Gaussian Blur": {
    category: "Blur & Sharpen",
    keywords: ["blur", "soft", "smooth", "desfoque", "borrão", "difuminado"],
  },
  "Gaussian Blur (Legacy)": {
    category: "Blur & Sharpen",
    keywords: ["blur", "legacy", "desfoque"],
  },
  "Directional Blur": {
    category: "Blur & Sharpen",
    keywords: ["blur", "motion", "direction", "desfoque direcional"],
  },
  "Camera Blur": {
    category: "Blur & Sharpen",
    keywords: ["blur", "focus", "camera", "desfoque de câmera"],
  },
  "Sharpen": {
    category: "Blur & Sharpen",
    keywords: ["sharp", "detail", "nitidez", "afiar"],
  },
  "Unsharp Mask": {
    category: "Blur & Sharpen",
    keywords: ["sharp", "detail", "nitidez", "máscara de nitidez"],
  },
  "Lumetri Color": {
    category: "Color Correction",
    keywords: ["color", "grade", "grading", "cor", "correção de cor", "lut"],
  },
  "Fast Color Corrector": {
    category: "Color Correction",
    keywords: ["color", "correction", "cor", "correção rápida"],
  },
  "Brightness & Contrast": {
    category: "Color Correction",
    keywords: ["brightness", "contrast", "brilho", "contraste"],
  },
  "RGB Curves": {
    category: "Color Correction",
    keywords: ["color", "curves", "cor", "curvas"],
  },
  "Color Balance": {
    category: "Color Correction",
    keywords: ["color", "balance", "cor", "balanço de cor"],
  },
  "Transform": {
    category: "Distort / Transform",
    keywords: ["zoom", "scale", "rotate", "position", "escala", "posição", "girar", "aumentar"],
  },
  "Basic 3D": {
    category: "Distort / Transform",
    keywords: ["3d", "rotate", "tilt", "swivel"],
  },
  "Crop": {
    category: "Distort / Transform",
    keywords: ["crop", "cortar", "corte"],
  },
  "Distort": {
    category: "Distort / Transform",
    keywords: ["distort", "warp", "distorcer"],
  },
  "Mirror": {
    category: "Distort / Transform",
    keywords: ["mirror", "reflect", "espelho", "espelhar"],
  },
  "Echo": {
    category: "Time / Stylize",
    keywords: ["echo", "trail", "ghost", "eco", "rastro"],
  },
  "Posterize": {
    category: "Stylize",
    keywords: ["posterize", "posterizar"],
  },
  "Noise": {
    category: "Noise & Grain",
    keywords: ["noise", "grain", "ruído", "granulado"],
  },
  "Noise Alpha": {
    category: "Noise & Grain",
    keywords: ["noise", "alpha", "ruído"],
  },
  "Median": {
    category: "Noise & Grain",
    keywords: ["denoise", "median", "smooth", "reduzir ruído"],
  },
  "Ultra Key": {
    category: "Keying",
    keywords: ["key", "chroma", "green screen", "croma", "chave verde"],
  },
  "Track Matte Key": {
    category: "Keying",
    keywords: ["matte", "key", "máscara"],
  },
  "Warp Stabilizer": {
    category: "Distort / Transform",
    keywords: ["stabilize", "shake", "estabilizar", "tremido"],
  },
  "Parametric Equalizer": {
    category: "Audio / EQ",
    keywords: ["eq", "equalizer", "equalização"],
  },
  "Graphic Equalizer (20 Bands)": {
    category: "Audio / EQ",
    keywords: ["eq", "equalizer", "equalização"],
  },
  "Reverb": {
    category: "Audio / Reverb",
    keywords: ["reverb", "room", "space", "reverberação", "ambiente"],
  },
  "Studio Reverb": {
    category: "Audio / Reverb",
    keywords: ["reverb", "room", "reverberação"],
  },
  "Dynamics": {
    category: "Audio / Dynamics",
    keywords: ["compressor", "gate", "limiter", "compressão", "dinâmica"],
  },
  "Multiband Compressor": {
    category: "Audio / Dynamics",
    keywords: ["compressor", "compressão"],
  },
  "DeNoise": {
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "denoise", "hiss", "redução de ruído"],
  },
  "Noise Reduction / Restoration": {
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "restoration", "redução de ruído"],
  },
  "Delay": {
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso", "eco"],
  },
  "Analog Delay": {
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso"],
  },
};

module.exports = { EFFECTS_METADATA };
