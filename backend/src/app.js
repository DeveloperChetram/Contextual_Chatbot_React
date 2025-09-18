require('dotenv').config()
const express = require('express');
const indexRouter = require('./routes/index.routes');
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');
const cors  = require('cors')
const app = express();

const cookieParser = require('cookie-parser')

// CORS configuration
const allowedOrigins = [
  'https://contextual-chatbot-react.vercel.app',
  'https://atomic-llm.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://contextual-chatbot-react.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(200).end();
});

app.get('/', (req, res) => {
  res.send('Yo Yo Yo Server is running')
})

// Health check endpoint for CORS testing
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    cors: 'enabled',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  })
})
app.use('/api', indexRouter)

app.use('/api/chat', chatRouter)
app.use('/api/auth', authRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Request origin:', req.headers.origin);
  console.error('Request method:', req.method);
  console.error('Request URL:', req.url);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;     