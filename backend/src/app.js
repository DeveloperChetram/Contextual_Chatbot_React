require('dotenv').config()
const express = require('express');
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');
const app = express();
const cookieParser = require('cookie-parser')


app.use(express.json())
app.use(cookieParser())
app.use('/', indexRouter)

app.use('/chat', chatRouter)
app.use('/auth', authRouter)

module.exports = app;   