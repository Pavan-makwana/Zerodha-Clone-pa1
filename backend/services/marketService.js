// backend/services/marketService.js

/**
 * Live Market Service for Zerodha Kite Clone
 * Fetches real NSE/BSE stock quotes and indices via Yahoo Finance API
 * with in-memory caching and resilient fallback defaults.
 */

const CACHE_TTL_MS = 20 * 1000; // 20 seconds cache
const quoteCache = new Map();

// Robust realistic fallbacks for when market is closed, offline, or symbol not found
const fallbackBaselines = {
  "^NSEI": { name: "NIFTY 50", price: 24881.05, change: 345.50, changePercent: 1.40 },
  "^BSESN": { name: "SENSEX", price: 80582.34, change: 1266.02, changePercent: 1.60 },
  "INFY": { name: "INFY", price: 1172.70, change: 5.30, changePercent: 0.45 },
  "ONGC": { name: "ONGC", price: 116.80, change: -0.10, changePercent: -0.09 },
  "TCS": { name: "TCS", price: 2500.50, change: 4.80, changePercent: 0.19 },
  "KPITTECH": { name: "KPITTECH", price: 266.45, change: 9.10, changePercent: 3.54 },
  "QUICKHEAL": { name: "QUICKHEAL", price: 308.55, change: -0.45, changePercent: -0.15 },
  "WIPRO": { name: "WIPRO", price: 577.75, change: 1.85, changePercent: 0.32 },
  "M&M": { name: "M&M", price: 779.80, change: -0.10, changePercent: -0.01 },
  "RELIANCE": { name: "RELIANCE", price: 1315.90, change: 2.50, changePercent: 0.19 },
  "HUL": { name: "HUL", price: 2417.40, change: 5.05, changePercent: 0.21 },
  "HINDUNILVR": { name: "HINDUNILVR", price: 2417.40, change: 5.05, changePercent: 0.21 },
  "BHARTIARTL": { name: "BHARTIARTL", price: 541.15, change: 15.70, changePercent: 2.99 },
  "HDFCBANK": { name: "HDFCBANK", price: 1522.35, change: 1.65, changePercent: 0.11 },
  "ITC": { name: "ITC", price: 207.90, change: 1.65, changePercent: 0.80 },
  "SBIN": { name: "SBIN", price: 430.20, change: -1.45, changePercent: -0.34 },
  "TATAPOWER": { name: "TATAPOWER", price: 124.15, change: -0.30, changePercent: -0.24 },
  "TATAMOTORS": { name: "TATAMOTORS", price: 715.30, change: 8.20, changePercent: 1.16 },
  "ZOMATO": { name: "ZOMATO", price: 245.60, change: 4.10, changePercent: 1.70 },
  "PAYTM": { name: "PAYTM", price: 780.20, change: -6.50, changePercent: -0.83 },
};

/**
 * Normalizes input stock symbol to Yahoo Finance ticker:
 * - INFY -> INFY.NS (Default to NSE)
 * - NIFTY / NIFTY 50 -> ^NSEI
 * - SENSEX -> ^BSESN
 */
function normalizeSymbol(symbol) {
  if (!symbol) return "";
  const clean = symbol.trim().toUpperCase();
  if (clean === "NIFTY" || clean === "NIFTY 50" || clean === "^NSEI") {
    return "^NSEI";
  }
  if (clean === "SENSEX" || clean === "^BSESN") {
    return "^BSESN";
  }
  if (clean.includes(".") || clean.startsWith("^")) {
    return clean;
  }
  return `${clean}.NS`;
}

/**
 * Clean display symbol without exchange suffix:
 * INFY.NS -> INFY, ^NSEI -> NIFTY 50
 */
function getDisplaySymbol(yahooSymbol) {
  if (yahooSymbol === "^NSEI") return "NIFTY 50";
  if (yahooSymbol === "^BSESN") return "SENSEX";
  return yahooSymbol.replace(/\.(NS|BO)$/i, "");
}

/**
 * Fetches a single quote from Yahoo Finance API with 3s timeout
 */
async function fetchYahooQuote(yahooSymbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Yahoo Finance responded with status ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.meta) {
      throw new Error("Invalid quote response structure from Yahoo Finance");
    }

    const meta = result.meta;
    const price = Number((meta.regularMarketPrice || meta.chartPreviousClose || 0).toFixed(2));
    const prevClose = Number((meta.chartPreviousClose || price).toFixed(2));
    const change = Number((price - prevClose).toFixed(2));
    const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
    const isDown = change < 0;
    const percentStr = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

    const displaySym = getDisplaySymbol(yahooSymbol);

    return {
      name: displaySym,
      symbol: displaySym,
      yahooSymbol,
      price,
      change,
      changePercent,
      percent: percentStr,
      isDown,
      high: Number((meta.regularMarketDayHigh || price).toFixed(2)),
      low: Number((meta.regularMarketDayLow || price).toFixed(2)),
      open: Number((meta.regularMarketDayLow || price).toFixed(2)),
      prevClose,
      exchange: meta.fullExchangeName || "NSE",
      currency: meta.currency || "INR",
      updatedAt: new Date().toISOString(),
      isLive: true,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // Return cached value if present
    if (quoteCache.has(yahooSymbol)) {
      const cached = quoteCache.get(yahooSymbol);
      return { ...cached.data, isLive: false, fallbackReason: err.message };
    }

    // Otherwise use realistic fallback baseline
    const displaySym = getDisplaySymbol(yahooSymbol);
    const baseline = fallbackBaselines[yahooSymbol] || fallbackBaselines[displaySym] || {
      name: displaySym,
      price: 500.00,
      change: 0.00,
      changePercent: 0.00,
    };

    const isDown = baseline.change < 0;
    const percentStr = `${baseline.changePercent >= 0 ? "+" : ""}${Number(baseline.changePercent).toFixed(2)}%`;

    return {
      name: displaySym,
      symbol: displaySym,
      yahooSymbol,
      price: Number(baseline.price.toFixed(2)),
      change: Number(baseline.change.toFixed(2)),
      changePercent: Number(baseline.changePercent.toFixed(2)),
      percent: percentStr,
      isDown,
      high: Number((baseline.price * 1.01).toFixed(2)),
      low: Number((baseline.price * 0.99).toFixed(2)),
      open: baseline.price,
      prevClose: baseline.price,
      exchange: "NSE",
      currency: "INR",
      updatedAt: new Date().toISOString(),
      isLive: false,
      fallbackReason: err.message,
    };
  }
}

/**
 * Gets a quote for a given symbol, checking cache first
 */
async function getQuote(rawSymbol) {
  const yahooSymbol = normalizeSymbol(rawSymbol);
  const now = Date.now();

  if (quoteCache.has(yahooSymbol)) {
    const cached = quoteCache.get(yahooSymbol);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const quote = await fetchYahooQuote(yahooSymbol);
  quoteCache.set(yahooSymbol, {
    timestamp: now,
    data: quote,
  });

  return quote;
}

/**
 * Gets multiple quotes concurrently
 */
async function getMultipleQuotes(symbolsArray) {
  if (!Array.isArray(symbolsArray) || symbolsArray.length === 0) {
    return [];
  }
  const promises = symbolsArray.map((sym) => getQuote(sym));
  return Promise.all(promises);
}

/**
 * Gets the live market indices: NIFTY 50 and SENSEX
 */
async function getIndices() {
  const [niftyQuote, sensexQuote] = await Promise.all([
    getQuote("^NSEI"),
    getQuote("^BSESN"),
  ]);

  return {
    nifty: {
      name: "NIFTY 50",
      price: niftyQuote.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      rawPrice: niftyQuote.price,
      change: `${niftyQuote.change >= 0 ? "+" : ""}${niftyQuote.change.toFixed(2)}`,
      percent: niftyQuote.percent,
      isDown: niftyQuote.isDown,
      updatedAt: niftyQuote.updatedAt,
      isLive: niftyQuote.isLive,
    },
    sensex: {
      name: "SENSEX",
      price: sensexQuote.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      rawPrice: sensexQuote.price,
      change: `${sensexQuote.change >= 0 ? "+" : ""}${sensexQuote.change.toFixed(2)}`,
      percent: sensexQuote.percent,
      isDown: sensexQuote.isDown,
      updatedAt: sensexQuote.updatedAt,
      isLive: sensexQuote.isLive,
    },
    timestamp: new Date().toISOString(),
  };
}

const historyCache = new Map();
const HISTORY_CACHE_TTL = 45 * 1000;

function formatCandleTime(ts, tf) {
  const d = new Date(ts);
  if (tf === '1D') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (tf === '1W') {
    return `${d.toLocaleDateString([], { weekday: 'short' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (tf === '1M') {
    return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
  } else {
    return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
  }
}

function generateSyntheticCandles(basePrice = 1000, tf = '1D') {
  const count = tf === '1D' ? 40 : tf === '1W' ? 35 : tf === '1M' ? 25 : 30;
  const candles = [];
  let currentClose = basePrice;
  const now = Date.now();
  const stepMs = tf === '1D' ? 5 * 60 * 1000 : tf === '1W' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;

  for (let i = count; i >= 0; i--) {
    const ts = now - (i * stepMs);
    const delta = (Math.random() * 0.016 - 0.0078) * currentClose;
    const open = Number(currentClose.toFixed(2));
    const close = Number(Math.max(1, open + delta).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * (open * 0.006)).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * (open * 0.006)).toFixed(2));
    const volume = Math.floor(Math.random() * 80000 + 20000);

    candles.push({
      timestamp: ts,
      time: formatCandleTime(ts, tf),
      open,
      high,
      low,
      close,
      volume,
      isUp: close >= open,
    });
    currentClose = close;
  }
  return candles;
}

/**
 * Fetches historical OHLC candle data for candlestick charts
 */
async function getHistory(rawSymbol, timeframe = '1D') {
  const cleanTf = ['1D', '1W', '1M', '1Y'].includes(timeframe.toUpperCase()) ? timeframe.toUpperCase() : '1D';
  const yahooSymbol = normalizeSymbol(rawSymbol);
  const cacheKey = `${yahooSymbol}_${cleanTf}`;
  const now = Date.now();

  if (historyCache.has(cacheKey)) {
    const cached = historyCache.get(cacheKey);
    if (now - cached.timestamp < HISTORY_CACHE_TTL) {
      return cached.data;
    }
  }

  const tfConfig = cleanTf === '1W' ? { interval: '15m', range: '5d' } :
                   cleanTf === '1M' ? { interval: '1d', range: '1mo' } :
                   cleanTf === '1Y' ? { interval: '1wk', range: '1y' } :
                   { interval: '5m', range: '1d' };

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${tfConfig.interval}&range=${tfConfig.range}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Yahoo responded with ${res.status}`);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0] || {};

    const candles = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.open?.[i] != null && quote.close?.[i] != null && quote.high?.[i] != null && quote.low?.[i] != null) {
        const ts = timestamps[i] * 1000;
        const open = Number(quote.open[i].toFixed(2));
        const close = Number(quote.close[i].toFixed(2));
        const high = Number(quote.high[i].toFixed(2));
        const low = Number(quote.low[i].toFixed(2));
        const volume = Math.round(quote.volume?.[i] || 0);

        candles.push({
          timestamp: ts,
          time: formatCandleTime(ts, cleanTf),
          open,
          high,
          low,
          close,
          volume,
          isUp: close >= open,
        });
      }
    }

    if (candles.length === 0) {
      throw new Error("No valid candle points in Yahoo response");
    }

    const payload = {
      symbol: getDisplaySymbol(yahooSymbol),
      yahooSymbol,
      timeframe: cleanTf,
      candles,
      isLive: true,
      lastUpdated: new Date().toISOString(),
    };

    historyCache.set(cacheKey, { timestamp: now, data: payload });
    return payload;
  } catch (err) {
    clearTimeout(timeoutId);
    if (historyCache.has(cacheKey)) {
      return historyCache.get(cacheKey).data;
    }

    const quote = await getQuote(rawSymbol);
    const basePrice = quote?.price || 1000;
    const candles = generateSyntheticCandles(basePrice, cleanTf);

    const payload = {
      symbol: getDisplaySymbol(yahooSymbol),
      yahooSymbol,
      timeframe: cleanTf,
      candles,
      isLive: false,
      fallbackReason: err.message,
      lastUpdated: new Date().toISOString(),
    };

    historyCache.set(cacheKey, { timestamp: now, data: payload });
    return payload;
  }
}

module.exports = {
  getQuote,
  getMultipleQuotes,
  getIndices,
  getHistory,
  normalizeSymbol,
  getDisplaySymbol,
};
