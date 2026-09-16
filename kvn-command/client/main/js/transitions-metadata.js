window.KVN = window.KVN || {};

/**
 * transitions-metadata.js
 *
 * Same idea as effects-metadata.js, but for transitions (a separate host
 * API — see host/ppro.jsx's kvnListTransitions/kvnApplyTransition).
 * Scoped to Premiere's documented "classic" transition set — the ones
 * confirmed present across Premiere versions. Newer bundled
 * Film Impact-branded transitions ("Block Motion Impacts" etc.) are
 * NOT included here since their presence/matching isn't confirmed on
 * this host; if your Premiere has them, they're still fully searchable
 * by their own real name via kvnListTransitions(), just without a
 * synonym overlay.
 */

window.KVN.TransitionsMetadata = [
  // ---------- Dissolve ----------
  {
    names: ["Cross Dissolve", "Dissolução cruzada"],
    category: "Dissolve",
    keywords: [
      "dissolve", "fade", "crossfade", "blend", "mix",
      "dissolução", "dissolver", "transição suave", "misturar",
      "esmaecer", "fundir cenas",
    ],
  },
  {
    names: ["Additive Dissolve", "Dissolução aditiva"],
    category: "Dissolve",
    keywords: [
      "dissolve", "fade", "bright dissolve", "light blend",
      "dissolução", "dissolução aditiva", "clarear na transição",
      "transição clara",
    ],
  },
  {
    names: ["Film Dissolve", "Dissolução de filme"],
    category: "Dissolve",
    keywords: [
      "dissolve", "film look", "cinematic fade",
      "dissolução", "dissolução de filme", "transição cinematográfica",
      "efeito de filme",
    ],
  },
  {
    names: ["Non-Additive Dissolve", "Dissolução não aditiva"],
    category: "Dissolve",
    keywords: [
      "dissolve", "luminance dissolve", "fade",
      "dissolução", "dissolução não aditiva", "transição por luminância",
    ],
  },
  {
    names: ["Dip To Black", "Para preto"],
    category: "Dissolve",
    keywords: [
      "fade to black", "black fade", "dip black", "abertura em preto",
      "fade para preto", "para preto", "escurecer", "sumir no preto",
      "abrir do preto",
    ],
  },
  {
    names: ["Dip To White", "Para branco"],
    category: "Dissolve",
    keywords: [
      "fade to white", "white fade", "dip white",
      "fade para branco", "para branco", "clarear até sumir",
      "abrir do branco",
    ],
  },
  {
    names: ["Dip To Color", "Para cor"],
    category: "Dissolve",
    keywords: [
      "fade to color", "color fade", "dip color",
      "fade para cor", "para cor", "transição colorida",
    ],
  },
  {
    names: ["Morph Cut"],
    category: "Dissolve",
    keywords: [
      "morph cut", "seamless cut", "jump cut fix", "smooth talking head cut",
      "corte suave", "corte sem salto", "remover corte seco",
      "suavizar corte de fala",
    ],
  },
  {
    names: ["Luma Fade", "Atenuação de Luma"],
    category: "Dissolve",
    keywords: [
      "luma fade", "luminance fade",
      "atenuação de luma", "esmaecer por luminância", "fade por brilho",
    ],
  },

  // ---------- Iris ----------
  {
    names: ["Iris Round"],
    category: "Iris",
    keywords: [
      "iris", "circle wipe", "round wipe", "spotlight transition",
      "íris", "íris redonda", "abertura circular", "abertura redonda",
      "efeito de câmera antiga",
    ],
  },
  {
    names: ["Iris Box"],
    category: "Iris",
    keywords: [
      "iris", "box wipe", "square wipe", "rectangle wipe",
      "íris", "íris quadrada", "abertura em caixa", "abertura retangular",
    ],
  },
  {
    names: ["Iris Diamond"],
    category: "Iris",
    keywords: [
      "iris", "diamond wipe",
      "íris", "íris diamante", "abertura em losango", "abertura diamante",
    ],
  },
  {
    names: ["Iris Cross"],
    category: "Iris",
    keywords: [
      "iris", "cross wipe", "plus wipe",
      "íris", "íris cruzada", "abertura em cruz",
    ],
  },

  // ---------- Page Peel ----------
  {
    names: ["Page Peel"],
    category: "Page Peel",
    keywords: [
      "page peel", "page curl", "paper peel",
      "virada de página", "descolar página", "efeito de papel",
      "dobrar página",
    ],
  },
  {
    names: ["Page Turn", "Virada de página"],
    category: "Page Peel",
    keywords: [
      "page turn", "book page", "flip page",
      "virada de página", "virar página", "efeito de livro",
    ],
  },

  // ---------- Slide ----------
  {
    names: ["Slide"],
    category: "Slide",
    keywords: [
      "slide", "swipe", "push aside",
      "deslizar", "deslize", "arrastar tela", "transição deslizante",
    ],
  },
  {
    names: ["Band Slide", "Movimento de deslocamento"],
    category: "Slide",
    keywords: [
      "band slide", "strips slide",
      "deslizar em faixas", "deslize em tiras", "faixas deslizantes",
    ],
  },
  {
    names: ["Center Split"],
    category: "Slide",
    keywords: [
      "center split", "split apart", "divide and slide",
      "divisão central", "dividir ao meio", "separar do centro",
    ],
  },
  {
    names: ["Push"],
    category: "Slide",
    keywords: [
      "push", "slide push", "shove aside",
      "empurrar", "empurrão", "transição de empurrar", "deslizar empurrando",
    ],
  },
  {
    names: ["Split"],
    category: "Slide",
    keywords: [
      "split", "divide screen",
      "dividir tela", "divisão", "separar tela",
    ],
  },
  {
    names: ["Whip"],
    category: "Slide",
    keywords: [
      "whip pan", "whip transition", "fast blur transition", "smash cut blur",
      "chicotada", "transição rápida", "borrão rápido", "corte com desfoque",
    ],
  },

  // ---------- Wipe ----------
  {
    names: ["Band Wipe"],
    category: "Wipe",
    keywords: [
      "wipe", "band wipe", "strip wipe",
      "abertura", "abertura em faixas", "cortina em tiras",
    ],
  },
  {
    names: ["Barn Doors"],
    category: "Wipe",
    keywords: [
      "barn doors", "double door wipe",
      "portas", "abertura de portas", "cortina dupla",
    ],
  },
  {
    names: ["Checker Wipe"],
    category: "Wipe",
    keywords: [
      "checker wipe", "checkerboard transition",
      "abertura em xadrez", "xadrez", "quadriculado",
    ],
  },
  {
    names: ["CheckerBoard"],
    category: "Wipe",
    keywords: [
      "checkerboard", "checker pattern",
      "tabuleiro de xadrez", "quadriculado", "xadrez",
    ],
  },
  {
    names: ["Clock Wipe", "Abertura em relógio"],
    category: "Wipe",
    keywords: [
      "clock wipe", "radial sweep", "pie wipe",
      "abertura em relógio", "ponteiro de relógio", "abertura radial giratória",
    ],
  },
  {
    names: ["Inset"],
    category: "Wipe",
    keywords: [
      "inset wipe", "corner wipe",
      "abertura por canto", "moldura interna",
    ],
  },
  {
    names: ["Paint Splatter"],
    category: "Wipe",
    keywords: [
      "paint splatter", "splash transition", "ink splatter",
      "respingo de tinta", "efeito de tinta", "transição de tinta",
    ],
  },
  {
    names: ["Pinwheel"],
    category: "Wipe",
    keywords: [
      "pinwheel", "windmill wipe", "spinning wipe",
      "cata-vento", "abertura giratória", "moinho",
    ],
  },
  {
    names: ["Radial Wipe", "Abertura radial"],
    category: "Wipe",
    keywords: [
      "radial wipe", "circular sweep",
      "abertura radial", "varredura circular",
    ],
  },
  {
    names: ["Random Blocks", "Raios aleatórios"],
    category: "Wipe",
    keywords: [
      "random blocks", "mosaic transition", "block wipe",
      "blocos aleatórios", "transição em blocos", "mosaico de transição",
    ],
  },
  {
    names: ["Random Wipe"],
    category: "Wipe",
    keywords: [
      "random wipe", "random reveal",
      "abertura aleatória", "revelação aleatória",
    ],
  },
  {
    names: ["Spiral Boxes"],
    category: "Wipe",
    keywords: [
      "spiral boxes", "spiral wipe",
      "abertura em espiral", "blocos em espiral", "espiral",
    ],
  },
  {
    names: ["Venetian Blinds", "Persiana"],
    category: "Wipe",
    keywords: [
      "venetian blinds", "blinds transition", "stripes wipe",
      "persiana", "veneziana", "efeito persiana", "cortina listrada",
    ],
  },
  {
    names: ["Wedge Wipe"],
    category: "Wipe",
    keywords: [
      "wedge wipe", "pie slice wipe", "fan wipe",
      "abertura em fatia", "abertura em leque",
    ],
  },
  {
    names: ["Wipe", "Abertura suave"],
    category: "Wipe",
    keywords: [
      "wipe", "sweep transition", "linear wipe",
      "abertura", "abertura suave", "varredura", "transição de tela",
    ],
  },
  {
    names: ["Zig-Zag Blocks"],
    category: "Wipe",
    keywords: [
      "zigzag", "zig-zag blocks", "jagged wipe",
      "abertura em zigue-zague", "blocos irregulares",
    ],
  },
  {
    names: ["Neon Wipe", "Abertura neon"],
    category: "Wipe",
    keywords: [
      "neon wipe", "glow wipe",
      "abertura neon", "abertura brilhante", "transição neon",
    ],
  },
  {
    names: ["Panel Wipe", "Abertura de painel"],
    category: "Wipe",
    keywords: [
      "panel wipe", "sliding panels",
      "abertura de painel", "painéis deslizantes", "transição em painéis",
    ],
  },
  {
    names: ["Plateau Wipe", "Abertura de platô"],
    category: "Wipe",
    keywords: [
      "plateau wipe", "flat top wipe",
      "abertura de platô", "abertura plana",
    ],
  },
  {
    names: ["Soft Wipe", "Abertura suave"],
    category: "Wipe",
    keywords: [
      "soft wipe", "gentle wipe", "smooth wipe",
      "abertura suave", "transição suave",
    ],
  },
  {
    names: ["Star Wipe", "Abertura de estrela"],
    category: "Wipe",
    keywords: [
      "star wipe",
      "abertura de estrela", "estrela", "transição em estrela",
    ],
  },
  {
    names: ["Stretch Wipe", "Abertura esticada"],
    category: "Wipe",
    keywords: [
      "stretch wipe", "elastic wipe",
      "abertura esticada", "abertura elástica",
    ],
  },
  {
    names: ["Linear Wipe", "Abertura linear"],
    category: "Wipe",
    keywords: [
      "linear wipe", "straight line wipe",
      "abertura linear", "abertura em linha reta",
    ],
  },

  // ---------- Zoom ----------
  {
    names: ["Cross Zoom"],
    category: "Zoom",
    keywords: [
      "cross zoom", "zoom transition", "zoom blur transition",
      "zoom cruzado", "transição de zoom", "zoom rápido",
    ],
  },
];
