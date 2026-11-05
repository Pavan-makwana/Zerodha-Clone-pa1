// backend/schemas/UserSchema.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  funds: {
    type: Number,
    default: 100000.00, // ₹1,00,000 initial paper trading cash
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = UserSchema;
