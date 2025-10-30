// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware'); // <-- ISEY IMPORT KAREIN
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// --- YEH NAYA ROUTE ADD KAREIN ---
// Yeh route check karega ki user ki cookie valid hai ya nahi
// Aapka dashboard app (Port 3001) is route ko call karega
router.get('/check-auth', verifyToken, (req, res) => {
  // Agar verifyToken middleware pass ho gaya, matlab token valid hai
  res.status(200).json({ message: "User is authenticated" });
});

module.exports = router;