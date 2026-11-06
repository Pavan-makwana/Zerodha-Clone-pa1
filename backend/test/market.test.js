// backend/test/market.test.js
const test = require('node:test');
const assert = require('node:assert');
const {
  normalizeSymbol,
  getDisplaySymbol,
  getQuote,
  getMultipleQuotes,
  getIndices
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
