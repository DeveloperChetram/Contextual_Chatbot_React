const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
    httpOnly: true,
    secure: true, // Ensure cookies are only sent over HTTPS
    sameSite:isProduction ? 'none' : 'lax',
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
};

module.exports = cookieOptions;
