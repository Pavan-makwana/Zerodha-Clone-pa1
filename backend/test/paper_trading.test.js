// backend/test/paper_trading.test.js
const test = require('node:test');
const assert = require('node:assert');
const { memoryStore } = require('../utils/memoryStore');

test('Paper Trading Wallet: Initializes user with ₹10,00,000 virtual capital and allows reset', () => {
  const testUserId = 'test_paper_trader_' + Date.now();
  memoryStore.initUserData(testUserId);
  const user = memoryStore.findUserById(testUserId);
  assert.ok(user, 'User must exist');
  assert.strictEqual(user.funds, 1000000.00, 'Virtual starter capital must be ₹10,00,000');

  // Place a trade
  memoryStore.executeOrder({
    userId: testUserId,
    name: 'RELIANCE',
    qty: 10,
    price: 1320.00,
    mode: 'BUY',
    product: 'CNC'
  });

  const fundsAfterBuy = memoryStore.findUserById(testUserId).funds;
  assert.strictEqual(fundsAfterBuy, 1000000 - 13200);

  // Reset virtual wallet
  const resetFunds = memoryStore.resetVirtualFunds(testUserId);
  assert.strictEqual(resetFunds, 1000000.00, 'Resetting wallet should restore exactly ₹10,00,000');
});

test('Paper Trading Margin: 5x MIS leverage vs 1x CNC delivery', () => {
  const testUserId = 'test_leverage_trader_' + Date.now();
  memoryStore.initUserData(testUserId);

  // Buy ₹50,000 worth of TCS with MIS (5x leverage) -> requires only ₹10,000 margin
  const result = memoryStore.executeOrder({
    userId: testUserId,
    name: 'TCS',
    qty: 20,
    price: 2500.00, // Total = 50,000
    mode: 'BUY',
    product: 'MIS'  // 5x Leverage -> 10,000 margin
  });

  assert.strictEqual(result.marginDeducted, 10000.00, 'MIS should deduct 1/5th margin');
  assert.strictEqual(result.availableMargin, 1000000 - 10000);
});
