// allowed = ['Admin'] or ['Manager','Admin']
const permit = (allowedRoles) => (req, res, next) => {
  const roles = req.user.userType || [];
  const ok = roles.some(r => allowedRoles.includes(r));
  if (!ok) return res.status(403).json({ message: 'Forbidden: insufficient role' });
  next();
};

module.exports = { permit };
