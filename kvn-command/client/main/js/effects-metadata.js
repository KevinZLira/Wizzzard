window.KVN = window.KVN || {};

/**
 * effects-metadata.js
 *
 * Curated overlay of aliases/keywords/category for Premiere's own stock
 * effects. This is NOT the source of truth for which effects exist —
 * premiere-bridge.js's listHostEffects() is. This file only enriches
 * whatever the host reports so search feels smart (typos, PT-BR terms,
 * colloquial editor slang, "zoom" -> Transform, etc.). Every entry keeps
 * at least ~20 keyword variations (formal + informal PT-BR, English,
 * common misspellings, and "how would someone actually type this"
 * action phrases) so searching in whatever words come to mind actually
 * finds something.
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
 * and add the PT-BR name here when known (see Settings > "Export raw
 * names (debug)" for a real, host-verified name dump — several entries
 * below were filled in exactly this way, not guessed).
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
      "blur", "soft", "smooth", "fuzzy", "out of focus", "hazy", "gaussian", "blurry", "blur it out", "soften",
      "desfoque", "desfoque gaussiano", "borrão", "borrado", "borrar", "borrar tudo",
      "embaçado", "embaçar", "embasado", "difuminado", "difuso", "nebuloso",
      "fora de foco", "gaussiano", "esfumaçar", "esfumar", "gausiano", "gaussiana",
      "desfocar tudo", "deixar borrado", "desfocar imagem", "borrar fundo", "desfocar rosto",
      "suavizar imagem", "amaciar imagem", "gausian blur",
    ],
  },
  {
    names: ["Gaussian Blur (Legacy)", "Desfoque Gaussiano (herdado)"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "legacy", "old", "classic", "gaussian", "gaussian blur old", "deprecated blur", "old blur",
      "desfoque", "desfoque gaussiano", "desfoque antigo", "embaçado", "desfoque legado",
      "antigo", "legado", "clássico", "borrado", "versão antiga", "gausiano antigo",
      "desfoque velho", "desfoque original", "blur clássico", "desfoque de antes",
      "versão legada do desfoque", "gaussiano legado", "desfoque descontinuado",
    ],
  },
  {
    names: ["Directional Blur", "Desfoque direcional"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "motion", "direction", "speed", "streak", "motion blur", "directional", "speed blur",
      "desfoque direcional", "desfoque de movimento", "embaçado", "borrado", "desfoque de velocidade",
      "rastro de movimento", "borrão de velocidade", "efeito de velocidade", "movimento rápido",
      "borrão de corrida", "efeito correndo", "desfoque com direção", "linha de movimento", "speed lines",
      "desfoque em linha", "movimento borrado", "borrão direcional",
    ],
  },
  {
    names: ["Camera Blur", "Desfoque da câmera"],
    category: "Blur & Sharpen",
    keywords: [
      "blur", "focus", "camera", "defocus", "rack focus", "out of focus camera", "camera blur",
      "desfoque de câmera", "fora de foco", "embaçado", "desfocar", "desfoque da câmera",
      "perder o foco", "foco da câmera", "desfoco de lente", "sem foco", "câmera desfocada",
      "puxar foco", "mudar foco", "foco borrado", "câmera embaçada",
      "efeito de foco perdido", "focar e desfocar",
    ],
  },
  {
    names: ["Sharpen", "Nitidez"],
    category: "Blur & Sharpen",
    keywords: [
      "sharp", "detail", "focus", "crisp", "clarity", "enhance", "sharpness", "sharpen it", "sharpen image",
      "nitidez", "afiar", "nítido", "focar", "realçar detalhes", "deixar nítido",
      "aumentar nitidez", "melhorar definição", "definição", "clarear detalhes",
      "deixar mais nítido", "aumentar detalhe", "melhorar imagem borrada", "afinar imagem",
      "corrigir imagem borrada", "aumentar foco de imagem",
    ],
  },
  {
    names: ["Unsharp Mask", "Máscara de nitidez"],
    category: "Blur & Sharpen",
    keywords: [
      "sharp", "detail", "mask", "clarity", "definition", "sharpen mask", "unsharp", "unsharp masking",
      "nitidez", "máscara de nitidez", "afiar", "realçar", "máscara de foco",
      "aumentar nitidez", "realce de detalhes", "clareza", "nitidez avançada",
      "melhorar nitidez", "definição avançada", "afiar detalhes", "aumentar foco",
      "nitidez profissional", "máscara de foco avançada",
    ],
  },

  // ---------- Color Correction / Grading ----------
  {
    names: ["Lumetri Color", "Cor de Lumetri"],
    category: "Color Correction",
    keywords: [
      "color", "grade", "grading", "lut", "look", "tone", "color wheel", "color grade", "color grading tool",
      "cor", "correção de cor", "gradação de cor", "colorização", "cor de lumetri",
      "tratamento de cor", "colorir", "cinema look", "cor cinematográfica",
      "ajustar cores", "paleta de cores", "colorização profissional", "lumetri",
      "colorização avançada", "grade de cor", "look cinematográfico", "correção de cor profissional",
      "aplicar lut",
    ],
  },
  {
    names: ["Fast Color Corrector"],
    category: "Color Correction",
    keywords: [
      "color", "correction", "hue", "saturation", "quick color", "fast color", "color corrector",
      "cor", "correção rápida", "corrigir cor", "correção de cor rápida",
      "ajustar cor rápido", "matiz", "saturação", "corretor de cor",
      "corrigir tonalidade rápido", "ajuste rápido de cor", "cor rápida",
      "corretor de cor rápido", "corrigir cor simples", "correção básica de cor",
    ],
  },
  {
    names: ["Brightness & Contrast", "Brilho e Contraste"],
    category: "Color Correction",
    keywords: [
      "brightness", "contrast", "light", "dark", "exposure", "brightness contrast", "bright and contrast",
      "brilho", "contraste", "claridade", "escurecer", "clarear",
      "iluminar", "deixar mais claro", "deixar mais escuro", "luminosidade",
      "aumentar brilho", "aumentar contraste", "ajustar brilho", "ajustar exposição",
      "imagem escura", "imagem clara", "melhorar exposição", "corrigir imagem escura",
      "corrigir imagem estourada",
    ],
  },
  {
    names: ["RGB Curves"],
    category: "Color Correction",
    keywords: [
      "color", "curves", "tone curve", "levels", "channels", "rgb", "rgb curves tool",
      "cor", "curvas", "curva de cor", "curva de tom", "canais rgb",
      "ajuste de curva", "níveis de cor", "curva", "curva rgb",
      "ajustar curva", "curva de luz", "grade por curva", "curva de canal",
      "ajustar cor por curva", "editar curva de cor",
    ],
  },
  {
    names: ["Color Balance"],
    category: "Color Correction",
    keywords: [
      "color", "balance", "white balance", "tint", "cast", "color cast", "color balance tool",
      "cor", "balanço de cor", "equilíbrio de cor", "balanço de branco",
      "tonalidade", "corrigir tonalidade", "matiz de cor", "equilibrar cor",
      "corrigir cor esverdeada", "corrigir cor amarelada", "balanço de branco manual",
      "corrigir dominante de cor", "ajustar balanço de cor",
    ],
  },
  {
    names: ["Preto e branco", "Black & White", "Black and White"],
    category: "Color Correction",
    keywords: [
      "black and white", "grayscale", "monochrome", "desaturate", "bw", "b&w", "black white filter",
      "preto e branco", "escala de cinza", "monocromático", "tirar cor",
      "deixar sem cor", "sem cor", "tirar saturação", "preto branco",
      "efeito pretoebranco", "vídeo em preto e branco", "sem saturação",
      "cinza", "tons de cinza", "remover cores", "efeito p&b", "converter pra preto e branco",
    ],
  },
  {
    names: ["Gamma Correction", "Correção gama"],
    category: "Color Correction",
    keywords: [
      "gamma", "gamma correction", "midtones", "adjust gamma", "brightness curve", "gamma fix", "gamma level",
      "correção gama", "gama", "ajustar gama", "corrigir gama",
      "meios-tons", "ajustar meio-tom", "corrigir brilho médio", "gama de cor",
      "curva de gama", "ajuste de gama", "correção de tons médios", "corrigir tom médio",
      "ajustar meio tom da imagem",
    ],
  },
  {
    names: ["Levels", "Níveis"],
    category: "Color Correction",
    keywords: [
      "levels", "histogram", "black point", "white point", "input levels", "output levels", "levels adjustment",
      "níveis", "histograma", "ponto preto", "ponto branco", "ajustar níveis",
      "corrigir níveis de cor", "níveis de entrada", "níveis de saída",
      "ajuste de contraste por níveis", "corrigir exposição por níveis", "ajustar histograma",
      "corrigir preto e branco da imagem", "níveis de vídeo", "levels de cor",
    ],
  },
  {
    names: ["ProcAmp"],
    category: "Color Correction",
    keywords: [
      "procamp", "brightness", "contrast", "hue", "saturation", "video amp", "process amplifier",
      "brilho e contraste rápido", "ajuste rápido de cor", "amplificador de processo",
      "ajustar matiz e saturação", "correção rápida de vídeo", "corrigir cor simples de vídeo",
      "ajuste de vídeo simples", "amplificador de vídeo", "corrigir cor de transmissão",
      "ajuste rápido de brilho", "processador de sinal de vídeo", "corrigir sinal de vídeo",
      "ajustar amplitude de vídeo",
    ],
  },

  // ---------- Distort / Transform ----------
  {
    names: ["Transform", "Transformar"],
    category: "Distort / Transform",
    keywords: [
      "zoom", "scale", "rotate", "position", "resize", "move", "skew", "anchor point", "transform", "transform tool",
      "escala", "posição", "girar", "aumentar", "diminuir", "transformar",
      "redimensionar", "mover", "rotação", "ampliar", "reduzir tamanho",
      "mudar tamanho", "inclinar", "ponto de ancoragem", "escalar", "mexer na posição",
      "dar zoom", "aplicar zoom", "mudar escala",
    ],
  },
  {
    names: ["Basic 3D", "3D básico"],
    category: "Distort / Transform",
    keywords: [
      "3d", "rotate", "tilt", "swivel", "depth", "perspective 3d", "basic 3d", "3d tilt",
      "girar em 3d", "inclinar", "efeito 3d", "profundidade", "3d básico",
      "rotação 3d", "perspectiva", "efeito de profundidade 3d", "girar cartão",
      "inclinar imagem", "virar em 3d", "efeito de cartão girando", "básico 3d",
    ],
  },
  {
    names: ["Rounded Corners", "Recorte arredondado"],
    // Confirmed via a live PT-BR host's raw effect list (Settings > Export
    // raw names): "Recorte arredondado" is this effect's real displayName.
    category: "Distort / Transform",
    keywords: [
      "rounded corners", "rounded", "round corners", "corner radius", "rounded rectangle", "round rect", "rounded edges",
      "cortes arredondados", "cantos arredondados", "arredondar cantos", "cantos redondos",
      "bordas arredondadas", "arredondado", "arredondada", "recorte redondo",
      "quadro arredondado", "borda redonda", "deixar cantos redondos", "arredondar quadro",
      "cantos curvos", "moldura arredondada", "recortar canto",
    ],
  },
  {
    names: ["Crop", "Cortar"],
    category: "Distort / Transform",
    keywords: [
      "crop", "trim edges", "cut frame", "border", "edge crop", "crop image", "cropping tool",
      "cortar", "corte", "recortar", "aparar", "recorte", "cortar tela",
      "cortar bordas", "aparar imagem", "cortar imagem", "cortar vídeo",
      "cortar lateral", "diminuir enquadramento", "cortar moldura", "ajustar enquadramento",
      "aparar bordas do vídeo", "cortar quadro",
    ],
  },
  {
    names: ["Distort"],
    category: "Distort / Transform",
    keywords: [
      "distort", "warp", "bend", "twist", "deform", "distortion", "distort effect",
      "distorcer", "distorção", "deformar", "torcer", "dobrar imagem",
      "empenar", "efeito de distorção", "torcer imagem", "deformar vídeo",
      "efeito torto", "distorcer tela", "efeito deformado", "amassar imagem",
    ],
  },
  {
    names: ["Mirror", "Espelho"],
    category: "Distort / Transform",
    keywords: [
      "mirror", "reflect", "flip", "duplicate side", "symmetry", "mirror effect", "reflection",
      "espelho", "espelhar", "espelhado", "inverter", "refletir",
      "simetria", "efeito espelho", "duplicar lado", "espelhamento",
      "efeito simétrico", "duplicar imagem espelhada", "espelhar tela", "reflexo simétrico",
      "efeito de reflexo",
    ],
  },
  {
    names: ["Horizontal Flip", "Inversão horizontal"],
    category: "Distort / Transform",
    keywords: [
      "flip", "mirror", "horizontal", "invert", "flip horizontal", "horizontal mirror", "flip image",
      "inverter", "espelhar", "virar", "virar horizontal", "inversão horizontal",
      "espelhar horizontal", "girar horizontalmente", "inverter imagem", "virar lado",
      "espelhar imagem", "trocar lado", "virar da esquerda pra direita",
      "inverter esquerda direita", "espelhar da direita pra esquerda",
    ],
  },
  {
    names: ["Vertical Flip", "Inversão vertical"],
    category: "Distort / Transform",
    keywords: [
      "flip", "mirror", "vertical", "invert", "flip vertical", "upside down", "vertical mirror", "flip clip",
      "inverter", "espelhar", "virar", "virar vertical", "inversão vertical",
      "de cabeça pra baixo", "girar verticalmente", "inverter de cima pra baixo",
      "virar imagem", "espelhar vertical", "virar de ponta cabeça",
      "inverter cima baixo", "virar o clipe de cabeça pra baixo",
    ],
  },
  {
    names: ["Warp Stabilizer", "Estabilizador de distorção"],
    category: "Distort / Transform",
    keywords: [
      "stabilize", "shake", "shaky", "steady", "smooth motion", "gimbal", "warp stabilizer", "stabilizer",
      "estabilizar", "estabilização", "tremido", "tremendo", "estabilizador de distorção",
      "balançando", "câmera tremida", "firmar imagem", "corrigir tremida",
      "estabilizar vídeo", "vídeo tremido", "consertar tremido", "firmar câmera",
      "tirar tremedeira", "vídeo balançando",
    ],
  },
  {
    names: ["Camera Shake", "Tremulação de câmera", "Balanço de câmera"],
    category: "Distort / Transform",
    keywords: [
      "shake", "camera", "wobble", "vibrate", "handheld look", "camera shake", "shake effect",
      "tremido", "balanço", "tremer", "tremida de câmera", "tremulação de câmera",
      "câmera na mão", "efeito de tremido", "vibração", "adicionar tremido",
      "simular câmera na mão", "efeito documentário", "tremer câmera",
      "efeito de terremoto na câmera", "vibrar imagem",
    ],
  },
  {
    names: ["Move", "Mover"],
    category: "Distort / Transform",
    keywords: [
      "move", "position", "drag", "shift position", "reposition", "move it", "move effect",
      "mover", "posição", "deslocar", "mudar posição", "arrastar",
      "movimentar", "reposicionar", "mover imagem", "mudar lugar",
      "arrastar posição", "trocar posição", "deslocar objeto",
      "mover para o lado",
    ],
  },
  {
    names: ["Offset", "Deslocamento"],
    category: "Distort / Transform",
    keywords: [
      "offset", "shift", "displace", "wrap around", "offset image", "offset effect", "pixel shift",
      "deslocamento", "deslocar", "deslocar imagem", "mover pixel",
      "compensar posição", "deslocamento de tela", "deslocar pixels",
      "corrigir posição", "compensar deslocamento", "deslocar quadro",
      "empurrar pixels", "mover conteúdo da tela", "reposicionar imagem",
    ],
  },
  {
    names: ["Grow", "Aumentar"],
    category: "Distort / Transform",
    keywords: [
      "grow", "expand", "enlarge", "bigger", "grow effect", "grow bigger", "grow image",
      "aumentar", "expandir", "crescer", "ampliar", "deixar maior",
      "engordar imagem", "expandir borda", "aumentar objeto", "esticar imagem",
      "aumentar tamanho", "deixar mais grosso", "crescer imagem", "expandir tamanho",
      "aumentar área da imagem",
    ],
  },
  {
    names: ["Shrink", "Encolher"],
    category: "Distort / Transform",
    keywords: [
      "shrink", "reduce", "smaller", "contract", "shrink effect", "shrink down", "shrink image",
      "encolher", "reduzir", "diminuir", "deixar menor", "contrair",
      "afinar imagem", "reduzir borda", "diminuir objeto", "encolher tamanho",
      "reduzir tamanho", "deixar mais fino", "encolher imagem", "diminuir escala",
      "reduzir área da imagem",
    ],
  },
  {
    names: ["Rotate", "Giro", "Girar"],
    category: "Distort / Transform",
    keywords: [
      "rotate", "spin", "turn", "revolve", "rotate effect", "rotate image", "spin image",
      "girar", "rotação", "rodar", "virar", "girar imagem", "giro",
      "rotacionar", "girar clipe", "girar vídeo", "rodar imagem",
      "girar tela", "rotacionar clipe", "girar 90 graus", "girar 180 graus",
      "girar em círculo",
    ],
  },
  {
    names: ["Auto Reframe", "Reestruturação automática"],
    category: "Distort / Transform",
    keywords: [
      "reframe", "crop", "aspect ratio", "vertical video", "resize for social", "auto reframe", "reframe tool",
      "reenquadrar", "proporção", "formato", "vídeo vertical", "reestruturação automática",
      "adaptar formato", "cortar automático", "9:16", "formato reels",
      "adaptar pra instagram", "vídeo pra tiktok", "converter formato automático",
      "reenquadramento automático", "formato quadrado",
    ],
  },
  {
    names: ["Auto Align", "Alinhamento automático"],
    category: "Distort / Transform",
    keywords: [
      "align", "sync", "match position", "auto sync", "auto align", "align clips", "auto alignment",
      "alinhar", "sincronizar", "alinhamento", "sincronização automática",
      "alinhar clipes", "sincronizar ângulos", "alinhamento automático",
      "sincronizar câmeras", "combinar ângulos", "alinhar automaticamente",
      "alinhar multicâmera", "sincronizar tomadas", "alinhar cenas", "sincronizar cortes",
    ],
  },
  {
    names: ["Corner Pin", "Pino de vértice"],
    category: "Distort / Transform",
    keywords: [
      "corner pin", "perspective pin", "screen replacement", "track screen", "corner pin tool", "pin corners",
      "pino de vértice", "fixar cantos", "substituir tela", "colar em tela",
      "perspectiva por cantos", "encaixar tela", "distorcer por cantos",
      "colocar em tela de tv", "encaixar imagem na tela", "prender cantos",
      "ajustar perspectiva de tela", "colocar vídeo dentro de outra tela",
      "encaixar tela de celular", "colar imagem em monitor",
    ],
  },
  {
    names: ["Spherize", "Esferização"],
    category: "Distort / Transform",
    keywords: [
      "spherize", "sphere", "bulge", "fisheye", "bubble effect", "spherize effect", "bulge effect",
      "esferização", "esfera", "efeito bolha", "olho de peixe",
      "abaular", "efeito esférico", "distorcer em esfera", "bola",
      "efeito lupa redonda", "efeito globo", "distorção esférica",
      "efeito de bola de vidro", "distorcer como esfera", "efeito de lupa",
    ],
  },
  {
    names: ["Twirl", "Redemoinho"],
    category: "Distort / Transform",
    keywords: [
      "twirl", "swirl", "whirlpool", "spiral distort", "twirl effect", "swirl distortion",
      "redemoinho", "espiral", "efeito espiral", "girar em espiral",
      "distorcer em redemoinho", "efeito redemoinho", "vórtice",
      "torção espiral", "efeito de furacão", "girar tela em espiral",
      "efeito de redemoinho na tela", "distorcer girando", "efeito de tornado",
      "girar imagem em espiral",
    ],
  },
  {
    names: ["Wave Warp", "Distorção ondulada"],
    category: "Distort / Transform",
    keywords: [
      "wave warp", "wave distort", "ripple", "water effect", "wave effect", "ripple distort",
      "distorção ondulada", "onda", "efeito de onda", "ondulação",
      "efeito água", "distorcer em onda", "onda na tela", "efeito ondulado",
      "efeito de água balançando", "ondular imagem", "efeito de ondas na água",
      "distorcer como água", "efeito de piscina", "ondulação de tela",
    ],
  },
  {
    names: ["Lens Distortion", "Distorção de lente"],
    category: "Distort / Transform",
    keywords: [
      "lens distortion", "fisheye", "barrel distortion", "wide lens effect", "lens correction", "lens fix",
      "distorção de lente", "olho de peixe", "distorção de câmera",
      "lente grande angular", "corrigir lente", "efeito de lente",
      "distorcer lente", "corrigir distorção de câmera", "efeito olho de peixe",
      "corrigir lente grande angular", "distorção tipo olho de peixe",
      "corrigir curvatura de lente", "distorção de barril", "corrigir imagem curvada",
    ],
  },
  {
    names: ["Time Warp", "Distorção de tempo"],
    category: "Distort / Transform",
    keywords: [
      "time warp", "slow motion effect", "speed ramp", "time remap distort", "time warp effect", "speed warp",
      "distorção de tempo", "câmera lenta", "acelerar tempo", "efeito de tempo",
      "distorcer velocidade", "warp de tempo", "manipular tempo",
      "efeito de tempo variável", "acelerar e desacelerar", "efeito de câmera lenta e rápida",
      "manipular velocidade do vídeo", "efeito de tempo dinâmico", "curva de velocidade",
      "efeito de bullet time",
    ],
  },

  // ---------- Stylize / Generate ----------
  {
    names: ["Echo", "Eco"],
    category: "Time / Stylize",
    keywords: [
      "echo", "trail", "ghost", "repeat", "motion trail", "smear", "echo effect", "ghosting",
      "eco", "rastro", "fantasma", "repetição", "efeito fantasma", "efeito eco",
      "rastro de movimento", "sobreposição de quadros", "efeito de rastro",
      "quadros sobrepostos", "sombra de movimento", "efeito de várias imagens",
      "efeito de repetição de movimento",
    ],
  },
  {
    names: ["Posterize", "Posterizar"],
    category: "Stylize",
    keywords: [
      "posterize", "flatten colors", "poster effect", "banding", "posterize effect", "flat colors", "reduce colors",
      "posterizar", "reduzir cores", "efeito pôster", "cores chapadas",
      "achatar cor", "simplificar cores", "efeito poster", "cores lisas",
      "reduzir gama de cor", "efeito de pôster", "diminuir número de cores",
      "achatar imagem", "efeito de poucas cores",
    ],
  },
  {
    names: ["Posterize Time", "Posterizar tempo"],
    category: "Time / Stylize",
    keywords: [
      "posterize", "frame rate", "choppy", "stutter", "stop motion look", "posterize time", "frame skip",
      "posterizar", "taxa de quadros", "travado", "efeito stop motion", "posterizar tempo",
      "cortar quadros", "quadros travados", "efeito travado", "reduzir fps",
      "efeito de fps baixo", "vídeo travado", "efeito de vídeo pulado",
      "diminuir taxa de quadros",
    ],
  },
  {
    names: ["Glow", "Brilho", "Resplendor"],
    category: "Stylize",
    keywords: [
      "glow", "shine", "bloom", "halo", "radiance", "glow effect", "bloom effect", "shining light",
      "brilho", "resplendor", "brilhante", "luminoso", "efeito de brilho",
      "auréola", "halo de luz", "efeito bloom", "luz brilhando",
      "brilho suave", "iluminação brilhante", "brilho intenso", "efeito luminoso",
      "adicionar brilho na imagem",
    ],
  },
  {
    names: ["Edge Glow", "Brilho de borda", "Brilho de aresta"],
    category: "Stylize",
    keywords: [
      "glow", "edge", "outline glow", "rim light effect", "edge glow", "border glow", "glowing outline",
      "brilho", "aresta", "borda", "brilho de contorno", "brilho de borda",
      "contorno luminoso", "brilho nas bordas", "efeito de contorno brilhante",
      "borda iluminada", "contorno neon", "brilho ao redor",
      "efeito de aresta brilhante", "contorno com brilho",
    ],
  },
  {
    names: ["Wonder Glow", "Brilho mágico", "Brilho maravilhoso"],
    category: "Stylize",
    keywords: [
      "glow", "dreamy", "soft glow", "ethereal", "magical look", "wonder glow", "dreamy glow", "fairy glow",
      "brilho", "sonhador", "etéreo", "brilho suave", "efeito mágico", "brilho mágico",
      "brilho sonhador", "efeito etéreo", "glow mágico", "brilho encantado",
      "brilho de conto de fadas", "efeito de sonho",
    ],
  },
  {
    names: ["Light Leaks", "Vazamentos de luz"],
    category: "Stylize",
    keywords: [
      "light leak", "flare", "film look", "sun flare", "vintage light", "light leaks", "leak effect", "analog leak",
      "vazamento de luz", "luz vazando", "vintage", "efeito retrô", "vazamentos de luz",
      "luz de filme antigo", "brilho retrô", "efeito de luz vintage",
      "luz vazada", "estouro de luz", "efeito de luz filme antigo",
      "vazamento de luz de câmera analógica",
    ],
  },
  {
    names: ["Volumetric Rays", "Raios volumétricos"],
    category: "Stylize",
    keywords: [
      "god rays", "light rays", "sun rays", "crepuscular rays", "beams", "volumetric rays", "ray effect", "light beams",
      "raios de luz", "raios volumétricos", "raios de sol",
      "raios divinos", "feixes de luz", "luz de deus", "raio de sol atravessando",
      "efeito de luz atravessando nuvem", "raios entre árvores", "efeito de neblina com luz",
      "luz de deus atravessando", "raio de luz celestial",
    ],
  },
  {
    names: ["RGB Split", "Divisão de RGB"],
    category: "Stylize",
    keywords: [
      "rgb split", "chromatic aberration", "glitch", "color shift", "vhs glitch", "rgb split effect", "aberration", "color offset",
      "divisão de cor", "aberração cromática", "efeito glitch", "divisão de rgb",
      "deslocamento de cor", "efeito vhs", "efeito glitchado", "cores separadas",
      "falha de cor", "efeito de erro visual", "efeito de aberração cromática",
      "separação de canais de cor",
    ],
  },
  {
    names: ["Drop Shadow", "Sombra projetada"],
    category: "Stylize",
    keywords: [
      "shadow", "drop shadow", "cast shadow", "depth shadow", "drop shadow effect", "add shadow", "shadow behind",
      "sombra", "sombra projetada", "sombra atrás", "adicionar sombra",
      "efeito de profundidade", "sombra de texto", "sombra atrás do texto",
      "sombra no fundo", "dar profundidade com sombra", "sombra suave",
      "sombra atrás da imagem", "sombra em objeto", "adicionar sombra no texto",
    ],
  },
  {
    names: ["Long Shadow", "Sombra longa"],
    category: "Stylize",
    keywords: [
      "shadow", "long shadow", "flat design shadow", "stretched shadow", "long shadow effect", "flat shadow", "extended shadow",
      "sombra", "sombra longa", "sombra comprida", "sombra esticada",
      "sombra estilizada", "efeito de sombra longa", "sombra diagonal",
      "sombra flat design", "sombra alongada", "sombra estendida",
      "sombra estilo design plano", "sombra tipo pôster", "sombra minimalista",
    ],
  },
  {
    names: ["Brush Strokes", "Traçados de pincel"],
    category: "Stylize",
    keywords: [
      "paint", "brush", "painterly", "artistic filter", "watercolor look", "brush strokes", "paint effect", "painted look",
      "pintura", "pincel", "traços", "efeito de pintura", "traçados de pincel",
      "aquarela", "estilo pintado", "efeito de tinta", "pincelada",
      "textura de pintura", "efeito quadro pintado", "estilo artístico",
    ],
  },
  {
    names: ["Color Emboss", "Entalhe de cor"],
    category: "Stylize",
    keywords: [
      "emboss", "relief", "3d texture", "engraved look", "color emboss", "emboss effect", "embossed",
      "entalhe", "relevo", "efeito de relevo", "gravado", "entalhe de cor",
      "textura em relevo", "efeito 3d de superfície", "efeito gravado",
      "textura entalhada", "efeito de moeda", "relevo colorido",
      "efeito de metal gravado", "textura de escultura",
    ],
  },
  {
    names: ["Find Edges", "Localizar bordas"],
    category: "Stylize",
    keywords: [
      "edges", "outline", "sketch effect", "line art", "cartoon edges", "find edges", "edge detection", "outline sketch",
      "bordas", "contorno", "desenho", "efeito desenho", "localizar bordas",
      "contornos da imagem", "estilo cartoon", "efeito de esboço",
      "linhas de contorno", "estilo desenho a lápis", "efeito de contorno de linha",
      "transformar em desenho",
    ],
  },
  {
    names: ["Mosaic", "Mosaico"],
    category: "Stylize",
    keywords: [
      "mosaic", "pixelate", "censor", "blur face", "pixel blocks", "mosaic effect", "pixelation", "pixelated",
      "mosaico", "pixelizar", "pixelado", "censurar rosto",
      "esconder rosto", "efeito pixelado", "pixelar", "censurar imagem",
      "borrar rosto pixelado", "efeito quadriculado", "censurar placa de carro",
      "pixelar rosto",
    ],
  },
  {
    names: ["Roughen Edges", "Tornar bordas ásperas"],
    category: "Stylize",
    keywords: [
      "rough edges", "torn", "grunge edge", "distressed border", "roughen edges", "torn edge effect", "ragged edge",
      "bordas ásperas", "rasgado", "irregular", "borda rasgada",
      "efeito envelhecido", "borda irregular", "efeito rasgado",
      "borda desgastada", "efeito grunge", "borda de papel rasgado",
      "textura desgastada na borda", "efeito de borda velha", "contorno rasgado",
    ],
  },
  {
    names: ["Strobe Light", "Luz estroboscópica"],
    category: "Stylize",
    keywords: [
      "strobe", "flash", "flicker", "blink effect", "party light", "strobe light", "flashing light", "flicker effect",
      "estroboscópica", "piscar", "efeito flash", "luz piscando", "luz estroboscópica",
      "estrobo", "piscada de luz", "efeito de balada", "luz piscante",
      "flash repetido", "efeito de piscar de luz rápido", "luz de festa", "luz de discoteca",
    ],
  },
  {
    names: ["Noise", "Ruído"],
    category: "Noise & Grain",
    keywords: [
      "noise", "grain", "texture", "static", "film grain", "vhs noise", "noise effect", "add grain", "film texture",
      "ruído", "granulado", "grão", "textura", "chiado visual",
      "efeito vhs", "textura de filme", "chuvisco", "grão de filme",
      "textura vintage", "ruído de tv antiga", "adicionar grão",
      "efeito de estática",
    ],
  },
  {
    names: ["Noise Alpha"],
    category: "Noise & Grain",
    keywords: [
      "noise", "alpha", "transparency noise", "grain alpha", "grain", "noise alpha", "alpha grain", "alpha channel noise",
      "ruído", "ruído no alfa", "textura transparente",
      "granulado transparente", "textura", "grão no canal alfa",
      "ruído em transparência", "grão transparente", "ruído de canal alfa",
      "textura de transparência", "grão em máscara", "ruído em máscara",
    ],
  },
  {
    names: ["Median"],
    category: "Noise & Grain",
    keywords: [
      "denoise", "median", "smooth", "painterly blur", "reduce grain", "median filter", "median blur", "smoothing filter",
      "reduzir ruído", "suavizar", "limpar imagem", "suavizar textura",
      "amenizar granulado", "filtro de mediana", "filtro mediano",
      "suavizar granulado", "reduzir grão", "efeito pintura suave",
      "borrar suavemente mantendo bordas", "filtro suavizador", "limpar textura",
    ],
  },

  // ---------- Keying ----------
  {
    names: ["Ultra Key"],
    category: "Keying",
    keywords: [
      "key", "chroma", "green screen", "chroma key", "blue screen", "ultra key", "keying tool", "background removal",
      "croma", "chave verde", "fundo verde", "remover fundo",
      "tela verde", "recortar fundo", "trocar fundo", "fundo azul",
      "remover chroma", "tirar fundo verde", "croma key", "chave de croma",
      "recortar tela verde",
    ],
  },
  {
    names: ["Track Matte Key"],
    category: "Keying",
    keywords: [
      "matte", "key", "luma matte", "mask track", "alpha matte", "track matte", "matte key tool", "matte tracking",
      "máscara", "máscara de rastreamento", "máscara de vídeo",
      "chave de máscara", "recorte com máscara", "matte de rastreamento",
      "recortar com matte", "usar máscara de vídeo", "matte de acompanhamento",
      "aplicar máscara em vídeo", "recorte por rastreamento", "matte animado",
    ],
  },
  {
    names: ["Color Key", "Substituição de cor"],
    category: "Keying",
    keywords: [
      "color key", "color replace", "chroma color", "remove color", "color key tool", "replace color",
      "substituição de cor", "chave de cor", "recortar por cor", "remover cor específica",
      "trocar cor por transparência", "chroma de cor", "recorte por cor",
      "remover fundo de cor", "recorte por matiz", "chave de cor específica",
      "substituir cor de fundo", "trocar cor específica por transparência",
      "chave por cor sólida", "recorte por cor exata",
    ],
  },
  {
    names: ["Luma Key"],
    category: "Keying",
    keywords: [
      "luma key", "brightness key", "remove black", "remove white background", "luma keying", "luminance key",
      "chave de luminância", "recortar por brilho", "remover preto", "remover branco",
      "chave de luma", "recorte por luminosidade", "recorte por brilho",
      "remover fundo preto", "remover fundo branco", "chave por brilho", "recortar por tonalidade",
      "recorte por escala de cinza", "chave de luminosidade", "chave por valor de luz",
    ],
  },

  // ---------- Utility / Generate ----------
  {
    names: ["Cineon Converter", "Conversor de Cineon", "Conversor Cineon"],
    category: "Utility",
    keywords: [
      "cineon", "log", "log footage", "convert log", "10-bit log", "dpx", "cineon converter", "log conversion",
      "conversor", "converter log", "conversão cineon", "conversor de cineon",
      "arquivo log", "converter imagem log", "converter formato",
      "converter dpx", "corrigir arquivo log", "converter footage log",
      "converter cineon dpx", "conversor de imagem log", "converter arquivo dpx",
    ],
  },
  {
    names: ["Clone"],
    category: "Utility",
    keywords: [
      "clone", "duplicate", "copy stamp", "clone stamp", "clone tool", "cloning", "clone brush",
      "clonar", "duplicar", "efeito clone", "copiar área",
      "carimbo clone", "duplicação", "clonar área", "remover objeto clonando",
      "copiar parte da imagem", "duplicar área da tela", "apagar objeto clonando fundo",
      "clonar textura", "ferramenta de clonagem",
    ],
  },
  {
    names: ["Simple Text", "Texto simples"],
    category: "Generate",
    keywords: [
      "text", "title", "caption", "add text", "basic text", "simple text", "text tool", "text overlay",
      "texto", "título", "legenda", "adicionar texto", "texto simples",
      "inserir título", "colocar texto", "escrever na tela", "adicionar legenda",
      "criar texto", "escrever texto", "inserir legenda",
    ],
  },
  {
    names: ["Stroke", "Traçado"],
    category: "Generate",
    keywords: [
      "stroke", "outline", "border line", "edge line", "stroke effect", "add outline", "outline text",
      "traçado", "contorno", "borda", "linha de contorno",
      "adicionar borda", "delinear", "contornar", "linha ao redor",
      "borda em volta", "delimitar objeto", "criar contorno",
      "linha de borda", "contorno de texto", "traçado ao redor do objeto",
    ],
  },
  {
    names: ["Gradient", "Gradiente"],
    category: "Generate",
    keywords: [
      "gradient", "color gradient", "fade colors", "gradient effect", "gradient overlay", "gradient background",
      "gradiente", "degradê", "gradação de cor", "fundo gradiente",
      "criar degradê", "cor em degradê", "efeito degradê", "gradiente de cor",
      "fundo degradê", "sobreposição de gradiente", "cor gradual", "transição de cor suave",
      "fundo com degradê", "gradiente linear",
    ],
  },
  {
    names: ["4-Color Gradient", "Gradiente de 4 cores"],
    category: "Generate",
    keywords: [
      "gradient", "four color gradient", "multi color gradient", "4 color gradient", "quad gradient", "multicolor",
      "gradiente de 4 cores", "degradê de quatro cores", "gradiente múltiplo",
      "fundo com várias cores", "gradiente com quatro pontos", "gradiente colorido",
      "fundo com múltiplos gradientes", "degradê com várias cores",
      "gradiente com 4 pontos de cor", "fundo colorido degradê", "gradiente complexo",
      "fundo multicolorido", "gradiente radial colorido", "gradiente com 4 cores diferentes",
    ],
  },
  {
    names: ["Lens Flare", "Flash de lente"],
    category: "Generate",
    keywords: [
      "lens flare", "sun flare", "light flare", "flare effect", "camera flare", "sunlight flare",
      "flash de lente", "reflexo de lente", "brilho de lente",
      "efeito de sol na lente", "reflexo de sol", "flare de câmera",
      "efeito de sol estourado", "brilho de lente de câmera", "reflexo solar",
      "brilho de sol na câmera", "efeito de clarão", "brilho anamórfico",
      "efeito de contraluz", "efeito de flare anamórfico",
    ],
  },
  {
    names: ["Vignette", "Vinheta"],
    category: "Generate",
    keywords: [
      "vignette", "darken edges", "corner darken", "vignette effect", "vignetting", "darkened corners",
      "vinheta", "escurecer bordas", "escurecer cantos", "vinheta escura",
      "sombra nas bordas", "focar no centro escurecendo cantos", "efeito vinheta",
      "escurecer cantos da imagem", "efeito de foco central", "sombreado nas bordas",
      "escurecer moldura", "vinheta cinematográfica", "sombreamento periférico",
      "escurecer periferia da imagem",
    ],
  },

  // ---------- Audio: EQ / Filter ----------
  {
    names: ["Parametric Equalizer"],
    category: "Audio / EQ",
    keywords: [
      "eq", "equalizer", "frequency", "tone shaping", "audio eq", "parametric eq", "eq tool", "sound shaping",
      "equalização", "equalizar", "equalizador", "ajustar frequência",
      "equalizador de áudio", "equalizador paramétrico", "ajuste de tom",
      "melhorar som", "equalizar áudio", "ajustar frequências específicas",
      "equalizador avançado", "eq paramétrico", "ajustar tom do áudio",
    ],
  },
  {
    names: ["Graphic Equalizer (20 Bands)", "Graphic Equalizer"],
    category: "Audio / EQ",
    keywords: [
      "eq", "equalizer", "bands", "graphic eq", "frequency bands", "20 band eq", "graphic equalizer", "band eq",
      "equalização", "equalizar", "equalizador gráfico",
      "bandas de frequência", "equalizador de bandas", "equalizador visual",
      "eq de 20 bandas", "equalizador de faixas", "equalização gráfica",
      "eq de várias bandas", "controle de bandas de frequência", "eq visual de barras",
    ],
  },
  {
    names: ["FFT Filter"],
    category: "Audio / EQ",
    keywords: [
      "filter", "fft", "spectral filter", "frequency filter", "eq", "fft filter", "spectrum filter", "spectral eq",
      "filtro", "filtro espectral", "filtro de frequência",
      "análise de frequência", "equalizar", "filtro avançado",
      "filtro de fft", "processamento espectral", "filtro de espectro sonoro",
      "análise de áudio avançada", "filtro por transformada de fourier", "correção espectral",
    ],
  },
  {
    names: ["Notch Filter"],
    category: "Audio / EQ",
    keywords: [
      "notch", "filter", "remove frequency", "hum removal filter", "eq", "notch filter", "band reject", "cut frequency",
      "filtro entalhe", "remover frequência", "filtro notch",
      "cortar frequência específica", "equalizar", "remover zumbido",
      "filtro corta frequência", "eliminar frequência específica", "filtro rejeita banda",
      "cortar frequência indesejada", "remover apito de frequência", "filtro corta banda",
    ],
  },
  {
    names: ["Treble"],
    category: "Audio / EQ",
    keywords: [
      "treble", "high", "highs", "brightness audio", "eq", "treble boost", "treble control", "high frequency",
      "agudo", "agudos", "som agudo", "realçar agudos",
      "frequência alta", "equalizar agudo", "aumentar agudo", "brilho no som",
      "deixar som mais agudo", "realce de agudos", "clarear som", "som mais fino",
    ],
  },
  {
    names: ["Bass"],
    category: "Audio / EQ",
    keywords: [
      "bass", "low", "lows", "sub bass", "warmth", "bass boost", "bass control", "low frequency",
      "grave", "graves", "som grave", "realçar graves",
      "frequência baixa", "aumentar grave", "grave profundo", "reforçar bass",
      "deixar som mais grave", "realce de graves", "engrossar som", "som mais encorpado",
    ],
  },
  {
    names: ["Highpass"],
    category: "Audio / EQ",
    keywords: [
      "high pass", "filter", "cut lows", "remove rumble", "eq", "highpass filter", "hpf", "high pass filter",
      "passa-alta", "filtro passa-alta", "cortar graves",
      "remover ruído grave", "equalizar", "cortar frequência baixa",
      "filtro corta grave", "eliminar zumbido grave", "filtro passa alta de áudio",
      "cortar frequências graves indesejadas", "remover ruído de vento", "limpar grave excessivo",
    ],
  },
  {
    names: ["Lowpass"],
    category: "Audio / EQ",
    keywords: [
      "low pass", "filter", "cut highs", "muffle", "eq", "lowpass filter", "lpf", "low pass filter",
      "passa-baixa", "filtro passa-baixa", "cortar agudos",
      "abafar som", "equalizar", "cortar frequência alta",
      "filtro corta agudo", "som abafado", "filtro passa baixa de áudio",
      "cortar frequências agudas indesejadas", "deixar som mais grave suave", "suavizar agudo",
    ],
  },

  // ---------- Audio: Reverb / Delay ----------
  {
    names: ["Reverb"],
    category: "Audio / Reverb",
    keywords: [
      "reverb", "room", "space", "ambience", "hall", "reverb effect", "reverberation", "reverb tail",
      "reverberação", "ambiente", "eco de sala", "sala",
      "som de sala", "espaço acústico", "reverberar", "ambiente de sala",
      "som de igreja", "efeito de sala grande", "adicionar reverb",
      "efeito de eco ambiente",
    ],
  },
  {
    names: ["Studio Reverb"],
    category: "Audio / Reverb",
    keywords: [
      "reverb", "room", "studio", "hall reverb", "space", "studio reverb", "studio ambience", "studio room",
      "reverberação", "ambiente", "sala", "reverb de estúdio",
      "eco de estúdio", "espaço acústico", "reverberação de estúdio",
      "som de estúdio", "ambiente profissional de áudio", "reverb profissional",
      "eco de estúdio profissional", "sala de gravação",
    ],
  },
  {
    names: ["Convolution Reverb"],
    category: "Audio / Reverb",
    keywords: [
      "reverb", "convolution", "impulse response", "realistic reverb", "room", "convolution", "ir reverb", "real space reverb",
      "reverberação", "convolução", "reverb realista",
      "resposta de impulso", "ambiente realista", "reverb por convolução",
      "reverberação natural", "reverb de sala real", "simulação de ambiente real",
      "reverb de alta qualidade", "resposta de sala real", "reverb cinematográfico",
    ],
  },
  {
    names: ["Delay"],
    category: "Audio / Delay",
    keywords: [
      "delay", "echo", "repeat", "bounce sound", "reverb-like", "delay effect", "audio delay", "echo repeat",
      "atraso", "eco", "repetição", "eco de áudio",
      "atraso de som", "efeito de eco", "eco repetido", "delay de áudio",
      "repetir som", "atraso sonoro", "efeito de eco repetido", "atraso de áudio",
    ],
  },
  {
    names: ["Analog Delay"],
    category: "Audio / Delay",
    keywords: [
      "delay", "echo", "analog", "warm echo", "tape delay", "analog delay", "vintage delay", "tape echo",
      "atraso", "eco", "eco analógico", "atraso analógico",
      "eco quente", "delay de fita", "eco vintage", "atraso vintage",
      "delay analógico quente", "eco de fita cassete", "delay estilo retrô", "eco de rockabilly",
    ],
  },
  {
    names: ["Multitap Delay"],
    category: "Audio / Delay",
    keywords: [
      "delay", "echo", "multiple echo", "rhythmic delay", "tap delay", "multitap", "multi tap delay", "layered delay",
      "atraso", "eco", "múltiplo", "eco múltiplo",
      "atraso rítmico", "eco em camadas", "delay múltiplo", "delay rítmico",
      "eco de vários tempos", "múltiplos ecos", "delay com várias repetições", "eco complexo",
    ],
  },

  // ---------- Audio: Dynamics ----------
  {
    names: ["Dynamics"],
    category: "Audio / Dynamics",
    keywords: [
      "compressor", "gate", "limiter", "noise gate", "level control", "dynamics processor", "dynamics tool", "audio dynamics",
      "compressão", "dinâmica", "compressor de áudio",
      "controle de volume", "gate de ruído", "processador de dinâmica",
      "controlar volume automaticamente", "processador dinâmico de áudio",
      "controle dinâmico de som", "compressor e gate", "controlar picos de volume",
      "dinâmica de voz",
    ],
  },
  {
    names: ["Multiband Compressor"],
    category: "Audio / Dynamics",
    keywords: [
      "compressor", "multiband", "mastering compressor", "dynamics", "multiband compression", "band compressor", "multiband dynamics",
      "compressão", "compressor de áudio", "compressor multibanda",
      "compressão de faixas", "masterização", "dinâmica de áudio",
      "compressor de masterização", "compressor de várias bandas",
      "compressão por frequência", "compressor profissional", "compressão multibanda de mixagem",
      "compressão de faixa completa", "compressor de master",
    ],
  },
  {
    names: ["Hard Limiter"],
    category: "Audio / Dynamics",
    keywords: [
      "limiter", "cap volume", "prevent clipping", "loudness limiter", "peak control", "hard limiter", "brickwall limiter", "volume cap",
      "limitador", "limitar volume", "evitar distorção",
      "controlar pico", "limitar áudio", "evitar clipping", "cortar pico de volume",
      "limitador de pico", "impedir estouro de áudio", "evitar áudio estourado", "limitar volume máximo",
      "limitador de saída",
    ],
  },
  {
    names: ["Single-Band Compressor"],
    category: "Audio / Dynamics",
    keywords: [
      "compressor", "single band", "basic compressor", "dynamics", "level control", "single band", "basic compression", "simple compressor",
      "compressão", "compressor simples", "compressor de áudio",
      "compressor básico", "controle de volume", "compressor de uma banda",
      "compressor de faixa única", "compressão básica de áudio", "compressor iniciante",
      "compressão simples de voz", "compressor de canal único", "compressor mono",
    ],
  },
  {
    names: ["Amplify"],
    category: "Audio / Dynamics",
    keywords: [
      "amplify", "gain", "volume", "boost volume", "increase level", "amplify audio", "loudness boost", "gain boost",
      "amplificar", "ganho", "aumentar volume", "subir volume",
      "aumentar áudio", "deixar mais alto", "ganho de áudio", "aumentar som",
      "amplificar áudio baixo", "subir ganho", "aumentar volume gravado", "reforçar volume baixo",
    ],
  },

  // ---------- Audio: Modulation ----------
  {
    names: ["Chorus"],
    category: "Audio / Modulation",
    keywords: [
      "chorus", "modulation", "thicken sound", "doubling effect", "widen", "chorus effect", "voice doubling", "widen sound",
      "coro", "modulação", "engrossar som", "efeito de coro",
      "duplicar voz", "alargar som", "efeito chorus", "engrossar voz",
      "efeito de várias vozes", "alargar áudio", "efeito de coral", "encorpar áudio",
    ],
  },
  {
    names: ["Flanger"],
    category: "Audio / Modulation",
    keywords: [
      "flanger", "modulation", "sweeping sound", "jet sound effect", "swoosh", "flanger effect", "jet flanger", "sweep effect",
      "modulação", "efeito flanger", "som de avião",
      "efeito de varredura", "som espacial", "efeito flangeado",
      "efeito de vento sonoro", "som de sopro metálico", "efeito de turbina", "som metálico ondulante",
      "efeito de whoosh", "modulação por atraso curto",
    ],
  },
  {
    names: ["Phaser"],
    category: "Audio / Modulation",
    keywords: [
      "phaser", "modulation", "swirling sound", "phase shift", "psychedelic", "phaser effect", "phase modulation", "swirl sound",
      "modulação", "efeito phaser", "som giratório",
      "deslocamento de fase", "som psicodélico", "efeito de fase",
      "som rodopiante", "efeito sonoro psicodélico", "som de nave espacial", "efeito robótico sonoro",
      "modulação de fase sonora", "filtro pente sonoro",
    ],
  },
  {
    names: ["Tremolo"],
    category: "Audio / Modulation",
    keywords: [
      "tremolo", "modulation", "volume wobble", "pulsing sound", "throb", "tremolo effect", "volume pulse", "wobble volume",
      "modulação", "efeito tremolo", "som pulsante",
      "vibração de volume", "som ondulante", "efeito de pulsação",
      "volume oscilante", "som trêmulo", "efeito de volume oscilando", "som pulsando ritmicamente",
      "vibrato de volume", "efeito de rádio antigo",
    ],
  },

  // ---------- Audio: Noise Reduction / Restoration ----------
  {
    names: ["DeNoise"],
    category: "Audio / Noise Reduction",
    keywords: [
      "noise reduction", "denoise", "hiss", "clean audio", "background noise", "remove hiss", "audio cleanup", "denoiser",
      "redução de ruído", "remover ruído", "limpar áudio", "chiado",
      "ruído de fundo", "tirar chiado", "tirar ruído de fundo", "limpar chiado",
      "remover ruído de gravação", "limpar gravação", "tirar ruído de fundo do áudio", "áudio mais limpo",
    ],
  },
  {
    names: ["DeHummer"],
    category: "Audio / Noise Reduction",
    keywords: [
      "hum", "buzz", "electrical noise", "60hz hum", "ground loop", "remove hum", "dehummer", "power hum",
      "zumbido", "ronco", "remover zumbido", "ruído elétrico",
      "zumbido de fio", "ruído de tomada", "tirar zumbido", "remover ronco",
      "remover ruído elétrico de 60hz", "eliminar zumbido de energia", "tirar ronco de fio", "remover interferência elétrica",
    ],
  },
  {
    names: ["Noise Reduction / Restoration", "Noise Reduction"],
    category: "Audio / Noise Reduction",
    keywords: [
      "noise reduction", "restoration", "clean audio", "remove hiss", "audio restoration", "restore audio", "audio repair",
      "redução de ruído", "remover ruído", "restauração", "limpar áudio",
      "restaurar áudio", "tirar ruído", "restaurar som", "limpeza de áudio",
      "restaurar gravação antiga", "melhorar áudio ruim", "consertar áudio danificado", "recuperar áudio",
      "salvar áudio ruim",
    ],
  },
  {
    names: ["Adaptive Noise Reduction"],
    category: "Audio / Noise Reduction",
    keywords: [
      "noise reduction", "adaptive", "smart denoise", "automatic cleanup", "hiss", "adaptive denoise", "smart cleanup", "auto denoise",
      "redução de ruído", "adaptativo", "limpeza automática",
      "redução inteligente de ruído", "chiado", "denoise inteligente",
      "limpeza de áudio automática", "redução automática de ruído", "denoise automático inteligente", "limpeza inteligente de gravação",
      "redução de ruído com ia", "denoise adaptativo",
    ],
  },
];
