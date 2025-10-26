const express = require('express');
const router = express.Router();
const { signup, login, logout, profile, allusers, allmanagers, getManagerUsers } = require('../controllers/AuthController');
const auth = require('../middleware/Auth');
const { loginLimiter } = require('../middleware/RateLimiter');
router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.post('/logout', auth, logout);
router.get('/profile', auth, profile);
router.get('/allusers',auth,allusers)
router.get('/allmanagers',allmanagers)
router.get('/getmanagerusers',auth,getManagerUsers)

module.exports = router;
