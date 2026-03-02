const express = require('express');
const authController = require('../controllers/auth.controllers');
const authMiddleware = require('../middlewares/auth.middleware');

const authRouter = express.Router();

authRouter.post('/register', authController.registerController);
authRouter.post('/login', authController.loginController);
authRouter.post('/logout', authController.logoutController);
authRouter.get('/me', authMiddleware, authController.getMeController);

// Profile management
authRouter.put('/profile', authMiddleware, authController.updateProfileController);
authRouter.put('/change-password', authMiddleware, authController.changePasswordController);
authRouter.get('/stats', authMiddleware, authController.getStatsController);
authRouter.delete('/account', authMiddleware, authController.deleteAccountController);

module.exports = authRouter;