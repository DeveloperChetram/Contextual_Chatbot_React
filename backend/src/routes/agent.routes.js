const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload');
const { createAgentController,chatController, getAgentsController, getAgentConfigController, editAgentController, deleteAgentController } = require('../controllers/agent.controller');

const agentRouter = express.Router();

agentRouter.post('/create', authMiddleware, upload.single('thumbnail'), createAgentController);
agentRouter.put('/edit/:agentId', authMiddleware, upload.single('thumbnail'), editAgentController);
agentRouter.delete('/delete/:agentId', authMiddleware, deleteAgentController);

agentRouter.post('/:agentId/v1/chat', chatController);
agentRouter.get('/agents', authMiddleware, getAgentsController);
agentRouter.get('/agentConfig', authMiddleware, getAgentConfigController);

module.exports = agentRouter;