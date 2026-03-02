const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieOptions = require('../utils/cookieOptions');
const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

const registerController = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName?.firstName || !fullName?.lastName) return res.status(400).json({ message: 'First and last name are required' });
        if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Valid email is required' });
        if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const isUser = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (isUser) return res.status(409).json({ message: 'User already exists' });

        const user = await userModel.create({
            fullName: { firstName: fullName.firstName.trim(), lastName: fullName.lastName.trim() },
            email: email.toLowerCase().trim(),
            credits: 50,
            passwordHash: await bcrypt.hash(password, 10),
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5d' });
        res.cookie('token', token, cookieOptions);
        res.status(201).json({ message: 'User successfully registered', user: sanitize(user) });
    } catch (error) {
        console.error('registerController error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await userModel.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return res.status(401).json({ message: 'Wrong password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5d' });
        res.cookie('token', token, cookieOptions);
        res.status(200).json({ message: 'User logged in', user: sanitize(user) });
    } catch (error) {
        console.error('loginController error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logoutController = async (req, res) => {
    res.clearCookie('token', cookieOptions);
    res.status(200).json({ message: 'User logged out' });
};

const getMeController = async (req, res) => {
    res.status(200).json({ user: sanitize(req.user) });
};

const updateProfileController = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        if (!firstName?.trim() || !lastName?.trim()) {
            return res.status(400).json({ message: 'First and last name are required' });
        }

        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            { fullName: { firstName: firstName.trim(), lastName: lastName.trim() } },
            { new: true }
        );

        res.status(200).json({ message: 'Profile updated', user: sanitize(user) });
    } catch (error) {
        console.error('updateProfileController error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const changePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old and new password required' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

        const user = await userModel.findById(req.user._id).select('+passwordHash');
        if (!user.passwordHash) {
            return res.status(400).json({ message: 'Password change is not available for Google accounts' });
        }

        const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValid) return res.status(401).json({ message: 'Current password is incorrect' });

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('changePasswordController error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getStatsController = async (req, res) => {
    try {
        const userId = req.user._id;
        const [totalChats, totalMessages, user] = await Promise.all([
            chatModel.countDocuments({ user: userId }),
            messageModel.countDocuments({ user: userId, role: 'user' }),
            userModel.findById(userId).select('credits'),
        ]);
        res.status(200).json({ totalChats, totalMessages, credits: user?.credits ?? 0 });
    } catch (error) {
        console.error('getStatsController error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAccountController = async (req, res) => {
    try {
        const userId = req.user._id;
        await Promise.all([
            userModel.findByIdAndDelete(userId),
            chatModel.deleteMany({ user: userId }),
            messageModel.deleteMany({ user: userId }),
        ]);
        res.clearCookie('token', cookieOptions);
        res.status(200).json({ message: 'Account deleted' });
    } catch (error) {
        console.error('deleteAccountController error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper: safe user projection
function sanitize(user) {
    return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        credits: user.credits,
        picture: user.picture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    getMeController,
    updateProfileController,
    changePasswordController,
    getStatsController,
    deleteAccountController,
};