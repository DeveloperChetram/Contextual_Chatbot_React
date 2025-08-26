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
const getChatByIdController = async (req, res) => {
    const user = req.user;
    const chatId = req.params.id;

    try {
        const chat = await chatModel.findOne({ _id: chatId, user: user._id });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json({
            message: "chat fetched",
            chat
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const chatHistoryController = async (req, res) => {
    const user = req.user;
    const chatId = req.params.id;

    const chat = await messageModel.find({ chat: chatId });
    res.status(200).json({
        message: "chat history fetched",
        chat
    })
}

module.exports = {createChatController,getChatController,getChatByIdController,chatHistoryController}