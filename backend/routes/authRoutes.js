// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); 
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/check-auth', verifyToken, (req, res) => {
  res.status(200).json({ message: "User is authenticated" });
});

module.exports = router;