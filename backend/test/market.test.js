// backend/test/market.test.js
const test = require('node:test');
const assert = require('node:assert');
const {
  normalizeSymbol,
  getDisplaySymbol,
  getQuote,
  getMultipleQuotes,
  getIndices,
  getHistory,
  searchStocks
} = require('../services/marketService');

test('Market Symbol Normalization', () => {
  assert.strictEqual(normalizeSymbol('INFY'), 'INFY.NS');
  assert.strictEqual(normalizeSymbol('reliance'), 'RELIANCE.NS');
  assert.strictEqual(normalizeSymbol('TCS.NS'), 'TCS.NS');
  assert.strictEqual(normalizeSymbol('NIFTY'), '^NSEI');
  assert.strictEqual(normalizeSymbol('NIFTY 50'), '^NSEI');
  assert.strictEqual(normalizeSymbol('SENSEX'), '^BSESN');
  assert.strictEqual(normalizeSymbol('^NSEI'), '^NSEI');
});

test('Market Display Symbol Formatting', () => {
  assert.strictEqual(getDisplaySymbol('INFY.NS'), 'INFY');
  assert.strictEqual(getDisplaySymbol('TCS.BO'), 'TCS');
  assert.strictEqual(getDisplaySymbol('^NSEI'), 'NIFTY 50');
  assert.strictEqual(getDisplaySymbol('^BSESN'), 'SENSEX');
});

test('Get Single Quote returns structured data', async () => {
  const quote = await getQuote('INFY');
  assert.ok(quote, 'Quote should not be null');
  assert.strictEqual(quote.symbol, 'INFY');
  assert.ok(typeof quote.price === 'number', 'Price should be a number');
  assert.ok(quote.price > 0, 'Price should be positive');
  assert.ok(typeof quote.percent === 'string', 'Percent should be a string');
  assert.ok(typeof quote.isDown === 'boolean', 'isDown should be boolean');
});

test('Get Market Indices returns NIFTY 50 and SENSEX', async () => {
  const indices = await getIndices();
  assert.ok(indices.nifty, 'Nifty index should be defined');
  assert.ok(indices.sensex, 'Sensex index should be defined');
  assert.strictEqual(indices.nifty.name, 'NIFTY 50');
  assert.strictEqual(indices.sensex.name, 'SENSEX');
  assert.ok(indices.nifty.price, 'Nifty formatted price should exist');
  assert.ok(indices.sensex.price, 'Sensex formatted price should exist');
});

test('Get Multiple Quotes batch processing', async () => {
  const quotes = await getMultipleQuotes(['INFY', 'TCS', 'RELIANCE']);
  assert.strictEqual(quotes.length, 3);
  assert.strictEqual(quotes[0].symbol, 'INFY');
  assert.strictEqual(quotes[1].symbol, 'TCS');
  assert.strictEqual(quotes[2].symbol, 'RELIANCE');
  quotes.forEach(q => {
    assert.ok(q.price > 0, `${q.symbol} price should be greater than 0`);
  });
});

test('Get Historical Candlestick data returns valid OHLC candles', async () => {
  const history = await getHistory('INFY', '1D');
  assert.ok(history, 'History payload should exist');
  assert.strictEqual(history.symbol, 'INFY');
  assert.strictEqual(history.timeframe, '1D');
  assert.ok(Array.isArray(history.candles), 'Candles should be an array');
  assert.ok(history.candles.length > 0, 'Should return at least 1 candle');

  const firstCandle = history.candles[0];
  assert.ok(typeof firstCandle.open === 'number', 'Candle open should be number');
  assert.ok(typeof firstCandle.high === 'number', 'Candle high should be number');
  assert.ok(typeof firstCandle.low === 'number', 'Candle low should be number');
  assert.ok(typeof firstCandle.close === 'number', 'Candle close should be number');
  assert.ok(firstCandle.high >= firstCandle.low, 'High should be >= Low');
});

test('Search Indian Stocks returns matched equities with live prices', async () => {
  const results = await searchStocks('TATA');
  assert.ok(Array.isArray(results), 'Search results should be an array');
  assert.ok(results.length > 0, 'Should return matching Tata stocks');
  const symbols = results.map(r => r.symbol);
  assert.ok(symbols.includes('TCS') || symbols.includes('TATAMOTORS') || symbols.includes('TATASTEEL'));
  results.forEach(stock => {
    assert.ok(stock.price > 0, `${stock.symbol} should have positive price`);
    assert.strictEqual(stock.exchange, 'NSE');
  });
});

test('Indian Stock Market Trading Hours Utility: Accurate Open/Close validation', () => {
  const { getIndianMarketStatus } = require('../utils/marketHours');

  // Case 1: Friday 6:16 PM IST (2026-11-13T12:46:00Z -> 18:16 IST)
  const fridayEveningUtc = new Date('2026-11-13T12:46:00Z');
  const friStatus = getIndianMarketStatus(fridayEveningUtc);
  assert.strictEqual(friStatus.isOpen, false, 'Market must be closed on Friday evening');
  assert.strictEqual(friStatus.session, 'CLOSED');
  assert.strictEqual(friStatus.badgeText, 'NSE CLOSED');
  assert.strictEqual(friStatus.nextOpenMessage, 'Opens Monday at 09:15 AM IST');

  // Case 2: Saturday afternoon (2026-11-14T08:45:00Z -> 14:15 IST)
  const satUtc = new Date('2026-11-14T08:45:00Z');
  const satStatus = getIndianMarketStatus(satUtc);
  assert.strictEqual(satStatus.isOpen, false, 'Market must be closed on Saturday');
  assert.strictEqual(satStatus.nextOpenMessage, 'Opens Monday at 09:15 AM IST');

  // Case 3: Tuesday regular trading hours (2026-11-17T05:00:00Z -> 10:30 AM IST)
  const tuesdayTradingUtc = new Date('2026-11-17T05:00:00Z');
  const tuesStatus = getIndianMarketStatus(tuesdayTradingUtc);
  assert.strictEqual(tuesStatus.isOpen, true, 'Market must be open on Tuesday at 10:30 AM IST');
  assert.strictEqual(tuesStatus.session, 'REGULAR');
  assert.strictEqual(tuesStatus.badgeText, 'NSE LIVE');

  // Case 4: Wednesday pre-market (2026-11-18T03:35:00Z -> 09:05 AM IST)
  const wedPreMarketUtc = new Date('2026-11-18T03:35:00Z');
  const wedStatus = getIndianMarketStatus(wedPreMarketUtc);
  assert.strictEqual(wedStatus.isOpen, false);
  assert.strictEqual(wedStatus.session, 'PRE_MARKET');
});
