const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
        firstName:{
            type:String,
            required:true,
            trim: true
        },
        lastName:{
            type:String,
            required:true,
            trim: true
        }
    },
    credits:{
        type:Number,
        default:50,
        min: 0
    },
    picture:{
        type:String,
        required:true,
        trim: true
    },
    passwordHash:{
        type:String,
        required:true,
        select: false
    }
}, {timestamps:true})

// Add a method to transform the user object when converting to JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    // Remove sensitive fields
    delete userObject.passwordHash;
    return userObject;
};

const userModel = mongoose.model('users', userSchema);


module.exports = userModel;
