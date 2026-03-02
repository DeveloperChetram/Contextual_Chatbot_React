require('dotenv').config();
const express = require('express');
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');
const googleAuthRouter = require('./routes/authRouter.google');
const memoryRouter = require('./routes/memory.routes');
const customCharacterRouter = require('./routes/customCharacter.routes');
const cors = require('cors');
const responseSanitizer = require('./middlewares/responseSanitizer.middleware');
const cookieParser = require('cookie-parser');
const allowedOrigins = require('./config/cors');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(responseSanitizer);

app.options('*', (req, res) => res.status(200).end());

app.get('/', (req, res) => res.send('Atomic Server is running'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', indexRouter);
app.use('/api/chat', chatRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth', googleAuthRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/characters', customCharacterRouter);

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS Error', message: 'Origin not allowed' });
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;