# Real-Time Paper Trading & Stock Screener Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Zerodha Kite Clone into a full-fidelity real-time Paper Trading and Market Training platform equipped with starter virtual capital (₹10,00,000 INR), an interactive real-time multi-metric Stock Screener, automated Limit/SL order simulation, real-time MTM portfolio tracking, and trader performance analytics.

**Architecture:** 
- **Backend:** Node.js/Express with dual data engines (Google Finance + Yahoo Finance + 2026 Baselines). Introduces an in-memory Limit Order and Stop-Loss matching engine (`orderEngine.js`) that checks open orders on every market tick, a high-performance multi-metric stock screening service (`screenerService.js`), and virtual wallet reset/margin management endpoints.
- **Frontend/Dashboard:** React 18 with Material UI icons and HTML5 Canvas. Integrates a dedicated `Screener.js` tab with filter chips, multi-column sorting, and 1-click B/S/Chart actions; updates `Funds.js` with instant virtual capital resets and margin health indicators; updates `Summary.js` with trader training performance metrics (Win Rate, Profit Factor, Equity Curve).
- **State & Real-Time Sync:** Real-time polling with micro-tick simulated liquidity and live MTM (Mark-to-Market) calculations across open Positions and Holdings without page reloads.

**Tech Stack:** Node.js, Express.js, MongoDB / MemoryStore fallback, React 18, React Router v6, Chart.js, HTML5 Canvas, Axios, Material-UI Icons.

**Spec:** Virtual Paper Trading & Real-Time Stock Screener Specification (Zerodha Kite Clone Training Suite).

---

## Global Constraints

- Zero browser `alert()` or `confirm()` popups; all notifications must use the modern floating 10-second notification cards (`Toast.js`).
- Zero emojis across components; use official Material-UI or FontAwesome vector icons exclusively.
- All monetary amounts must format in Indian Rupee notation (`₹10,00,000.00` via `en-IN` locale).
- All timestamps and market timelines must adhere strictly to Indian Standard Time (`Asia/Kolkata`, IST: 09:15 AM to 03:30 PM).
- Order execution must enforce realistic trading constraints: reject BUY orders when `availableMargin < marginRequired`; reject SELL orders on CNC when shares are not held.
- MIS (Intraday) orders provide 5x leverage (`marginRequired = (price * qty) / 5`), while CNC (Delivery) requires 1x cash (`price * qty`).

---

## Review Focus

1. **Insufficient Margin on Limit Order Trigger:** When a pending limit order triggers on a price dip, verify it does not execute if the user spent their margin on another trade while the order was pending.
2. **Short Selling on MIS vs CNC:** Verify short selling is permitted on MIS (Intraday) with automatic square-off / position creation, but blocked on CNC (Cash-and-Carry) if the user has 0 quantity.
3. **Screener Filter Edge Cases:** Verify screening with empty filters or conflicting parameters (e.g., sector "Banking" + search "ZOMATO") returns an empty array cleanly without crashing.
4. **Virtual Fund Reset State Integrity:** When resetting virtual funds to ₹10,00,000, verify all active open positions, pending orders, and holdings are either archived or cleanly reset to avoid orphan P&L calculations.
5. **Real-time Price Tick Throttling:** Ensure the multi-stock screener polling doesn't choke the client or exceed rate limits by caching screener calculations for 10 seconds.

---

## File Structure & Responsibility Map

```
backend/
├── services/
│   ├── marketService.js            # Existing live market & candle engine
│   ├── screenerService.js          # NEW: Multi-metric stock screening and ranking
│   └── orderEngine.js              # NEW: Paper trading order matching (Market, Limit, SL)
├── routes/
│   ├── marketRoutes.js             # Existing market routes (extended with /api/market/screener)
│   ├── orderRoutes.js              # Order placement and pending order queue
│   └── fundsRoutes.js              # Virtual wallet funds and reset endpoints
├── test/
│   ├── screener.test.js            # NEW: Unit tests for screener filtering and sorting
│   └── paper_trading.test.js       # NEW: Unit tests for order matching, SL trigger, and margin
dashboard/src/
├── components/
│   ├── Screener.js                 # NEW: Real-time stock screener table and filter chips
│   ├── Screener.css                # NEW: Styling for screener UI, badges, and metrics
│   ├── Funds.js                    # MODIFIED: Virtual training capital, reset wallet button
│   ├── BuyActionWindow.js          # MODIFIED: Limit/Market/SL selector & 5x MIS leverage
│   ├── Orders.js                   # MODIFIED: Executed vs Pending orders tab with cancellation
│   ├── Summary.js                  # MODIFIED: Trader performance analytics (Win Rate, Equity Curve)
│   └── Menu.js                     # MODIFIED: Add Screener navigation tab
```

---

## Tasks

### Task 1: Virtual Training Capital & Practice Wallet Management

**Files:**
- Modify: `backend/utils/memoryStore.js`
- Modify: `backend/index.js`
- Create: `backend/test/wallet.test.js`
- Modify: `dashboard/src/components/Funds.js`

**Interfaces:**
- Consumes: Authenticated session (`userId`)
- Produces: `POST /funds/reset` returning `{ availableMargin: 1000000, usedMargin: 0, totalEquity: 1000000 }`

- [ ] **Step 1: Write the failing test for virtual wallet reset and initial ₹10,00,000 balance**

```javascript
// backend/test/wallet.test.js
const test = require('node:test');
const assert = require('node:assert');
const memoryStore = require('../utils/memoryStore');

test('Virtual Wallet: Initializes user with ₹10,00,000 and allows 1-click reset', () => {
  const userId = 'trader_test_101';
  const funds = memoryStore.getFunds(userId);
  assert.strictEqual(funds.availableMargin, 1000000, 'New user should start with 10 Lakhs virtual capital');
  
  // Deduct margin on a trade
  memoryStore.deductMargin(userId, 250000);
  assert.strictEqual(memoryStore.getFunds(userId).availableMargin, 750000);

  // Reset virtual wallet
  const resetFunds = memoryStore.resetVirtualFunds(userId);
  assert.strictEqual(resetFunds.availableMargin, 1000000, 'Wallet reset should restore 10 Lakhs capital');
  assert.strictEqual(resetFunds.usedMargin, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test backend/test/wallet.test.js`
Expected: FAIL with "memoryStore.resetVirtualFunds is not a function" or balance mismatch.

- [ ] **Step 3: Implement virtual wallet reset and ₹10L initial capital in `backend/utils/memoryStore.js` and `backend/index.js`**

Implement `resetVirtualFunds(userId)` in `memoryStore.js` resetting `availableMargin: 1000000`, `usedMargin: 0`, and clearing/resetting demo trade orders. Expose `POST /funds/reset` in `backend/index.js`. Update `Funds.js` to render a prominent "Reset Training Capital (₹10L)" button with a confirmation toast.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test backend/test/wallet.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/utils/memoryStore.js backend/index.js backend/test/wallet.test.js dashboard/src/components/Funds.js
git commit -m "feat: Add ₹10L virtual training capital and 1-click wallet reset"
```

---

### Task 2: Real-Time Stock Screener Backend Service

**Files:**
- Create: `backend/services/screenerService.js`
- Modify: `backend/routes/marketRoutes.js`
- Create: `backend/test/screener.test.js`

**Interfaces:**
- Consumes: `INDIAN_STOCKS_DIRECTORY` and `marketService.getQuote(symbol)`
- Produces: `GET /api/market/screener?sector=&marketCap=&sort=&order=&search=` returning an array of enriched stock objects:
  ```typescript
  interface ScreenerStock {
    symbol: string;
    name: string;
    sector: string;
    price: number;
    change: number;
    percent: string;
    isDown: boolean;
    marketCapCategory: "Large Cap" | "Mid Cap" | "Small Cap";
    peRatio: number;
    dayHigh: number;
    dayLow: number;
    high52w: number;
    low52w: number;
    proximity52wHigh: number; // % away from 52W high
    volume: number;
  }
  ```

- [ ] **Step 1: Write the failing test for stock screener multi-metric filtering and sorting**

```javascript
// backend/test/screener.test.js
const test = require('node:test');
const assert = require('node:assert');
const { getScreenerStocks } = require('../services/screenerService');

test('Screener Service: Filters stocks by sector and sorts by change percentage', async () => {
  // Test 1: Filter by Sector "Banking & Financials"
  const banking = await getScreenerStocks({ sector: 'Banking & Financials' });
  assert.ok(banking.length > 0, 'Should find banking stocks');
  assert.ok(banking.every(s => s.sector === 'Banking & Financials'), 'All results must match sector');

  // Test 2: Filter by Top Gainers
  const gainers = await getScreenerStocks({ sort: 'gainers' });
  assert.ok(gainers.length > 1);
  assert.ok(gainers[0].changePercent >= gainers[1].changePercent, 'Must sort descending by percentage');

  // Test 3: Search keyword
  const reliance = await getScreenerStocks({ search: 'reliance' });
  assert.strictEqual(reliance[0].symbol, 'RELIANCE');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test backend/test/screener.test.js`
Expected: FAIL with "Cannot find module '../services/screenerService'"

- [ ] **Step 3: Implement `screenerService.js` and mount `GET /api/market/screener`**

In `backend/services/screenerService.js`:
- Enrich each stock from `INDIAN_STOCKS_DIRECTORY` with live quote data (`getQuote`), market cap categorization (Large/Mid/Small), estimated P/E ratio, 52-week ranges, and proximity to 52-week high.
- Implement filtering by `sector`, `marketCapCategory`, `near52wHigh` (within 5%), and `search` query.
- Implement sorting: `gainers` (changePercent desc), `losers` (changePercent asc), `volume` (volume desc), `price` (price desc).
- Cache screened results for 10 seconds to protect performance.
- Mount `GET /api/market/screener` in `backend/routes/marketRoutes.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test backend/test/screener.test.js`
Expected: PASS (all 3 assertions pass).

- [ ] **Step 5: Commit**

```bash
git add backend/services/screenerService.js backend/routes/marketRoutes.js backend/test/screener.test.js
git commit -m "feat: Implement real-time multi-metric stock screener backend service"
```

---

### Task 3: Interactive Stock Screener UI Component (`Screener.js`)

**Files:**
- Create: `dashboard/src/components/Screener.js`
- Create: `dashboard/src/components/Screener.css`
- Modify: `dashboard/src/components/Menu.js`
- Modify: `dashboard/src/components/Dashboard.js`

**Interfaces:**
- Consumes: `GET /api/market/screener` via Axios
- Produces: Visual Screener UI with instant sector chips, metric sorting, quick search, and 1-click B/S/Chart modal actions.

- [ ] **Step 1: Create `Screener.css` with clean Kite-styled tables and filter chips**

Define CSS classes:
- `.screener-container`: Clean padding, responsive layout.
- `.screener-toolbar`: Quick filter chips (All, Top Gainers, Top Losers, Near 52W High, High Volume, Large Cap, Banking, IT, Auto).
- `.screener-table`: Fixed header, hover rows, color-coded change percentages (`#00a25b` green / `#df514c` red).
- `.action-btn-group`: Compact `B`, `S`, `Chart`, and `+ Watchlist` action buttons on each stock row.

- [ ] **Step 2: Implement `Screener.js` component**

Features:
- State: `stocks`, `loading`, `selectedSector`, `activeFilter` ('all' | 'gainers' | 'losers' | '52w_high' | 'volume'), `searchQuery`, `sortField`, `sortAsc`.
- Top Filter Bar: Interactive chips for instant 1-click filtering.
- Search Input: Debounced real-time filter by ticker or company name.
- Data Columns: Symbol, Company Name, Sector, Market Price (with real-time green/red tick flash), Day Change (₹ and %), Market Cap Tag, 52W Range bar, Actions.
- Action Buttons:
  - `B`: Calls `openBuyWindow(stock.symbol)`
  - `S`: Calls `openSellWindow(stock.symbol)`
  - `Chart`: Calls `openChartModal(stock.symbol)`
  - `+`: Adds stock to active watchlist with 10-second success toast card.

- [ ] **Step 3: Register Screener in `Menu.js` and `Dashboard.js`**

Add `Screener` tab in the top navigation bar between `Holdings` and `Positions` (or next to `Orders`). Update React Router routes in `Dashboard.js` to render `<Screener />` at `/screener`.

- [ ] **Step 4: Verify build with zero warnings**

Run: `npm run build:dashboard`
Expected: Compiled successfully with zero warnings.

- [ ] **Step 5: Commit**

```bash
git add dashboard/src/components/Screener.js dashboard/src/components/Screener.css dashboard/src/components/Menu.js dashboard/src/components/Dashboard.js
git commit -m "feat: Add interactive real-time Stock Screener UI with 1-click trading actions"
```

---

### Task 4: Paper Trading Limit & Stop-Loss Order Execution Engine

**Files:**
- Create: `backend/services/orderEngine.js`
- Modify: `backend/index.js`
- Modify: `dashboard/src/components/BuyActionWindow.js`
- Modify: `dashboard/src/components/Orders.js`
- Create: `backend/test/orderEngine.test.js`

**Interfaces:**
- Consumes: Live quote ticks from `marketService.getQuote(symbol)`
- Produces: Execution transitions: `PENDING` $\rightarrow$ `EXECUTED` when market price crosses limit or stop-loss trigger price.

- [ ] **Step 1: Write the failing test for Limit and Stop-Loss order matching**

```javascript
// backend/test/orderEngine.test.js
const test = require('node:test');
const assert = require('node:assert');
const { placeOrder, processTick, getOrders } = require('../services/orderEngine');

test('Order Engine: Executes Limit orders when market price reaches trigger threshold', () => {
  const userId = 'trader_paper_1';
  
  // Place BUY LIMIT order below market (e.g., RELIANCE at ₹1,300 when market is ₹1,320)
  const order = placeOrder(userId, {
    symbol: 'RELIANCE',
    qty: 10,
    price: 1300.00,
    orderType: 'LIMIT',
    product: 'CNC',
    mode: 'BUY',
  });
  
  assert.strictEqual(order.status, 'PENDING', 'Limit order should remain pending until price dips');

  // Simulate market price dipping to ₹1,299
  const executed = processTick('RELIANCE', 1299.00);
  assert.strictEqual(executed.length, 1);
  assert.strictEqual(executed[0].status, 'EXECUTED');
  assert.strictEqual(executed[0].executedPrice, 1299.00);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test backend/test/orderEngine.test.js`
Expected: FAIL with "Cannot find module '../services/orderEngine'"

- [ ] **Step 3: Implement `orderEngine.js` with Limit/SL matching and 5x Intraday MIS leverage**

In `backend/services/orderEngine.js`:
- Store pending limit and SL orders in memory keyed by symbol.
- Margin Calculation:
  - If `product === 'MIS'`, `marginRequired = (price * qty) / 5` (5x training leverage).
  - If `product === 'CNC'`, `marginRequired = price * qty`.
- Check user `availableMargin` before placing order.
- Implement `processTick(symbol, currentPrice)`:
  - For BUY LIMIT: triggers if `currentPrice <= order.price`.
  - For SELL LIMIT: triggers if `currentPrice >= order.price`.
  - For STOP-LOSS (SL): triggers if `currentPrice <= order.triggerPrice` (for sell SL).
- On execution: update user Holdings (CNC) or Positions (MIS), deduct margin, and add executed transaction to user order book.
- Expose `GET /orders/pending`, `POST /orders/cancel/:id` in `backend/index.js`.

- [ ] **Step 4: Update `BuyActionWindow.js` and `Orders.js`**

In `BuyActionWindow.js`:
- Connect order type selector (`MARKET` | `LIMIT` | `SL`) and product type (`CNC` | `MIS`).
- Display dynamic "Margin Required (5x Leverage)" badge when MIS is toggled.
- Send `orderType`, `product`, `triggerPrice` to `POST /newOrder`.
In `Orders.js`:
- Add tab toggle: "Executed Orders" vs "Open / Pending Orders".
- For pending orders, display a "Cancel Order" button with immediate margin refund.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test backend/test/orderEngine.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/services/orderEngine.js backend/index.js dashboard/src/components/BuyActionWindow.js dashboard/src/components/Orders.js backend/test/orderEngine.test.js
git commit -m "feat: Implement simulated Limit, SL, and 5x leverage order matching engine"
```

---

### Task 5: Real-Time Mark-to-Market (MTM) Portfolio Sync

**Files:**
- Modify: `dashboard/src/components/Holdings.js`
- Modify: `dashboard/src/components/Positions.js`
- Modify: `dashboard/src/components/GeneralContext.js`

**Interfaces:**
- Consumes: Live market quotes from `/api/market/quotes`
- Produces: Dynamic recalculation of `currentValue`, `pnl`, `dayChange`, and total portfolio return on every tick without reloading.

- [ ] **Step 1: Write integration test for portfolio MTM recalculation**

```javascript
// backend/test/mtm.test.js
const test = require('node:test');
const assert = require('node:assert');
const { calculatePortfolioMTM } = require('../utils/portfolioMath');

test('Portfolio MTM: Calculates accurate unrealized P&L and return % against live prices', () => {
  const holdings = [
    { name: 'RELIANCE', qty: 10, avgPrice: 1300.00 }, // Invested: 13000
    { name: 'TCS', qty: 5, avgPrice: 2500.00 },      // Invested: 12500
  ];
  const liveQuotes = {
    'RELIANCE': { price: 1320.00 }, // +200
    'TCS': { price: 2480.00 },      // -100
  };

  const mtm = calculatePortfolioMTM(holdings, liveQuotes);
  assert.strictEqual(mtm.totalInvestment, 25500.00);
  assert.strictEqual(mtm.totalCurrentValue, 25600.00);
  assert.strictEqual(mtm.totalPnl, 100.00);
  assert.strictEqual(mtm.pnlPercentage, '+0.39%');
});
```

- [ ] **Step 2: Run test to verify it passes/fails**

Run: `node --test backend/test/mtm.test.js`
Verify behavior and ensure math functions exist in `backend/utils/portfolioMath.js`.

- [ ] **Step 3: Update `Holdings.js` and `Positions.js` with live price subscription**

In `Holdings.js` and `Positions.js`:
- Poll `/api/market/quotes` every 4 seconds for all held tickers.
- Dynamically update each row's `curValue = qty * livePrice` and `pnl = (livePrice - avgPrice) * qty`.
- Flash row background with subtle green/red highlight when price changes.
- Update top header summary metrics (Total Investment, Current Value, Overall P&L, Day P&L) in real time.

- [ ] **Step 4: Verify dashboard build**

Run: `npm run build:dashboard`
Expected: Compiled successfully with zero errors.

- [ ] **Step 5: Commit**

```bash
git add backend/test/mtm.test.js dashboard/src/components/Holdings.js dashboard/src/components/Positions.js dashboard/src/components/GeneralContext.js
git commit -m "feat: Enable real-time Mark-to-Market (MTM) P&L updates on Holdings and Positions"
```

---

### Task 6: Trader Learning Analytics & Performance Journal in `Summary.js`

**Files:**
- Modify: `dashboard/src/components/Summary.js`
- Create: `dashboard/src/components/TradeAnalytics.js`
- Create: `dashboard/src/components/TradeAnalytics.css`

**Interfaces:**
- Consumes: Completed user orders and realized trades
- Produces: Visual training dashboard with Win/Loss ratio, Profit Factor, Net Realized P&L, Equity Growth curve, and trading tips for beginners.

- [ ] **Step 1: Create `TradeAnalytics.js` component**

Calculate and display key training metrics:
1. **Win Rate:** Percentage of profitable closed trades (e.g., `68.5%`).
2. **Profit Factor:** Gross Profits divided by Gross Losses (e.g., `1.85`).
3. **Average Win vs Average Loss:** Gauge risk-to-reward discipline.
4. **Virtual Capital Health:** Total available cash, capital utilization gauge bar.
5. **Interactive Equity Curve:** Canvas/Chart.js line chart showing capital growth over trades.
6. **Practice Tips Pill:** Dynamic guidance based on performance (e.g., "Good risk management! You are risking less than 2% of capital per trade.").

- [ ] **Step 2: Embed `TradeAnalytics` into `Summary.js`**

Place the Analytics card directly below the Equity & Commodity overview cards in `Summary.js`. Ensure it refreshes when trades execute.

- [ ] **Step 3: Run production build check**

Run: `npm run build:dashboard`
Expected: Clean build with zero warnings.

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/components/Summary.js dashboard/src/components/TradeAnalytics.js dashboard/src/components/TradeAnalytics.css
git commit -m "feat: Add paper trading performance analytics, win rate, and equity curve to Summary"
```

---

### Task 7: Full Test Suite, Build Verification & Cloud Deployment

**Files:**
- Modify: `WHAT_NEEDS_TO_BE_DONE.md`

- [ ] **Step 1: Run complete backend test suite**

Run: `npm run test:backend`
Expected: 100% tests passing across all suites (`market.test.js`, `screener.test.js`, `orderEngine.test.js`, `wallet.test.js`, `mtm.test.js`).

- [ ] **Step 2: Run clean production builds**

Run: `npm run build:dashboard && npm run build:frontend`
Expected: Both applications compile with 0 errors and 0 warnings.

- [ ] **Step 3: Update roadmap document**

Add Phase 13 to `WHAT_NEEDS_TO_BE_DONE.md` documenting the Real-Time Paper Trading and Screener Platform deliverables.

- [ ] **Step 4: Git Push & Deployment Sync**

```bash
git push origin main
```
Verify Render picks up backend endpoints and Vercel deploys frontend/dashboard updates.

---

## Self-Review Checklist

1. **Spec Coverage:** Covers virtual starter money (₹10L), wallet reset, real-time multi-metric stock screener, 1-click B/S/Chart actions, Limit/SL order simulation, 5x MIS leverage, live MTM portfolio calculations, and learning analytics.
2. **Step Scan:** Every step defines exact files, tests, signatures, and expected outputs.
3. **No Code Written Yet:** This plan details architecture and decisions without touching the implementation code, preserving user's strict requirement.
4. **Review Focus Handled:** Insufficient margin checks, short-selling constraints, screener filter edge cases, and wallet reset integrity are addressed in Task 1, Task 2, and Task 4.
