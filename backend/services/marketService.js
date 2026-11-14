// backend/services/marketService.js

/**
 * Live Market Service for Zerodha Kite Clone
 * Fetches real NSE/BSE stock quotes, indices, and candlestick history
 * using primary Google Finance real-time data with Yahoo Finance and
 * high-fidelity 2026 market baselines as resilient fallbacks.
 */

const { INDIAN_STOCKS_DIRECTORY } = require('../data/indianStocks');
const { getIndianMarketStatus } = require('../utils/marketHours');

const CACHE_TTL_MS = 15 * 1000; // 15 seconds cache
const quoteCache = new Map();

// Robust realistic fallbacks for when market is closed or network is unavailable
const fallbackBaselines = {
  "^NSEI": { name: "NIFTY 50", price: 24881.05, change: 345.50, changePercent: 1.40 },
  "^BSESN": { name: "SENSEX", price: 80582.34, change: 1266.02, changePercent: 1.60 },
  "RELIANCE": { name: "Reliance Industries Ltd", price: 1320.00, change: 6.60, changePercent: 0.50 },
  "TCS": { name: "Tata Consultancy Services Ltd", price: 2498.50, change: 2.80, changePercent: 0.11 },
  "INFY": { name: "Infosys Ltd", price: 1181.40, change: 14.00, changePercent: 1.20 },
  "BHARTIARTL": { name: "Bharti Airtel Ltd", price: 2107.20, change: 50.30, changePercent: 2.45 },
  "HDFCBANK": { name: "HDFC Bank Ltd", price: 788.25, change: 28.25, changePercent: 3.72 },
  "ONGC": { name: "ONGC", price: 260.00, change: -0.65, changePercent: -0.25 },
  "WIPRO": { name: "WIPRO", price: 545.00, change: 1.75, changePercent: 0.32 },
  "M&M": { name: "M&M", price: 2840.00, change: 23.90, changePercent: 0.85 },
  "KPITTECH": { name: "KPITTECH", price: 1420.00, change: 21.50, changePercent: 1.54 },
  "QUICKHEAL": { name: "QUICKHEAL", price: 540.00, change: -2.45, changePercent: -0.45 },
  "SBIN": { name: "State Bank of India", price: 810.00, change: -2.75, changePercent: -0.34 },
  "ITC": { name: "ITC Ltd", price: 468.00, change: 3.70, changePercent: 0.80 },
  "HUL": { name: "Hindustan Unilever Ltd", price: 2380.00, change: 5.00, changePercent: 0.21 },
  "HINDUNILVR": { name: "Hindustan Unilever Ltd", price: 2380.00, change: 5.00, changePercent: 0.21 },
  "TATAPOWER": { name: "Tata Power Company Ltd", price: 395.00, change: 2.90, changePercent: 0.74 },
  "TATAMOTORS": { name: "Tata Motors Ltd", price: 785.00, change: 9.10, changePercent: 1.16 },
  "ZOMATO": { name: "Zomato Ltd (Eternal)", price: 363.15, change: 4.85, changePercent: 1.35 },
  "ETERNAL": { name: "Eternal Ltd (Zomato)", price: 363.15, change: 4.85, changePercent: 1.35 },
  "SWIGGY": { name: "Swiggy Ltd", price: 191.17, change: 1.66, changePercent: 0.88 },
  "PAYTM": { name: "One97 Communications (Paytm)", price: 820.00, change: -6.80, changePercent: -0.83 },
};

// Seed rest of directory into fallback baselines
INDIAN_STOCKS_DIRECTORY.forEach((stock) => {
  if (!fallbackBaselines[stock.symbol]) {
    fallbackBaselines[stock.symbol] = {
      name: stock.name,
      price: stock.baseline,
      change: 0.0,
      changePercent: 0.0,
    };
  }
});

// Google Finance symbol mapping
const GOOGLE_FINANCE_SYMBOLS = {
  "ZOMATO": "ETERNAL:NSE",
  "ETERNAL": "ETERNAL:NSE",
  "RELIANCE": "RELIANCE:NSE",
  "TCS": "TCS:NSE",
  "INFY": "INFY:NSE",
  "HDFCBANK": "HDFCBANK:NSE",
  "ICICIBANK": "ICICIBANK:NSE",
  "SBIN": "SBIN:NSE",
  "BHARTIARTL": "BHARTIARTL:NSE",
  "ITC": "ITC:NSE",
  "LT": "LT:NSE",
  "TATAPOWER": "TATAPOWER:NSE",
  "SWIGGY": "SWIGGY:NSE",
  "WIPRO": "WIPRO:NSE",
  "MARUTI": "MARUTI:NSE",
  "SUNPHARMA": "SUNPHARMA:NSE",
  "^NSEI": "NIFTY_50:INDEXNSE",
  "NIFTY": "NIFTY_50:INDEXNSE",
  "NIFTY 50": "NIFTY_50:INDEXNSE",
  "^BSESN": "SENSEX:INDEXBOM",
  "SENSEX": "SENSEX:INDEXBOM",
};

/**
 * Normalizes input stock symbol to Yahoo Finance ticker
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
 * Clean display symbol without exchange suffix
 */
function getDisplaySymbol(yahooSymbol) {
  if (yahooSymbol === "^NSEI" || yahooSymbol === "NIFTY_50:INDEXNSE") return "NIFTY 50";
  if (yahooSymbol === "^BSESN" || yahooSymbol === "SENSEX:INDEXBOM") return "SENSEX";
  return yahooSymbol.replace(/:(NSE|BSE|INDEXNSE|INDEXBOM)$/i, "").replace(/\.(NS|BO)$/i, "");
}

/**
 * Fetches real-time quote directly from Google Finance
 */
async function fetchGoogleFinanceQuote(rawSymbol) {
  const displaySym = getDisplaySymbol(rawSymbol);
  const cleanSym = displaySym.toUpperCase().replace(/\.(NS|BO)$/i, "");
  const gfKey = GOOGLE_FINANCE_SYMBOLS[cleanSym] || GOOGLE_FINANCE_SYMBOLS[rawSymbol] || `${cleanSym}:NSE`;
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(gfKey)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Finance returned status ${response.status}`);
    }

    const html = await response.text();
    const priceMatch = html.match(/<span>₹\s*([0-9,.]+)\s*<\/span>/) ||
                       html.match(/<span>([0-9,.]+)\s*<\/span>/);
    if (!priceMatch) {
      throw new Error(`Price pattern not found for ${gfKey}`);
    }

    const price = parseFloat(priceMatch[1].replace(/,/g, ""));
    const priceIndex = html.indexOf(priceMatch[0]);
    const localSnippet = priceIndex !== -1 ? html.substring(priceIndex, priceIndex + 700) : "";

    const chgMatch = localSnippet.match(/<span>([+-][0-9,.]+)<\/span>\s*\)\s*Today/i) ||
                     localSnippet.match(/jsname=["']xnruHf["'][^>]*><span>([+-]?[0-9,.]+)<\/span>/i);
    let change = chgMatch ? parseFloat(chgMatch[1].replace(/,/g, "")) : 0;

    const pctMatch = localSnippet.match(/class=["'][^"']*ougHge[^"']*["']>([+-]?[0-9,.]+)%<\/span>/i);
    let changePercent = pctMatch ? parseFloat(pctMatch[1].replace(/,/g, "")) : 0;

    if (change < 0 || localSnippet.includes("arrow_downward")) {
      change = -Math.abs(change);
      changePercent = -Math.abs(changePercent);
    } else if (change > 0 || localSnippet.includes("arrow_upward")) {
      change = Math.abs(change);
      changePercent = Math.abs(changePercent);
    }

    const isDown = change < 0;
    const prevClose = Number((price - change).toFixed(2));
    const percentStr = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

    return {
      name: displaySym,
      symbol: displaySym,
      yahooSymbol: normalizeSymbol(displaySym),
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      percent: percentStr,
      isDown,
      high: Number((price + Math.abs(change) * 0.35).toFixed(2)),
      low: Number((price - Math.abs(change) * 0.35).toFixed(2)),
      open: prevClose,
      prevClose,
      exchange: gfKey.includes("INDEXBOM") ? "BSE" : "NSE",
      currency: "INR",
      updatedAt: new Date().toISOString(),
      isLive: true,
      source: "Google Finance",
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
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
      source: "Yahoo Finance",
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Gets a quote for a given symbol, checking cache and multi-source fallbacks
 */
async function getQuote(rawSymbol) {
  const yahooSymbol = normalizeSymbol(rawSymbol);
  const displaySym = getDisplaySymbol(yahooSymbol);
  const now = Date.now();

  if (quoteCache.has(yahooSymbol)) {
    const cached = quoteCache.get(yahooSymbol);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // 1. Primary: Google Finance
  try {
    const gfQuote = await fetchGoogleFinanceQuote(displaySym);
    const enriched = { ...gfQuote, isMarketOpen: getIndianMarketStatus().isOpen };
    quoteCache.set(yahooSymbol, { timestamp: now, data: enriched });
    return enriched;
  } catch (gfErr) {
    // 2. Secondary: Yahoo Finance
    try {
      const yQuote = await fetchYahooQuote(yahooSymbol);
      const enriched = { ...yQuote, isMarketOpen: getIndianMarketStatus().isOpen };
      quoteCache.set(yahooSymbol, { timestamp: now, data: enriched });
      return enriched;
    } catch (yErr) {
      // 3. Return cached data if available
      if (quoteCache.has(yahooSymbol)) {
        return { ...quoteCache.get(yahooSymbol).data, isLive: false, isMarketOpen: getIndianMarketStatus().isOpen };
      }

      // 4. Tertiary: High-fidelity 2026 baseline
      const baseline = fallbackBaselines[yahooSymbol] || fallbackBaselines[displaySym] || {
        name: displaySym,
        price: 500.00,
        change: 0.00,
        changePercent: 0.00,
      };

      const isDown = baseline.change < 0;
      const percentStr = `${baseline.changePercent >= 0 ? "+" : ""}${Number(baseline.changePercent).toFixed(2)}%`;

      const fallbackQuote = {
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
        isMarketOpen: getIndianMarketStatus().isOpen,
        fallbackReason: gfErr.message,
      };

      quoteCache.set(yahooSymbol, { timestamp: now, data: fallbackQuote });
      return fallbackQuote;
    }
  }
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
  const marketStatus = getIndianMarketStatus();
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
    marketStatus,
    isMarketOpen: marketStatus.isOpen,
    timestamp: new Date().toISOString(),
  };
}

const historyCache = new Map();
const HISTORY_CACHE_TTL = 30 * 1000;

/**
 * Formats timestamps strictly in Indian Standard Time (IST / Asia/Kolkata)
 */
function formatCandleTime(ts, tf) {
  const d = new Date(ts);
  if (tf === '1D') {
    return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  } else if (tf === '1W') {
    const day = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
    const time = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${time}`;
  } else if (tf === '1M') {
    return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
  } else {
    return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: '2-digit' });
  }
}

/**
 * Generates realistic candlestick timeline aligned with Indian Stock Market (NSE/BSE) hours:
 * 09:15 AM IST to 03:30 PM IST (or current IST time during live trading session).
 */
function generateSyntheticCandles(basePrice = 1000, tf = '1D') {
  if (tf === '1D') {
    // Current time in IST (UTC + 5.5 hours)
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const nowUtc = new Date();
    const nowIst = new Date(nowUtc.getTime() + istOffsetMs);

    const istYear = nowIst.getUTCFullYear();
    const istMonth = nowIst.getUTCMonth();
    const istDate = nowIst.getUTCDate();
    const istHours = nowIst.getUTCHours();
    const istMinutes = nowIst.getUTCMinutes();
    const currentIstMinutes = istHours * 60 + istMinutes;

    const marketOpenMins = 9 * 60 + 15; // 09:15 AM IST
    const marketCloseMins = 15 * 60 + 30; // 03:30 PM IST

    let sessionDate = istDate;
    let sessionMonth = istMonth;
    let sessionYear = istYear;
    let endMinutes = currentIstMinutes;

    if (currentIstMinutes < marketOpenMins) {
      // Prior session close
      sessionDate -= 1;
      endMinutes = marketCloseMins;
    } else if (currentIstMinutes > marketCloseMins) {
      // Today after market close
      endMinutes = marketCloseMins;
    }

    const sessionStartEpoch = Date.UTC(sessionYear, sessionMonth, sessionDate, 9, 15) - istOffsetMs;
    const sessionEndEpoch = Date.UTC(sessionYear, sessionMonth, sessionDate, Math.floor(endMinutes / 60), endMinutes % 60) - istOffsetMs;

    const totalMinutes = Math.max(30, endMinutes - marketOpenMins);
    // Interval: 5 min if short session, up to 10 min for full 375 min session
    const stepMinutes = totalMinutes > 180 ? 8 : 5;
    const stepMs = stepMinutes * 60 * 1000;

    const timestamps = [];
    for (let ts = sessionStartEpoch; ts <= sessionEndEpoch; ts += stepMs) {
      timestamps.push(ts);
    }
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < sessionEndEpoch) {
      timestamps.push(sessionEndEpoch);
    }

    const candles = [];
    // Start price around ±1.2% of basePrice
    let cur = Number((basePrice * (1 + (Math.random() * 0.02 - 0.01))).toFixed(2));
    const n = timestamps.length;

    for (let i = 0; i < n; i++) {
      const ts = timestamps[i];
      // On the final candle, converge close price exactly to basePrice
      const isLast = i === n - 1;
      const open = cur;
      let close;
      if (isLast) {
        close = Number(basePrice.toFixed(2));
      } else {
        const delta = (Math.random() * 0.014 - 0.0068) * open;
        close = Number(Math.max(1, open + delta).toFixed(2));
      }

      const high = Number((Math.max(open, close) + Math.random() * (open * 0.0045)).toFixed(2));
      const low = Number((Math.min(open, close) - Math.random() * (open * 0.0045)).toFixed(2));
      const volume = Math.floor(Math.random() * 65000 + 15000);

      candles.push({
        timestamp: ts,
        time: formatCandleTime(ts, '1D'),
        open,
        high,
        low,
        close,
        volume,
        isUp: close >= open,
      });
      cur = close;
    }

    return candles;
  }

  // 1W, 1M, 1Y timelines
  const count = tf === '1W' ? 35 : tf === '1M' ? 25 : 30;
  const candles = [];
  let currentClose = basePrice;
  const now = Date.now();
  const stepMs = tf === '1W' ? 4 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  for (let i = count; i >= 0; i--) {
    const ts = now - (i * stepMs);
    const delta = (Math.random() * 0.016 - 0.0078) * currentClose;
    const open = Number(currentClose.toFixed(2));
    const close = i === 0 ? Number(basePrice.toFixed(2)) : Number(Math.max(1, open + delta).toFixed(2));
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
  const timeoutId = setTimeout(() => controller.abort(), 3500);

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

    const marketStatus = getIndianMarketStatus();
    const payload = {
      symbol: getDisplaySymbol(yahooSymbol),
      yahooSymbol,
      timeframe: cleanTf,
      candles,
      marketStatus,
      isMarketOpen: marketStatus.isOpen,
      isLive: marketStatus.isOpen,
      lastUpdated: new Date().toISOString(),
    };

    historyCache.set(cacheKey, { timestamp: now, data: payload });
    return payload;
  } catch (err) {
    clearTimeout(timeoutId);
    if (historyCache.has(cacheKey)) {
      return historyCache.get(cacheKey).data;
    }

    const marketStatus = getIndianMarketStatus();
    const quote = await getQuote(rawSymbol);
    const basePrice = quote?.price || 1000;
    const candles = generateSyntheticCandles(basePrice, cleanTf);

    const payload = {
      symbol: getDisplaySymbol(yahooSymbol),
      yahooSymbol,
      timeframe: cleanTf,
      candles,
      marketStatus,
      isMarketOpen: marketStatus.isOpen,
      isLive: false,
      fallbackReason: err.message,
      lastUpdated: new Date().toISOString(),
    };

    historyCache.set(cacheKey, { timestamp: now, data: payload });
    return payload;
  }
}

/**
 * Searches top Indian stocks by symbol or name and returns live quotes
 */
async function searchStocks(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toUpperCase();
  if (!q) return [];

  // Match symbols or names from Indian stocks directory
  const matches = INDIAN_STOCKS_DIRECTORY.filter(
    (stock) => stock.symbol.toUpperCase().includes(q) || stock.name.toUpperCase().includes(q) || stock.sector.toUpperCase().includes(q)
  ).slice(0, 8);

  const results = await Promise.all(
    matches.map(async (stock) => {
      try {
        const quote = await getQuote(stock.symbol);
        return {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: quote.price,
          percent: quote.percent,
          isDown: quote.isDown,
          exchange: "NSE",
          isLive: quote.isLive,
        };
      } catch (err) {
        return {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: stock.baseline,
          percent: "+0.00%",
          isDown: false,
          exchange: "NSE",
          isLive: false,
        };
      }
    })
  );

  return results;
}

module.exports = {
  getQuote,
  getMultipleQuotes,
  getIndices,
  getHistory,
  searchStocks,
  normalizeSymbol,
  getDisplaySymbol,
  formatCandleTime,
};
