const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: true, // 🛑 MUST be true in production (requires HTTPS)
  sameSite: "none", // 🛑 MUST be 'none' for cross-domain cookies to work!
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (or whatever you use)
};

module.exports = cookieOptions;
