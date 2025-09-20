const { oauth2Client } = require("../services/google.service");
const axios = require("axios");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const googleAuth = async (req, res) => {
    try {
        const { code } = req.query;
        
        // The 'code' parameter is actually the access_token from @react-oauth/google
        const accessToken = code;
        
        // Use the access token directly to get user info from Google
        const userFromGoogle = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`
        );
        
        console.log("userFromGoogle", userFromGoogle.data);

        let user = await User.findOne({ email: userFromGoogle.data.email });
        
        if (!user) {
            user = await User.create({ 
                email: userFromGoogle.data.email, 
                fullName: { 
                    firstName: userFromGoogle.data.given_name, 
                    lastName: userFromGoogle.data.family_name 
                }, 
                picture: userFromGoogle.data.picture 
            });
        }

        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
        res.cookie("token", token);
        res.status(200).json({ message:'success', user, token });

    } catch (error) {
        console.log("Google Auth error:", error);
        res.status(500).json({ message: 'Error', error: error.message });
    }
}

module.exports = { googleAuth };