const express = require('express')
const authController= require('../controllers/auth.controllers')
const authMiddleware = require('../middlewares/auth.middleware')

const authRouter = express.Router()

authRouter.post('/register',authController.registerController)
authRouter.post('/login', authController.loginController)
authRouter.get('/logout', authController.logoutController)

module.exports = authRouter;