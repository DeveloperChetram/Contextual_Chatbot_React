const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
    getCustomCharactersController,
    createCustomCharacterController,
    updateCustomCharacterController,
    deleteCustomCharacterController,
} = require('../controllers/customCharacter.controller');

const customCharacterRouter = express.Router();

customCharacterRouter.get('/', authMiddleware, getCustomCharactersController);
customCharacterRouter.post('/', authMiddleware, createCustomCharacterController);
customCharacterRouter.put('/:id', authMiddleware, updateCustomCharacterController);
customCharacterRouter.delete('/:id', authMiddleware, deleteCustomCharacterController);

module.exports = customCharacterRouter;
