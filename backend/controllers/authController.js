// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { UserModel } = require('../model/UserModel');
const { memoryStore } = require('../utils/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password)" });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const existingUser = await UserModel.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        name,
        email: cleanEmail,
        password: hashedPassword,
      });

      await newUser.save();

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } else {
      // Resilient fallback mode
      const existingUser = memoryStore.findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = memoryStore.createUser({
        name,
        email: cleanEmail,
        passwordHash: hashedPassword,
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (isDbConnected()) {
      user = await UserModel.findOne({ email: cleanEmail });
      if (!user) {
        const demoUser = memoryStore.findUserByEmail(cleanEmail);
        if (demoUser) {
          user = new UserModel({
            name: demoUser.name,
            email: demoUser.email,
            password: demoUser.password,
            funds: demoUser.funds || 100000.0,
          });
          await user.save();
        }
      }
    } else {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const secret = process.env.JWT_SECRET || 'zerodha_jwt_secret_key_production_fallback';
    const token = jwt.sign({ id: user._id || user.id }, secret, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 3600000 
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error during login" });
  }
};

const logoutUser = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error during logout" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    let user = null;
    if (isDbConnected()) {
      user = await UserModel.findById(req.user).select('-password');
    } else {
      const u = memoryStore.findUserById(req.user);
      if (u) {
        user = {
          _id: u._id,
          id: u.id,
          name: u.name,
          email: u.email,
          funds: u.funds,
          createdAt: u.createdAt,
        };
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to fetch user" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
