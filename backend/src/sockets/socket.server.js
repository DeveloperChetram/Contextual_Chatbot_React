const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'https://contextual-chatbot-react.vercel.app',
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:3001',
          'https://contextual-chatbot-react.onrender.com',
          // Add your Vercel domain for mobile access
          'https://your-app-name.vercel.app'
        ];
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log('Socket CORS blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    },
  });

  // Middleware 
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      if (!cookies.token) {
        return next(new Error("Unauthorized: Token not found"));
      }
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("credits"); 
      if (!user) {
        return next(new Error("Unauthorized: User not found"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    socket.on("user-message", async (messagePayload) => {
      console.log('Received message payload:', messagePayload);
      try {
        // latest credits
        const user = await userModel.findById(socket.user._id).select("credits");
        if (!user || typeof user.credits !== "number" || user.credits <= 0) {
          socket.emit("ai-response", {
            chatId: messagePayload.chatId,
            response:
              "You are out of credits. For more credits, please contact @developerchetram on Instagram or email me at patelchetram49@gmail.com.",
          });
          return;
        }

        // decrement credits
        const updatedUser = await userModel.findOneAndUpdate(
          { _id: socket.user._id, credits: { $gt: 0 } },
          { $inc: { credits: -1 } },
          { new: true }
        ).select("credits");

        if (!updatedUser) {
          // 0 credits
          socket.emit("ai-response", {
            chatId: messagePayload.chatId,
            response:
              "You are out of credits. For more credits, please contact @developerchetram on Instagram or email me at patelchetram49@gmail.com. NOTE: your messages wont be saved after and with this response. NOTE: your messages wont be saved after and with this response.",
          });
          return;
        }

        // DB save & vector generation
        const [userMessage, vectors] = await Promise.all([
          messageModel.create({
            user: socket.user._id,
            chatId: messagePayload.chatId,
            content: messagePayload.content,
            role: "user",
            character: messagePayload.character || "atomic",
          }),
          generateVector(messagePayload.content),
        ]);

        // Query memories and get chat history 
        const [pineconeData, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 5,
            metadata: { user: socket.user._id.toString() },
          }),
          messageModel
            .find({ chatId: messagePayload.chatId })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean()
            .then((messages) => messages.reverse()), 
        ]);
        
        //  context for the AI
        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm = [{
          role: "user",
          parts: [
            {
              text: `You are an assistant with long-term memory. Here are relevant memories about the user: ${pineconeData
                .map((item) => `- ${item.metadata.message}`)
                .join("\n")}`,
            },
          ],
        }];

        // Generate response with the selected character
        const {response, character: responseCharacter} = await generateResponse([...ltm, ...stm], messagePayload.character);

        socket.emit("ai-response", { chatId: messagePayload.chatId, response, character: responseCharacter });

        // save response
        const responseMessage = await messageModel.create({
            user: socket.user._id,
            chatId: messagePayload.chatId,
            content: response,
            character: responseCharacter,
            role: "model",
        });

        const responseVectors = await generateVector(response);
        // pinecone save response
        await Promise.all([
            createMemory({
                vectors,
                messageId: userMessage._id,
                metadata: {
                    user: socket.user._id.toString(),
                    chatId: messagePayload.chatId,
                    message: messagePayload.content,
                },
            }),
            // pinecone save response message 
            createMemory({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata: {
                    chatId: messagePayload.chatId,
                    user: socket.user._id.toString(),
                    message: response,
                },
            })
        ]);

      } catch (error) {
        console.error("Error in user-message handler:", error.message);
        socket.emit("error", { 
              message: "Sorry, an error occurred while processing your request." 
          });
      }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user._id}`);
    });
  });
};

module.exports = initSocketServer;