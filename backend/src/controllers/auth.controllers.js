const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieOptions = require('../utils/cookieOptions');

const registerController = async (req, res)=>{
    const {fullName:{firstName, lastName}, email, password } = req.body;
    const isUser = await userModel.findOne({email})

    if(isUser){
        return res.status(409).json({
            message:"user already exist"
        })
    }
  try{  
    const user = await userModel.create({
        fullName:{
            firstName, 
            lastName
        },
        email,
        credits: 50,
        passwordHash: await bcrypt.hash(password, 10)
    })

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: '5d' })
    res.cookie('token', token, cookieOptions);
    // Remove sensitive data before sending response
    const userResponse = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        credits: user.credits,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
    
    res.status(201).json({
        message:"user successfully registered",
        user: userResponse
    })
} catch (error) {
    console.log(error)
    res.status(500).json({
        message: "Internal server error"
    })
}
}

const loginController = async (req, res)=>{
    const {email, password} = req.body;
    const user = await userModel.findOne({
        email
    }).select('+passwordHash') // Explicitly include passwordHash for authentication
    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }
    const isPasswordValid =await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordValid){
        return res.status(401).json({
            message: "wrong password"
        })
    }
    try {
        const token= jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: '5d' })
        res.cookie('token', token, cookieOptions);
        
        // Remove sensitive data before sending response
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            credits: user.credits,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(201).json({
            message:'user loged in',
            user: userResponse
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

const logoutController = async (req, res)=>{
    res.clearCookie("token", cookieOptions);
    res.status(201).json({
        message:"user logged out"
    })
}

module.exports= {
    registerController,
    loginController,
    logoutController
}