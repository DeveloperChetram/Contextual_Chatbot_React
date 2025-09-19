const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

const createChatController = async (req, res) =>{
    const { title } = req.body;
    const user = req.user
    const chat = await chatModel.create({
        user:user._id,
        title:title
    })

    // Remove sensitive data from chat response
    const chatResponse = {
        _id: chat._id,
        title: chat.title,
        user: chat.user,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
    };

    res.status(201).json({
        message:"chat created",
        chat: chatResponse
    })
  
}

const getChatController = async (req, res)=>{
    const user = req.user
    const chats = await chatModel.find({user:user._id}).sort({ createdAt: -1 });
    
    // Sanitize chat data to remove any sensitive information
    const sanitizedChats = chats.map(chat => ({
        _id: chat._id,
        title: chat.title,
        user: chat.user,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
    }));
    
    res.status(200).json({
        message:"chats fetched",
        chats: sanitizedChats
    })
}

const getMessagesController = async (req, res)=>{
    const user = req.user
    const messages = await messageModel.find({user:user._id})
    
    // Sanitize message data to remove any sensitive information
    const sanitizedMessages = messages.map(message => ({
        _id: message._id,
        user: message.user,
        chatId: message.chatId,
        content: message.content,
        role: message.role,
        character: message.character,
        lastActivity: message.lastActivity,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
    }));
    
    res.status(200).json({
        message:"messages fetched",
        messages: sanitizedMessages
    })
}
const updateChatController = async (req, res)=>{
    const user = req.user
    const {id} = req.params
    const {title} = req.body
    const chat = await chatModel.findByIdAndUpdate(id, {title}, {new:true})
    
    // Sanitize chat data to remove any sensitive information
    const chatResponse = {
        _id: chat._id,
        title: chat.title,
        user: chat.user,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
    };
    
    res.status(200).json({
        message:"chat updated",
        chat: chatResponse
    })
}
module.exports = {createChatController,getChatController,getMessagesController,updateChatController}
