const STORAGE_CACHE_KEY = "lexico-diario-cache-v1";
const FAVORITES_CACHE_KEY = "lexico-diario-favoritos-v1";
const THEME_CACHE_KEY = "lexico-diario-tema-v1";

const PALAVRAS_BASE = [
  "saudade", "esperança", "algazarra", "efêmero", "resiliência", "serenidade",
  "eloquência", "intrepidez", "sutileza", "plenitude", "constância", "magnânimo",
  "morosidade", "inócuo", "perspicaz", "venerável", "sagaz", "prosaico",
  "idílico", "acanhado", "bucólico", "verossímil", "pujança", "altruísmo",
  "candura", "enigma", "jubilo", "lúgubre", "perenidade", "apaziguador",
  "desvelo", "complacente", "insólito", "retórica", "singelo", "felicidade",
  "amizade", "bondade", "coragem", "justiça", "liberdade", "sabedoria",
  "curiosidade", "paciência", "generosidade", "humildade", "disciplina", "sonho",
  "memória", "imaginação", "harmonia", "gentileza", "gratidão", "inspiração",
  "aventura", "criatividade", "equilíbrio", "autenticidade", "transformação",
  "desenvoltura", "intuição", "proximidade", "solenidade", "curtura", "alegria",
  "esperteza", "dignidade", "prudência", "solidariedade", "empatia", "compreensão",
  "determinação", "persistência", "otimismo", "confiança", "inspiração",
  "universo", "tempo", "natureza", "vida", "palavra", "silêncio", "pensamento",
  "conhecimento", "cuidado", "partilha", "acolhimento", "descoberta", "caminho",
  "ancestral", "aurora", "bravura", "carinho", "conquista", "delicadeza",
  "destino", "encanto", "flecha", "firmeza", "floresta", "graça", "honra",
  "hospitalidade", "inspiração", "inteireza", "legado", "leveza", "nobreza"
];

const PALAVRAS = Object.freeze([
  ...PALAVRAS_BASE,
  ...PALAVRAS_BASE,
  ...PALAVRAS_BASE.slice(0, 365 - PALAVRAS_BASE.length * 2)
]);

const CONTINGENCIA_LOCAL = {
  saudade: { pos: "substantivo feminino", definition: "Sentimento de falta ou ausência de alguém ou algo que se ama." },
  esperança: { pos: "substantivo feminino", definition: "Expectativa confiante de realização ou melhoria." },
  serenidade: { pos: "substantivo feminino", definition: "Estado de calma, tranquilidade e equilíbrio interior." },
  resiliência: { pos: "substantivo feminino", definition: "Capacidade de se adaptar e recuperar diante de dificuldades." },
  efêmero: { pos: "adjetivo", definition: "Que dura por pouco tempo; passageiro." },
  sagaz: { pos: "adjetivo", definition: "Que possui grande perspicácia e rapidez de raciocínio." }
};

async function fetchWithTimeout(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDicionarioAberto(palavra) {
  const url = `https://api.dicionario-aberto.net/word/${encodeURIComponent(palavra.toLowerCase())}`;
  const res = await fetchWithTimeout(url, 2500);
  if (!res) return null;

  try {
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const xmlStr = data[0].xml || "";
    const doc = new DOMParser().parseFromString(xmlStr, "text/xml");

    const defNode = doc.querySelector("sense > def");
    const gramNode = doc.querySelector("form > gramGrp") || doc.querySelector("gramGrp");
    const etymNode = doc.querySelector("etym");

    const rawDef = defNode ? defNode.textContent.replace(/\s+/g, " ").trim() : "";
    const cleanDef = rawDef.replace(/^[:\s-]+/, "").trim();

    return {
      source: "Dicionário Aberto",
      definition: cleanDef || null,
      pos: gramNode ? gramNode.textContent.trim().toLowerCase() : null,
      etymology: etymNode ? etymNode.textContent.replace(/\s+/g, " ").trim() : null
    };
  } catch {
    return null;
  }
}

async function fetchWikcionarioPT(palavra) {
  const title = palavra.toLowerCase();
  const url = `https://pt.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&origin=*`;
  const res = await fetchWithTimeout(url, 2500);
  if (!res) return null;

  try {
    const json = await res.json();
    const wikitext = json?.parse?.wikitext?.["*"];
    if (!wikitext) return null;

    const ptSectionMatch = wikitext.split(/==\s*\{\{-pt-\}\}\s*==/i)[1];
    if (!ptSectionMatch) return null;
    const ptBlock = ptSectionMatch.split(/\n==[^=]/)[0];

    let pos = null;
    const posMatch = ptBlock.match(/===\s*\{\{-(substantivo|adjetivo|verbo|advérbio)-\}\}\s*===/i);
    if (posMatch) pos = posMatch[1].toLowerCase();

    let definition = null;
    const defLines = ptBlock.split("\n").filter(l => /^#\s+[^*:]/.test(l));
    if (defLines.length > 0) {
      definition = defLines[0]
        .replace(/^#\s+/, "")
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, "$2")
        .replace(/''+/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    let synonyms = [];
    const synSection = ptBlock.split(/====\s*Sinônimos\s*====/i)[1];
    if (synSection) {
      const synBlock = synSection.split(/\n===/)[0];
      const links = [...synBlock.matchAll(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g)].map(m => m[1].trim());
      synonyms = [...new Set(links)].slice(0, 5);
    }

    let etymology = null;
    const etymSection = ptBlock.split(/===\s*Etimologia\s*===/i)[1];
    if (etymSection) {
      const etymLine = etymSection.split(/\n===/)[0].trim().split("\n")[0];
      etymology = etymLine
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, "$2")
        .replace(/''+/g, "")
        .trim();
    }

    return {
      source: "Wikcionário PT-BR",
      definition: definition || null,
      pos: pos || null,
      synonyms: synonyms.length ? synonyms : null,
      etymology: etymology || null
    };
  } catch {
    return null;
  }
}

function buildFallbackEntry(todayInfo) {
  const { word, dayNumber, totalWords, dateKey } = todayInfo;
  const localFallback = CONTINGENCIA_LOCAL[word.toLowerCase()] || {};

  return {
    dateKey,
    word,
    syllables: localFallback.syllables || separarSilabasSimples(word),
    pos: localFallback.pos || "vocábulo",
    definition:
      localFallback.definition ||
      `Vocábulo da língua portuguesa selecionado para o dia ${dayNumber} do calendário lexical.`,
    synonyms: localFallback.synonyms || ["expressão", "termo", "vocábulo"],
    antonyms: localFallback.antonyms || ["—"],
    etymology: localFallback.etymology || "Registro lexical da língua portuguesa.",
    example:
      localFallback.example ||
      `O uso preciso da palavra "${word}" enriquece a expressão escrita e oral.`,
    sourceLabel: "Acervo Lexical Local",
    isLiveApi: false,
    dayNumber,
    totalWords
  };
}

async function resolveDailyEntry() {
  const todayInfo = getWordForToday();
  const { word, dayNumber, totalWords, dateKey } = todayInfo;

  try {
    const cachedRaw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached && cached.dateKey === dateKey && cached.word === word) {
        return { ...cached, dayNumber, totalWords };
      }
    }
  } catch {
    // Ignora falha de leitura do cache
  }

  const baseEntry = buildFallbackEntry(todayInfo);

  try {
    const [daResult, wikResult] = await Promise.allSettled([
      fetchDicionarioAberto(word),
      fetchWikcionarioPT(word)
    ]);

    const da = daResult.status === "fulfilled" ? daResult.value : null;
    const wik = wikResult.status === "fulfilled" ? wikResult.value : null;

    const sourcesUsed = [];
    if (da && da.definition) sourcesUsed.push("Dicionário Aberto");
    if (wik && wik.definition) sourcesUsed.push("Wikcionário PT-BR");

    const enriched = {
      ...baseEntry,
      definition: (wik && wik.definition) || (da && da.definition) || baseEntry.definition,
      pos: (wik && wik.pos) || (da && da.pos) || baseEntry.pos,
      synonyms: (wik && wik.synonyms) || baseEntry.synonyms,
      etymology: (wik && wik.etymology) || (da && da.etymology) || baseEntry.etymology,
      sourceLabel: sourcesUsed.length
        ? `API Aberta: ${sourcesUsed.join(" + ")}`
        : "Acervo Lexical Local",
      isLiveApi: sourcesUsed.length > 0
    };

    try {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(enriched));
    } catch {
      // Ignora erro de escrita no storage
    }

    return enriched;
  } catch {
    return baseEntry;
  }
}

async function initDailyWord() {
  const card = document.getElementById("mainCard");
  card.classList.add("loading");

  // Renderiza imediatamente a base garantida para nunca travar em "Carregando..."
  const immediateEntry = buildFallbackEntry(getWordForToday());
  renderEntry(immediateEntry);

  try {
    const resolved = await resolveDailyEntry();
    renderEntry(resolved);
  } finally {
    card.classList.remove("loading");
  }
}

function getWordForToday() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayNumber = Math.floor(diff / 86400000);
  const dateKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
  const word = PALAVRAS[(dayNumber - 1) % PALAVRAS.length];

  return { word, dayNumber, totalWords: 365, dateKey };
}

function separarSilabasSimples(word) {
  const lower = word.toLowerCase();
  if (lower.length <= 3) return lower;
  return lower
    .replace(/([aeiouãõáéíóúâêô])(?=[^aeiouãõáéíóúâêô])/gi, "$1·")
    .replace(/·{2,}/g, "·");
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderTags(containerId, values) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();

  (values && values.length ? values : ["—"]).forEach((value) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = value;
    container.appendChild(tag);
  });
}

function renderEntry(entry) {
  setText("wordSyllables", entry.syllables || "—");
  setText("wordMain", entry.word);
  setText("wordPos", entry.pos || "vocábulo");
  setText("wordDefinition", entry.definition);
  setText("wordExample", entry.example);
  setText("wordEtymology", entry.etymology);
  setText("dayCycleText", `Dia ${entry.dayNumber} de ${entry.totalWords}`);

  renderTags("wordSynonyms", entry.synonyms);
  renderTags("wordAntonyms", entry.antonyms);

  const statusText = document.getElementById("apiStatusText");
  const statusDot = document.getElementById("apiStatusDot");
  if (statusText) {
    statusText.textContent = entry.isLiveApi
      ? entry.sourceLabel
      : "Acervo local ativo — consulta às APIs concluída";
  }
  if (statusDot) {
    statusDot.style.background = entry.isLiveApi ? "#1f9d68" : "#b45309";
  }

  updateBookmarkState(entry.word);
  window.currentEntry = entry;
}

function formatDate(now = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);
}

function startClock() {
  setText("currentDateText", formatDate());

  const updateCountdown = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const remaining = Math.max(0, next - now);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    setText(
      "countdownText",
      `Próxima palavra em ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    );
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function getFavorites() {
  try {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_CACHE_KEY) || "[]");
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(favorites));
  } catch {
    // A página continua funcional quando o storage não está disponível.
  }
}

function updateBookmarkState(word) {
  const favorites = getFavorites();
  const isSaved = favorites.some((item) => item.word === word);
  const button = document.getElementById("btnBookmark");
  if (button) button.classList.toggle("active", isSaved);
  setText("favCount", String(favorites.length));
}

function toggleFavorite() {
  const entry = window.currentEntry;
  if (!entry) return;

  const favorites = getFavorites();
  const index = favorites.findIndex((item) => item.word === entry.word);
  if (index >= 0) {
    favorites.splice(index, 1);
    showToast("Removida dos favoritos");
  } else {
    favorites.unshift({
      word: entry.word,
      pos: entry.pos,
      definition: entry.definition,
      dateKey: entry.dateKey
    });
    showToast("Salva nos favoritos");
  }

  saveFavorites(favorites);
  updateBookmarkState(entry.word);
}

function openFavorites() {
  const list = document.getElementById("favList");
  const favorites = getFavorites();
  if (!list) return;

  list.replaceChildren();
  if (favorites.length === 0) {
    const empty = document.createElement("p");
    empty.className = "fav-item-def";
    empty.textContent = "Nenhuma palavra salva ainda.";
    list.appendChild(empty);
  } else {
    favorites.forEach((item) => {
      const row = document.createElement("div");
      row.className = "fav-item";

      const text = document.createElement("div");
      const title = document.createElement("div");
      title.className = "fav-item-title";
      title.textContent = item.word;
      const definition = document.createElement("div");
      definition.className = "fav-item-def";
      definition.textContent = item.definition;
      text.append(title, definition);

      const remove = document.createElement("button");
      remove.className = "btn-icon";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remover ${item.word}`);
      remove.addEventListener("click", () => {
        saveFavorites(getFavorites().filter((favorite) => favorite.word !== item.word));
        openFavorites();
        updateBookmarkState(window.currentEntry?.word);
      });

      row.append(text, remove);
      list.appendChild(row);
    });
  }

  document.getElementById("favModal")?.classList.add("open");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  setText("themeLabel", theme === "dark" ? "Claro" : "Escuro");
}

function toggleTheme() {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_CACHE_KEY, theme);
  } catch {
    // Tema continua funcional nesta sessão mesmo sem storage.
  }
}

function speakWord() {
  const entry = window.currentEntry;
  if (!entry || !("speechSynthesis" in window)) {
    showToast("Leitura por voz não disponível");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(entry.word);
  utterance.lang = "pt-BR";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function openShareModal() {
  const entry = window.currentEntry;
  if (!entry) return;

  const preview = document.getElementById("sharePreview");
  if (preview) {
    preview.innerHTML = `
      <div class="sp-brand">LÉXICO DIÁRIO • PT-BR</div>
      <div class="sp-word">${entry.word}</div>
      <div class="sp-pos">${entry.pos}</div>
      <div class="sp-def">${entry.definition}</div>
      <div class="sp-ex">${entry.example}</div>
    `;
  }
  document.getElementById("shareModal")?.classList.add("open");
}

function getShareText() {
  const entry = window.currentEntry;
  return entry
    ? `Léxico Diário — ${entry.word}\n${entry.pos}\n\n${entry.definition}\n\n${entry.example}`
    : "";
}

async function copyShareText() {
  const text = getShareText();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Texto copiado");
  } catch {
    showToast("Não foi possível copiar");
  }
}

async function nativeShare() {
  const text = getShareText();
  if (navigator.share) {
    try {
      await navigator.share({ title: "Léxico Diário", text });
    } catch {
      // Cancelamento pelo usuário não exige aviso.
    }
  } else {
    await copyShareText();
  }
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function bindEvents() {
  document.getElementById("btnTheme")?.addEventListener("click", toggleTheme);
  document.getElementById("btnFavorites")?.addEventListener("click", openFavorites);
  document.getElementById("btnBookmark")?.addEventListener("click", toggleFavorite);
  document.getElementById("btnSpeak")?.addEventListener("click", speakWord);
  document.getElementById("btnShare")?.addEventListener("click", openShareModal);
  document.getElementById("btnCopyShare")?.addEventListener("click", copyShareText);
  document.getElementById("btnNativeShare")?.addEventListener("click", nativeShare);

  document.getElementById("closeFavModal")?.addEventListener("click", () => {
    document.getElementById("favModal")?.classList.remove("open");
  });
  document.getElementById("closeShareModal")?.addEventListener("click", () => {
    document.getElementById("shareModal")?.classList.remove("open");
  });

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) backdrop.classList.remove("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let theme = "light";
  try {
    theme = localStorage.getItem(THEME_CACHE_KEY) || "light";
  } catch {
    // Mantém o tema claro.
  }
  applyTheme(theme);
  startClock();
  bindEvents();
  setText("favCount", String(getFavorites().length));
  initDailyWord();
});