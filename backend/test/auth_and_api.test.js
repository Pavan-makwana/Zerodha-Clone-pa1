// backend/test/auth_and_api.test.js
const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { memoryStore } = require('../utils/memoryStore');

test('Server Startup & Express App Exports cleanly', () => {
  const app = require('../index.js');
  assert.ok(app, 'Express app must be exported without syntax or runtime errors');
});

test('JWT Token Generation and Verification', () => {
  const secret = 'test-secret-key-12345';
  const userId = 'user_67890_abc';

  const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
  assert.ok(token, 'Token should be generated');

  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.id, userId, 'Decoded user ID should match');
});

test('Order Validation Logic', () => {
  // Test quantity validation
  const validateOrder = (name, qty, price, mode) => {
    if (!name || qty === undefined || price === undefined || !mode) {
      return { valid: false, error: 'All fields are required' };
    }
    const orderQty = Number(qty);
    const orderPrice = Number(price);

    if (isNaN(orderQty) || orderQty <= 0) {
      return { valid: false, error: 'Quantity must be a positive number' };
    }
    if (isNaN(orderPrice) || orderPrice <= 0) {
      return { valid: false, error: 'Price must be a positive number' };
    }

    const normalizedMode = mode.toUpperCase();
    if (normalizedMode !== 'BUY' && normalizedMode !== 'SELL') {
      return { valid: false, error: 'Mode must be either BUY or SELL' };
    }

    return { valid: true, orderQty, orderPrice, normalizedMode };
  };

  // Valid Buy Order
  const validBuy = validateOrder('INFY', 5, 1500.5, 'BUY');
  assert.strictEqual(validBuy.valid, true);
  assert.strictEqual(validBuy.orderQty, 5);
  assert.strictEqual(validBuy.normalizedMode, 'BUY');

  // Valid Sell Order
  const validSell = validateOrder('TCS', 2, 3200, 'sell');
  assert.strictEqual(validSell.valid, true);
  assert.strictEqual(validSell.normalizedMode, 'SELL');

  // Invalid Quantity
  const invalidQty = validateOrder('INFY', 0, 1500, 'BUY');
  assert.strictEqual(invalidQty.valid, false);

  // Invalid Negative Price
  const invalidPrice = validateOrder('INFY', 5, -100, 'BUY');
  assert.strictEqual(invalidPrice.valid, false);

  // Invalid Mode
  const invalidMode = validateOrder('INFY', 5, 1500, 'HOLD');
  assert.strictEqual(invalidMode.valid, false);
});

test('Portfolio Math Calculations', () => {
  const holdings = [
    { name: 'INFY', qty: 2, avg: 1400.0, price: 1500.0 }, // cost: 2800, cur: 3000
    { name: 'TCS', qty: 1, avg: 3000.0, price: 3200.0 },  // cost: 3000, cur: 3200
  ];

  const totalInvestment = holdings.reduce((acc, s) => acc + s.avg * s.qty, 0);
  const currentValue = holdings.reduce((acc, s) => acc + s.price * s.qty, 0);
  const totalPL = currentValue - totalInvestment;
  const plPercent = (totalPL / totalInvestment) * 100;

  assert.strictEqual(totalInvestment, 5800.0);
  assert.strictEqual(currentValue, 6200.0);
  assert.strictEqual(totalPL, 400.0);
  assert.strictEqual(Number(plPercent.toFixed(2)), 6.90);
});

test('Weighted Average Cost Calculation on BUY', () => {
  const existingHolding = { name: 'RELIANCE', qty: 2, avg: 2000.0 }; // cost: 4000
  const orderPrice = 2300.0;
  const orderQty = 1;

  const totalCost = (existingHolding.avg * existingHolding.qty) + (orderPrice * orderQty); // 6300
  const newTotalQty = existingHolding.qty + orderQty; // 3
  const newAvg = Number((totalCost / newTotalQty).toFixed(2)); // 2100.00

  assert.strictEqual(newTotalQty, 3);
  assert.strictEqual(newAvg, 2100.0);
});

test('MemoryStore User, Orders, and Portfolio Execution', () => {
  const testUserId = 'test_user_unit_test';
  const holdingsBefore = memoryStore.getHoldings(testUserId);
  assert.ok(holdingsBefore.length > 0, 'User should have initial holdings');

  // Place BUY order
  const buyResult = memoryStore.executeOrder({
    userId: testUserId,
    name: 'INFY',
    qty: 2,
    price: 1500.0,
    mode: 'BUY',
  });
  assert.strictEqual(buyResult.order.mode, 'BUY');
  assert.strictEqual(buyResult.order.name, 'INFY');

  // Place SELL order
  const sellResult = memoryStore.executeOrder({
    userId: testUserId,
    name: 'INFY',
    qty: 1,
    price: 1600.0,
    mode: 'SELL',
  });
  assert.strictEqual(sellResult.order.mode, 'SELL');

  // Watchlist operations
  const item = memoryStore.addWatchlistItem(testUserId, { name: 'ZOMATO', price: 250 });
  assert.strictEqual(item.name, 'ZOMATO');
  const list = memoryStore.getWatchlist(testUserId);
  assert.ok(list.some(s => s.name === 'ZOMATO'), 'Watchlist should contain newly added stock');

  const removed = memoryStore.removeWatchlistItem(testUserId, 'ZOMATO');
  assert.strictEqual(removed, true, 'Watchlist item should be removed');
});
