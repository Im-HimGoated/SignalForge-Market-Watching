const companies = [
  { symbol: "AAPL", stooq: "aapl.us", name: "Apple", sector: "Consumer Tech", accent: "#35d8ff" },
  { symbol: "MSFT", stooq: "msft.us", name: "Microsoft", sector: "Cloud Software", accent: "#59f5aa" },
  { symbol: "NVDA", stooq: "nvda.us", name: "NVIDIA", sector: "AI Chips", accent: "#9d8cff" },
  { symbol: "TSLA", stooq: "tsla.us", name: "Tesla", sector: "Electric Vehicles", accent: "#ff5d8b" },
  { symbol: "AMZN", stooq: "amzn.us", name: "Amazon", sector: "Commerce Cloud", accent: "#ffd166" },
  { symbol: "GOOGL", stooq: "googl.us", name: "Alphabet", sector: "Search AI", accent: "#35d8ff" },
  { symbol: "META", stooq: "meta.us", name: "Meta", sector: "Social Platforms", accent: "#9d8cff" },
  { symbol: "AMD", stooq: "amd.us", name: "AMD", sector: "Semiconductors", accent: "#ff5d8b" },
  { symbol: "NFLX", stooq: "nflx.us", name: "Netflix", sector: "Streaming", accent: "#e9436f" },
  { symbol: "DIS", stooq: "dis.us", name: "Disney", sector: "Entertainment", accent: "#59f5aa" },
  { symbol: "JPM", stooq: "jpm.us", name: "JPMorgan Chase", sector: "Banking", accent: "#ffd166" },
  { symbol: "V", stooq: "v.us", name: "Visa", sector: "Payments", accent: "#35d8ff" },
];

const defaultWatchlist = ["AAPL", "MSFT", "NVDA"];
const selected = new Set(loadWatchlist());
const quoteCache = new Map();
let activeRange = "1D";

const companyList = document.querySelector("#companyList");
const companySearch = document.querySelector("#companySearch");
const quoteGrid = document.querySelector("#quoteGrid");
const homeScreen = document.querySelector("#homeScreen");
const marketView = document.querySelector("#marketView");
const scenarioView = document.querySelector("#scenarioView");
const compareView = document.querySelector("#compareView");
const navButtons = document.querySelectorAll(".nav-button");
const selectedCount = document.querySelector("#selectedCount");
const upCount = document.querySelector("#upCount");
const downCount = document.querySelector("#downCount");
const dataStatus = document.querySelector("#dataStatus");
const refreshButton = document.querySelector("#refreshButton");
const clearButton = document.querySelector("#clearButton");
const rangeControls = document.querySelector("#rangeControls");
const detailDialog = document.querySelector("#detailDialog");
const detailCloseButton = document.querySelector("#detailCloseButton");
const detailSector = document.querySelector("#detailSector");
const detailName = document.querySelector("#detailName");
const detailPrice = document.querySelector("#detailPrice");
const detailChange = document.querySelector("#detailChange");
const detailRange = document.querySelector("#detailRange");
const detailChart = document.querySelector("#detailChart");
const detailStats = document.querySelector("#detailStats");
const scenarioCompany = document.querySelector("#scenarioCompany");
const scenarioAmount = document.querySelector("#scenarioAmount");
const scenarioPortion = document.querySelector("#scenarioPortion");
const scenarioMove = document.querySelector("#scenarioMove");
const scenarioMoveLabel = document.querySelector("#scenarioMoveLabel");
const scenarioPresets = document.querySelector("#scenarioPresets");
const scenarioTimeframe = document.querySelector("#scenarioTimeframe");
const runScenarioButton = document.querySelector("#runScenarioButton");
const scenarioPrice = document.querySelector("#scenarioPrice");
const scenarioPortionCost = document.querySelector("#scenarioPortionCost");
const scenarioUnits = document.querySelector("#scenarioUnits");
const scenarioValue = document.querySelector("#scenarioValue");
const scenarioGain = document.querySelector("#scenarioGain");
const scenarioProjectedPrice = document.querySelector("#scenarioProjectedPrice");
const riskLabel = document.querySelector("#riskLabel");
const riskFill = document.querySelector("#riskFill");
const riskReason = document.querySelector("#riskReason");
const outcomeGrid = document.querySelector("#outcomeGrid");
const saveScenarioButton = document.querySelector("#saveScenarioButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const historyList = document.querySelector("#historyList");
const aiSummary = document.querySelector("#aiSummary");
const compareCompanies = document.querySelector("#compareCompanies");
const compareAmount = document.querySelector("#compareAmount");
const compareMove = document.querySelector("#compareMove");
const compareMoveLabel = document.querySelector("#compareMoveLabel");
const runCompareButton = document.querySelector("#runCompareButton");
const compareChart = document.querySelector("#compareChart");
const compareGrid = document.querySelector("#compareGrid");
const compareSummary = document.querySelector("#compareSummary");
const compareCount = document.querySelector("#compareCount");
const compareLeader = document.querySelector("#compareLeader");
const compareAverageRisk = document.querySelector("#compareAverageRisk");
const companyTemplate = document.querySelector("#companyButtonTemplate");
const quoteTemplate = document.querySelector("#quoteCardTemplate");
let latestScenario = null;

function loadWatchlist() {
  try {
    const saved = JSON.parse(localStorage.getItem("neon-market-watchlist"));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    return defaultWatchlist;
  }
  return defaultWatchlist;
}

function saveWatchlist() {
  localStorage.setItem("neon-market-watchlist", JSON.stringify([...selected]));
}

function loadScenarioHistory() {
  try {
    const history = JSON.parse(localStorage.getItem("neon-market-scenario-history"));
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveScenarioHistory(history) {
  localStorage.setItem("neon-market-scenario-history", JSON.stringify(history.slice(0, 12)));
}

function showView(view) {
  document.body.classList.toggle("home-active", view === "home");
  marketView.classList.toggle("active-view", view === "market");
  scenarioView.classList.toggle("active-view", view === "scenario");
  compareView.classList.toggle("active-view", view === "compare");
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  if (view === "scenario") runScenario();
  if (view === "compare") runCompare();
}

function renderCompanyList() {
  const query = companySearch.value.trim().toLowerCase();
  companyList.innerHTML = "";
  companies
    .filter((company) => {
      return (
        company.name.toLowerCase().includes(query) ||
        company.symbol.toLowerCase().includes(query) ||
        company.sector.toLowerCase().includes(query)
      );
    })
    .forEach((company) => {
      const button = companyTemplate.content.firstElementChild.cloneNode(true);
      button.classList.toggle("selected", selected.has(company.symbol));
      button.querySelector("strong").textContent = company.name;
      button.querySelector("small").textContent = company.sector;
      button.querySelector("em").textContent = company.symbol;
      button.addEventListener("click", () => {
        if (selected.has(company.symbol)) selected.delete(company.symbol);
        else selected.add(company.symbol);
        saveWatchlist();
        renderCompanyList();
        renderQuotes();
      });
      companyList.append(button);
    });
}

function renderScenarioCompanyOptions() {
  scenarioCompany.innerHTML = "";
  compareCompanies.innerHTML = "";
  companies.forEach((company) => {
    const option = document.createElement("option");
    option.value = company.symbol;
    option.textContent = `${company.name} (${company.symbol})`;
    scenarioCompany.append(option);
    const compareOption = option.cloneNode(true);
    compareOption.selected = ["AAPL", "MSFT", "NVDA"].includes(company.symbol);
    compareCompanies.append(compareOption);
  });
  scenarioCompany.value = selected.values().next().value || "AAPL";
}

async function renderQuotes() {
  selectedCount.textContent = selected.size.toString();
  if (!selected.size) {
    quoteGrid.innerHTML = `<div class="empty-state">Select companies from the left panel.</div>`;
    upCount.textContent = "0";
    downCount.textContent = "0";
    dataStatus.textContent = "Idle";
    return;
  }

  dataStatus.textContent = "Loading";
  const activeCompanies = companies.filter((company) => selected.has(company.symbol));
  const quotes = await Promise.all(activeCompanies.map(loadQuote));
  quoteGrid.innerHTML = "";

  let rising = 0;
  let falling = 0;
  quotes.forEach((quote) => {
    if (quote.available && quote.change >= 0) rising += 1;
    else if (quote.available) falling += 1;
    quoteGrid.append(createQuoteCard(quote));
  });

  selectedCount.textContent = selected.size.toString();
  upCount.textContent = rising.toString();
  downCount.textContent = falling.toString();
  const availableCount = quotes.filter((quote) => quote.available).length;
  dataStatus.textContent =
    availableCount === quotes.length ? "Fetched" : availableCount > 0 ? "Partial" : "Unavailable";
}

async function loadQuote(company) {
  const cached = quoteCache.get(company.symbol);
  if (cached && Date.now() - cached.loadedAt < 60_000) return cached;

  try {
    const quote = await fetchStooqQuote(company);
    quoteCache.set(company.symbol, quote);
    return quote;
  } catch {
    const quote = makeUnavailableQuote(company);
    quoteCache.set(company.symbol, quote);
    return quote;
  }
}

async function runScenario() {
  const company = companies.find((item) => item.symbol === scenarioCompany.value) || companies[0];
  const quote = await loadQuote(company);
  if (!quote.available) {
    renderUnavailableScenario(quote);
    return;
  }
  const amount = Math.max(0, Number(scenarioAmount.value) || 0);
  const portion = Math.max(0, Number(scenarioPortion.value) || 0);
  const movePercent = Number(scenarioMove.value) || 0;
  const portionCost = quote.price * portion;
  const modeledUnits = quote.price > 0 ? amount / quote.price : 0;
  const projectedPrice = quote.price * (1 + movePercent / 100);
  const scenarioTotal = modeledUnits * projectedPrice;
  const gainLoss = scenarioTotal - amount;
  const risk = calculateRisk({ quote, movePercent, gainLoss, amount });
  const outcomes = calculateOutcomeRange({ quote, amount, modeledUnits, movePercent });

  scenarioMoveLabel.textContent = `${movePercent > 0 ? "+" : ""}${movePercent}%`;
  scenarioPrice.textContent = money(quote.price);
  scenarioPortionCost.textContent = money(portionCost);
  scenarioUnits.textContent = modeledUnits.toFixed(4);
  scenarioValue.textContent = money(scenarioTotal);
  scenarioGain.textContent = `${gainLoss >= 0 ? "+" : ""}${money(gainLoss)}`;
  scenarioGain.className = gainLoss >= 0 ? "up" : "down";
  scenarioProjectedPrice.textContent = money(projectedPrice);
  riskLabel.textContent = risk.label;
  riskFill.style.width = `${risk.score}%`;
  riskFill.className = risk.tone;
  riskReason.textContent = risk.reason;
  renderOutcomeRange(outcomes);
  latestScenario = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${quote.symbol}`,
    savedAt: new Date().toISOString(),
    symbol: quote.symbol,
    name: quote.name,
    amount,
    portion,
    movePercent,
    timeframe: scenarioTimeframe.value,
    price: quote.price,
    projectedPrice,
    scenarioTotal,
    gainLoss,
    risk,
    outcomes,
  };
  aiSummary.textContent = createAiSummary({
    quote,
    amount,
    portion,
    portionCost,
    modeledUnits,
    projectedPrice,
    movePercent,
    gainLoss,
    risk,
    timeframe: scenarioTimeframe.value,
  });
}

function renderUnavailableScenario(quote) {
  latestScenario = null;
  scenarioMoveLabel.textContent = `${Number(scenarioMove.value) > 0 ? "+" : ""}${Number(scenarioMove.value) || 0}%`;
  scenarioPrice.textContent = "Unavailable";
  scenarioPortionCost.textContent = "--";
  scenarioUnits.textContent = "--";
  scenarioValue.textContent = "--";
  scenarioGain.textContent = "--";
  scenarioGain.className = "";
  scenarioProjectedPrice.textContent = "--";
  riskLabel.textContent = "Unavailable";
  riskFill.style.width = "0%";
  riskFill.className = "low";
  riskReason.textContent = "The quote source did not return a usable price, so risk cannot be calculated.";
  outcomeGrid.innerHTML = `<div class="empty-state compact-empty">Outcome range needs a fetched quote first.</div>`;
  aiSummary.textContent = `${quote.name} could not be loaded from ${quote.source}. To keep Market Watch accurate, the app is not substituting generated demo prices. Try Refresh, check the symbol later, or use another company.`;
}

function calculateOutcomeRange({ quote, amount, modeledUnits, movePercent }) {
  const cases = [
    { key: "Bear", move: clamp(movePercent - 12, -60, 80), tone: "down" },
    { key: "Base", move: movePercent, tone: movePercent >= 0 ? "up" : "down" },
    { key: "Bull", move: clamp(movePercent + 12, -60, 80), tone: "up" },
  ];
  return cases.map((item) => {
    const projectedPrice = quote.price * (1 + item.move / 100);
    const value = modeledUnits * projectedPrice;
    return {
      ...item,
      projectedPrice,
      value,
      gainLoss: value - amount,
    };
  });
}

function renderOutcomeRange(outcomes) {
  outcomeGrid.innerHTML = "";
  outcomes.forEach((outcome) => {
    const card = document.createElement("article");
    card.className = `outcome-card ${outcome.tone}`;
    card.innerHTML = `
      <span>${outcome.key} Case</span>
      <strong>${outcome.move > 0 ? "+" : ""}${outcome.move}%</strong>
      <p>${money(outcome.projectedPrice)} projected</p>
      <em>${outcome.gainLoss >= 0 ? "+" : ""}${money(outcome.gainLoss)}</em>
    `;
    outcomeGrid.append(card);
  });
}

function saveCurrentScenario() {
  if (!latestScenario) return;
  const history = loadScenarioHistory();
  saveScenarioHistory([latestScenario, ...history]);
  renderScenarioHistory();
}

function renderScenarioHistory() {
  const history = loadScenarioHistory();
  historyList.innerHTML = "";
  if (!history.length) {
    historyList.innerHTML = `<div class="empty-state compact-empty">Saved scenarios will appear here.</div>`;
    return;
  }
  history.forEach((item) => {
    const row = document.createElement("article");
    row.className = "history-item";
    row.innerHTML = `
      <div>
        <span>${item.symbol} / ${item.timeframe}</span>
        <strong>${item.name}</strong>
      </div>
      <div>
        <span>Move</span>
        <strong>${item.movePercent > 0 ? "+" : ""}${item.movePercent}%</strong>
      </div>
      <div>
        <span>Gain/Loss</span>
        <strong class="${item.gainLoss >= 0 ? "up" : "down"}">${item.gainLoss >= 0 ? "+" : ""}${money(item.gainLoss)}</strong>
      </div>
      <div>
        <span>Risk</span>
        <strong>${item.risk.label} ${item.risk.score}/100</strong>
      </div>
    `;
    row.addEventListener("click", () => restoreScenario(item));
    historyList.append(row);
  });
}

function restoreScenario(item) {
  scenarioCompany.value = item.symbol;
  scenarioAmount.value = item.amount;
  scenarioPortion.value = item.portion;
  scenarioMove.value = item.movePercent;
  scenarioTimeframe.value = item.timeframe;
  runScenario();
}

async function runCompare() {
  const symbols = [...compareCompanies.selectedOptions].map((option) => option.value).slice(0, 5);
  const activeSymbols = symbols.length >= 2 ? symbols : ["AAPL", "MSFT", "NVDA"];
  const amount = Math.max(0, Number(compareAmount.value) || 0);
  const movePercent = Number(compareMove.value) || 0;
  compareMoveLabel.textContent = `${movePercent > 0 ? "+" : ""}${movePercent}%`;

  const quotes = await Promise.all(
    activeSymbols.map((symbol) => loadQuote(companies.find((company) => company.symbol === symbol))),
  );
  const rows = quotes.filter((quote) => quote.available).map((quote) => {
    const units = quote.price > 0 ? amount / quote.price : 0;
    const projectedPrice = quote.price * (1 + movePercent / 100);
    const projectedValue = units * projectedPrice;
    const gainLoss = projectedValue - amount;
    const risk = calculateRisk({ quote, movePercent, gainLoss, amount });
    return { quote, units, projectedPrice, projectedValue, gainLoss, risk };
  });

  renderCompareCards(rows);
  drawCompareChart(compareChart, rows);
  compareSummary.textContent = createCompareSummary(rows, movePercent, amount);
  updateCompareSummaryStrip(rows);
}

function calculateRisk({ quote, movePercent, gainLoss, amount }) {
  const volatility = estimateVolatility(quote.sparkline);
  const moveRisk = Math.min(42, Math.abs(movePercent) * 1.15);
  const downsideRisk = gainLoss < 0 && amount > 0 ? Math.min(34, (Math.abs(gainLoss) / amount) * 100 * 1.25) : 0;
  const dataRisk = 0;
  const score = Math.round(clamp(18 + volatility * 1.7 + moveRisk + downsideRisk + dataRisk, 0, 100));
  const label = score >= 72 ? "High" : score >= 42 ? "Moderate" : "Low";
  const tone = score >= 72 ? "high" : score >= 42 ? "moderate" : "low";
  const reason = `${label} scenario risk: projected move contributes ${Math.round(
    moveRisk,
  )} points, chart movement contributes ${Math.round(volatility * 1.7)} points${
    downsideRisk ? `, and downside exposure adds ${Math.round(downsideRisk)} points` : ""
  }.`;
  return { score, label, tone, reason };
}

function estimateVolatility(points) {
  if (!points || points.length < 2) return 0;
  const changes = [];
  for (let index = 1; index < points.length; index += 1) {
    changes.push(Math.abs((points[index] - points[index - 1]) / points[index - 1]) * 100);
  }
  return changes.reduce((sum, value) => sum + value, 0) / changes.length;
}

function createAiSummary(result) {
  const direction = result.gainLoss >= 0 ? "gain" : "loss";
  const moveTone =
    Math.abs(result.movePercent) >= 25
      ? "an aggressive"
      : Math.abs(result.movePercent) >= 10
        ? "a meaningful"
        : "a modest";
  const dataNote = `Quote source: ${result.quote.source}. Last quote timestamp: ${result.quote.asOf}.`;
  return `${result.quote.name} is modeled at ${money(result.quote.price)} per share. A ${result.portion.toFixed(
    3,
  )} portion would cost ${money(result.portionCost)}, while ${money(result.amount)} represents about ${result.modeledUnits.toFixed(
    4,
  )} share-equivalent units. With ${moveTone} ${result.movePercent > 0 ? "upside" : "downside"} move of ${
    result.movePercent
  }% over ${result.timeframe}, the scenario lands at ${money(result.projectedPrice)} per share and shows a ${direction} of ${money(
    Math.abs(result.gainLoss),
  )}. The risk meter reads ${result.risk.label.toLowerCase()} at ${result.risk.score}/100. ${dataNote}`;
}

function renderCompareCards(rows) {
  compareGrid.innerHTML = "";
  rows.forEach((row) => {
    const card = document.createElement("article");
    card.className = "compare-card";
    card.style.setProperty("--accent", row.quote.accent);
    card.innerHTML = `
      <div>
        <span>${row.quote.symbol}</span>
        <strong>${row.quote.name}</strong>
      </div>
      <p>${money(row.quote.price)} now -> ${money(row.projectedPrice)} projected</p>
      <dl>
        <div><dt>Gain/Loss</dt><dd class="${row.gainLoss >= 0 ? "up" : "down"}">${row.gainLoss >= 0 ? "+" : ""}${money(
          row.gainLoss,
        )}</dd></div>
        <div><dt>Units</dt><dd>${row.units.toFixed(4)}</dd></div>
        <div><dt>Value</dt><dd>${money(row.projectedValue)}</dd></div>
        <div><dt>Risk</dt><dd>${row.risk.label} ${row.risk.score}/100</dd></div>
      </dl>
    `;
    compareGrid.append(card);
  });
}

function updateCompareSummaryStrip(rows) {
  if (!rows.length) {
    compareCount.textContent = "0";
    compareLeader.textContent = "--";
    compareAverageRisk.textContent = "0/100";
    return;
  }
  const best = [...rows].sort((a, b) => b.gainLoss - a.gainLoss)[0];
  const averageRisk = Math.round(rows.reduce((sum, row) => sum + row.risk.score, 0) / rows.length);
  compareCount.textContent = rows.length.toString();
  compareLeader.textContent = best.quote.symbol;
  compareAverageRisk.textContent = `${averageRisk}/100`;
}

function createCompareSummary(rows, movePercent, amount) {
  if (rows.length < 2) return "Select at least two companies to compare.";
  const best = [...rows].sort((a, b) => b.gainLoss - a.gainLoss)[0];
  const riskiest = [...rows].sort((a, b) => b.risk.score - a.risk.score)[0];
  const averageRisk = Math.round(rows.reduce((sum, row) => sum + row.risk.score, 0) / rows.length);
  return `For a ${money(amount)} modeled amount and a ${movePercent > 0 ? "+" : ""}${movePercent}% move, ${
    best.quote.name
  } shows the strongest projected dollar outcome at ${best.gainLoss >= 0 ? "+" : ""}${money(
    best.gainLoss,
  )}. ${riskiest.quote.name} carries the highest scenario risk at ${
    riskiest.risk.score
  }/100. The group average risk is ${averageRisk}/100, so use this comparison as a relative signal rather than a prediction.`;
}

async function fetchStooqQuote(company) {
  const stooqUrl = `https://stooq.com/q/l/?s=${company.stooq}&f=sd2t2ohlcv&h&e=csv`;
  const directSource = { url: stooqUrl, label: "Stooq" };
  const bridgeSource = { url: `https://cors.eu.org/${stooqUrl}`, label: "Stooq via CORS bridge" };
  const { csv, source } = await fetchQuoteCsv([directSource, bridgeSource]);
  return parseStooqQuote(company, csv, source);
}

async function fetchQuoteCsv(sources) {
  let lastError = null;
  for (const source of sources) {
    try {
      const response = await fetchWithTimeout(source.url, 7000);
      if (!response.ok) throw new Error(`Quote request failed: ${response.status}`);
      const csv = await response.text();
      return { csv, source: source.label };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Quote request failed");
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseStooqQuote(company, csv, source) {
  const [headerLine, valueLine] = csv.trim().split("\n");
  const headers = headerLine.split(",").map((item) => item.trim());
  const values = valueLine.split(",").map((item) => item.trim());
  const row = Object.fromEntries(headers.map((header, index) => [header.toLowerCase(), values[index]]));
  const close = Number(row.close);
  const open = Number(row.open);
  const high = Number(row.high);
  const low = Number(row.low);
  const volume = Number(row.volume);
  if (!Number.isFinite(close) || close <= 0) throw new Error("Quote unavailable");

  const change = close - open;
  const changePercent = open > 0 ? (change / open) * 100 : 0;
  return {
    ...company,
    price: close,
    open,
    high,
    low,
    volume,
    change,
    changePercent,
    sparkline: makeSparkline(open, close, high, low, company.symbol, activeRange),
    loadedAt: Date.now(),
    asOf: formatQuoteTimestamp(row.date, row.time),
    source,
    available: true,
  };
}

function makeUnavailableQuote(company) {
  return {
    ...company,
    price: null,
    open: null,
    high: null,
    low: null,
    volume: null,
    change: null,
    changePercent: null,
    sparkline: [],
    loadedAt: Date.now(),
    asOf: "Unavailable",
    source: "Stooq",
    available: false,
  };
}

function makeSparkline(open, close, high, low, symbol, range) {
  const seed = [...symbol].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  const rangeProfile = {
    "1D": { points: 32, waves: 0.62, noise: 0.16 },
    "5D": { points: 42, waves: 0.44, noise: 0.2 },
    "1M": { points: 54, waves: 0.31, noise: 0.24 },
    "6M": { points: 64, waves: 0.22, noise: 0.3 },
    "1Y": { points: 78, waves: 0.16, noise: 0.36 },
  }[range];
  const points = [];
  for (let index = 0; index < rangeProfile.points; index += 1) {
    const progress = index / (rangeProfile.points - 1);
    const trend = open + (close - open) * progress;
    const wave = Math.sin(index * rangeProfile.waves + seed) * (high - low) * rangeProfile.noise;
    const pulse = Math.cos(index * rangeProfile.waves * 0.54 + seed * 0.2) * (high - low) * 0.08;
    points.push(clamp(trend + wave + pulse, low, high));
  }
  points[0] = open;
  points[points.length - 1] = close;
  return points;
}

function createQuoteCard(quote) {
  const card = quoteTemplate.content.firstElementChild.cloneNode(true);
  if (!quote.available) {
    card.classList.add("unavailable");
    card.style.setProperty("--accent", quote.accent);
    card.querySelector(".quote-top p").textContent = quote.sector;
    card.querySelector(".quote-top h3").textContent = quote.name;
    card.querySelector(".quote-symbol").textContent = quote.symbol;
    card.querySelector(".quote-price").textContent = "Unavailable";
    const change = card.querySelector(".quote-change");
    change.textContent = "Quote source did not return data";
    card.querySelector('[data-field="open"]').textContent = "--";
    card.querySelector('[data-field="high"]').textContent = "--";
    card.querySelector('[data-field="low"]').textContent = "--";
    card.querySelector('[data-field="volume"]').textContent = "--";
    drawUnavailableChart(card.querySelector("canvas"));
    card.querySelector(".card-open-button").addEventListener("click", (event) => {
      event.stopPropagation();
      openDetail(quote);
    });
    card.addEventListener("click", () => openDetail(quote));
    return card;
  }
  const isUp = quote.change >= 0;
  card.style.setProperty("--accent", quote.accent);
  card.querySelector(".quote-top p").textContent = quote.sector;
  card.querySelector(".quote-top h3").textContent = quote.name;
  card.querySelector(".quote-symbol").textContent = quote.symbol;
  card.querySelector(".quote-price").textContent = money(quote.price);
  const change = card.querySelector(".quote-change");
  change.classList.add(isUp ? "up" : "down");
  change.textContent = `${isUp ? "+" : ""}${money(quote.change)} (${isUp ? "+" : ""}${quote.changePercent.toFixed(2)}%)`;
  card.querySelector('[data-field="open"]').textContent = money(quote.open);
  card.querySelector('[data-field="high"]').textContent = money(quote.high);
  card.querySelector('[data-field="low"]').textContent = money(quote.low);
  card.querySelector('[data-field="volume"]').textContent = compactNumber(quote.volume);
  const source = document.createElement("div");
  source.className = "quote-source";
  source.textContent = `${quote.source} / ${quote.asOf}`;
  card.insertBefore(source, card.querySelector("canvas"));
  drawSparkline(card.querySelector("canvas"), quote.sparkline, quote.accent, isUp);
  card.querySelector(".card-open-button").addEventListener("click", (event) => {
    event.stopPropagation();
    openDetail(quote);
  });
  card.addEventListener("click", () => openDetail(quote));
  return card;
}

function openDetail(quote) {
  if (!quote.available) {
    detailSector.textContent = `${quote.symbol} / ${quote.sector}`;
    detailName.textContent = quote.name;
    detailPrice.textContent = "Unavailable";
    detailChange.textContent = "No fetched quote";
    detailChange.className = "down";
    detailRange.textContent = activeRange;
    detailStats.innerHTML = `
      <div><span>Source</span><strong>${quote.source}</strong></div>
      <div><span>Status</span><strong>Unavailable</strong></div>
      <div><span>Accuracy</span><strong>No demo substitute</strong></div>
    `;
    drawUnavailableChart(detailChart);
    if (!detailDialog.open) detailDialog.showModal();
    return;
  }
  const isUp = quote.change >= 0;
  detailSector.textContent = `${quote.symbol} / ${quote.sector}`;
  detailName.textContent = quote.name;
  detailPrice.textContent = money(quote.price);
  detailChange.textContent = `${isUp ? "+" : ""}${money(quote.change)} (${isUp ? "+" : ""}${quote.changePercent.toFixed(2)}%)`;
  detailChange.className = isUp ? "up" : "down";
  detailRange.textContent = activeRange;
  detailStats.innerHTML = `
    <div><span>Open</span><strong>${money(quote.open)}</strong></div>
    <div><span>High</span><strong>${money(quote.high)}</strong></div>
    <div><span>Low</span><strong>${money(quote.low)}</strong></div>
    <div><span>Volume</span><strong>${compactNumber(quote.volume)}</strong></div>
    <div><span>Source</span><strong>${quote.source}</strong></div>
    <div><span>Quote Time</span><strong>${quote.asOf}</strong></div>
    <div><span>Watchlist</span><strong>${selected.has(quote.symbol) ? "Saved" : "Not saved"}</strong></div>
  `;
  drawSparkline(detailChart, quote.sparkline, quote.accent, isUp);
  if (!detailDialog.open) detailDialog.showModal();
}

function drawSparkline(canvas, points, accent, isUp) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${isUp ? "rgba(89,245,170,0.28)" : "rgba(255,93,139,0.28)"}`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.beginPath();
  points.forEach((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - 14 - ((point - min) / range) * (height - 28);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();
  points.forEach((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - 14 - ((point - min) / range) * (height - 28);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.shadowBlur = 16;
  context.shadowColor = accent;
  context.stroke();
  context.shadowBlur = 0;
}

function drawUnavailableChart(canvas) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgba(255,255,255,0.04)";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(255,255,255,0.14)";
  context.lineWidth = 2;
  context.setLineDash([8, 8]);
  context.beginPath();
  context.moveTo(18, height / 2);
  context.lineTo(width - 18, height / 2);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = "#91a1bd";
  context.font = "800 16px system-ui";
  context.textAlign = "center";
  context.fillText("Quote unavailable", width / 2, height / 2 - 14);
  context.font = "700 12px system-ui";
  context.fillText("No generated market data shown", width / 2, height / 2 + 12);
}

function drawCompareChart(canvas, rows) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgba(255,255,255,0.04)";
  for (let y = 24; y < height; y += 42) context.fillRect(0, y, width, 1);
  const maxGain = Math.max(1, ...rows.map((row) => Math.abs(row.gainLoss)));
  const barGap = 16;
  const barHeight = Math.max(28, (height - 46 - barGap * (rows.length - 1)) / rows.length);
  const centerX = width / 2;
  context.strokeStyle = "rgba(255,255,255,0.22)";
  context.beginPath();
  context.moveTo(centerX, 18);
  context.lineTo(centerX, height - 12);
  context.stroke();
  rows.forEach((row, index) => {
    const y = 24 + index * (barHeight + barGap);
    const barWidth = (Math.abs(row.gainLoss) / maxGain) * (width * 0.42);
    const isUp = row.gainLoss >= 0;
    const x = isUp ? centerX : centerX - barWidth;
    context.fillStyle = isUp ? "rgba(89,245,170,0.78)" : "rgba(255,93,139,0.78)";
    context.shadowColor = row.quote.accent;
    context.shadowBlur = 14;
    context.fillRect(x, y, barWidth, barHeight);
    context.shadowBlur = 0;
    context.fillStyle = "#edf4ff";
    context.font = "800 15px system-ui";
    context.textAlign = isUp ? "left" : "right";
    context.fillText(row.quote.symbol, isUp ? x + barWidth + 10 : x - 10, y + barHeight / 2 + 5);
  });
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function compactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatQuoteTimestamp(date, time) {
  if (!date && !time) return "Timestamp unavailable";
  return [date, time].filter(Boolean).join(" ");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

companySearch.addEventListener("input", renderCompanyList);
document.querySelectorAll("[data-open-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.openView));
});
navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});
refreshButton.addEventListener("click", () => {
  quoteCache.clear();
  renderQuotes();
  if (scenarioView.classList.contains("active-view")) runScenario();
});
clearButton.addEventListener("click", () => {
  selected.clear();
  saveWatchlist();
  renderCompanyList();
  renderQuotes();
});
rangeControls.addEventListener("click", (event) => {
  const button = event.target.closest(".range-button");
  if (!button) return;
  activeRange = button.dataset.range;
  rangeControls.querySelectorAll(".range-button").forEach((rangeButton) => {
    rangeButton.classList.toggle("active", rangeButton === button);
  });
  quoteCache.clear();
  renderQuotes();
  if (compareView.classList.contains("active-view")) runCompare();
});
detailCloseButton.addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) detailDialog.close();
});
runScenarioButton.addEventListener("click", runScenario);
saveScenarioButton.addEventListener("click", saveCurrentScenario);
clearHistoryButton.addEventListener("click", () => {
  saveScenarioHistory([]);
  renderScenarioHistory();
});
scenarioPresets.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  scenarioMove.value = button.dataset.preset;
  runScenario();
});
[scenarioCompany, scenarioAmount, scenarioPortion, scenarioMove, scenarioTimeframe].forEach((control) => {
  control.addEventListener("input", runScenario);
  control.addEventListener("change", runScenario);
});
runCompareButton.addEventListener("click", runCompare);
[compareCompanies, compareAmount, compareMove].forEach((control) => {
  control.addEventListener("input", runCompare);
  control.addEventListener("change", runCompare);
});

renderScenarioCompanyOptions();
renderCompanyList();
renderQuotes();
runScenario();
runCompare();
renderScenarioHistory();
