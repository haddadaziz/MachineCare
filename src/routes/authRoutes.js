const express = require('express');
const router = express.Router();
const { login, register, getMe, updateMe } = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// routes publics
router.post('/login', login);
router.post('/register', register);

// Routes protégées
router.get('/me', authenticateJWT, getMe);
router.put('/me', authenticateJWT, updateMe);

module.exports = router;