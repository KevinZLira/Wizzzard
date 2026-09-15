window.KVN = window.KVN || {};

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

window.KVN.EffectsMetadata = {
  "Gaussian Blur": {
    category: "Blur & Sharpen",
    keywords: [
      "blur", "soft", "smooth", "fuzzy", "out of focus",
      "desfoque", "desfoque gaussiano", "borrão", "borrado", "embaçado",
      "embasado", "difuminado", "difuso", "nebuloso", "fora de foco", "gaussiano",
    ],
  },
  "Gaussian Blur (Legacy)": {
    category: "Blur & Sharpen",
    keywords: ["blur", "legacy", "desfoque", "desfoque gaussiano", "embaçado", "antigo"],
  },
  "Directional Blur": {
    category: "Blur & Sharpen",
    keywords: ["blur", "motion", "direction", "speed", "desfoque direcional", "desfoque de movimento", "embaçado", "borrado"],
  },
  "Camera Blur": {
    category: "Blur & Sharpen",
    keywords: ["blur", "focus", "camera", "desfoque de câmera", "fora de foco", "embaçado", "desfocar"],
  },
  "Sharpen": {
    category: "Blur & Sharpen",
    keywords: ["sharp", "detail", "focus", "crisp", "nitidez", "afiar", "nítido", "focar", "realçar detalhes"],
  },
  "Unsharp Mask": {
    category: "Blur & Sharpen",
    keywords: ["sharp", "detail", "nitidez", "máscara de nitidez", "afiar", "realçar"],
  },
  "Lumetri Color": {
    category: "Color Correction",
    keywords: [
      "color", "grade", "grading", "lut", "look",
      "cor", "correção de cor", "gradação de cor", "colorização",
      "tratamento de cor", "colorir",
    ],
  },
  "Fast Color Corrector": {
    category: "Color Correction",
    keywords: ["color", "correction", "cor", "correção rápida", "corrigir cor"],
  },
  "Brightness & Contrast": {
    category: "Color Correction",
    keywords: ["brightness", "contrast", "brilho", "contraste", "claridade", "escurecer", "clarear"],
  },
  "RGB Curves": {
    category: "Color Correction",
    keywords: ["color", "curves", "cor", "curvas", "curva de cor"],
  },
  "Color Balance": {
    category: "Color Correction",
    keywords: ["color", "balance", "cor", "balanço de cor", "equilíbrio de cor"],
  },
  "Transform": {
    category: "Distort / Transform",
    keywords: [
      "zoom", "scale", "rotate", "position", "resize", "move",
      "escala", "posição", "girar", "aumentar", "diminuir",
      "redimensionar", "mover", "rotação", "ampliar",
    ],
  },
  "Basic 3D": {
    category: "Distort / Transform",
    keywords: ["3d", "rotate", "tilt", "swivel", "girar em 3d", "inclinar"],
  },
  "Crop": {
    category: "Distort / Transform",
    keywords: ["crop", "cortar", "corte", "recortar", "aparar", "recorte"],
  },
  "Distort": {
    category: "Distort / Transform",
    keywords: ["distort", "warp", "distorcer", "distorção", "deformar"],
  },
  "Mirror": {
    category: "Distort / Transform",
    keywords: ["mirror", "reflect", "flip", "espelho", "espelhar", "espelhado", "inverter", "refletir"],
  },
  "Echo": {
    category: "Time / Stylize",
    keywords: ["echo", "trail", "ghost", "repeat", "eco", "rastro", "fantasma", "repetição"],
  },
  "Posterize": {
    category: "Stylize",
    keywords: ["posterize", "posterizar", "reduzir cores"],
  },
  "Noise": {
    category: "Noise & Grain",
    keywords: ["noise", "grain", "texture", "static", "ruído", "granulado", "grão", "textura", "chiado visual"],
  },
  "Noise Alpha": {
    category: "Noise & Grain",
    keywords: ["noise", "alpha", "ruído", "granulado"],
  },
  "Median": {
    category: "Noise & Grain",
    keywords: ["denoise", "median", "smooth", "reduzir ruído", "suavizar", "limpar imagem"],
  },
  "Ultra Key": {
    category: "Keying",
    keywords: [
      "key", "chroma", "green screen", "chroma key",
      "croma", "chave verde", "fundo verde", "remover fundo",
      "tela verde", "recortar fundo",
    ],
  },
  "Track Matte Key": {
    category: "Keying",
    keywords: ["matte", "key", "máscara", "máscara de rastreamento"],
  },
  "Warp Stabilizer": {
    category: "Distort / Transform",
    keywords: [
      "stabilize", "shake", "shaky",
      "estabilizar", "estabilização", "tremido", "tremendo",
      "balançando", "câmera tremida", "firmar imagem",
    ],
  },
  "Parametric Equalizer": {
    category: "Audio / EQ",
    keywords: ["eq", "equalizer", "equalização", "equalizar"],
  },
  "Graphic Equalizer (20 Bands)": {
    category: "Audio / EQ",
    keywords: ["eq", "equalizer", "equalização", "equalizar"],
  },
  "Reverb": {
    category: "Audio / Reverb",
    keywords: ["reverb", "room", "space", "reverberação", "ambiente", "eco de sala", "sala"],
  },
  "Studio Reverb": {
    category: "Audio / Reverb",
    keywords: ["reverb", "room", "reverberação", "ambiente", "sala"],
  },
  "Dynamics": {
    category: "Audio / Dynamics",
    keywords: ["compressor", "gate", "limiter", "compressão", "dinâmica", "compressor de áudio"],
  },
  "Multiband Compressor": {
    category: "Audio / Dynamics",
    keywords: ["compressor", "compressão", "compressor de áudio"],
  },
  "DeNoise": {
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "denoise", "hiss", "redução de ruído", "remover ruído", "limpar áudio", "chiado"],
  },
  "Noise Reduction / Restoration": {
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "restoration", "redução de ruído", "remover ruído", "restauração", "limpar áudio"],
  },
  "Delay": {
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso", "eco", "repetição"],
  },
  "Analog Delay": {
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso", "eco"],
  },
};

