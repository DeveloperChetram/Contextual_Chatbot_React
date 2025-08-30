const {indexController, creditsController, changeCharacterController   } = require('../controllers/index.controller')
const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')

const indexRouter = express.Router();

indexRouter.get('/', indexController)

indexRouter.get('/credits', authMiddleware, creditsController)
indexRouter.get('/change-character/:character', authMiddleware, changeCharacterController )



module.exports = indexRouter;