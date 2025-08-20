const {indexController} = require('../controllers/index.controller')
const express = require('express')

const indexRouter = express.Router();

indexRouter.get('/', indexController)



module.exports = indexRouter;