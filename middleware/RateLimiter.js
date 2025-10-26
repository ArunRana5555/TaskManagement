const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 login attempts per window per IP
  message: 'Too many login attempts, please try later'
});

module.exports = { loginLimiter };
