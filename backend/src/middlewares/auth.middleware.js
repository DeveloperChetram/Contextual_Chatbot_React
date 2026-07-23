const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  // ── DEV MODE: bypass all auth, create a mock user ─────────────────────
  const mockUser = { _id: 'dev-user-id', credits: 999999, email: 'dev@local' };
  req.user = mockUser;
  return next();
};

module.exports = authMiddleware;