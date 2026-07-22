const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const cookieOptions = require("../utils/cookieOptions");

// Create OAuth2 client for credential verification
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "No access token provided" });
        }

        let accessToken = code;

        try {
            const tokenResponse = await googleClient.getToken(code);
            accessToken = tokenResponse?.tokens?.access_token || accessToken;
        } catch (tokenError) {
            console.warn("Google auth code exchange failed, trying as access token:", tokenError.message);
        }

        // Use the access token in the Authorization header instead of query params.
        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo?alt=json', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const googleUser = await userinfoResponse.json();

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

        // Set JWT as httpOnly cookie
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

// New endpoint for credential-based authentication (modern approach)
const googleCredentialAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "No credential provided" });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload.email) {
            return res.status(400).json({ message: "Could not retrieve email from Google" });
        }

        let user = await User.findOne({ email: payload.email });

        if (!user) {
            const firstName = payload.given_name || "Google";
            const lastName = payload.family_name || firstName;

            user = await User.create({
                email: payload.email,
                fullName: { firstName, lastName },
                picture: payload.picture || "https://via.placeholder.com/150",
                // passwordHash is optional for Google OAuth users
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server configuration error" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });

        // Set JWT as httpOnly cookie
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            message: "success",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                credits: user.credits,
                picture: user.picture,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Google credential auth error:", error.message);
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
};

module.exports = { googleAuth, googleCredentialAuth };