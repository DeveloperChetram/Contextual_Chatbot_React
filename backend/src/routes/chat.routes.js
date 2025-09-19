const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const chatControllers = require('../controllers/chat.controller')

const chatRouter = express.Router();

chatRouter.post('/',authMiddleware, chatControllers.createChatController )
chatRouter.get('/',authMiddleware, chatControllers.getChatController )
chatRouter.get('/messages',authMiddleware, chatControllers.getMessagesController )
chatRouter.put('/:id',authMiddleware, chatControllers.updateChatController )

module.exports = chatRouter;