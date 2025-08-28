const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    chatId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"chats",
        required:true
    },
    content:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user', 'model'],
        default:"user"
    },
    character:{
        type:String,
        default:"default"
    },
    lastActivity:{
        type:Date,
        default:Date.now
    }

},{timestamps:true})



const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;