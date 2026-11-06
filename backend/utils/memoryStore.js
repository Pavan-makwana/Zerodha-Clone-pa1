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
      funds: 100000.00,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.initUserData(id);
    return user;
  }

  initUserData(userId) {
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
      funds: 100000.00,
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
    user.funds = Math.round(((user.funds || 100000) + Number(amount)) * 100) / 100;
    return user.funds;
  }

  executeOrder({ userId, name, qty, price, mode }) {
    const uid = String(userId);
    this.initUserData(uid);
    const user = this.findUserById(uid);
    const stockName = name.toUpperCase().trim();
    const orderQty = Number(qty);
    const orderPrice = Number(price);
    const totalCost = orderQty * orderPrice;
    const normalizedMode = mode.toUpperCase();

    if (normalizedMode === "BUY") {
      if (user && user.funds < totalCost) {
        throw new Error(`Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${user.funds.toFixed(2)}`);
      }
      if (user) {
        user.funds = Math.round((user.funds - totalCost) * 100) / 100;
      }
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
    } else if (normalizedMode === "SELL") {
      const userHoldings = this.holdings.get(uid);
      const existing = userHoldings.find(h => h.name.toUpperCase() === stockName);
      if (!existing || existing.qty < orderQty) {
        const available = existing ? existing.qty : 0;
        throw new Error(`Insufficient stock holdings. Requested to sell: ${orderQty}, Available: ${available}`);
      }
      existing.qty -= orderQty;
      if (existing.qty === 0) {
        const idx = userHoldings.indexOf(existing);
        userHoldings.splice(idx, 1);
      }
      if (user) {
        user.funds = Math.round((user.funds + totalCost) * 100) / 100;
      }
    }

    const order = {
      _id: `ord_${Date.now()}`,
      userId: uid,
      name: stockName,
      qty: orderQty,
      price: orderPrice,
      mode: normalizedMode,
      status: "COMPLETE",
      createdAt: new Date(),
    };
    this.orders.get(uid).push(order);

    return {
      order,
      availableMargin: user ? user.funds : undefined,
    };
  }
}

const memoryStore = new MemoryStore();

module.exports = { memoryStore };
