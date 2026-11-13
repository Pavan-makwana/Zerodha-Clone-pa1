// backend/routes/marketRoutes.js

const express = require('express');
const router = express.Router();
const { getIndices, getQuote, getMultipleQuotes, getHistory, searchStocks } = require('../services/marketService');
const { getScreenerStocks } = require('../services/screenerService');

// Default watchlist tickers if none requested
const DEFAULT_SYMBOLS = [
  "INFY", "ONGC", "TCS", "KPITTECH", "QUICKHEAL", "WIPRO", "M&M", "RELIANCE", "HUL"
];

/**
 * GET /api/market/indices
 * Returns live market indices (NIFTY 50 and SENSEX)
 */
router.get('/indices', async (req, res) => {
  try {
    const indices = await getIndices();
    res.status(200).json(indices);
  } catch (err) {
    console.error("Error fetching indices:", err.message);
    res.status(500).json({ message: "Failed to fetch market indices", error: err.message });
  }
});

/**
 * GET /api/market/quotes?symbols=INFY,TCS,RELIANCE
 * Returns live quotes for a comma-separated list of symbols
 */
router.get('/quotes', async (req, res) => {
  try {
    let symbols = DEFAULT_SYMBOLS;
    if (req.query.symbols) {
      symbols = req.query.symbols.split(',').map(s => s.trim()).filter(Boolean);
    }
    const quotes = await getMultipleQuotes(symbols);
    res.status(200).json(quotes);
  } catch (err) {
    console.error("Error fetching quotes:", err.message);
    res.status(500).json({ message: "Failed to fetch quotes", error: err.message });
  }
});

/**
 * GET /api/market/quote/:symbol
 * Returns live quote for a specific stock symbol
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    if (!symbol) {
      return res.status(400).json({ message: "Symbol is required" });
    }
    const quote = await getQuote(symbol);
    res.status(200).json(quote);
  } catch (err) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, err.message);
    res.status(500).json({ message: `Failed to fetch quote for ${req.params.symbol}`, error: err.message });
  }
});

/**
 * GET /api/market/history/:symbol?timeframe=1D
 * Returns historical OHLC candlestick data for the specified symbol & timeframe
 */
router.get('/history/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const timeframe = req.query.timeframe || '1D';
    if (!symbol) {
      return res.status(400).json({ message: "Symbol is required" });
    }
    const history = await getHistory(symbol, timeframe);
    res.status(200).json(history);
  } catch (err) {
    console.error(`Error fetching history for ${req.params.symbol}:`, err.message);
    res.status(500).json({ message: `Failed to fetch history for ${req.params.symbol}`, error: err.message });
  }
});

/**
 * GET /api/market/search?q=tata
 * Searches Indian stocks across NSE/BSE and returns live quotes
 */
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || "";
    const results = await searchStocks(q);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error searching stocks:", err.message);
    res.status(500).json({ message: "Stock search failed", error: err.message });
  }
});

/**
 * GET /api/market/screener?sector=&marketCap=&filter=&sort=&search=
 * Real-time multi-metric stock screener endpoint
 */
router.get('/screener', async (req, res) => {
  try {
    const { sector, marketCap, filter, sort, search } = req.query;
    const stocks = await getScreenerStocks({ sector, marketCap, filter, sort, search });
    res.status(200).json(stocks);
  } catch (err) {
    console.error("Error screening stocks:", err.message);
    res.status(500).json({ message: "Stock screener failed", error: err.message });
  }
});

module.exports = router;
