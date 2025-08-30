const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Define cookie options once
const cookieOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: 'None' 
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

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
    // cookie options
    res.cookie('token', token, cookieOptions);
    res.status(201).json({
        message:"user successfully registered",
        user
    })
} catch (error) {
    console.log(error)
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
        const token= jwt.sign({id:user._id}, process.env.JWT_SECRET)
        // Use defined cookie options
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            message:'user loged in',
            user
        })
    } catch (error) {
        console.log(error)
    }
}

const logoutController = async (req, res)=>{
    // Use the same options when clearing the cookie
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