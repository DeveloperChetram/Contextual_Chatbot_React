const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");
const allowedOrigins = require("../config/cors");
const Agent = require("../models/agent.model");
const useGroq = require("../langchain/providers/groq.provider");
const loadTools = require("../langchain/tools/loadTools");
const runAgent = require("../langchain/chains/chatChain");
const createLangChainAgent = require("../langchain/agents/createAgent");

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.error(`🚫 CORS blocked: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
      exposedHeaders: ["Set-Cookie"],
    },
    // Enable connection state recovery for reliability
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    // Configure transports to prefer WebSocket
    transports: ["websocket", "polling"],
    // Allow EIO3 protocol
    allowEIO3: true,
  });

  io.use(async (socket, next) => {
    try {
      // Try to get token from handshake auth (for production cross-domain)
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      console.log('Socket handshake auth:', socket.handshake)
      console.log('token in socket ', token)
      // Fallback to cookies (for development/localhost)
      if (!token) {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
        token = cookies.token;
      }
      
      if (!token) return next(new Error("Unauthorized: Token not found"));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("credits");

      if (!user) return next(new Error("Unauthorized: User not found"));

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Invalid token: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket?.fullName?.firstName}, ID: ${socket.user._id}`);

    socket.on("user-message", async (messagePayload) => {
      try {
     
        const updatedUser = await userModel.findOne(
          { _id: socket.user._id, credits: { $gt: 0 } },
        ).select("credits");

        if (!updatedUser) {
          socket.emit("ai-response", {
            chatId: messagePayload.chatId,
            response: "You are out of credits. For more credits, please contact @developerchetram on Instagram.",
            character: messagePayload.character || "atomic",
          });
          return;
        }

        const characterKey = messagePayload.character || "atomic";

        const [userMessage, vectors] = await Promise.all([
          messageModel.create({
            user: socket.user._id,
            chatId: messagePayload.chatId,
            content: messagePayload.content,
            role: "user",
            character: characterKey,
          }),
          generateVector(messagePayload.content),
        ]);

        const [pineconeData, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 5,
            metadata: { user: socket.user._id.toString(), character: characterKey },
          }),
          messageModel
            .find({ chatId: messagePayload.chatId })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean()
            .then((msgs) => msgs.reverse()),
        ]);

        const stm = chatHistory
          .filter((item) => item.character === characterKey)
          .map((item) => ({ role: item.role, parts: [{ text: item.content }] }));

        const ltm = [
          {
            role: "user",
            parts: [{
              text: `Here are relevant memories about the user: ${pineconeData.map((item) => `- ${item.metadata.message}`).join("\n")
                }`,
            }],
          },
        ];

        const { response, character: responseCharacter } = await generateResponse(
          [...ltm, ...stm],
          characterKey
        );

        socket.emit("ai-response", {
          chatId: messagePayload.chatId,
          response,
          character: responseCharacter,
        });

        const finalUpdatedUser =  userModel.findOneAndUpdate(
          { _id: socket.user._id },
          { $inc: { credits: -1 } },
          { new: true }
        );

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
              character: characterKey,
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

        if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
          socket.emit("ai-response", {
            chatId: messagePayload.chatId,
            response: "The service is temporarily unavailable due to high demand. Please try again later.",
            error: "quota-exceeded",
            character: messagePayload.character || "atomic",
          });
        } else {
          socket.emit("error", { message: "Sorry, an error occurred while processing your request." });
        }
      }
    });

    socket.on('agent-chat', async (agentPayload) => {
     try {
       console.log(`Received agent-chat from user ${socket.user._id} for message ${agentPayload.message}`);
 
        const agentConfig = await Agent.findById(agentPayload.agentId);
        if (!agentConfig) {
            return socket.emit("error", { message: "Agent not found." });
        }
 
        const llm = await useGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: agentConfig.settings.model,
            temperature: agentConfig.settings.temperature,
            // Cap maxTokens to 1024 to avoid hitting TPM limits on responses
            maxTokens: Math.min(agentConfig.settings.maxTokens || 2048, 1024),
        });
 
        const tools = await loadTools(agentConfig.tools);
        const agent = await createLangChainAgent({
            llm,
            tools,
            systemPrompt: `Your name is ${agentConfig.name}. ${agentConfig.settings.systemPrompt}\n\nIMPORTANT: When using tools, you must output strictly valid JSON. Do not wrap your JSON in parentheses like '({...})'. Output the JSON object directly.`,
        });

        // Helper: retry once on 429 after waiting the retry-after seconds
        const runWithRetry = async () => {
            try {
                return await runAgent({
                    agent,
                    tools,
                    message: agentPayload.message,
                    callbacks: [
                        {
                            handleToolStart: (tool, input) => {
                                socket.emit("agent-status", { status: `Using tool: ${tool.name}...` });
                            },
                            handleToolEnd: (output, toolId) => {
                                socket.emit("agent-status", { status: `Tool finished. Processing result...` });
                            },
                            handleLLMStart: () => {
                                socket.emit("agent-status", { status: `Thinking...` });
                            }
                        }
                    ]
                });
            } catch (err) {
                // If rate limited, wait and retry once
                if (err?.status === 429) {
                    const retryAfter = parseInt(err?.headers?.get?.('retry-after') || '15', 10);
                    socket.emit("agent-status", { status: `Rate limit hit. Retrying in ${retryAfter}s...` });
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    // Retry once
                    return await runAgent({
                        agent,
                        tools,
                        message: agentPayload.message,
                        callbacks: []
                    });
                }
                throw err;
            }
        };

        const response = await runWithRetry();

        const finalMessageContent = response.messages[response.messages.length - 1].content;

        // Truncate if unusually long (safety net)
        const finalOutput = typeof finalMessageContent === 'string' && finalMessageContent.length > 4000
            ? finalMessageContent.substring(0, 4000) + '\n\n*(Response truncated due to length)*'
            : finalMessageContent;

        socket.emit("agent-status", { status: "" }); // clear status
        socket.emit("agent-response", {
           agent: {
            agentName: agentConfig.name,
            agentId: agentConfig._id,
           },
           agentResponse: finalOutput,
        });
         
        userModel.findOneAndUpdate(
           { _id: socket.user._id },
           { $inc: { credits: -1 } },
           { new: true }
        );
     } catch (error) {
       console.log(error);
       let errorMessage = "I encountered an error while processing your request. Please try again.";
       if (error?.error?.error?.code === 'tool_use_failed') {
         errorMessage = "I had trouble using my tools correctly. Could you please rephrase your request?";
       } else if (error?.status === 429) {
         errorMessage = "I'm getting too many requests right now. Please wait a moment and try again.";
       } else if (error.message) {
         errorMessage = `Error: ${error.message}`;
       }
       
       socket.emit("agent-status", { status: "" }); // always clear status on error
       socket.emit("agent-error", {
         agent: {
           agentName: agentPayload.agentName || "Agent",
           agentId: agentPayload.agentId
         },
         message: errorMessage
       });
     }

    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });
};

module.exports = initSocketServer;