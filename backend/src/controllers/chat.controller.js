const chatModel = require("../models/chat.model");

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


module.exports = {createChatController}