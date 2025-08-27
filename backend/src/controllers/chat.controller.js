const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

const createChatController = async (req, res) =>{
    const { title } = req.body;
    const user = req.user
    const chat = await chatModel.create({
        user:user._id,
        title:title
    })

    res.status(201).json({
        message:"chat created",
        chat
    })
  
}

const getChatController = async (req, res)=>{
    const user = req.user
    const chats = await chatModel.find({user:user._id})
    res.status(200).json({
        message:"chats fetched",
        chats
    })


}

const getMessagesController = async (req, res)=>{
    const user = req.user
    const messages = await messageModel.find({user:user._id})
    res.status(200).json({
        message:"messages fetched",
        messages
    })
}
module.exports = {createChatController,getChatController,getMessagesController}
