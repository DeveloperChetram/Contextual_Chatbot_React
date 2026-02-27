const { indexController, creditsController } = require('../controllers/index.controller');
const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');

const indexRouter = express.Router();

indexRouter.get('/', indexController);
indexRouter.get('/credits', authMiddleware, creditsController);

// FLAW-03: /change-character route removed — character is passed per message in socket payload

module.exports = indexRouter;