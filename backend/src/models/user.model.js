const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    fullName:{
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        }
    },

    passwordHash:{
        type:String,
        required:true
    }
}, {timestamps:true})

const userModel = mongoose.model('users', userSchema);


module.exports = userModel;
