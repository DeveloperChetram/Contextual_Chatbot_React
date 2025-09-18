const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined // Let browser handle domain
};

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
    res.status(201).json({
        message:"user successfully registered",
        user
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
    })
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
        res.status(201).json({
            message:'user loged in',
            user
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