const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");

// MINOR-02: Use shared CORS config
const allowedOrigins = require("../config/cors");

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    },
  });

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
      try {
        // PERF-01: Single atomic credit check + decrement (was 2 separate queries)
        const updatedUser = await userModel.findOneAndUpdate(
          { _id: socket.user._id, credits: { $gt: 0 } },
          { $inc: { credits: -1 } },
          { new: true }
        ).select("credits");

        if (!updatedUser) {
          socket.emit("ai-response", {
            chatId: messagePayload.chatId,
            response:
              "You are out of credits. For more credits, please contact @developerchetram on Instagram or email me at patelchetram49@gmail.com.",
            character: messagePayload.character || "atomic",
          });
          return;
        }

        // FLAW-03: character comes from message payload — no server-side global needed
        const character = messagePayload.character || "atomic";

        const [userMessage, vectors] = await Promise.all([
          messageModel.create({
            user: socket.user._id,
            chatId: messagePayload.chatId,
            content: messagePayload.content,
            role: "user",
            character,
          }),
          generateVector(messagePayload.content),
        ]);

        const [pineconeData, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 5,
            metadata: { user: socket.user._id.toString(), character },
          }),
          messageModel
            .find({ chatId: messagePayload.chatId })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        const stm = chatHistory
          .filter((item) => item.character === character)
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.content }],
          }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `You are an assistant with long-term memory. Here are relevant memories about the user: ${pineconeData
                  .map((item) => `- ${item.metadata.message}`)
                  .join("\n")}`,
              },
            ],
          },
        ];

        const { response, character: responseCharacter } = await generateResponse(
          [...ltm, ...stm],
          character
        );

        socket.emit("ai-response", {
          chatId: messagePayload.chatId,
          response,
          character: responseCharacter,
        });

        const responseMessage = await messageModel.create({
          user: socket.user._id,
          chatId: messagePayload.chatId,
          content: response,
          character: responseCharacter,
          role: "model",
        });

        const responseVectors = await generateVector(response);
        await Promise.all([
          createMemory({
            vectors,
            messageId: userMessage._id,
            metadata: {
              user: socket.user._id.toString(),
              chatId: messagePayload.chatId,
              message: messagePayload.content,
              character,
            },
          }),
          createMemory({
            vectors: responseVectors,
            messageId: responseMessage._id,
            metadata: {
              chatId: messagePayload.chatId,
              user: socket.user._id.toString(),
              message: response,
              character: responseCharacter,
            },
          }),
        ]);
      } catch (error) {
        console.error("Socket user-message error:", error.message);

        if (error.message?.includes("429") && error.message?.includes("RESOURCE_EXHAUSTED")) {
          socket.emit("ai-response", {
            chatId: messagePayload.chatId,
            response:
              "The service is temporarily unavailable due to high demand. Please try again later.",
            error: "quota-exceeded",
            character: messagePayload.character || "atomic",
          });
        } else {
          socket.emit("error", {
            message: "Sorry, an error occurred while processing your request.",
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });
};

module.exports = initSocketServer;