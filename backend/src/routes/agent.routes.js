const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { createAgentController,chatController } = require('../controllers/agent.controller');

const agentRouter = express.Router();

agentRouter.post('/create', createAgentController);
agentRouter.post('/:agentId/v1/chat', chatController);

module.exports = agentRouter;