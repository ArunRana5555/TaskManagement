const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const { isBlacklisted } = require('../utils/jwtBlackListed');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) return res.status(401).json({ message: 'No token' });
    const token = header.split(' ')[1];
    if (await isBlacklisted(token)) return res.status(401).json({ message: 'Token invalidated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

module.exports = auth;
