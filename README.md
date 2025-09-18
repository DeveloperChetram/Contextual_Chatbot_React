# Atomic - Contextual Chatbot React
![App Screenshot](image.png)

A full-stack AI-powered contextual chatbot application built with React, Node.js, and Google Gemini AI. The application features multiple AI personalities, real-time chat functionality, user authentication, and persistent memory using vector embeddings.

## 📋 Table of Contents

- [🎬 Demo Video](#-demo-video)
- [🌟 Features](#-features)
  - [Core Functionality](#core-functionality)
  - [AI Personalities](#ai-personalities)
  - [Technical Features](#technical-features)
- [🏗️ Architecture](#-architecture)
  - [Frontend (React + Vite)](#frontend-react--vite)
  - [Backend (Node.js + Express)](#backend-nodejs--express)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [🔧 Configuration](#-configuration)
  - [CORS Setup](#cors-setup)
  - [Database Models](#database-models)
- [🌐 Deployment](#-deployment)
  - [Frontend (Vercel)](#frontend-vercel)
  - [Backend (Render)](#backend-render)
  - [Production URLs](#production-urls)
- [🔌 API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Chat](#chat)
  - [Health Check](#health-check)
- [🛠️ Technologies Used](#-technologies-used)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [AI & Database](#ai--database)
- [🐛 Troubleshooting](#-troubleshooting)
  - [Common Issues](#common-issues)
  - [Debug Commands](#debug-commands)
- [📝 Development Notes](#-development-notes)
  - [Character System](#character-system)
  - [Memory System](#memory-system)
  - [Credit System](#credit-system)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)
- [🙏 Acknowledgments](#-acknowledgments)

## 🎬 Demo Video

Watch a quick demo of the Atomic personality in action:

### 🎥 Interactive Demo Video
[![Watch Demo Video](https://img.shields.io/badge/📹-Watch%20Demo%20Video-red?style=for-the-badge)](https://ik.imagekit.io/chetram/Atomic%20/output_progressive_503ca82d-3653-4cc0-b9e2-88582f331a09.mp4?tr=orig)

### 🎬 Direct Video Player
<video controls width="100%">
  <source src="https://ik.imagekit.io/chetram/Atomic%20/output_progressive_503ca82d-3653-4cc0-b9e2-88582f331a09.mp4?tr=orig" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 📱 Live Application
🌐 **Try it yourself**: [https://atomic-llm.vercel.app](https://atomic-llm.vercel.app)

### 📸 Screenshots

#### Chat Interface Overview
![Chat Interface Demo](scrst1.png)

#### Light/Dark Theme Support
![Light Mode Support](scrnst2.png)

#### Responsive in many screens
![Responsive Chat](scrnst3.png)

## 🌟 Features

### Core Functionality
- **Multi-Personality AI Chat**: Choose from different AI characters (Atomic, Jahnvi, Chandni, Osho, Harsh Bhaiya)
- **Real-time Communication**: WebSocket-based instant messaging
- **User Authentication**: Secure login/register system with JWT tokens
- **Persistent Memory**: Vector-based conversation memory using Pinecone
- **Credit System**: User credit management for API usage
- **Responsive Design**: Mobile-friendly interface with dark/light themes

### AI Personalities
- **Atomic**: Precise, factual, and concise responses
- **Jahnvi**: Friendly, knowledgeable girl from Damoh, MP
- **Chandni**: Calm, reserved, and direct personality
- **Osho**: Mystical, meditative, and paradoxical responses
- **Harsh Bhaiya**: Motivational mentor and coding school founder

### Technical Features
- **Vector Embeddings**: Gemini embedding model for semantic search
- **Contextual Memory**: Pinecone vector database for conversation history
- **Markdown Support**: Rich text rendering with syntax highlighting
- **CORS Configuration**: Cross-origin resource sharing setup
- **Cookie-based Auth**: Secure authentication with HTTP-only cookies

## 🏗️ Architecture

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChatInterface.jsx    # Main chat UI
│   │   ├── Login.jsx            # Authentication forms
│   │   ├── Register.jsx
│   │   ├── ThemeToggler.jsx     # Dark/Light mode
│   │   └── TypingIndicator.jsx  # Real-time typing
│   ├── redux/               # State management
│   │   ├── store.js             # Redux store
│   │   ├── reducers/            # State reducers
│   │   └── actions/             # Action creators
│   ├── api/                 # API configuration
│   │   └── axios.jsx            # HTTP client setup
│   ├── routes/              # React Router
│   └── styles/               # CSS files
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controllers.js    # Authentication logic
│   │   └── chat.controllers.js    # Chat operations
│   ├── models/              # Database schemas
│   │   ├── user.model.js          # User data model
│   │   ├── chat.model.js           # Chat sessions
│   │   └── message.model.js        # Message history
│   ├── services/            # Business logic
│   │   ├── ai.service.js           # Gemini AI integration
│   │   └── vector.service.js       # Pinecone operations
│   ├── routes/              # API endpoints
│   ├── middlewares/         # Custom middleware
│   ├── sockets/             # WebSocket handlers
│   ├── db/                  # Database connection
│   └── app.js               # Express app configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Google AI API key
- Pinecone API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeveloperChetram/Contextual_Chatbot_React.git
   cd Contextual_Chatbot_React
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google AI
GOOGLE_API_KEY=your_google_ai_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key

# Environment
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:3001/api
```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:3001`

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Access the Application**
   Open `http://localhost:5173` in your browser

## 🔧 Configuration

### CORS Setup
The application is configured to allow requests from:
- `http://localhost:5173` (Frontend dev server)
- `https://atomic-llm.vercel.app` (Production frontend)
- `https://contextual-chatbot-react.onrender.com` (Production backend)

### Database Models

#### User Model
```javascript
{
  email: String (required),
  fullName: {
    firstName: String (required),
    lastName: String (required)
  },
  credits: Number (default: 50),
  passwordHash: String (required),
  timestamps: true
}
```

#### Chat Model
```javascript
{
  userId: ObjectId (required),
  title: String,
  messages: [ObjectId],
  timestamps: true
}
```

#### Message Model
```javascript
{
  chatId: ObjectId (required),
  content: String (required),
  role: String (required), // 'user' or 'model'
  character: String,
  timestamps: true
}
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_BACKEND_URL=https://your-backend-domain.com/api`
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_API_KEY`
   - `PINECONE_API_KEY`
   - `NODE_ENV=production`
3. Deploy automatically on push to main branch

### Production URLs
- **Frontend**: `https://atomic-llm.vercel.app`
- **Backend**: `https://contextual-chatbot-react.onrender.com`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout

### Chat
- `GET /api/chat` - Get user's chat sessions
- `POST /api/chat` - Create new chat session
- `POST /api/chat/:chatId/message` - Send message to chat

### Health Check
- `GET /api/health` - Server health status
- `GET /api/cors-test` - CORS configuration test

## 🛠️ Technologies Used

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code highlighting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling

### AI & Database
- **Google Gemini AI** - Language model and embeddings
- **Pinecone** - Vector database for memory
- **MongoDB Atlas** - Document database

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend URL is in allowed origins
   - Check environment variables are set correctly
   - Verify CORS middleware is properly configured

2. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check network access settings in MongoDB Atlas
   - Ensure environment variables are loaded

3. **AI API Errors**
   - Verify Google AI API key is valid
   - Check API quota and limits
   - Ensure Pinecone API key is correct

4. **Authentication Issues**
   - Check JWT secret is set
   - Verify cookie settings for production
   - Ensure user model is properly configured

### Debug Commands

```bash
# Test backend health
curl https://contextual-chatbot-react.onrender.com/api/health

# Test CORS
curl -H "Origin: http://localhost:5173" https://contextual-chatbot-react.onrender.com/api/health

# Test login endpoint
curl -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}' https://contextual-chatbot-react.onrender.com/api/auth/login
```

## 📝 Development Notes

### Character System
The AI personalities are defined in `backend/src/services/ai.service.js`. Each character has:
- Unique personality traits
- Specific communication style
- Cultural context (Indian English, Hinglish)
- Response patterns

### Memory System
- Messages are embedded using Gemini's embedding model
- Vector embeddings are stored in Pinecone
- Context is retrieved based on semantic similarity
- Memory helps maintain conversation continuity

### Credit System
- Users start with 50 credits
- Each AI interaction consumes credits
- Credits prevent API abuse
- System tracks usage per user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**DeveloperChetram**
- GitHub: [@DeveloperChetram](https://github.com/DeveloperChetram)
- Email: patelchetram49@gmail.com

## 🙏 Acknowledgments

- Google Gemini AI for language model capabilities
- Pinecone for vector database services
- MongoDB Atlas for database hosting
- Vercel and Render for deployment platforms
- The React and Node.js communities for excellent tooling

---

**Note**: This application is designed for educational and personal use. Please ensure you have proper API keys and follow the terms of service for all third-party services used.
