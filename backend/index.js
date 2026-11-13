// backend/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { HoldingsModel } = require('./model/HoldingsModel');
const { PositionsModel } = require('./model/PositionsModel');
const { OrdersModel } = require('./model/OrdersModel');
const { WatchlistModel } = require('./model/WatchlistModel');
const { UserModel } = require('./model/UserModel');
const { memoryStore } = require('./utils/memoryStore');

const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const isDbConnected = () => mongoose.connection.readyState === 1;

const app = express();
const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

// CORS Configuration: support local development, production, and preview URLs
const allowedOrigins = [
  'https://zerodha-clone-frontend-pa1.vercel.app',
  'https://zerodha-clone-dashboard-pa1.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Default watchlist data for new users (Real 2026 Indian Market Baselines)
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

// Initial demo holdings for newly registered users
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Zerodha Backend API is running successfully.",
    database: isDbConnected() ? "connected" : "fallback_mode",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    dbReadyState: mongoose.connection.readyState,
    database: isDbConnected() ? "connected" : "fallback_mode",
  });
});

// User Isolated Holdings
app.get('/allholdings', verifyToken, async (req, res) => {
  try {
    let rawHoldings = [];
    if (isDbConnected()) {
      let userHoldings = await HoldingsModel.find({ userId: req.user });
      if (userHoldings.length === 0) {
        const seedHoldings = await HoldingsModel.find({ userId: { $exists: false } });
        const source = seedHoldings.length > 0 ? seedHoldings : defaultHoldings;
        const initial = source.map((h) => ({
          userId: req.user,
          name: h.name,
          qty: h.qty,
          avg: h.avg,
          price: h.price,
          net: h.net,
          day: h.day,
        }));
        userHoldings = await HoldingsModel.insertMany(initial);
      }
      rawHoldings = userHoldings;
    } else {
      rawHoldings = memoryStore.getHoldings(req.user);
    }

    // Enrich holdings with live market prices & dynamic P&L
    const { getQuote } = require('./services/marketService');
    const enriched = await Promise.all(
      rawHoldings.map(async (h) => {
        try {
          const live = await getQuote(h.name);
          const obj = h.toObject ? h.toObject() : { ...h };
          const livePrice = live.price || obj.price;
          const avg = obj.avg || livePrice;
          const netVal = avg > 0 ? (((livePrice - avg) / avg) * 100).toFixed(2) : "0.00";
          return {
            ...obj,
            price: livePrice,
            day: live.percent || obj.day,
            net: `${Number(netVal) >= 0 ? "+" : ""}${netVal}%`,
            isLoss: live.isDown,
          };
        } catch (e) {
          return h;
        }
      })
    );

    return res.status(200).json(enriched);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch holdings" });
  }
});

// User Isolated Positions
app.get('/allpositions', verifyToken, async (req, res) => {
  try {
    let rawPositions = [];
    if (isDbConnected()) {
      let userPositions = await PositionsModel.find({ userId: req.user });
      if (userPositions.length === 0) {
        const seedPositions = await PositionsModel.find({ userId: { $exists: false } });
        const source = seedPositions.length > 0 ? seedPositions : defaultPositions;
        const initial = source.map((p) => ({
          userId: req.user,
          product: p.product,
          name: p.name,
          qty: p.qty,
          avg: p.avg,
          price: p.price,
          net: p.net,
          day: p.day,
          isLoss: p.isLoss,
        }));
        userPositions = await PositionsModel.insertMany(initial);
      }
      rawPositions = userPositions;
    } else {
      rawPositions = memoryStore.getPositions(req.user);
    }

    // Enrich positions with live market prices from marketService
    const { getQuote } = require('./services/marketService');
    const enriched = await Promise.all(
      rawPositions.map(async (p) => {
        try {
          const live = await getQuote(p.name);
          const obj = p.toObject ? p.toObject() : { ...p };
          const livePrice = live.price || obj.price;
          const avg = obj.avg || livePrice;
          const netVal = avg > 0 ? (((livePrice - avg) / avg) * 100).toFixed(2) : "0.00";
          return {
            ...obj,
            price: livePrice,
            day: live.percent || obj.day,
            net: `${Number(netVal) >= 0 ? "+" : ""}${netVal}%`,
            isLoss: live.isDown,
          };
        } catch (e) {
          return p;
        }
      })
    );

    return res.status(200).json(enriched);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch positions" });
  }
});

// Square Off Single Position (MIS or CNC)
app.post('/positions/exit', verifyToken, async (req, res) => {
  try {
    const { name, product, price } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Stock name is required to square off" });
    }

    const { getQuote } = require('./services/marketService');
    const quote = await getQuote(name);
    const exitPrice = Number(price) || quote.price;

    if (isDbConnected()) {
      const stockName = name.toUpperCase().trim();
      const prod = (product || "MIS").toUpperCase();
      const pos = await PositionsModel.findOne({ userId: req.user, name: stockName, product: prod });
      if (!pos) {
        return res.status(404).json({ message: `No active position found for ${stockName}` });
      }

      const qty = pos.qty;
      const avg = pos.avg || pos.price;
      const realizedPL = Math.round(((exitPrice - avg) * qty) * 100) / 100;
      const margin = prod === "MIS"
        ? Math.round(((avg * qty) / 5) * 100) / 100
        : Math.round((avg * qty) * 100) / 100;
      const credit = Math.round((margin + realizedPL) * 100) / 100;

      await PositionsModel.findByIdAndDelete(pos._id);

      const user = await UserModel.findById(req.user);
      if (user) {
        user.funds = Math.max(0, Math.round(((user.funds || 1000000) + credit) * 100) / 100);
        await user.save();
      }

      const order = new OrdersModel({
        userId: req.user,
        name: stockName,
        qty,
        price: exitPrice,
        mode: "SELL",
        product: prod,
        orderType: "MARKET",
        status: "COMPLETE",
        realizedPL,
        createdAt: new Date(),
      });
      await order.save();

      return res.status(200).json({
        message: `Position squared off! Realized P&L: ${realizedPL >= 0 ? "+" : ""}₹${realizedPL.toFixed(2)}`,
        order,
        realizedPL,
        availableMargin: user ? user.funds : undefined,
      });
    } else {
      const result = memoryStore.squareOffPosition(req.user, {
        name,
        product,
        currentPrice: exitPrice,
      });
      return res.status(200).json(result);
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to square off position" });
  }
});

// Square Off All Open Positions
app.post('/positions/exit-all', verifyToken, async (req, res) => {
  try {
    const { getQuote } = require('./services/marketService');
    if (isDbConnected()) {
      const userPositions = await PositionsModel.find({ userId: req.user });
      let totalRealized = 0;
      for (const pos of userPositions) {
        const quote = await getQuote(pos.name);
        const exitPrice = quote.price;
        const avg = pos.avg || pos.price;
        const realizedPL = Math.round(((exitPrice - avg) * pos.qty) * 100) / 100;
        const margin = pos.product === "MIS"
          ? Math.round(((avg * pos.qty) / 5) * 100) / 100
          : Math.round((avg * pos.qty) * 100) / 100;
        const credit = Math.round((margin + realizedPL) * 100) / 100;

        await PositionsModel.findByIdAndDelete(pos._id);
        const user = await UserModel.findById(req.user);
        if (user) {
          user.funds = Math.max(0, Math.round(((user.funds || 1000000) + credit) * 100) / 100);
          await user.save();
        }

        const order = new OrdersModel({
          userId: req.user,
          name: pos.name,
          qty: pos.qty,
          price: exitPrice,
          mode: "SELL",
          product: pos.product,
          orderType: "MARKET",
          status: "COMPLETE",
          realizedPL,
          createdAt: new Date(),
        });
        await order.save();
        totalRealized += realizedPL;
      }
      return res.status(200).json({
        message: `All positions squared off! Total P&L: ${totalRealized >= 0 ? "+" : ""}₹${totalRealized.toFixed(2)}`,
        totalRealized,
      });
    } else {
      const positions = memoryStore.getPositions(req.user);
      const priceMap = {};
      await Promise.all(
        positions.map(async (p) => {
          try {
            const q = await getQuote(p.name);
            priceMap[p.name.toUpperCase()] = q.price;
          } catch (e) {}
        })
      );
      const result = memoryStore.squareOffAll(req.user, priceMap);
      return res.status(200).json(result);
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to square off all positions" });
  }
});

// Trade Analytics Endpoint
app.get('/trade-analytics', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const orders = await OrdersModel.find({ userId: req.user });
      const completedOrders = orders.filter((o) => o.status === "COMPLETE");
      const buyOrders = completedOrders.filter((o) => o.mode === "BUY");
      const sellOrders = completedOrders.filter((o) => o.mode === "SELL");

      let grossProfit = 0;
      let grossLoss = 0;
      let winCount = 0;
      let lossCount = 0;
      let totalTradedVolume = 0;

      completedOrders.forEach((o) => {
        totalTradedVolume += (o.qty * o.price);
      });

      sellOrders.forEach((o) => {
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

      const user = await UserModel.findById(req.user);
      const currentFunds = user ? user.funds : 1000000;
      const capitalGrowth = Math.round(((currentFunds - 1000000) / 1000000) * 10000) / 100;

      return res.status(200).json({
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
      });
    } else {
      return res.status(200).json(memoryStore.getTradeAnalytics(req.user));
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch trade analytics" });
  }
});

// User Isolated Orders
app.get('/allorders', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const allOrders = await OrdersModel.find({ userId: req.user }).sort({ _id: -1 });
      return res.status(200).json(allOrders);
    } else {
      return res.status(200).json(memoryStore.getOrders(req.user));
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch orders" });
  }
});

// User Watchlist Endpoints
app.get('/watchlist', verifyToken, async (req, res) => {
  try {
    let items = [];
    if (isDbConnected()) {
      let userWatchlist = await WatchlistModel.find({ userId: req.user });
      if (userWatchlist.length === 0) {
        const initial = defaultWatchlist.map((s) => ({ ...s, userId: req.user }));
        userWatchlist = await WatchlistModel.insertMany(initial);
      }
      items = userWatchlist;
    } else {
      items = memoryStore.getWatchlist(req.user);
    }

    // Enrich with live market prices from marketService
    const { getQuote } = require('./services/marketService');
    const enriched = await Promise.all(
      items.map(async (item) => {
        try {
          const rawName = item.name;
          const live = await getQuote(rawName);
          const obj = item.toObject ? item.toObject() : { ...item };
          return {
            ...obj,
            price: live.price,
            percent: live.percent,
            isDown: live.isDown,
            isLive: live.isLive,
          };
        } catch (e) {
          return item;
        }
      })
    );

    return res.status(200).json(enriched);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch watchlist" });
  }
});

app.post('/watchlist/add', verifyToken, async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json({ message: "Stock symbol is required" });
    const stockName = name.toUpperCase().trim();

    if (isDbConnected()) {
      const existing = await WatchlistModel.findOne({ userId: req.user, name: stockName });
      if (existing) {
        return res.status(400).json({ message: "Stock is already in your watchlist" });
      }
      const item = new WatchlistModel({
        userId: req.user,
        name: stockName,
        price: Number(price) || 500.0,
        percent: "+0.00%",
        isDown: false,
      });
      await item.save();
      return res.status(201).json(item);
    } else {
      const item = memoryStore.addWatchlistItem(req.user, { name: stockName, price });
      return res.status(201).json(item);
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to add to watchlist" });
  }
});

app.delete('/watchlist/:name', verifyToken, async (req, res) => {
  try {
    const stockName = req.params.name.toUpperCase().trim();
    if (isDbConnected()) {
      await WatchlistModel.deleteOne({ userId: req.user, name: stockName });
    } else {
      memoryStore.removeWatchlistItem(req.user, stockName);
    }
    return res.status(200).json({ message: `Removed ${stockName} from watchlist` });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to remove from watchlist" });
  }
});

// User Margin & Funds Endpoints
app.get('/funds', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await UserModel.findById(req.user);
      if (!user) return res.status(404).json({ message: "User not found" });
      const availableMargin = user.funds !== undefined ? user.funds : 1000000.0;
      return res.status(200).json({ availableMargin, usedMargin: 0.0 });
    } else {
      const user = memoryStore.findUserById(req.user);
      const availableMargin = user && user.funds !== undefined ? user.funds : 1000000.0;
      return res.status(200).json({ availableMargin, usedMargin: 0.0 });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch funds" });
  }
});

app.post('/funds/reset', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await UserModel.findById(req.user);
      if (!user) return res.status(404).json({ message: "User not found" });
      user.funds = 1000000.0;
      await user.save();
      return res.status(200).json({ message: "Virtual training capital reset to ₹10,00,000", availableMargin: 1000000.0 });
    } else {
      const newBal = memoryStore.resetVirtualFunds(req.user);
      return res.status(200).json({ message: "Virtual training capital reset to ₹10,00,000", availableMargin: newBal });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to reset virtual funds" });
  }
});

app.post('/funds/add', verifyToken, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (isDbConnected()) {
      const user = await UserModel.findById(req.user);
      if (!user) return res.status(404).json({ message: "User not found" });
      user.funds = (user.funds || 0) + amount;
      await user.save();
      return res.status(200).json({ message: "Funds added successfully", availableMargin: user.funds });
    } else {
      const newBalance = memoryStore.addFunds(req.user, amount);
      return res.status(200).json({ message: "Funds added successfully", availableMargin: newBalance });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to add funds" });
  }
});

app.post('/funds/withdraw', verifyToken, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (isDbConnected()) {
      const user = await UserModel.findById(req.user);
      if (!user) return res.status(404).json({ message: "User not found" });
      if ((user.funds || 0) < amount) {
        return res.status(400).json({ message: "Insufficient available margin" });
      }
      user.funds = (user.funds || 0) - amount;
      await user.save();
      return res.status(200).json({ message: "Withdrawal completed", availableMargin: user.funds });
    } else {
      const user = memoryStore.findUserById(req.user);
      if ((user.funds || 0) < amount) {
        return res.status(400).json({ message: "Insufficient available margin" });
      }
      user.funds = (user.funds || 0) - amount;
      return res.status(200).json({ message: "Withdrawal completed", availableMargin: user.funds });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to withdraw funds" });
  }
});

// Order Execution with Balance & Ownership Validation
app.post('/newOrder', verifyToken, async (req, res) => {
  try {
    const { name, qty, price, mode, product, orderType } = req.body;

    if (!name || qty === undefined || price === undefined || !mode) {
      return res.status(400).json({ message: "Name, qty, price, and mode are required" });
    }

    const orderQty = Number(qty);
    const orderPrice = Number(price);

    if (isNaN(orderQty) || orderQty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }
    if (isNaN(orderPrice) || orderPrice <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const normalizedMode = mode.toUpperCase();
    if (normalizedMode !== "BUY" && normalizedMode !== "SELL") {
      return res.status(400).json({ message: "Mode must be either BUY or SELL" });
    }

    const normalizedProduct = (product || "CNC").toUpperCase();
    const normalizedOrderType = (orderType || "MARKET").toUpperCase();

    if (!isDbConnected()) {
      const result = memoryStore.executeOrder({
        userId: req.user,
        name,
        qty: orderQty,
        price: orderPrice,
        mode: normalizedMode,
        product: normalizedProduct,
        orderType: normalizedOrderType,
      });
      return res.status(201).json({
        message: `${normalizedMode} order placed successfully!`,
        order: result.order,
        availableMargin: result.availableMargin,
      });
    }

    const totalCost = orderPrice * orderQty;
    const marginRequired = normalizedProduct === "MIS"
      ? Math.round((totalCost / 5) * 100) / 100
      : totalCost;
    const user = await UserModel.findById(req.user);

    if (normalizedMode === "BUY") {
      if (user && user.funds < marginRequired) {
        return res.status(400).json({
          message: `Insufficient funds. Required: ₹${marginRequired.toFixed(2)}, Available: ₹${user.funds.toFixed(2)}`
        });
      }

      if (user) {
        user.funds -= marginRequired;
        await user.save();
      }

      if (normalizedProduct === "MIS") {
        const existingPos = await PositionsModel.findOne({ userId: req.user, name, product: "MIS" });
        if (existingPos) {
          const totalCostPrev = existingPos.qty * existingPos.price;
          existingPos.qty += orderQty;
          existingPos.price = (totalCostPrev + totalCost) / existingPos.qty;
          await existingPos.save();
        } else {
          const newPos = new PositionsModel({
            userId: req.user,
            product: "MIS",
            name,
            qty: orderQty,
            avg: orderPrice,
            price: orderPrice,
            net: "+0.00%",
            day: "+0.00%",
            isLoss: false,
          });
          await newPos.save();
        }
      } else {
        const existingHolding = await HoldingsModel.findOne({ userId: req.user, name });
        if (existingHolding) {
          const totalPreviousCost = existingHolding.qty * existingHolding.avg;
          existingHolding.qty += orderQty;
          existingHolding.avg = (totalPreviousCost + totalCost) / existingHolding.qty;
          existingHolding.price = orderPrice;
          await existingHolding.save();
        } else {
          const newHolding = new HoldingsModel({
            userId: req.user,
            name,
            qty: orderQty,
            avg: orderPrice,
            price: orderPrice,
            net: "+0.00%",
            day: "+0.00%",
          });
          await newHolding.save();
        }
      }
    } else if (normalizedMode === "SELL") {
      if (normalizedProduct === "MIS") {
        const existingPos = await PositionsModel.findOne({ userId: req.user, name, product: "MIS" });
        if (existingPos) {
          existingPos.qty -= orderQty;
          if (existingPos.qty <= 0) {
            await PositionsModel.findByIdAndDelete(existingPos._id);
          } else {
            await existingPos.save();
          }
        }
        if (user) {
          user.funds += marginRequired;
          await user.save();
        }
      } else {
        const existingHolding = await HoldingsModel.findOne({ userId: req.user, name });
        if (!existingHolding || existingHolding.qty < orderQty) {
          const available = existingHolding ? existingHolding.qty : 0;
          return res.status(400).json({
            message: `Insufficient stock holdings. Requested to sell: ${orderQty}, Available: ${available}`
          });
        }

        existingHolding.qty -= orderQty;
        if (existingHolding.qty === 0) {
          await HoldingsModel.findByIdAndDelete(existingHolding._id);
        } else {
          await existingHolding.save();
        }

        if (user) {
          user.funds += totalCost;
          await user.save();
        }
      }
    }

    const newOrder = new OrdersModel({
      userId: req.user,
      name,
      qty: orderQty,
      price: orderPrice,
      mode: normalizedMode,
      product: normalizedProduct,
      orderType: normalizedOrderType,
      status: "COMPLETE",
      createdAt: new Date(),
    });
    await newOrder.save();

    return res.status(201).json({
      message: `${normalizedMode} order placed successfully!`,
      order: newOrder,
      availableMargin: user ? user.funds : undefined,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to place order" });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// Server start & MongoDB connection
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Zerodha backend server running on port ${PORT}`);
  });

  if (uri) {
    console.log("Connecting to MongoDB Atlas...");
    mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((err) => {
        console.warn(`[Notice] MongoDB Atlas connection failed: ${err.message}`);
        console.warn("[Notice] Server operating seamlessly in resilient in-memory fallback mode.");
      });
  } else {
    console.warn("MONGO_URL not defined. Operating in resilient in-memory mode.");
  }
}

module.exports = app;
