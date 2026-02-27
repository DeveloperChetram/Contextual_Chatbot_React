/**
 * Shared CORS allowed origins — single source of truth.
 * Used by both express CORS middleware and Socket.IO server.
 */
const allowedOrigins = [
    'https://atomic-llm.vercel.app',
    'https://contextual-chatbot-react.vercel.app',
    'https://contextual-chatbot-react.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
];

module.exports = allowedOrigins;
