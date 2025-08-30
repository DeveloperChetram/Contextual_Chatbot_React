require('dotenv').config()
const express = require('express');
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');
const cors  = require('cors')
const app = express();

const cookieParser = require('cookie-parser')

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://contextual-chatbot-react.vercel.app',
      'http://localhost:5173',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.options('*', cors());

app.get('/', (req, res) => {
  res.send('Yo Yo Yo Server is running')
})
app.use('/api', indexRouter)

app.use('/api/chat', chatRouter)
app.use('/api/auth', authRouter)

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;     