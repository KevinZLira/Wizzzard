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
 *
 * Every entry keeps at least ~20 keyword variations (see
 * effects-metadata.js's header for the same rationale) so search finds
 * a transition from however someone actually types it.
 */

window.KVN.TransitionsMetadata = [
  // ---------- Dissolve ----------
  {
    names: ["Cross Dissolve", "Dissolução cruzada"],
    category: "Dissolve",
    keywords: [
      "dissolve", "fade", "crossfade", "blend", "mix", "cross fade", "cross dissolve transition", "smooth transition",
      "dissolução", "dissolver", "transição suave", "misturar",
      "esmaecer", "fundir cenas", "transição clássica", "dissolvência",
      "fundir imagens", "misturar cenas", "transição padrão", "corte suave entre cenas",
      "transição básica do premiere", "misturar dois clipes",
    ],
  },
  {
    names: ["Additive Dissolve", "Dissolução aditiva"],
    category: "Dissolve",
    keywords: [
      "dissolve", "fade", "bright dissolve", "light blend", "additive dissolve transition", "bright blend",
      "dissolução", "dissolução aditiva", "clarear na transição",
      "transição clara", "dissolvência clara", "transição luminosa",
      "mistura clara entre cenas", "fundir com brilho", "transição com estouro de luz",
      "dissolvência aditiva de brilho", "fundir cenas com clareamento",
      "transição com flash de luz", "dissolver clareando a imagem", "fusão luminosa entre clipes",
    ],
  },
  {
    names: ["Film Dissolve", "Dissolução de filme"],
    category: "Dissolve",
    keywords: [
      "dissolve", "film look", "cinematic fade", "film dissolve transition", "cinematic dissolve",
      "dissolução", "dissolução de filme", "transição cinematográfica",
      "efeito de filme", "transição de cinema", "dissolvência de filme",
      "transição estilo filme antigo", "fundir como filme", "dissolução estilo cinema",
      "transição de rolo de filme", "dissolvência de longa metragem",
      "efeito de transição de cinema clássico", "fundir cenas como longa", "dissolvência com grão de filme",
      "transição de cinema antigo",
    ],
  },
  {
    names: ["Non-Additive Dissolve", "Dissolução não aditiva"],
    category: "Dissolve",
    keywords: [
      "dissolve", "luminance dissolve", "fade", "non additive dissolve", "luminance blend",
      "dissolução", "dissolução não aditiva", "transição por luminância",
      "dissolvência por brilho", "transição de luminância",
      "fundir por brilho da imagem", "dissolução baseada em brilho",
      "transição usando luminosidade", "mistura por valor de luz",
      "dissolver sem somar cores", "fusão por tom de cinza", "transição técnica de luminância",
      "dissolvência não somada", "transição sem aditivo de luz", "dissolvência de contraste puro",
    ],
  },
  {
    names: ["Dip To Black", "Para preto"],
    category: "Dissolve",
    keywords: [
      "fade to black", "black fade", "dip black", "abertura em preto", "fade out black", "fade black transition",
      "fade para preto", "para preto", "escurecer", "sumir no preto",
      "abrir do preto", "fade preto", "escurecer tela", "transição pro preto",
      "acabar com tela preta", "sumir na tela preta", "fade final preto",
      "transição de fim de cena escurecendo", "terminar em preto", "começar do preto",
      "fade de abertura escuro",
    ],
  },
  {
    names: ["Dip To White", "Para branco"],
    category: "Dissolve",
    keywords: [
      "fade to white", "white fade", "dip white", "fade out white", "fade white transition",
      "fade para branco", "para branco", "clarear até sumir",
      "abrir do branco", "fade branco", "clarear tela", "transição pro branco",
      "sumir na tela branca", "estourar de luz", "fade de clareamento total",
      "transição clareando até sumir", "terminar em branco", "começar do branco",
      "fade de flash branco", "sumir totalmente clareando",
    ],
  },
  {
    names: ["Dip To Color", "Para cor"],
    category: "Dissolve",
    keywords: [
      "fade to color", "color fade", "dip color", "fade out color", "fade color transition",
      "fade para cor", "para cor", "transição colorida", "sumir em uma cor",
      "fade para tela colorida", "escurecer para cor específica",
      "transição pra tela de cor", "sumir numa cor sólida", "dissolver para cor customizada",
      "terminar numa cor", "começar de uma cor", "fade colorido personalizado",
      "sumir em tela de cor sólida", "fade colorido de fundo", "transição de saída colorida",
    ],
  },
  {
    names: ["Morph Cut", "Recorte de metamorfose"],
    category: "Dissolve",
    keywords: [
      "morph cut", "seamless cut", "jump cut fix", "smooth talking head cut", "morph transition", "seamless morph",
      "corte suave", "corte sem salto", "remover corte seco",
      "suavizar corte de fala", "recorte de metamorfose", "corte de entrevista suave",
      "consertar jump cut", "transição de rosto suave", "esconder corte de fala",
      "suavizar corte de entrevista", "corte invisível de fala",
      "transição de podcast suave", "esconder corte abrupto", "corte de vlog suave",
    ],
  },
  {
    names: ["Luma Fade", "Atenuação de Luma"],
    category: "Dissolve",
    keywords: [
      "luma fade", "luminance fade", "luma fade transition", "luma based fade",
      "atenuação de luma", "esmaecer por luminância", "fade por brilho",
      "fade de luminância", "transição por luz", "esmaecer com base no brilho",
      "atenuar por luma", "fade de intensidade luminosa", "dissolvência por valor de luma",
      "transição por canal de luminância", "atenuação técnica de luz", "fade por brilho da cena",
      "esmaecimento por luminância", "atenuação suave de luz", "esmaecer suavemente pela luz", "fade técnico por luz pura",
    ],
  },

  // ---------- Iris ----------
  {
    names: ["Iris Round", "Círculo íris"],
    category: "Iris",
    keywords: [
      "iris", "circle wipe", "round wipe", "rounded", "spotlight transition", "circular wipe", "iris circle", "round reveal",
      "íris", "íris redonda", "abertura circular", "abertura redonda",
      "arredondado", "efeito de câmera antiga", "íris circular", "abertura em círculo",
      "efeito de holofote", "transição circular", "abertura tipo lente antiga",
      "efeito de câmera de cinema antigo", "transição em forma de bola",
    ],
  },
  {
    names: ["Iris Box", "Caixa íris"],
    category: "Iris",
    keywords: [
      "iris", "box wipe", "square wipe", "rectangle wipe", "iris box transition", "box iris", "square reveal",
      "íris", "íris quadrada", "abertura em caixa", "abertura retangular",
      "abertura quadrada", "transição em caixa", "íris retangular",
      "abertura tipo quadro", "transição quadriculada de íris",
      "abertura em formato de janela", "revelação em quadrado",
      "abertura tipo caixa fechando", "transição em formato de tv antiga",
    ],
  },
  {
    names: ["Iris Diamond", "Diamante íris"],
    category: "Iris",
    keywords: [
      "iris", "diamond wipe", "iris diamond transition", "rhombus wipe", "diamond reveal",
      "íris", "íris diamante", "abertura em losango", "abertura diamante",
      "abertura em forma de diamante", "transição em losango", "íris em forma de diamante",
      "abertura tipo pedra preciosa", "revelação em formato de losango",
      "transição em forma de joia", "abertura em forma de baralho", "íris losangular",
      "revelação romboidal", "abertura tipo pedra de xadrez", "íris em formato de baralho",
    ],
  },
  {
    names: ["Iris Cross", "Cruz íris"],
    category: "Iris",
    keywords: [
      "iris", "cross wipe", "plus wipe", "iris cross transition", "cross iris", "plus sign reveal",
      "íris", "íris cruzada", "abertura em cruz", "abertura tipo cruz",
      "transição em formato de cruz", "íris em forma de mais",
      "abertura tipo sinal de mais", "revelação em cruz", "transição em formato de x",
      "abertura em formato de soma", "íris cruzada revelando",
      "abertura em formato de xis", "revelação central cruzada", "íris tipo cruz de malta",
    ],
  },

  // ---------- Page Peel ----------
  {
    names: ["Page Peel", "Passagem de página"],
    category: "Page Peel",
    keywords: [
      "page peel", "page curl", "paper peel", "page peel transition", "curling page",
      "virada de página", "descolar página", "efeito de papel",
      "dobrar página", "passagem de página", "efeito de folha virando",
      "descascar página", "transição de livro virando página",
      "efeito de papel se descolando", "canto de página levantando",
      "efeito de caderno virando", "página descolando do canto",
      "efeito de adesivo descolando", "canto levantando como papel", "transição de papel enrolando",
    ],
  },
  {
    names: ["Page Turn", "Virada de página"],
    category: "Page Peel",
    keywords: [
      "page turn", "book page", "flip page", "page turn transition", "book flip",
      "virada de página", "virar página", "efeito de livro",
      "folhear", "efeito de folhear livro", "virar folha",
      "transição de folha de livro", "efeito de revista folheando",
      "página virando como livro", "efeito de álbum virando página",
      "virar página de catálogo", "folhear revista digital",
      "efeito de agenda virando página", "virar página de caderno", "transição de página de livro clássico",
    ],
  },

  // ---------- Slide ----------
  {
    names: ["Slide", "Deslizar"],
    category: "Slide",
    keywords: [
      "slide", "swipe", "push aside", "slide transition", "slide effect", "sliding transition",
      "deslizar", "deslize", "arrastar tela", "transição deslizante",
      "deslizamento", "efeito de deslizar", "arrastar imagem", "deslizar tela",
      "transição de arrastar", "corte deslizante", "deslizar clipe pro lado",
      "efeito de arrastar cena", "cena deslizando pra fora", "transição de slide simples",
    ],
  },
  {
    names: ["Band Slide", "Movimento de deslocamento"],
    category: "Slide",
    keywords: [
      "band slide", "strips slide", "band slide transition", "banded slide", "strip transition",
      "deslizar em faixas", "deslize em tiras", "faixas deslizantes",
      "movimento de deslocamento", "transição em tiras", "deslizamento em bandas",
      "deslizar em listras", "transição de faixas deslizando",
      "efeito de tiras se movendo", "deslocar em faixas paralelas",
      "efeito de barras deslizando lado a lado", "transição de listras horizontais",
      "efeito de tiras verticais deslizando", "cortina de faixas movendo", "transição de bandas horizontais",
    ],
  },
  {
    names: ["Center Split", "Divisão central"],
    category: "Slide",
    keywords: [
      "center split", "split apart", "divide and slide", "center split transition", "split from center",
      "divisão central", "dividir ao meio", "separar do centro",
      "abrir do centro", "transição de divisão", "separar tela ao meio",
      "efeito de cortina dupla", "abrir dos dois lados",
      "efeito de portão abrindo do meio", "dividir imagem em duas partes",
      "abrir tela ao meio pros lados", "efeito de elevador abrindo do centro",
      "efeito de porta dupla abrindo do meio", "abertura simétrica central", "divisão a partir do centro da tela",
    ],
  },
  {
    names: ["Push", "Empurrar"],
    category: "Slide",
    keywords: [
      "push", "slide push", "shove aside", "push transition", "push effect", "push slide",
      "empurrar", "empurrão", "transição de empurrar", "deslizar empurrando",
      "empurrar tela", "efeito de empurrão", "transição empurrada",
      "arrastar empurrando cena", "empurrar imagem pra fora",
      "cena empurrando a outra", "efeito de empurrar de lado",
      "uma cena empurrando pra fora a outra", "transição de empurrão lateral", "efeito de empurrar cena inteira",
    ],
  },
  {
    names: ["Split", "Dividir"],
    category: "Slide",
    keywords: [
      "split", "divide screen", "split transition", "split screen transition", "screen split",
      "dividir tela", "divisão", "separar tela", "dividir imagem",
      "efeito de tela dividida", "transição de divisão de tela",
      "separar em duas partes", "cortar tela ao meio",
      "efeito de tela partida", "dividir cena em partes",
      "efeito split screen", "dividir em múltiplas telas",
      "efeito de tela rachada", "dividir em partes iguais", "efeito de abertura em duas metades",
    ],
  },
  {
    names: ["Whip", "Chicote"],
    category: "Slide",
    keywords: [
      "whip pan", "whip transition", "fast blur transition", "smash cut blur", "whip pan transition", "whip zoom",
      "chicotada", "transição rápida", "borrão rápido", "corte com desfoque",
      "chicote", "efeito de câmera rápida", "transição borrada rápida",
      "efeito de whip pan", "corte com movimento rápido de câmera",
      "corte estilo vlog rápido", "transição de câmera girando rápido",
      "efeito de virada de câmera", "transição de pan rápido borrado", "efeito de chicote de câmera rápido",
    ],
  },

  // ---------- Wipe ----------
  {
    names: ["Band Wipe", "Listra"],
    category: "Wipe",
    keywords: [
      "wipe", "band wipe", "strip wipe", "band wipe transition", "striped wipe", "stripe reveal",
      "abertura", "abertura em faixas", "cortina em tiras",
      "listra", "transição em listras", "abertura listrada", "cortina em faixas",
      "efeito de tiras deslizando", "transição de barras",
      "abertura em barras verticais", "efeito de persiana em tiras",
      "abertura em bandas coloridas", "transição de faixas paralelas", "revelação em barras deslizantes",
    ],
  },
  {
    names: ["Barn Doors", "Abertura de portas"],
    category: "Wipe",
    keywords: [
      "barn doors", "double door wipe", "barn door transition", "double doors", "barn door reveal",
      "portas", "abertura de portas", "cortina dupla",
      "efeito de portas abrindo", "abrir como portas", "transição tipo cortina",
      "abertura tipo palco", "portas duplas se abrindo",
      "efeito de cortina de teatro", "abrir tipo elevador duplo",
      "abertura de granja", "efeito de portão de celeiro", "transição de portas de estábulo", "abertura tipo cortina dupla de teatro", "efeito de portas se afastando",
    ],
  },
  {
    names: ["Checker Wipe"],
    category: "Wipe",
    keywords: [
      "checker wipe", "checkerboard transition", "checker wipe transition", "checkers reveal", "checker pattern wipe",
      "abertura em xadrez", "xadrez", "quadriculado", "transição quadriculada",
      "efeito de tabuleiro", "abertura tipo xadrez", "quadros revelando",
      "transição em quadrados alternados", "abertura de damas",
      "efeito quadriculado revelando cena", "abertura tipo jogo de damas",
      "revelação em blocos de xadrez", "transição tipo jogo de tabuleiro", "revelação quadriculada progressiva", "efeito de xadrez revelando cena",
    ],
  },
  {
    names: ["CheckerBoard"],
    category: "Wipe",
    keywords: [
      "checkerboard", "checker pattern", "checkerboard transition", "checker grid", "checkerboard reveal",
      "tabuleiro de xadrez", "quadriculado", "xadrez", "efeito tabuleiro",
      "transição em grade", "padrão quadriculado", "efeito de grade de quadrados",
      "transição tipo tabuleiro de damas", "grade quadriculada revelando",
      "efeito de blocos quadrados alternados", "revelação em grade alternada",
      "efeito de tabuleiro completo", "padrão intercalado revelando", "transição em grade completa", "efeito de tabuleiro alternado",
    ],
  },
  {
    names: ["Clock Wipe", "Abertura em relógio"],
    category: "Wipe",
    keywords: [
      "clock wipe", "radial sweep", "pie wipe", "clock wipe transition", "clockwise wipe", "clock hand reveal",
      "abertura em relógio", "ponteiro de relógio", "abertura radial giratória",
      "transição tipo ponteiro", "efeito de relógio girando", "varredura tipo relógio",
      "abertura em formato de pizza", "transição circular giratória",
      "efeito de ponteiro de relógio girando", "revelação tipo relógio analógico",
      "abertura tipo contagem de tempo", "transição em formato de relógio de sol", "abertura tipo cronômetro girando", "efeito de contagem regressiva circular",
    ],
  },
  {
    names: ["Inset"],
    category: "Wipe",
    keywords: [
      "inset wipe", "corner wipe", "inset wipe transition", "corner reveal", "corner box wipe",
      "abertura por canto", "moldura interna", "abertura pelo canto",
      "transição de canto", "efeito de moldura revelando", "abrir a partir do canto",
      "revelar pelo canto da tela", "abertura em janela interna",
      "efeito de moldura dentro da tela", "abertura tipo foto emoldurada",
      "revelação a partir do canto superior", "moldura menor dentro da tela", "revelação em janela pequena", "efeito de foto dentro de foto", "abertura em retângulo interno",
    ],
  },
  {
    names: ["Paint Splatter"],
    category: "Wipe",
    keywords: [
      "paint splatter", "splash transition", "ink splatter", "paint splatter transition", "splatter reveal", "ink splash",
      "respingo de tinta", "efeito de tinta", "transição de tinta",
      "salpico de tinta", "efeito de respingo", "transição artística de tinta",
      "efeito de tinta espirrando", "revelação com respingos coloridos",
      "efeito de aquarela espirrando", "transição de pintura jogada", "salpicos de tinta na tela", "efeito de tinta jogada na tela", "transição artística com respingos", "salpico colorido revelando",
    ],
  },
  {
    names: ["Pinwheel"],
    category: "Wipe",
    keywords: [
      "pinwheel", "windmill wipe", "spinning wipe", "pinwheel transition", "windmill reveal", "spinning fan wipe",
      "cata-vento", "abertura giratória", "moinho", "efeito cata-vento",
      "transição em moinho de vento", "abertura girando", "efeito de hélice girando",
      "transição tipo ventilador", "abertura em pás giratórias",
      "revelação em formato de moinho", "efeito de hélice de avião girando", "abertura tipo ventilador girando", "transição em pás rotativas", "efeito de catavento girando rápido",
    ],
  },
  {
    names: ["Radial Wipe", "Abertura radial"],
    category: "Wipe",
    keywords: [
      "radial wipe", "circular sweep", "radial wipe transition", "radial sweep reveal", "circular radial wipe",
      "abertura radial", "varredura circular", "transição em leque circular",
      "abertura girando do centro", "efeito de varredura radial",
      "transição tipo relógio sem ponteiro", "abertura circular giratória",
      "revelação em formato de leque", "varredura a partir do centro", "abertura em formato de sol", "transição em formato de roda", "abertura em ângulo girando", "efeito de compasso abrindo", "revelação circular progressiva", "transição tipo bússola",
    ],
  },
  {
    names: ["Random Blocks", "Raios aleatórios"],
    category: "Wipe",
    keywords: [
      "random blocks", "mosaic transition", "block wipe", "random blocks transition", "block reveal", "random block wipe",
      "blocos aleatórios", "transição em blocos", "mosaico de transição",
      "efeito de blocos surgindo", "transição tipo quebra-cabeça", "blocos revelando aleatoriamente",
      "efeito de pixels aparecendo", "revelação por blocos randômicos",
      "transição tipo mosaico quebrado", "efeito de blocos surgindo sem padrão", "revelação tipo estática de tv", "transição em pixels quebrados", "blocos quadrados aparecendo aleatoriamente", "efeito de tela quebrando em blocos",
    ],
  },
  {
    names: ["Random Wipe"],
    category: "Wipe",
    keywords: [
      "random wipe", "random reveal", "random wipe transition", "random pattern reveal", "random pattern wipe",
      "abertura aleatória", "revelação aleatória", "transição aleatória",
      "efeito de revelação randômica", "abertura sem padrão fixo",
      "transição imprevisível", "revelar de forma aleatória",
      "abertura de padrão randômico", "transição surpresa", "abertura sem direção fixa", "transição totalmente imprevisível", "revelação por partes aleatórias", "efeito de aparecer aos pedaços", "transição caótica de tela", "abertura desorganizada",
    ],
  },
  {
    names: ["Spiral Boxes"],
    category: "Wipe",
    keywords: [
      "spiral boxes", "spiral wipe", "spiral boxes transition", "spiral block reveal", "spiral pattern wipe",
      "abertura em espiral", "blocos em espiral", "espiral",
      "transição espiral de blocos", "efeito de blocos girando em espiral",
      "revelação em espiral", "abertura tipo redemoinho de blocos",
      "transição em blocos girando", "efeito de espiral de quadrados", "blocos girando para fora", "efeito de espiral de caixas quadradas", "revelação em espiral de blocos", "transição tipo redemoinho quadriculado", "efeito de blocos rodopiando", "abertura em círculo de quadrados",
    ],
  },
  {
    names: ["Venetian Blinds", "Persiana"],
    category: "Wipe",
    keywords: [
      "venetian blinds", "blinds transition", "stripes wipe", "venetian blinds transition", "blind wipe", "blinds reveal",
      "persiana", "veneziana", "efeito persiana", "cortina listrada",
      "transição tipo persiana", "efeito de cortina veneziana", "abertura tipo veneziana",
      "listras horizontais revelando", "efeito de blinds abrindo",
      "transição de cortina de escritório", "revelação em tiras horizontais alternadas", "transição tipo blinds de janela", "efeito de veneziana abrindo aos poucos", "cortina listrada horizontal",
    ],
  },
  {
    names: ["Wedge Wipe"],
    category: "Wipe",
    keywords: [
      "wedge wipe", "pie slice wipe", "fan wipe", "wedge wipe transition", "pie wipe reveal", "fan slice wipe",
      "abertura em fatia", "abertura em leque", "transição tipo fatia de pizza",
      "efeito de leque abrindo", "abertura em cunha", "revelação em formato de fatia",
      "transição tipo relógio em fatias", "abertura em formato de leque japonês",
      "efeito de fatia de torta", "abertura em formato de leque japonês", "transição em ângulo circular", "efeito de compasso em fatias", "revelação tipo relógio de sol em fatias", "abertura circular em cunha",
    ],
  },
  {
    // Was wrongly guessed as "Abertura suave" before — that's actually
    // Soft Wipe's real PT-BR name (confirmed live), and the collision
    // meant one of the two entries silently never matched. "Abertura" is
    // this one's confirmed real name.
    names: ["Wipe", "Abertura"],
    category: "Wipe",
    keywords: [
      "wipe", "sweep transition", "linear wipe", "wipe transition", "basic wipe", "generic wipe",
      "abertura", "varredura", "transição de tela", "transição básica",
      "abertura padrão", "efeito de varredura simples", "transição tipo cortina reta",
      "abertura em linha reta simples", "transição clássica de abertura",
      "efeito de cortina passando na tela", "transição de tela simples", "efeito de varredura padrão", "abertura genérica de tela", "revelação em linha simples",
    ],
  },
  {
    names: ["Zig-Zag Blocks"],
    category: "Wipe",
    keywords: [
      "zigzag", "zig-zag blocks", "jagged wipe", "zigzag blocks transition", "jagged reveal", "zigzag pattern",
      "abertura em zigue-zague", "blocos irregulares", "transição em ziguezague",
      "efeito de blocos irregulares", "abertura serrilhada", "revelação em zigzag",
      "transição tipo dente de serra", "abertura em padrão dentado",
      "efeito de linha quebrada revelando", "revelação em padrão dentado", "transição tipo raio quebrado", "efeito de linha serrilhada", "abertura em formato de raio", "transição em zigzag irregular",
    ],
  },
  {
    names: ["Neon Wipe", "Abertura neon"],
    category: "Wipe",
    keywords: [
      "neon wipe", "glow wipe", "neon wipe transition", "glowing wipe", "neon glow reveal",
      "abertura neon", "abertura brilhante", "transição neon",
      "efeito de luz neon", "transição brilhante", "abertura luminosa",
      "efeito de contorno neon revelando", "transição estilo balada",
      "abertura com brilho fluorescente", "transição brilhante estilo cyberpunk", "revelação luminosa colorida", "efeito de contorno iluminado", "transição estilo sinal de néon", "abertura com efeito de luz de rua neon", "efeito de tubo de neon aceso",
    ],
  },
  {
    names: ["Panel Wipe", "Abertura de painel"],
    category: "Wipe",
    keywords: [
      "panel wipe", "sliding panels", "panel wipe transition", "sliding panel reveal", "panel slide wipe",
      "abertura de painel", "painéis deslizantes", "transição em painéis",
      "efeito de painéis se abrindo", "abertura tipo elevador", "painéis deslizando pros lados",
      "transição de placas deslizantes", "efeito de portas de elevador",
      "abertura tipo painéis de vidro", "efeito de painéis de vidro deslizando", "transição tipo cortina de metal", "abertura em placas móveis", "revelação por painéis paralelos", "efeito de portas corrediças", "transição em compartimentos",
    ],
  },
  {
    names: ["Plateau Wipe", "Abertura de platô"],
    category: "Wipe",
    keywords: [
      "plateau wipe", "flat top wipe", "plateau wipe transition", "flat wipe", "flat top reveal",
      "abertura de platô", "abertura plana", "transição de platô",
      "efeito de abertura com topo reto", "abertura em degrau",
      "transição tipo mesa", "revelação com topo plano",
      "abertura com parte de cima reta", "efeito de plataforma revelando", "abertura com platô no topo", "transição em formato de mesa", "revelação com parte plana no meio", "abertura com topo nivelado", "transição em forma de degrau plano", "efeito de patamar revelando cena",
    ],
  },
  {
    names: ["Soft Wipe", "Abertura suave"],
    category: "Wipe",
    keywords: [
      "soft wipe", "gentle wipe", "smooth wipe", "soft wipe transition", "gentle reveal", "smooth reveal",
      "abertura suave", "transição suave", "abertura delicada",
      "efeito de abertura macia", "transição gentil", "abertura sem contraste forte",
      "revelação suave e gradual", "transição delicada entre cenas",
      "abertura com borda esfumaçada", "transição sem bordas duras", "abertura esfumaçada gradual", "revelação suave sem contraste", "efeito de abertura desfocada", "transição delicada e gradual",
    ],
  },
  {
    names: ["Star Wipe", "Abertura em estrela", "Abertura de estrela"],
    category: "Wipe",
    keywords: [
      "star wipe", "star wipe transition", "star shape reveal", "star pattern wipe",
      "abertura de estrela", "estrela", "transição em estrela",
      "abertura em formato de estrela", "efeito de estrela abrindo",
      "revelação em forma de estrela", "transição tipo estrela brilhante",
      "abertura estrelada", "efeito de estrela se expandindo", "abertura tipo estrela do céu", "transição em formato de asterisco", "revelação estelar", "efeito de estrela crescendo", "abertura em formato de estrela cadente", "transição tipo brilho estelar", "efeito de estrela se abrindo",
    ],
  },
  {
    names: ["Stretch Wipe", "Abertura esticada"],
    category: "Wipe",
    keywords: [
      "stretch wipe", "elastic wipe", "stretch wipe transition", "elastic reveal", "stretching wipe",
      "abertura esticada", "abertura elástica", "transição esticada",
      "efeito de esticar tela", "abertura tipo elástico", "revelação esticando a imagem",
      "transição com efeito de borracha", "efeito de imagem esticando pros lados",
      "abertura tipo goma esticando", "efeito de imagem esticando pros dois lados", "transição tipo chiclete esticando", "revelação por estiramento", "abertura elástica progressiva", "efeito de puxar a imagem", "transição de esticar tela",
    ],
  },
  {
    names: ["Linear Wipe", "Abertura linear"],
    category: "Wipe",
    keywords: [
      "linear wipe", "straight line wipe", "linear wipe transition", "straight wipe", "line reveal",
      "abertura linear", "abertura em linha reta", "transição linear",
      "efeito de linha reta revelando", "abertura reta simples", "varredura em linha reta",
      "transição em linha direta", "abertura em diagonal reta",
      "efeito de linha atravessando a tela", "abertura em linha simples reta", "transição direta em linha", "revelação em faixa reta", "efeito de linha cortando a tela", "abertura tipo régua", "transição reta padrão",
    ],
  },

  // ---------- Zoom ----------
  {
    names: ["Cross Zoom", "Zoom cruzado"],
    category: "Zoom",
    keywords: [
      "cross zoom", "zoom transition", "zoom blur transition", "cross zoom transition", "zoom cross", "fast zoom transition",
      "zoom cruzado", "transição de zoom", "zoom rápido",
      "efeito de zoom borrado", "transição com zoom", "zoom dinâmico entre cenas",
      "efeito de zoom acelerado", "transição de zoom rápido borrado",
      "zoom estilo vlog", "efeito de zoom in e zoom out", "transição de zoom estilo youtube", "zoom acelerado entre cenas", "transição de zoom com corte rápido", "efeito de zoom estilo reels",
    ],
  },
];
