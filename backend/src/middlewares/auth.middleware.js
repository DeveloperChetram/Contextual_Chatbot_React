const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const authMiddleware = async (req, res, next)=>{
    const { token } = req.cookies;

    if(!token){
        return res.status(401).json({
            message:"Unauthorized: token not found"
        })
    }

    try {
        const decoded =jwt.verify(token, process.env.JWT_SECRET) 
        
        const user = await userModel.findOne({
            _id:decoded.id
        })

        if(!user){

            return res.status(401).json({
                message:"Unauthorized: user not found"
            })
        }
        req.user = user
        next()

        
    }
         catch (error) {
            console.log(error)
            res.status(401).json({
                Error:error
            })
        }
}

module.exports=authMiddleware;