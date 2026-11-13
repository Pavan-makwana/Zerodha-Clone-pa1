// backend/utils/memoryStore.js
// In-memory fallback database for graceful operation when MongoDB Atlas is unreachable or paused.

const crypto = require('crypto');

const defaultHoldings = [
  { name: "BHARTIARTL", qty: 2, avg: 2040.00, price: 2094.20, net: "+2.65%", day: "+1.81%" },
  { name: "HDFCBANK", qty: 4, avg: 760.00, price: 785.45, net: "+3.35%", day: "+0.45%" },
  { name: "HINDUNILVR", qty: 1, avg: 2335.85, price: 2380.00, net: "+1.89%", day: "+0.21%" },
  { name: "INFY", qty: 2, avg: 1150.00, price: 1174.00, net: "+2.09%", day: "+0.57%" },
  { name: "ITC", qty: 5, avg: 455.00, price: 468.00, net: "+2.86%", day: "+0.80%" },
  { name: "KPITTECH", qty: 2, avg: 1380.00, price: 1420.00, net: "+2.90%", day: "+1.54%" },
  { name: "M&M", qty: 1, avg: 2780.00, price: 2840.00, net: "+2.16%", day: "+0.85%" },
  { name: "RELIANCE", qty: 2, avg: 1295.00, price: 1320.00, net: "+1.93%", day: "+0.50%" },
  { name: "SBIN", qty: 4, avg: 790.00, price: 810.00, net: "+2.53%", day: "-0.34%" },
  { name: "SGBMAY29", qty: 2, avg: 4727.00, price: 4719.00, net: "-0.17%", day: "+0.15%" },
  { name: "TATAPOWER", qty: 5, avg: 380.00, price: 395.00, net: "+3.95%", day: "+0.74%" },
  { name: "TCS", qty: 1, avg: 2460.00, price: 2498.50, net: "+1.57%", day: "+0.11%" },
  { name: "WIPRO", qty: 4, avg: 535.00, price: 545.00, net: "+1.87%", day: "+0.32%" },
];

const defaultPositions = [
  { product: "CNC", name: "EVEREADY", qty: 2, avg: 375.00, price: 380.00, net: "+1.33%", day: "-0.45%", isLoss: false },
  { product: "CNC", name: "JUBLFOOD", qty: 2, avg: 570.00, price: 580.00, net: "+1.75%", day: "+0.35%", isLoss: false },
  { product: "FUT", name: "TCS", qty: 25, avg: 2480.00, price: 2498.50, net: "+0.75%", day: "+0.11%", isLoss: false },
  { product: "CNC", name: "RELIANCE", qty: 10, avg: 1310.00, price: 1320.00, net: "+0.76%", day: "+0.50%", isLoss: false },
];

const defaultWatchlist = [
  { name: "RELIANCE", price: 1320.00, percent: "+0.50%", isDown: false },
  { name: "TCS", price: 2498.50, percent: "+0.11%", isDown: false },
  { name: "INFY", price: 1174.00, percent: "+0.57%", isDown: false },
  { name: "BHARTIARTL", price: 2094.20, percent: "+1.81%", isDown: false },
  { name: "HDFCBANK", price: 785.45, percent: "+3.35%", isDown: false },
  { name: "ONGC", price: 260.00, percent: "-0.25%", isDown: true },
  { name: "WIPRO", price: 545.00, percent: "+0.32%", isDown: false },
  { name: "M&M", price: 2840.00, percent: "+0.85%", isDown: false },
  { name: "KPITTECH", price: 1420.00, percent: "+1.54%", isDown: false },
  { name: "QUICKHEAL", price: 540.00, percent: "-0.45%", isDown: true },
];

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.holdings = new Map();
    this.positions = new Map();
    this.orders = new Map();
    this.watchlists = new Map();

    // Pre-seed demo users
    this.initDemoUser("usr_pavan", "Pavan Makwana", "pa10506@zerodha.com", "$2b$10$gnFYjGY1SbOGErVfZFws9eETyfqpVbarStcQQF9UduyP1ypWmvXN.");
    this.initDemoUser("usr_demo", "Demo Trader", "demo@zerodha.com", "$2b$10$frI/IOIaUHFohBomMoZcruUeD5PTw9Ef8arwCWjDGLzNUGMMq..K2");
  }

  initDemoUser(id, name, email, passwordHash) {
    const user = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      funds: 1000000.00,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.initUserData(id);
    return user;
  }

  initUserData(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        _id: userId,
        id: userId,
        name: "Paper Trader",
        email: `${userId}@zerodha.com`,
        funds: 1000000.00,
        createdAt: new Date(),
      });
    }
    if (!this.holdings.has(userId)) {
      this.holdings.set(userId, defaultHoldings.map((h, i) => ({
        _id: `hld_${userId}_${i}`,
        userId,
        ...h,
      })));
    }
    if (!this.positions.has(userId)) {
      this.positions.set(userId, defaultPositions.map((p, i) => ({
        _id: `pos_${userId}_${i}`,
        userId,
        ...p,
      })));
    }
    if (!this.watchlists.has(userId)) {
      this.watchlists.set(userId, defaultWatchlist.map((w, i) => ({
        _id: `wtc_${userId}_${i}`,
        userId,
        ...w,
      })));
    }
    if (!this.orders.has(userId)) {
      this.orders.set(userId, [
        {
          _id: `ord_${userId}_0`,
          userId,
          name: "INFY",
          qty: 1,
          price: 1555.45,
          mode: "BUY",
          status: "COMPLETE",
          createdAt: new Date(),
        }
      ]);
    }
  }

  findUserByEmail(email) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === clean) return user;
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(String(id)) || null;
  }

  createUser({ name, email, passwordHash }) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = {
      _id: id,
      id,
      name,
      email: email.toLowerCase().trim(),
      password: passwordHash,
      funds: 1000000.00,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.initUserData(id);
    return user;
  }

  getHoldings(userId) {
    const uid = String(userId);
    this.initUserData(uid);
    return this.holdings.get(uid) || [];
  }

  getPositions(userId) {
    const uid = String(userId);
    this.initUserData(uid);
    return this.positions.get(uid) || [];
  }

  getOrders(userId) {
    const uid = String(userId);
    this.initUserData(uid);
    return (this.orders.get(uid) || []).slice().reverse();
  }

  getWatchlist(userId) {
    const uid = String(userId);
    this.initUserData(uid);
    return this.watchlists.get(uid) || [];
  }

  addWatchlistItem(userId, item) {
    const uid = String(userId);
    this.initUserData(uid);
    const list = this.watchlists.get(uid);
    const newItem = {
      _id: `wtc_${Date.now()}`,
      userId: uid,
      name: item.name.toUpperCase().trim(),
      price: Number(item.price) || 100,
      percent: item.percent || "+0.00%",
      isDown: Boolean(item.isDown),
    };
    list.unshift(newItem);
    return newItem;
  }

  removeWatchlistItem(userId, identifier) {
    const uid = String(userId);
    this.initUserData(uid);
    const list = this.watchlists.get(uid);
    const clean = String(identifier).toUpperCase().trim();
    const index = list.findIndex(w => w._id === identifier || String(w._id) === String(identifier) || w.name.toUpperCase() === clean);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  }

  addFunds(userId, amount) {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.funds = Math.round(((user.funds || 1000000) + Number(amount)) * 100) / 100;
    return user.funds;
  }

  resetVirtualFunds(userId) {
    const uid = String(userId);
    this.initUserData(uid);
    let user = this.findUserById(uid);
    if (!user) {
      user = {
        _id: uid,
        id: uid,
        name: "Paper Trader",
        email: `${uid}@zerodha.com`,
        funds: 1000000.00,
        createdAt: new Date(),
      };
      this.users.set(uid, user);
    } else {
      user.funds = 1000000.00;
    }
    return user.funds;
  }

  executeOrder({ userId, name, qty, price, mode, product = "CNC", orderType = "MARKET" }) {
    const uid = String(userId);
    this.initUserData(uid);
    let user = this.findUserById(uid);
    if (!user) {
      user = {
        _id: uid,
        id: uid,
        name: "Paper Trader",
        email: `${uid}@zerodha.com`,
        funds: 1000000.00,
        createdAt: new Date(),
      };
      this.users.set(uid, user);
    }

    const stockName = name.toUpperCase().trim();
    const orderQty = Number(qty);
    const orderPrice = Number(price);
    const totalCost = orderQty * orderPrice;
    const normalizedMode = mode.toUpperCase();
    const normalizedProduct = (product || "CNC").toUpperCase();

    // MIS (Intraday) has 5x leverage -> 1/5th margin required
    const marginRequired = normalizedProduct === "MIS"
      ? Math.round((totalCost / 5) * 100) / 100
      : totalCost;

    let orderPayloadRealizedPL = 0;

    if (normalizedMode === "BUY") {
      if (user && user.funds < marginRequired) {
        throw new Error(`Insufficient funds. Required: ₹${marginRequired.toFixed(2)}, Available: ₹${user.funds.toFixed(2)}`);
      }
      if (user) {
        user.funds = Math.round((user.funds - marginRequired) * 100) / 100;
      }

      if (normalizedProduct === "MIS") {
        const userPositions = this.positions.get(uid);
        const existing = userPositions.find(p => p.name.toUpperCase() === stockName && p.product === "MIS");
        if (existing) {
          const totalCostPrev = existing.qty * existing.price;
          existing.qty += orderQty;
          existing.price = Math.round(((totalCostPrev + totalCost) / existing.qty) * 100) / 100;
        } else {
          userPositions.push({
            _id: `pos_${Date.now()}`,
            userId: uid,
            product: "MIS",
            name: stockName,
            qty: orderQty,
            avg: orderPrice,
            price: orderPrice,
            net: "+0.00%",
            day: "+0.00%",
            isLoss: false,
          });
        }
      } else {
        const userHoldings = this.holdings.get(uid);
        const existing = userHoldings.find(h => h.name.toUpperCase() === stockName);
        if (existing) {
          const totalPreviousCost = existing.qty * existing.avg;
          existing.qty += orderQty;
          existing.avg = Math.round(((totalPreviousCost + totalCost) / existing.qty) * 100) / 100;
          existing.price = orderPrice;
        } else {
          userHoldings.push({
            _id: `hld_${Date.now()}`,
            userId: uid,
            name: stockName,
            qty: orderQty,
            avg: orderPrice,
            price: orderPrice,
            net: "+0.00%",
            day: "+0.00%",
          });
        }
      }
    } else if (normalizedMode === "SELL") {
      let realizedPL = 0;
      if (normalizedProduct === "MIS") {
        const userPositions = this.positions.get(uid);
        const existing = userPositions.find(p => p.name.toUpperCase() === stockName && p.product === "MIS");
        if (existing) {
          const avgPrice = existing.avg || existing.price || orderPrice;
          realizedPL = Math.round(((orderPrice - avgPrice) * orderQty) * 100) / 100;
          existing.qty -= orderQty;
          if (existing.qty <= 0) {
            const idx = userPositions.indexOf(existing);
            userPositions.splice(idx, 1);
          }
        }
        if (user) {
          user.funds = Math.max(0, Math.round((user.funds + marginRequired + realizedPL) * 100) / 100);
        }
      } else {
        const userHoldings = this.holdings.get(uid);
        const existing = userHoldings.find(h => h.name.toUpperCase() === stockName);
        if (!existing || existing.qty < orderQty) {
          const available = existing ? existing.qty : 0;
          throw new Error(`Insufficient stock holdings. Requested to sell: ${orderQty}, Available: ${available}`);
        }
        const avgPrice = existing.avg || existing.price || orderPrice;
        realizedPL = Math.round(((orderPrice - avgPrice) * orderQty) * 100) / 100;
        existing.qty -= orderQty;
        if (existing.qty === 0) {
          const idx = userHoldings.indexOf(existing);
          userHoldings.splice(idx, 1);
        }
        if (user) {
          user.funds = Math.round((user.funds + totalCost) * 100) / 100;
        }
      }

      orderPayloadRealizedPL = realizedPL;
    }

    const order = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      name: stockName,
      qty: orderQty,
      price: orderPrice,
      mode: normalizedMode,
      product: normalizedProduct,
      orderType: orderType || "MARKET",
      status: "COMPLETE",
      realizedPL: orderPayloadRealizedPL,
      createdAt: new Date(),
    };
    this.orders.get(uid).push(order);

    return {
      order,
      availableMargin: user ? user.funds : undefined,
      marginDeducted: normalizedMode === "BUY" ? marginRequired : 0,
    };
  }

  squareOffPosition(userId, { name, product, currentPrice }) {
    const uid = String(userId);
    this.initUserData(uid);
    const stockName = name.toUpperCase().trim();
    const prod = (product || "MIS").toUpperCase();
    const userPositions = this.positions.get(uid);
    const existing = userPositions.find(p => p.name.toUpperCase() === stockName && p.product === prod);
    if (!existing) {
      throw new Error(`No active position found for ${stockName} (${prod})`);
    }

    const qty = existing.qty;
    const avg = existing.avg || existing.price;
    const exitPrice = Number(currentPrice) || existing.price || avg;
    const realizedPL = Math.round(((exitPrice - avg) * qty) * 100) / 100;
    const originalMargin = prod === "MIS"
      ? Math.round(((avg * qty) / 5) * 100) / 100
      : Math.round((avg * qty) * 100) / 100;
    const netCredit = Math.round((originalMargin + realizedPL) * 100) / 100;

    const idx = userPositions.indexOf(existing);
    userPositions.splice(idx, 1);

    const user = this.findUserById(uid);
    if (user) {
      user.funds = Math.max(0, Math.round((user.funds + netCredit) * 100) / 100);
    }

    const order = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      name: stockName,
      qty,
      price: exitPrice,
      mode: "SELL",
      product: prod,
      orderType: "MARKET",
      status: "COMPLETE",
      realizedPL,
      createdAt: new Date(),
    };
    this.orders.get(uid).push(order);

    return {
      message: `Squared off ${qty} shares of ${stockName} at ₹${exitPrice.toFixed(2)}. P&L: ${realizedPL >= 0 ? "+" : ""}₹${realizedPL.toFixed(2)}`,
      order,
      realizedPL,
      availableMargin: user ? user.funds : undefined,
    };
  }

  squareOffAll(userId, priceMap = {}) {
    const uid = String(userId);
    this.initUserData(uid);
    const userPositions = this.positions.get(uid).slice();
    const results = [];
    let totalRealized = 0;

    for (const pos of userPositions) {
      const livePrice = priceMap[pos.name.toUpperCase()] || pos.price;
      const res = this.squareOffPosition(uid, {
        name: pos.name,
        product: pos.product,
        currentPrice: livePrice,
      });
      results.push(res);
      totalRealized += res.realizedPL;
    }

    const user = this.findUserById(uid);
    return {
      message: `Squared off ${results.length} positions. Total P&L: ${totalRealized >= 0 ? "+" : ""}₹${totalRealized.toFixed(2)}`,
      results,
      totalRealized: Math.round(totalRealized * 100) / 100,
      availableMargin: user ? user.funds : undefined,
    };
  }

  getTradeAnalytics(userId) {
    const uid = String(userId);
    this.initUserData(uid);
    const orders = this.orders.get(uid) || [];
    const completedOrders = orders.filter(o => o.status === "COMPLETE");
    const buyOrders = completedOrders.filter(o => o.mode === "BUY");
    const sellOrders = completedOrders.filter(o => o.mode === "SELL");

    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalTradedVolume = 0;

    completedOrders.forEach(o => {
      totalTradedVolume += (o.qty * o.price);
    });

    sellOrders.forEach(o => {
      const pl = o.realizedPL !== undefined ? o.realizedPL : 0;
      if (pl > 0) {
        grossProfit += pl;
        winCount++;
      } else if (pl < 0) {
        grossLoss += Math.abs(pl);
        lossCount++;
      }
    });

    const closedTrades = winCount + lossCount;
    const winRate = closedTrades > 0 ? Math.round((winCount / closedTrades) * 100) : 0;
    const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : (grossProfit > 0 ? 99.9 : 1.0);
    const netRealizedPL = Math.round((grossProfit - grossLoss) * 100) / 100;

    const user = this.findUserById(uid);
    const currentFunds = user ? user.funds : 1000000;
    const capitalGrowth = Math.round(((currentFunds - 1000000) / 1000000) * 10000) / 100;

    return {
      totalTrades: completedOrders.length,
      buyTrades: buyOrders.length,
      sellTrades: sellOrders.length,
      closedTrades,
      winCount,
      lossCount,
      winRate,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      profitFactor,
      netRealizedPL,
      totalTradedVolume: Math.round(totalTradedVolume * 100) / 100,
      currentFunds,
      capitalGrowth,
    };
  }
}

const memoryStore = new MemoryStore();

module.exports = { memoryStore };
