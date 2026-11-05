// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); 
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/check-auth', verifyToken, (req, res) => {
  res.status(200).json({ message: "User is authenticated", userId: req.user });
});

router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
