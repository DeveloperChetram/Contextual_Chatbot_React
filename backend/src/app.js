require('dotenv').config()
const express = require('express');
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');
const cors  = require('cors')
const app = express();

const cookieParser = require('cookie-parser')


app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())
app.use('/api', indexRouter)

app.use('/api/chat', chatRouter)
app.use('/api/auth', authRouter)

module.exports = app;     