const { Server } = require('socket.io')
const cookie = require('cookie')
const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const { generateResponse, generateVector } = require('../services/ai.service')
const messageModel = require('../models/messege.model')
const { createMemory, queryMemory } = require('../services/vector.service')
const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {})

    // middleware
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
        // console.log(cookies)
        if (!cookies.token) {
            next(new Error('unauthorized : token not found'))
        }
        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await userModel.findById(
                decoded.id
            )
            socket.user = user;
            next()
        } catch (error) {
            // console.log('error')
            next(new Error('Invalid token' + error))
        }
    })


    io.on('connection', (socket) => {
        // console.log('a user connected')
        // console.log('user connected', socket.id, socket.user)

        socket.on('user-message', async (messagePayload) => {
            // user message vectors
            
            
            
            // mongo model
            const userMessage =   await messageModel.create({
                user: socket.user._id,
                chatId: messagePayload.chatId,
                content: messagePayload.content,
                role: "user"
            })
            
            // vector memory
            const vectors = await generateVector(messagePayload.content);
            // console.log(vectors)

            // pinecone query
            const pineconeData = await queryMemory(
               {queryVector:vectors,
                limit:5,
                metadata:{}
               }
            )

            console.log(pineconeData)

            await createMemory({
                vectors, messageId: userMessage._id, metadata: {
                    user: socket.user._id,
                    chatId: messagePayload.chatId,
                    message:messagePayload.content
                }
            })

         
            // STM
            const chatHistory = (await messageModel.find({ chatId: messagePayload.chatId }).sort({createdAt: -1}).limit(8).lean()).reverse()
            // console.log(chatHistory)
            const STM = chatHistory.map((item) => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })//.slice(-4)
            const response = await generateResponse(STM)
            
            // mongo model
            const responseMessage = await messageModel.create({
                user: socket.user._id,
                chatId: messagePayload.chatId,
                content: response,
                role: "model"
            })
            // response vectors
            const responseVectors = await generateVector(response)
            //  console.log(responseVectors)
            // response vector memory
            await createMemory({vectors:responseVectors, messageId:responseMessage._id, metadata:{
                chatId:messagePayload.chatId,
                user:socket.user._id,
                message:response
            }})
            socket.emit('ai-response', { chatId: messagePayload.chatId, response })
        })
    })



}


module.exports = initSocketServer;