const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { getMemoriesController, deleteMemoryController } = require('../controllers/memory.controller');

const memoryRouter = express.Router();

memoryRouter.get('/', authMiddleware, getMemoriesController);
memoryRouter.delete('/:id', authMiddleware, deleteMemoryController);

module.exports = memoryRouter;
