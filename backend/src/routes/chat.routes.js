const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const chatControllers = require('../controllers/chat.controller')

const chatRouter = express.Router();

chatRouter.post('/',authMiddleware, chatControllers.createChatController )

module.exports = chatRouter;