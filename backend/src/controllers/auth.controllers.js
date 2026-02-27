const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieOptions = require("../utils/cookieOptions");

const registerController = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Input validation
        if (!fullName?.firstName || !fullName?.lastName) {
            return res.status(400).json({ message: "First and last name are required" });
        }
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Valid email is required" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const isUser = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (isUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = await userModel.create({
            fullName: {
                firstName: fullName.firstName.trim(),
                lastName: fullName.lastName.trim(),
            },
            email: email.toLowerCase().trim(),
            credits: 50,
            passwordHash: await bcrypt.hash(password, 10),
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            message: "User successfully registered",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                credits: user.credits,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("registerController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userModel
            .findOne({ email: email.toLowerCase().trim() })
            .select("+passwordHash");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
        res.cookie("token", token, cookieOptions);

        // FIX: login returns 200 OK (not 201 Created)
        res.status(200).json({
            message: "User logged in",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                credits: user.credits,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("loginController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logoutController = async (req, res) => {
    res.clearCookie("token", cookieOptions);
    // FIX: logout returns 200 OK (not 201 Created)
    res.status(200).json({ message: "User logged out" });
};

const getMeController = async (req, res) => {
    // req.user is already populated by authMiddleware
    const user = req.user;
    res.status(200).json({
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
};

module.exports = {
    registerController,
    loginController,
    logoutController,
    getMeController,
};