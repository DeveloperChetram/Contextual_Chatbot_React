const express = require("express");
const authController = require("../controllers/auth.controllers");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router();

authRouter.post("/register", authController.registerController);
authRouter.post("/login", authController.loginController);

// FIX: logout changed from GET to POST (state mutation must not use GET)
authRouter.post("/logout", authController.logoutController);

// NEW: /auth/me — proper session validation endpoint
authRouter.get("/me", authMiddleware, authController.getMeController);

module.exports = authRouter;