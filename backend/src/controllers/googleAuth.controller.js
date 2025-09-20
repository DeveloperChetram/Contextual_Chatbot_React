const { oauth2Client } = require("../services/google.service");
const axios = require("axios");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const googleAuth = async (req, res) => {
    try {
        console.log("=== Google Auth Controller Debug ===");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
        console.log("Request origin:", req.headers.origin);
        console.log("Request headers:", req.headers);
        
        const { code } = req.query;
        console.log("Received code parameter:", code ? "Present" : "Missing");
        
        if (!code) {
            console.error("No access token provided");
            return res.status(400).json({ message: 'Error', error: 'No access token provided' });
        }
        
        // The 'code' parameter is actually the access_token from @react-oauth/google
        const accessToken = code;
        
        console.log("Making request to Google API...");
        
        // Use the access token directly to get user info from Google
        const userFromGoogle = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`
        );
        
        console.log("Google API response:", userFromGoogle.data);

        let user = await User.findOne({ email: userFromGoogle.data.email });
        
        if (!user) {
            console.log("Creating new user for email:", userFromGoogle.data.email);
            user = await User.create({ 
                email: userFromGoogle.data.email, 
                fullName: { 
                    firstName: userFromGoogle.data.given_name, 
                    lastName: userFromGoogle.data.family_name 
                }, 
                picture: userFromGoogle.data.picture 
            });
        } else {
            console.log("Found existing user:", user.email);
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined");
            return res.status(500).json({ message: 'Error', error: 'Server configuration error' });
        }

        console.log("Generating JWT token...");
        console.log("JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
        console.log("User ID:", user._id);
        
        let token;
        try {
            token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
            console.log("JWT token generated successfully, length:", token ? token.length : 0);
            console.log("JWT token preview:", token ? token.substring(0, 20) + "..." : "null");
        } catch (jwtError) {
            console.error("JWT generation failed:", jwtError.message);
            throw jwtError;
        }
        
        res.cookie("token", token);
        
        console.log("Login successful, sending response with token:", !!token);
        console.log("Response data:", { message: 'success', user, token });
        
        res.status(200).json({ message:'success', user, token });

    } catch (error) {
        console.log("=== Google Auth Error ===");
        console.log("Error message:", error.message);
        console.log("Error response:", error.response?.data);
        console.log("Error status:", error.response?.status);
        
        res.status(500).json({ message: 'Error', error: error.message });
    }
}

module.exports = { googleAuth };