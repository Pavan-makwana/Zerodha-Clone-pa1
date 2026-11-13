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

test('Paper Trading Square-off & Trade Analytics: Square off position and calculate win rate', () => {
  const testUserId = 'test_squareoff_trader_' + Date.now();
  memoryStore.initUserData(testUserId);

  // 1. Buy 10 INFY at ₹1200 with MIS -> Margin = (1200 * 10) / 5 = ₹2400
  memoryStore.executeOrder({
    userId: testUserId,
    name: 'INFY',
    qty: 10,
    price: 1200.00,
    mode: 'BUY',
    product: 'MIS',
  });

  // Verify position was created
  const positions = memoryStore.getPositions(testUserId);
  const infyPos = positions.find(p => p.name === 'INFY' && p.product === 'MIS');
  assert.ok(infyPos, 'Position must exist');
  assert.strictEqual(infyPos.qty, 10);

  // 2. Square off at ₹1250 (Profit: +₹50 * 10 = +₹500)
  const sqRes = memoryStore.squareOffPosition(testUserId, {
    name: 'INFY',
    product: 'MIS',
    currentPrice: 1250.00,
  });

  assert.strictEqual(sqRes.realizedPL, 500.00, 'Realized P&L should be ₹500');
  // Margin ₹2400 + Profit ₹500 = ₹2900 returned to funds (Initial 10,00,000 - 2,400 + 2,900 = 10,00,500)
  assert.strictEqual(sqRes.availableMargin, 1000500.00);

  // Verify position was closed
  const postSquareOff = memoryStore.getPositions(testUserId);
  assert.strictEqual(postSquareOff.find(p => p.name === 'INFY' && p.product === 'MIS'), undefined);

  // 3. Trade Analytics check
  const analytics = memoryStore.getTradeAnalytics(testUserId);
  assert.ok(analytics.totalTrades >= 2, 'Total orders should be at least 2');
  assert.strictEqual(analytics.closedTrades, 1, 'Closed trades should be 1');
  assert.strictEqual(analytics.winCount, 1, 'Win count should be 1');
  assert.strictEqual(analytics.winRate, 100, 'Win rate should be 100%');
  assert.strictEqual(analytics.netRealizedPL, 500.00, 'Net realized P&L should be ₹500');
});
