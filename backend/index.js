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

// Default watchlist data for new users
const defaultWatchlist = [
  { name: "INFY", price: 1555.45, percent: "-1.60%", isDown: true },
  { name: "ONGC", price: 116.8, percent: "-0.09%", isDown: true },
  { name: "TCS", price: 3194.8, percent: "-0.25%", isDown: true },
  { name: "KPITTECH", price: 266.45, percent: "3.54%", isDown: false },
  { name: "QUICKHEAL", price: 308.55, percent: "-0.15%", isDown: true },
  { name: "WIPRO", price: 577.75, percent: "0.32%", isDown: false },
  { name: "M&M", price: 779.8, percent: "-0.01%", isDown: true },
  { name: "RELIANCE", price: 2112.4, percent: "1.44%", isDown: false },
  { name: "HUL", price: 512.4, percent: "1.04%", isDown: false },
];

// Initial demo holdings for newly registered users
const defaultHoldings = [
  { name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
  { name: "HDFCBANK", qty: 2, avg: 1383.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
  { name: "HINDUNILVR", qty: 1, avg: 2335.85, price: 2417.4, net: "+3.49%", day: "+0.21%" },
  { name: "INFY", qty: 1, avg: 1350.5, price: 1555.45, net: "+15.18%", day: "-1.60%" },
  { name: "ITC", qty: 5, avg: 202.0, price: 207.9, net: "+2.92%", day: "+0.80%" },
  { name: "KPITTECH", qty: 5, avg: 250.3, price: 266.45, net: "+6.45%", day: "+3.54%" },
  { name: "M&M", qty: 2, avg: 809.9, price: 779.8, net: "-3.72%", day: "-0.01%" },
  { name: "RELIANCE", qty: 1, avg: 2193.7, price: 2112.4, net: "-3.71%", day: "+1.44%" },
  { name: "SBIN", qty: 4, avg: 324.35, price: 430.2, net: "+32.63%", day: "-0.34%" },
  { name: "SGBMAY29", qty: 2, avg: 4727.0, price: 4719.0, net: "-0.17%", day: "+0.15%" },
  { name: "TATAPOWER", qty: 5, avg: 104.2, price: 124.15, net: "+19.15%", day: "-0.24%" },
  { name: "TCS", qty: 1, avg: 3041.7, price: 3194.8, net: "+5.03%", day: "-0.25%" },
  { name: "WIPRO", qty: 4, avg: 489.3, price: 577.75, net: "+18.08%", day: "+0.32%" },
];

const defaultPositions = [
  { product: "CNC", name: "EVEREADY", qty: 2, avg: 316.27, price: 312.35, net: "+0.58%", day: "-1.24%", isLoss: true },
  { product: "CNC", name: "JUBLFOOD", qty: 1, avg: 3124.75, price: 3082.65, net: "+10.04%", day: "-1.35%", isLoss: true },
  { product: "FUT", name: "TCS", qty: 200, avg: 2400.00, price: 2550.50, net: "+6.27%", day: "+1.50%", isLoss: false },
  { product: "CNC", name: "RELIANCE", qty: 10, avg: 2400.00, price: 2550.50, net: "+6.27%", day: "+1.50%", isLoss: false },
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
      return res.status(200).json(userHoldings);
    } else {
      return res.status(200).json(memoryStore.getHoldings(req.user));
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch holdings" });
  }
});

// User Isolated Positions
app.get('/allpositions', verifyToken, async (req, res) => {
  try {
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
      return res.status(200).json(userPositions);
    } else {
      return res.status(200).json(memoryStore.getPositions(req.user));
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch positions" });
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
    if (isDbConnected()) {
      let userWatchlist = await WatchlistModel.find({ userId: req.user });
      if (userWatchlist.length === 0) {
        const initial = defaultWatchlist.map((s) => ({ ...s, userId: req.user }));
        userWatchlist = await WatchlistModel.insertMany(initial);
      }
      return res.status(200).json(userWatchlist);
    } else {
      return res.status(200).json(memoryStore.getWatchlist(req.user));
    }
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
      const availableMargin = user.funds !== undefined ? user.funds : 100000.0;
      return res.status(200).json({ availableMargin, usedMargin: 0.0 });
    } else {
      const user = memoryStore.findUserById(req.user);
      const availableMargin = user && user.funds !== undefined ? user.funds : 100000.0;
      return res.status(200).json({ availableMargin, usedMargin: 0.0 });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch funds" });
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
    const { name, qty, price, mode } = req.body;

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

    if (!isDbConnected()) {
      const result = memoryStore.executeOrder({
        userId: req.user,
        name,
        qty: orderQty,
        price: orderPrice,
        mode: normalizedMode,
      });
      return res.status(201).json({
        message: `${normalizedMode} order placed successfully!`,
        order: result.order,
        availableMargin: result.availableMargin,
      });
    }

    const totalCost = orderPrice * orderQty;
    const user = await UserModel.findById(req.user);

    if (normalizedMode === "BUY") {
      if (user && user.funds < totalCost) {
        return res.status(400).json({
          message: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${user.funds.toFixed(2)}`
        });
      }

      if (user) {
        user.funds -= totalCost;
        await user.save();
      }

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
    } else if (normalizedMode === "SELL") {
      const existingHolding = await HoldingsModel.findOne({ userId: req.user, name });
      if (!existingHolding || existingHolding.qty < orderQty) {
        return res.status(400).json({
          message: `Insufficient stock holdings to sell. Requested: ${orderQty}, Available: ${existingHolding ? existingHolding.qty : 0}`
        });
      }

      existingHolding.qty -= orderQty;
      if (existingHolding.qty === 0) {
        await HoldingsModel.deleteOne({ _id: existingHolding._id });
      } else {
        await existingHolding.save();
      }

      if (user) {
        user.funds = (user.funds || 0) + totalCost;
        await user.save();
      }
    }

    const newOrder = new OrdersModel({
      userId: req.user,
      name,
      qty: orderQty,
      price: orderPrice,
      mode: normalizedMode,
      status: "COMPLETE",
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
