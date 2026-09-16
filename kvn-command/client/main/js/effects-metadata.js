window.KVN = window.KVN || {};

/**
 * effects-metadata.js
 *
 * Curated overlay of aliases/keywords/category for Premiere's own stock
 * effects. This is NOT the source of truth for which effects exist —
 * premiere-bridge.js's listHostEffects() is. This file only enriches
 * whatever the host reports so search feels smart (typos, PT-BR terms,
 * "zoom" -> Transform, etc.).
 *
 * Each entry is matched against the host's real (and possibly localized
 * — Premiere returns effect names in whatever language it's running in)
 * displayName via its `names` list, not a single object key — see
 * effects-catalog.js's buildMetadataIndex(). Anything the host reports
 * that isn't in this table still works; it just falls back to plain
 * fuzzy-matching its own name with no extra keywords/category (this is
 * what keeps third-party plugin effects usable without inventing
 * anything about them).
 *
 * `names` entries with only one language are effects whose Portuguese
 * name hasn't been confirmed against a live host yet — English is kept
 * so the entry still matches on an English-language Premiere, and PT-BR
 * search still works via the host's own (translated) display name
 * directly, just without these extra keyword synonyms attached. Confirm
 * and add the PT-BR name here when known.
 *
 * category is a purely cosmetic grouping for search results — it does
 * NOT come from the host (there is no API for Premiere's own Effects
 * panel categories) and is best-effort based on Premiere's documented
 * effect list.
 */

window.KVN.EffectsMetadata = [
  // ---------- Blur & Sharpen ----------
  {
    names: ["Gaussian Blur", "Desfoque Gaussiano"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "soft", "smooth", "fuzzy", "out of focus",
      "desfoque", "desfoque gaussiano", "borrão", "borrado", "borrar", "embaçado",
      "embaçar", "embasado", "difuminado", "difuso", "nebuloso", "fora de foco", "gaussiano",
    ],
  },
  {
    names: ["Gaussian Blur (Legacy)"],
    category: "Blur & Sharpen",
    keywords: ["blur", "legacy", "desfoque", "desfoque gaussiano", "embaçado", "antigo", "legado"],
  },
  {
    names: ["Directional Blur"],
    category: "Blur & Sharpen",
    keywords: ["blur", "motion", "direction", "speed", "desfoque direcional", "desfoque de movimento", "embaçado", "borrado"],
  },
  {
    names: ["Camera Blur"],
    category: "Blur & Sharpen",
    keywords: ["blur", "focus", "camera", "desfoque de câmera", "fora de foco", "embaçado", "desfocar"],
  },
  {
    names: ["Sharpen"],
    category: "Blur & Sharpen",
    keywords: ["sharp", "detail", "focus", "crisp", "nitidez", "afiar", "nítido", "focar", "realçar detalhes"],
  },
  {
    names: ["Unsharp Mask"],
    category: "Blur & Sharpen",
    keywords: ["sharp", "detail", "nitidez", "máscara de nitidez", "afiar", "realçar"],
  },

  // ---------- Color Correction / Grading ----------
  {
    names: ["Lumetri Color"],
    category: "Color Correction",
    keywords: [
      "color", "grade", "grading", "lut", "look",
      "cor", "correção de cor", "gradação de cor", "colorização",
      "tratamento de cor", "colorir",
    ],
  },
  {
    names: ["Fast Color Corrector"],
    category: "Color Correction",
    keywords: ["color", "correction", "cor", "correção rápida", "corrigir cor"],
  },
  {
    names: ["Brightness & Contrast"],
    category: "Color Correction",
    keywords: ["brightness", "contrast", "brilho", "contraste", "claridade", "escurecer", "clarear"],
  },
  {
    names: ["RGB Curves"],
    category: "Color Correction",
    keywords: ["color", "curves", "cor", "curvas", "curva de cor"],
  },
  {
    names: ["Color Balance"],
    category: "Color Correction",
    keywords: ["color", "balance", "cor", "balanço de cor", "equilíbrio de cor"],
  },

  // ---------- Distort / Transform ----------
  {
    names: ["Transform"],
    category: "Distort / Transform",
    keywords: [
      "zoom", "scale", "rotate", "position", "resize", "move",
      "escala", "posição", "girar", "aumentar", "diminuir",
      "redimensionar", "mover", "rotação", "ampliar",
    ],
  },
  {
    names: ["Basic 3D", "3D básico"],
    category: "Distort / Transform",
    keywords: ["3d", "rotate", "tilt", "swivel", "girar em 3d", "inclinar"],
  },
  {
    names: ["Crop"],
    category: "Distort / Transform",
    keywords: ["crop", "cortar", "corte", "recortar", "aparar", "recorte"],
  },
  {
    names: ["Distort"],
    category: "Distort / Transform",
    keywords: ["distort", "warp", "distorcer", "distorção", "deformar"],
  },
  {
    names: ["Mirror", "Espelho"],
    category: "Distort / Transform",
    keywords: ["mirror", "reflect", "flip", "espelho", "espelhar", "espelhado", "inverter", "refletir"],
  },
  {
    names: ["Horizontal Flip", "Inversão horizontal"],
    category: "Distort / Transform",
    keywords: ["flip", "mirror", "inverter", "espelhar", "virar"],
  },
  {
    names: ["Warp Stabilizer"],
    category: "Distort / Transform",
    keywords: [
      "stabilize", "shake", "shaky",
      "estabilizar", "estabilização", "tremido", "tremendo",
      "balançando", "câmera tremida", "firmar imagem",
    ],
  },
  {
    names: ["Camera Shake", "Balanço de câmera"],
    category: "Distort / Transform",
    keywords: ["shake", "camera", "tremido", "balanço", "tremer"],
  },
  {
    names: ["Move", "Mover"],
    category: "Distort / Transform",
    keywords: ["move", "position", "mover", "posição", "deslocar"],
  },
  {
    names: ["Offset", "Deslocamento"],
    category: "Distort / Transform",
    keywords: ["offset", "shift", "deslocamento", "deslocar"],
  },
  {
    names: ["Grow", "Aumentar"],
    category: "Distort / Transform",
    keywords: ["grow", "expand", "aumentar", "expandir"],
  },
  {
    names: ["Shrink", "Encolher"],
    category: "Distort / Transform",
    keywords: ["shrink", "reduce", "encolher", "reduzir", "diminuir"],
  },
  {
    names: ["Rotate", "Girar"],
    category: "Distort / Transform",
    keywords: ["rotate", "spin", "girar", "rotação", "rodar"],
  },
  {
    names: ["Auto Reframe", "Reestruturação automática"],
    category: "Distort / Transform",
    keywords: ["reframe", "crop", "aspect ratio", "reenquadrar", "proporção", "formato"],
  },
  {
    names: ["Auto Align", "Alinhamento automático"],
    category: "Distort / Transform",
    keywords: ["align", "sync", "alinhar", "sincronizar"],
  },

  // ---------- Stylize / Generate ----------
  {
    names: ["Echo", "Eco"],
    category: "Time / Stylize",
    keywords: ["echo", "trail", "ghost", "eco", "rastro", "fantasma", "repetição"],
  },
  {
    names: ["Posterize"],
    category: "Stylize",
    keywords: ["posterize", "posterizar", "reduzir cores"],
  },
  {
    names: ["Posterize Time", "Posterizar tempo"],
    category: "Time / Stylize",
    keywords: ["posterize", "frame rate", "posterizar", "taxa de quadros", "travado"],
  },
  {
    names: ["Glow", "Resplendor"],
    category: "Stylize",
    keywords: ["glow", "shine", "brilho", "resplendor", "brilhante", "luminoso"],
  },
  {
    names: ["Edge Glow", "Brilho de aresta"],
    category: "Stylize",
    keywords: ["glow", "edge", "brilho", "aresta", "borda"],
  },
  {
    names: ["Wonder Glow", "Brilho maravilhoso"],
    category: "Stylize",
    keywords: ["glow", "dreamy", "brilho", "sonhador", "etéreo"],
  },
  {
    names: ["Light Leaks", "Vazamentos de luz"],
    category: "Stylize",
    keywords: ["light leak", "flare", "vazamento de luz", "luz vazando", "vintage"],
  },
  {
    names: ["Volumetric Rays", "Raios volumétricos"],
    category: "Stylize",
    keywords: ["god rays", "light rays", "raios de luz", "raios volumétricos", "raios de sol"],
  },
  {
    names: ["RGB Split", "Divisão de RGB"],
    category: "Stylize",
    keywords: ["rgb split", "chromatic aberration", "glitch", "divisão de cor", "aberração cromática"],
  },
  {
    names: ["Drop Shadow", "Sombra projetada"],
    category: "Stylize",
    keywords: ["shadow", "drop shadow", "sombra", "sombra projetada"],
  },
  {
    names: ["Long Shadow", "Sombra longa"],
    category: "Stylize",
    keywords: ["shadow", "long shadow", "sombra longa", "sombra comprida"],
  },
  {
    names: ["Brush Strokes", "Traçados de pincel"],
    category: "Stylize",
    keywords: ["paint", "brush", "pintura", "pincel", "traços"],
  },
  {
    names: ["Color Emboss", "Entalhe de cor"],
    category: "Stylize",
    keywords: ["emboss", "relief", "entalhe", "relevo"],
  },
  {
    names: ["Find Edges", "Localizar bordas"],
    category: "Stylize",
    keywords: ["edges", "outline", "bordas", "contorno", "desenho"],
  },
  {
    names: ["Mosaic", "Mosaico"],
    category: "Stylize",
    keywords: ["mosaic", "pixelate", "mosaico", "pixelizar", "pixelado"],
  },
  {
    names: ["Roughen Edges", "Tornar bordas ásperas"],
    category: "Stylize",
    keywords: ["rough edges", "torn", "bordas ásperas", "rasgado", "irregular"],
  },
  {
    names: ["Strobe Light", "Luz estroboscópica"],
    category: "Stylize",
    keywords: ["strobe", "flash", "flicker", "estroboscópica", "piscar"],
  },
  {
    names: ["Noise", "Ruído"],
    category: "Noise & Grain",
    keywords: ["noise", "grain", "texture", "static", "ruído", "granulado", "grão", "textura", "chiado visual"],
  },
  {
    names: ["Noise Alpha"],
    category: "Noise & Grain",
    keywords: ["noise", "alpha", "ruído"],
  },
  {
    names: ["Median"],
    category: "Noise & Grain",
    keywords: ["denoise", "median", "smooth", "reduzir ruído", "suavizar", "limpar imagem"],
  },

  // ---------- Keying ----------
  {
    names: ["Ultra Key"],
    category: "Keying",
    keywords: [
      "key", "chroma", "green screen", "chroma key",
      "croma", "chave verde", "fundo verde", "remover fundo",
      "tela verde", "recortar fundo",
    ],
  },
  {
    names: ["Track Matte Key"],
    category: "Keying",
    keywords: ["matte", "key", "máscara", "máscara de rastreamento"],
  },

  // ---------- Utility / Generate ----------
  {
    names: ["Cineon Converter", "Conversor Cineon"],
    category: "Utility",
    keywords: ["cineon", "log", "conversor"],
  },
  {
    names: ["Clone"],
    category: "Utility",
    keywords: ["clone", "duplicate", "clonar", "duplicar"],
  },
  {
    names: ["Simple Text", "Texto simples"],
    category: "Generate",
    keywords: ["text", "title", "texto", "título", "legenda"],
  },
  {
    names: ["Stroke", "Traçado"],
    category: "Generate",
    keywords: ["stroke", "outline", "traçado", "contorno", "borda"],
  },

  // ---------- Audio: EQ / Filter ----------
  {
    names: ["Parametric Equalizer"],
    category: "Audio / EQ",
    keywords: ["eq", "equalizer", "equalização", "equalizar"],
  },
  {
    names: ["Graphic Equalizer (20 Bands)", "Graphic Equalizer"],
    category: "Audio / EQ",
    keywords: ["eq", "equalizer", "equalização", "equalizar"],
  },
  {
    names: ["FFT Filter"],
    category: "Audio / EQ",
    keywords: ["filter", "fft", "filtro"],
  },
  {
    names: ["Notch Filter"],
    category: "Audio / EQ",
    keywords: ["notch", "filter", "filtro entalhe"],
  },
  {
    names: ["Treble"],
    category: "Audio / EQ",
    keywords: ["treble", "high", "agudo", "agudos"],
  },
  {
    names: ["Bass"],
    category: "Audio / EQ",
    keywords: ["bass", "low", "grave", "graves"],
  },
  {
    names: ["Highpass"],
    category: "Audio / EQ",
    keywords: ["high pass", "filter", "passa-alta"],
  },
  {
    names: ["Lowpass"],
    category: "Audio / EQ",
    keywords: ["low pass", "filter", "passa-baixa"],
  },

  // ---------- Audio: Reverb / Delay ----------
  {
    names: ["Reverb"],
    category: "Audio / Reverb",
    keywords: ["reverb", "room", "space", "reverberação", "ambiente", "eco de sala", "sala"],
  },
  {
    names: ["Studio Reverb"],
    category: "Audio / Reverb",
    keywords: ["reverb", "room", "reverberação", "ambiente", "sala"],
  },
  {
    names: ["Convolution Reverb"],
    category: "Audio / Reverb",
    keywords: ["reverb", "convolution", "reverberação", "convolução"],
  },
  {
    names: ["Delay"],
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso", "eco", "repetição"],
  },
  {
    names: ["Analog Delay"],
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso", "eco"],
  },
  {
    names: ["Multitap Delay"],
    category: "Audio / Delay",
    keywords: ["delay", "echo", "atraso", "eco", "múltiplo"],
  },

  // ---------- Audio: Dynamics ----------
  {
    names: ["Dynamics"],
    category: "Audio / Dynamics",
    keywords: ["compressor", "gate", "limiter", "compressão", "dinâmica"],
  },
  {
    names: ["Multiband Compressor"],
    category: "Audio / Dynamics",
    keywords: ["compressor", "compressão", "compressor de áudio"],
  },
  {
    names: ["Hard Limiter"],
    category: "Audio / Dynamics",
    keywords: ["limiter", "limitador"],
  },
  {
    names: ["Single-Band Compressor"],
    category: "Audio / Dynamics",
    keywords: ["compressor", "compressão"],
  },
  {
    names: ["Amplify"],
    category: "Audio / Dynamics",
    keywords: ["amplify", "gain", "volume", "amplificar", "ganho"],
  },

  // ---------- Audio: Modulation ----------
  {
    names: ["Chorus"],
    category: "Audio / Modulation",
    keywords: ["chorus", "coro", "modulação"],
  },
  {
    names: ["Flanger"],
    category: "Audio / Modulation",
    keywords: ["flanger", "modulação"],
  },
  {
    names: ["Phaser"],
    category: "Audio / Modulation",
    keywords: ["phaser", "modulação"],
  },
  {
    names: ["Tremolo"],
    category: "Audio / Modulation",
    keywords: ["tremolo", "modulação"],
  },

  // ---------- Audio: Noise Reduction / Restoration ----------
  {
    names: ["DeNoise"],
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "denoise", "hiss", "redução de ruído", "remover ruído", "limpar áudio", "chiado"],
  },
  {
    names: ["DeHummer"],
    category: "Audio / Noise Reduction",
    keywords: ["hum", "buzz", "zumbido", "ronco"],
  },
  {
    names: ["Noise Reduction / Restoration", "Noise Reduction"],
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "restoration", "redução de ruído", "remover ruído", "restauração", "limpar áudio"],
  },
  {
    names: ["Adaptive Noise Reduction"],
    category: "Audio / Noise Reduction",
    keywords: ["noise reduction", "adaptive", "redução de ruído", "adaptativo"],
  },
];
