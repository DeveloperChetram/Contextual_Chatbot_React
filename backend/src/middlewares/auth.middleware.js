const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  let token;

  // 1. HttpOnly cookie (same-origin / non-proxied requests)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // 2. Standard Authorization header (Vercel may strip this in proxy)
  if (!token && req.headers?.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts[0] === 'Bearer' && parts[1]) {
      token = parts[1];
    }
  }
  // 3. Custom x-auth-token header (Vercel typically forwards unknown headers)
  if (!token && req.headers?.['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  // 4. Query parameter (always forwarded by Vercel)
  if (!token && req.query?.token) {
    token = req.query.token;
  }
  // 5. Body parameter
  if (!token && req.body?.token) {
    token = req.body.token;
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