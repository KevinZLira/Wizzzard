window.KVN = window.KVN || {};

/**
 * effects-metadata.js
 *
 * Curated overlay of aliases/keywords/category for Premiere's own stock
 * effects. This is NOT the source of truth for which effects exist —
 * premiere-bridge.js's listHostEffects() is. This file only enriches
 * whatever the host reports so search feels smart (typos, PT-BR terms,
 * colloquial editor slang, "zoom" -> Transform, etc.). Every entry keeps
 * at least ~10 keyword variations (formal + informal PT-BR, English,
 * common misspellings) so searching in whatever words come to mind
 * actually finds something.
 *
 * Each entry is matched against the host's real (and possibly localized
 * — Premiere returns effect names in whatever language it's running in)
 * displayName via its `names` list, not a single object key — see
 * effects-catalog.js's getMetadataIndex(). Anything the host reports
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
      "blur", "soft", "smooth", "fuzzy", "out of focus", "hazy", "gaussian",
      "desfoque", "desfoque gaussiano", "borrão", "borrado", "borrar",
      "embaçado", "embaçar", "embasado", "difuminado", "difuso", "nebuloso",
      "fora de foco", "gaussiano", "borrar tudo", "esfumaçar",
    ],
  },
  {
    names: ["Gaussian Blur (Legacy)", "Desfoque Gaussiano (herdado)"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "legacy", "old", "classic", "gaussian",
      "desfoque", "desfoque gaussiano", "desfoque antigo", "embaçado",
      "antigo", "legado", "clássico", "borrado", "versão antiga",
    ],
  },
  {
    names: ["Directional Blur", "Desfoque direcional"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "motion", "direction", "speed", "streak", "motion blur",
      "desfoque direcional", "desfoque de movimento", "embaçado", "borrado",
      "rastro de movimento", "borrão de velocidade", "efeito de velocidade",
      "movimento rápido",
    ],
  },
  {
    names: ["Camera Blur", "Desfoque da câmera"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "focus", "camera", "defocus", "rack focus",
      "desfoque de câmera", "fora de foco", "embaçado", "desfocar",
      "perder o foco", "foco da câmera", "desfoco de lente", "sem foco",
    ],
  },
  {
    names: ["Sharpen", "Nitidez"],
    category: "Blur & Sharpen",
    keywords: [
      "sharp", "detail", "focus", "crisp", "clarity", "enhance",
      "nitidez", "afiar", "nítido", "focar", "realçar detalhes",
      "deixar nítido", "aumentar nitidez", "melhorar definição", "definição",
    ],
  },
  {
    names: ["Unsharp Mask", "Máscara de nitidez"],
    category: "Blur & Sharpen",
    keywords: [
      "sharp", "detail", "mask", "clarity", "definition",
      "nitidez", "máscara de nitidez", "afiar", "realçar",
      "aumentar nitidez", "realce de detalhes", "máscara de foco", "clareza",
    ],
  },

  // ---------- Color Correction / Grading ----------
  {
    names: ["Lumetri Color", "Cor de Lumetri"],
    category: "Color Correction",
    keywords: [
      "color", "grade", "grading", "lut", "look", "tone", "color wheel",
      "cor", "correção de cor", "gradação de cor", "colorização",
      "tratamento de cor", "colorir", "cinema look", "cor cinematográfica",
      "ajustar cores", "paleta de cores",
    ],
  },
  {
    names: ["Fast Color Corrector"],
    category: "Color Correction",
    keywords: [
      "color", "correction", "hue", "saturation", "quick color",
      "cor", "correção rápida", "corrigir cor", "correção de cor rápida",
      "ajustar cor rápido", "matiz", "saturação",
    ],
  },
  {
    names: ["Brightness & Contrast"],
    category: "Color Correction",
    keywords: [
      "brightness", "contrast", "light", "dark", "exposure",
      "brilho", "contraste", "claridade", "escurecer", "clarear",
      "iluminar", "deixar mais claro", "deixar mais escuro", "luminosidade",
    ],
  },
  {
    names: ["RGB Curves"],
    category: "Color Correction",
    keywords: [
      "color", "curves", "tone curve", "levels", "channels",
      "cor", "curvas", "curva de cor", "curva de tom", "canais rgb",
      "ajuste de curva", "níveis de cor", "curva",
    ],
  },
  {
    names: ["Color Balance"],
    category: "Color Correction",
    keywords: [
      "color", "balance", "white balance", "tint", "cast",
      "cor", "balanço de cor", "equilíbrio de cor", "balanço de branco",
      "tonalidade", "corrigir tonalidade", "matiz de cor",
    ],
  },

  // ---------- Distort / Transform ----------
  {
    names: ["Transform", "Transformar"],
    category: "Distort / Transform",
    keywords: [
      "zoom", "scale", "rotate", "position", "resize", "move", "skew", "anchor point",
      "escala", "posição", "girar", "aumentar", "diminuir",
      "redimensionar", "mover", "rotação", "ampliar", "reduzir tamanho",
    ],
  },
  {
    names: ["Basic 3D", "3D básico"],
    category: "Distort / Transform",
    keywords: [
      "3d", "rotate", "tilt", "swivel", "depth", "perspective 3d",
      "girar em 3d", "inclinar", "efeito 3d", "profundidade",
      "rotação 3d", "perspectiva",
    ],
  },
  {
    // Confirmed via a live PT-BR host's raw effect list (Settings > Export
    // raw names): "Recorte arredondado" is this effect's real displayName.
    names: ["Rounded Corners", "Recorte arredondado"],
    category: "Distort / Transform",
    keywords: [
      "rounded corners", "rounded", "round corners", "corner radius", "rounded rectangle",
      "cortes arredondados", "cantos arredondados", "arredondar cantos",
      "bordas arredondadas", "arredondado", "arredondada", "cantos redondos",
      "recorte redondo", "quadro arredondado",
    ],
  },
  {
    names: ["Crop", "Cortar"],
    category: "Distort / Transform",
    keywords: [
      "crop", "trim edges", "cut frame", "border", "edge crop",
      "cortar", "corte", "recortar", "aparar", "recorte",
      "cortar bordas", "aparar imagem", "cortar tela",
    ],
  },
  {
    names: ["Distort"],
    category: "Distort / Transform",
    keywords: [
      "distort", "warp", "bend", "twist", "deform",
      "distorcer", "distorção", "deformar", "torcer", "dobrar imagem",
      "empenar", "efeito de distorção",
    ],
  },
  {
    names: ["Mirror", "Espelho"],
    category: "Distort / Transform",
    keywords: [
      "mirror", "reflect", "flip", "duplicate side", "symmetry",
      "espelho", "espelhar", "espelhado", "inverter", "refletir",
      "simetria", "efeito espelho", "duplicar lado",
    ],
  },
  {
    names: ["Horizontal Flip", "Inversão horizontal"],
    category: "Distort / Transform",
    keywords: [
      "flip", "mirror", "horizontal", "invert",
      "inverter", "espelhar", "virar", "virar horizontal",
      "espelhar horizontal", "girar horizontalmente", "inverter imagem",
    ],
  },
  {
    names: ["Warp Stabilizer", "Estabilizador de distorção"],
    category: "Distort / Transform",
    keywords: [
      "stabilize", "shake", "shaky", "steady", "smooth motion", "gimbal",
      "estabilizar", "estabilização", "tremido", "tremendo",
      "balançando", "câmera tremida", "firmar imagem", "corrigir tremida",
    ],
  },
  {
    names: ["Camera Shake", "Tremulação de câmera", "Balanço de câmera"],
    category: "Distort / Transform",
    keywords: [
      "shake", "camera", "wobble", "vibrate", "handheld look",
      "tremido", "balanço", "tremer", "tremida de câmera",
      "câmera na mão", "efeito de tremido", "vibração",
    ],
  },
  {
    names: ["Move", "Mover"],
    category: "Distort / Transform",
    keywords: [
      "move", "position", "drag", "shift position", "reposition",
      "mover", "posição", "deslocar", "mudar posição", "arrastar",
      "movimentar", "reposicionar",
    ],
  },
  {
    names: ["Offset", "Deslocamento"],
    category: "Distort / Transform",
    keywords: [
      "offset", "shift", "displace", "wrap around",
      "deslocamento", "deslocar", "deslocar imagem", "mover pixel",
      "compensar posição", "deslocamento de tela",
    ],
  },
  {
    names: ["Grow", "Aumentar"],
    category: "Distort / Transform",
    keywords: [
      "grow", "expand", "enlarge", "bigger",
      "aumentar", "expandir", "crescer", "ampliar", "deixar maior",
      "engordar imagem", "expandir borda",
    ],
  },
  {
    names: ["Shrink", "Encolher"],
    category: "Distort / Transform",
    keywords: [
      "shrink", "reduce", "smaller", "contract",
      "encolher", "reduzir", "diminuir", "deixar menor", "contrair",
      "afinar imagem", "reduzir borda",
    ],
  },
  {
    names: ["Rotate", "Giro", "Girar"],
    category: "Distort / Transform",
    keywords: [
      "rotate", "spin", "turn", "revolve",
      "girar", "rotação", "rodar", "virar", "girar imagem",
      "rotacionar", "girar clipe",
    ],
  },
  {
    names: ["Auto Reframe", "Reestruturação automática"],
    category: "Distort / Transform",
    keywords: [
      "reframe", "crop", "aspect ratio", "vertical video", "resize for social",
      "reenquadrar", "proporção", "formato", "vídeo vertical",
      "adaptar formato", "cortar automático", "9:16",
    ],
  },
  {
    names: ["Auto Align", "Alinhamento automático"],
    category: "Distort / Transform",
    keywords: [
      "align", "sync", "match position", "auto sync",
      "alinhar", "sincronizar", "alinhamento", "sincronização automática",
      "alinhar clipes", "sincronizar ângulos",
    ],
  },

  // ---------- Stylize / Generate ----------
  {
    names: ["Echo", "Eco"],
    category: "Time / Stylize",
    keywords: [
      "echo", "trail", "ghost", "repeat", "motion trail", "smear",
      "eco", "rastro", "fantasma", "repetição", "efeito fantasma",
      "rastro de movimento", "sobreposição de quadros",
    ],
  },
  {
    names: ["Posterize", "Posterizar"],
    category: "Stylize",
    keywords: [
      "posterize", "flatten colors", "poster effect", "banding",
      "posterizar", "reduzir cores", "efeito pôster", "cores chapadas",
      "achatar cor", "simplificar cores",
    ],
  },
  {
    names: ["Posterize Time", "Posterizar tempo"],
    category: "Time / Stylize",
    keywords: [
      "posterize", "frame rate", "choppy", "stutter", "stop motion look",
      "posterizar", "taxa de quadros", "travado", "efeito stop motion",
      "cortar quadros", "quadros travados",
    ],
  },
  {
    names: ["Glow", "Brilho", "Resplendor"],
    category: "Stylize",
    keywords: [
      "glow", "shine", "bloom", "halo", "radiance",
      "brilho", "resplendor", "brilhante", "luminoso", "efeito de brilho",
      "auréola", "halo de luz",
    ],
  },
  {
    names: ["Edge Glow", "Brilho de borda", "Brilho de aresta"],
    category: "Stylize",
    keywords: [
      "glow", "edge", "outline glow", "rim light effect",
      "brilho", "aresta", "borda", "brilho de contorno",
      "contorno luminoso", "brilho nas bordas",
    ],
  },
  {
    names: ["Wonder Glow", "Brilho mágico", "Brilho maravilhoso"],
    category: "Stylize",
    keywords: [
      "glow", "dreamy", "soft glow", "ethereal", "magical look",
      "brilho", "sonhador", "etéreo", "brilho suave", "efeito mágico",
      "brilho sonhador",
    ],
  },
  {
    names: ["Light Leaks", "Vazamentos de luz"],
    category: "Stylize",
    keywords: [
      "light leak", "flare", "film look", "sun flare", "vintage light",
      "vazamento de luz", "luz vazando", "vintage", "efeito retrô",
      "luz de filme antigo", "brilho retrô",
    ],
  },
  {
    names: ["Volumetric Rays", "Raios volumétricos"],
    category: "Stylize",
    keywords: [
      "god rays", "light rays", "sun rays", "crepuscular rays", "beams",
      "raios de luz", "raios volumétricos", "raios de sol",
      "raios divinos", "feixes de luz",
    ],
  },
  {
    names: ["RGB Split", "Divisão de RGB"],
    category: "Stylize",
    keywords: [
      "rgb split", "chromatic aberration", "glitch", "color shift", "vhs glitch",
      "divisão de cor", "aberração cromática", "efeito glitch",
      "deslocamento de cor", "efeito vhs",
    ],
  },
  {
    names: ["Drop Shadow", "Sombra projetada"],
    category: "Stylize",
    keywords: [
      "shadow", "drop shadow", "cast shadow", "depth shadow",
      "sombra", "sombra projetada", "sombra atrás", "adicionar sombra",
      "efeito de profundidade", "sombra de texto",
    ],
  },
  {
    names: ["Long Shadow", "Sombra longa"],
    category: "Stylize",
    keywords: [
      "shadow", "long shadow", "flat design shadow", "stretched shadow",
      "sombra", "sombra longa", "sombra comprida", "sombra esticada",
      "sombra estilizada", "efeito de sombra longa", "sombra diagonal",
    ],
  },
  {
    names: ["Brush Strokes", "Traçados de pincel"],
    category: "Stylize",
    keywords: [
      "paint", "brush", "painterly", "artistic filter", "watercolor look",
      "pintura", "pincel", "traços", "efeito de pintura",
      "aquarela", "estilo pintado",
    ],
  },
  {
    names: ["Color Emboss", "Entalhe de cor"],
    category: "Stylize",
    keywords: [
      "emboss", "relief", "3d texture", "engraved look",
      "entalhe", "relevo", "efeito de relevo", "gravado",
      "textura em relevo", "efeito 3d de superfície",
    ],
  },
  {
    names: ["Find Edges", "Localizar bordas"],
    category: "Stylize",
    keywords: [
      "edges", "outline", "sketch effect", "line art", "cartoon edges",
      "bordas", "contorno", "desenho", "efeito desenho",
      "contornos da imagem", "estilo cartoon",
    ],
  },
  {
    names: ["Mosaic", "Mosaico"],
    category: "Stylize",
    keywords: [
      "mosaic", "pixelate", "censor", "blur face", "pixel blocks",
      "mosaico", "pixelizar", "pixelado", "censurar rosto",
      "esconder rosto", "efeito pixelado",
    ],
  },
  {
    names: ["Roughen Edges", "Tornar bordas ásperas"],
    category: "Stylize",
    keywords: [
      "rough edges", "torn", "grunge edge", "distressed border",
      "bordas ásperas", "rasgado", "irregular", "borda rasgada",
      "efeito envelhecido", "borda irregular",
    ],
  },
  {
    names: ["Strobe Light", "Luz estroboscópica"],
    category: "Stylize",
    keywords: [
      "strobe", "flash", "flicker", "blink effect", "party light",
      "estroboscópica", "piscar", "efeito flash", "luz piscando",
      "estrobo", "piscada de luz",
    ],
  },
  {
    names: ["Noise", "Ruído"],
    category: "Noise & Grain",
    keywords: [
      "noise", "grain", "texture", "static", "film grain", "vhs noise",
      "ruído", "granulado", "grão", "textura", "chiado visual",
      "efeito vhs", "textura de filme", "chuvisco",
    ],
  },
  {
    names: ["Noise Alpha"],
    category: "Noise & Grain",
    keywords: [
      "noise", "alpha", "transparency noise", "grain alpha", "grain",
      "ruído", "ruído no alfa", "textura transparente",
      "granulado transparente", "textura", "grão no canal alfa",
    ],
  },
  {
    names: ["Median"],
    category: "Noise & Grain",
    keywords: [
      "denoise", "median", "smooth", "painterly blur", "reduce grain",
      "reduzir ruído", "suavizar", "limpar imagem", "suavizar textura",
      "amenizar granulado", "filtro de mediana",
    ],
  },

  // ---------- Keying ----------
  {
    names: ["Ultra Key"],
    category: "Keying",
    keywords: [
      "key", "chroma", "green screen", "chroma key", "blue screen",
      "croma", "chave verde", "fundo verde", "remover fundo",
      "tela verde", "recortar fundo", "trocar fundo", "fundo azul",
    ],
  },
  {
    names: ["Track Matte Key"],
    category: "Keying",
    keywords: [
      "matte", "key", "luma matte", "mask track", "alpha matte",
      "máscara", "máscara de rastreamento", "máscara de vídeo",
      "chave de máscara", "recorte com máscara",
    ],
  },

  // ---------- Utility / Generate ----------
  {
    names: ["Cineon Converter", "Conversor de Cineon", "Conversor Cineon"],
    category: "Utility",
    keywords: [
      "cineon", "log", "log footage", "convert log", "10-bit log", "dpx",
      "conversor", "converter log", "conversão cineon",
      "arquivo log", "converter imagem log", "converter formato",
    ],
  },
  {
    names: ["Clone"],
    category: "Utility",
    keywords: [
      "clone", "duplicate", "copy stamp", "clone stamp",
      "clonar", "duplicar", "efeito clone", "copiar área",
      "carimbo clone", "duplicação",
    ],
  },
  {
    names: ["Simple Text", "Texto simples"],
    category: "Generate",
    keywords: [
      "text", "title", "caption", "add text", "basic text",
      "texto", "título", "legenda", "adicionar texto",
      "texto simples", "inserir título",
    ],
  },
  {
    names: ["Stroke", "Traçado"],
    category: "Generate",
    keywords: [
      "stroke", "outline", "border line", "edge line",
      "traçado", "contorno", "borda", "linha de contorno",
      "adicionar borda", "delinear",
    ],
  },

  // ---------- Audio: EQ / Filter ----------
  {
    names: ["Parametric Equalizer"],
    category: "Audio / EQ",
    keywords: [
      "eq", "equalizer", "frequency", "tone shaping", "audio eq",
      "equalização", "equalizar", "equalizador", "ajustar frequência",
      "equalizador de áudio",
    ],
  },
  {
    names: ["Graphic Equalizer (20 Bands)", "Graphic Equalizer"],
    category: "Audio / EQ",
    keywords: [
      "eq", "equalizer", "bands", "graphic eq", "frequency bands",
      "equalização", "equalizar", "equalizador gráfico",
      "bandas de frequência", "equalizador de bandas",
    ],
  },
  {
    names: ["FFT Filter"],
    category: "Audio / EQ",
    keywords: [
      "filter", "fft", "spectral filter", "frequency filter", "eq",
      "filtro", "filtro espectral", "filtro de frequência",
      "análise de frequência", "equalizar", "filtro avançado",
    ],
  },
  {
    names: ["Notch Filter"],
    category: "Audio / EQ",
    keywords: [
      "notch", "filter", "remove frequency", "hum removal filter", "eq",
      "filtro entalhe", "remover frequência", "filtro notch",
      "cortar frequência específica", "equalizar", "remover zumbido",
    ],
  },
  {
    names: ["Treble"],
    category: "Audio / EQ",
    keywords: [
      "treble", "high", "highs", "brightness audio", "eq",
      "agudo", "agudos", "som agudo", "realçar agudos",
      "frequência alta", "equalizar agudo",
    ],
  },
  {
    names: ["Bass"],
    category: "Audio / EQ",
    keywords: [
      "bass", "low", "lows", "sub bass", "warmth",
      "grave", "graves", "som grave", "realçar graves",
      "frequência baixa",
    ],
  },
  {
    names: ["Highpass"],
    category: "Audio / EQ",
    keywords: [
      "high pass", "filter", "cut lows", "remove rumble", "eq",
      "passa-alta", "filtro passa-alta", "cortar graves",
      "remover ruído grave", "equalizar", "cortar frequência baixa",
    ],
  },
  {
    names: ["Lowpass"],
    category: "Audio / EQ",
    keywords: [
      "low pass", "filter", "cut highs", "muffle", "eq",
      "passa-baixa", "filtro passa-baixa", "cortar agudos",
      "abafar som", "equalizar", "cortar frequência alta",
    ],
  },

  // ---------- Audio: Reverb / Delay ----------
  {
    names: ["Reverb"],
    category: "Audio / Reverb",
    keywords: [
      "reverb", "room", "space", "ambience", "hall",
      "reverberação", "ambiente", "eco de sala", "sala",
      "som de sala", "espaço acústico",
    ],
  },
  {
    names: ["Studio Reverb"],
    category: "Audio / Reverb",
    keywords: [
      "reverb", "room", "studio", "hall reverb", "space",
      "reverberação", "ambiente", "sala", "reverb de estúdio",
      "eco de estúdio", "espaço acústico",
    ],
  },
  {
    names: ["Convolution Reverb"],
    category: "Audio / Reverb",
    keywords: [
      "reverb", "convolution", "impulse response", "realistic reverb", "room",
      "reverberação", "convolução", "reverb realista",
      "resposta de impulso", "ambiente realista",
    ],
  },
  {
    names: ["Delay"],
    category: "Audio / Delay",
    keywords: [
      "delay", "echo", "repeat", "bounce sound", "reverb-like",
      "atraso", "eco", "repetição", "eco de áudio",
      "atraso de som", "efeito de eco",
    ],
  },
  {
    names: ["Analog Delay"],
    category: "Audio / Delay",
    keywords: [
      "delay", "echo", "analog", "warm echo", "tape delay",
      "atraso", "eco", "eco analógico", "atraso analógico",
      "eco quente",
    ],
  },
  {
    names: ["Multitap Delay"],
    category: "Audio / Delay",
    keywords: [
      "delay", "echo", "multiple echo", "rhythmic delay", "tap delay",
      "atraso", "eco", "múltiplo", "eco múltiplo",
      "atraso rítmico", "eco em camadas",
    ],
  },

  // ---------- Audio: Dynamics ----------
  {
    names: ["Dynamics"],
    category: "Audio / Dynamics",
    keywords: [
      "compressor", "gate", "limiter", "noise gate", "level control",
      "compressão", "dinâmica", "compressor de áudio",
      "controle de volume", "gate de ruído",
    ],
  },
  {
    names: ["Multiband Compressor"],
    category: "Audio / Dynamics",
    keywords: [
      "compressor", "multiband", "mastering compressor", "dynamics",
      "compressão", "compressor de áudio", "compressor multibanda",
      "compressão de faixas", "masterização", "dinâmica de áudio",
    ],
  },
  {
    names: ["Hard Limiter"],
    category: "Audio / Dynamics",
    keywords: [
      "limiter", "cap volume", "prevent clipping", "loudness limiter", "peak control",
      "limitador", "limitar volume", "evitar distorção",
      "controlar pico", "limitar áudio",
    ],
  },
  {
    names: ["Single-Band Compressor"],
    category: "Audio / Dynamics",
    keywords: [
      "compressor", "single band", "basic compressor", "dynamics", "level control",
      "compressão", "compressor simples", "compressor de áudio",
      "compressor básico", "controle de volume",
    ],
  },
  {
    names: ["Amplify"],
    category: "Audio / Dynamics",
    keywords: [
      "amplify", "gain", "volume", "boost volume", "increase level",
      "amplificar", "ganho", "aumentar volume", "subir volume",
      "aumentar áudio",
    ],
  },

  // ---------- Audio: Modulation ----------
  {
    names: ["Chorus"],
    category: "Audio / Modulation",
    keywords: [
      "chorus", "modulation", "thicken sound", "doubling effect", "widen",
      "coro", "modulação", "engrossar som", "efeito de coro",
      "duplicar voz", "alargar som",
    ],
  },
  {
    names: ["Flanger"],
    category: "Audio / Modulation",
    keywords: [
      "flanger", "modulation", "sweeping sound", "jet sound effect", "swoosh",
      "modulação", "efeito flanger", "som de avião",
      "efeito de varredura", "som espacial",
    ],
  },
  {
    names: ["Phaser"],
    category: "Audio / Modulation",
    keywords: [
      "phaser", "modulation", "swirling sound", "phase shift", "psychedelic",
      "modulação", "efeito phaser", "som giratório",
      "deslocamento de fase", "som psicodélico",
    ],
  },
  {
    names: ["Tremolo"],
    category: "Audio / Modulation",
    keywords: [
      "tremolo", "modulation", "volume wobble", "pulsing sound", "throb",
      "modulação", "efeito tremolo", "som pulsante",
      "vibração de volume", "som ondulante",
    ],
  },

  // ---------- Audio: Noise Reduction / Restoration ----------
  {
    names: ["DeNoise"],
    category: "Audio / Noise Reduction",
    keywords: [
      "noise reduction", "denoise", "hiss", "clean audio", "background noise",
      "redução de ruído", "remover ruído", "limpar áudio", "chiado",
      "ruído de fundo", "tirar chiado",
    ],
  },
  {
    names: ["DeHummer"],
    category: "Audio / Noise Reduction",
    keywords: [
      "hum", "buzz", "electrical noise", "60hz hum", "ground loop",
      "zumbido", "ronco", "remover zumbido", "ruído elétrico",
      "zumbido de fio", "ruído de tomada",
    ],
  },
  {
    names: ["Noise Reduction / Restoration", "Noise Reduction"],
    category: "Audio / Noise Reduction",
    keywords: [
      "noise reduction", "restoration", "clean audio", "remove hiss",
      "redução de ruído", "remover ruído", "restauração", "limpar áudio",
      "restaurar áudio", "tirar ruído",
    ],
  },
  {
    names: ["Adaptive Noise Reduction"],
    category: "Audio / Noise Reduction",
    keywords: [
      "noise reduction", "adaptive", "smart denoise", "automatic cleanup", "hiss",
      "redução de ruído", "adaptativo", "limpeza automática",
      "redução inteligente de ruído", "chiado",
    ],
  },
];
