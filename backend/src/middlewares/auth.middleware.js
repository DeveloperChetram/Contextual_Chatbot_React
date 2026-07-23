const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  // 1. Try HttpOnly cookie first (same-origin requests)
  let token = req.cookies?.token;

  // 2. Fallback: Authorization header (used when Vercel proxies requests)
  if (!token && req.headers?.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts[0] === 'Bearer' && parts[1]) {
      token = parts[1];
    }
  }

  // 3. Fallback: direct token in body/query (for WebSocket-like HTTP endpoints)
  if (!token) {
    token = req.body?.token || req.query?.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: error.message });
  }
};

module.exports = authMiddleware;