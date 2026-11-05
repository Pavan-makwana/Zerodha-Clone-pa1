// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { HoldingsModel } = require('./model/HoldingsModel');
const { PositionsModel } = require('./model/PositionsModel');

const initialHoldings = [
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

const initialPositions = [
  { product: "CNC", name: "EVEREADY", qty: 2, avg: 316.27, price: 312.35, net: "+0.58%", day: "-1.24%", isLoss: true },
  { product: "CNC", name: "JUBLFOOD", qty: 1, avg: 3124.75, price: 3082.65, net: "+10.04%", day: "-1.35%", isLoss: true },
  { product: "FUT", name: "TCS", qty: 200, avg: 2400.00, price: 2550.50, net: "+6.27%", day: "+1.50%", isLoss: false },
  { product: "CNC", name: "RELIANCE", qty: 10, avg: 2400.00, price: 2550.50, net: "+6.27%", day: "+1.50%", isLoss: false },
];

async function seedDatabase() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error("No MONGO_URL configured in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    const existingHoldings = await HoldingsModel.countDocuments();
    if (existingHoldings === 0) {
      await HoldingsModel.insertMany(initialHoldings);
      console.log(`Seeded ${initialHoldings.length} holdings.`);
    } else {
      console.log(`Holdings already exist (${existingHoldings} found). Skipping.`);
    }

    const existingPositions = await PositionsModel.countDocuments();
    if (existingPositions === 0) {
      await PositionsModel.insertMany(initialPositions);
      console.log(`Seeded ${initialPositions.length} positions.`);
    } else {
      console.log(`Positions already exist (${existingPositions} found). Skipping.`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedDatabase();
