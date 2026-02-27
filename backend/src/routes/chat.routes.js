const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const chatControllers = require('../controllers/chat.controller');

const chatRouter = express.Router();

chatRouter.post('/', authMiddleware, chatControllers.createChatController);
chatRouter.get('/', authMiddleware, chatControllers.getChatController);

// NEW: per-chat messages with cursor pagination — replaces the old /messages (fetch-all)
chatRouter.get('/:id/messages', authMiddleware, chatControllers.getMessagesByChatController);

chatRouter.put('/:id', authMiddleware, chatControllers.updateChatController);
chatRouter.delete('/:id', authMiddleware, chatControllers.deleteChatController);

module.exports = chatRouter;