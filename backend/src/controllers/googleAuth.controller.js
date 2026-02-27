const { oauth2Client } = require("../services/google.service");
const axios = require("axios");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const cookieOptions = require("../utils/cookieOptions");

const googleAuth = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "No access token provided" });
        }

        // Use access token to get user info from Google
        const googleResponse = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${code}`
        );

        const googleUser = googleResponse.data;

        if (!googleUser.email) {
            return res.status(400).json({ message: "Could not retrieve email from Google" });
        }

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            const firstName = googleUser.given_name || "Google";
            const lastName = googleUser.family_name || firstName;

            user = await User.create({
                email: googleUser.email,
                fullName: { firstName, lastName },
                picture: googleUser.picture || "https://via.placeholder.com/150",
                // passwordHash is optional for Google OAuth users
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server configuration error" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

        // FIX: Set JWT as httpOnly cookie only — DO NOT expose token in response body
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            message: "success",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                credits: user.credits,
                picture: user.picture,
            },
        });
    } catch (error) {
        console.error("Google auth error:", error.message);
        res.status(500).json({ message: "Authentication failed" });
    }
};

module.exports = { googleAuth };