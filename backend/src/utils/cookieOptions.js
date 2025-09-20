const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
};

module.exports = cookieOptions;
