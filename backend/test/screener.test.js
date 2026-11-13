// backend/test/screener.test.js
const test = require('node:test');
const assert = require('node:assert');
const { getScreenerStocks } = require('../services/screenerService');

test('Screener Service: Returns screened stocks and supports sector/performance filters', async () => {
  // Test 1: Fetch all screened stocks
  const allStocks = await getScreenerStocks({});
  assert.ok(allStocks.length >= 20, 'Should return at least 20 stocks in directory');
  assert.ok(allStocks[0].price > 0, 'Stock must have valid price');

  // Test 2: Filter by Sector
  const itStocks = await getScreenerStocks({ sector: 'Information Technology' });
  assert.ok(itStocks.length > 0, 'Should find IT stocks');
  assert.ok(itStocks.every(s => s.sector === 'Information Technology'), 'All results must match IT sector');

  // Test 3: Search
  const reliance = await getScreenerStocks({ search: 'reliance' });
  assert.ok(reliance.length >= 1);
  assert.strictEqual(reliance[0].symbol, 'RELIANCE');

  // Test 4: Gainers
  const gainers = await getScreenerStocks({ sort: 'gainers' });
  assert.ok(gainers.length > 1);
  assert.ok(gainers[0].changePercent >= gainers[1].changePercent, 'Gainers must sort descending by changePercent');
});
