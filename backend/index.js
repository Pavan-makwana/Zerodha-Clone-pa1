// backend/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <-- STEP 1: ISEY ADD KAREIN

const { HoldingsModel } = require('./model/HoldingsModel');
const { PositionsModel } = require('./model/PositionsModel');
const { OrdersModel } = require('./model/OrdersModel');

const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Dono frontend ko allow karein
  credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser()); // <-- STEP 3: ISEY ADD KAREIN

app.use('/api/auth', authRoutes);

// Aapke baaki routes waise hi rahenge
app.get('/allholdings', verifyToken, async (req, res) => {
  const allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get('/allpositions', verifyToken, async (req, res) => {
  const allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get('/allorders', verifyToken, async (req, res) => {
  const allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.post('/newOrder', verifyToken, async (req, res) => {
  const newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  await newOrder.save();
  res.send("Order Placed");
});

// MongoDB connection
mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });