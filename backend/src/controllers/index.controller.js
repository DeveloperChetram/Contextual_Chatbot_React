const userModel = require('../models/user.model')
const { changeCharacter } = require('../services/ai.service')

const indexController = (req, res)=>{
    res.json({
        message: "/ is working"
    })
}

const creditsController =  async (req, res)=> {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) {
      return res.status(400).json({ message: "User not found in request" });
    }
    const user = await userModel.findById(userId).select('credits');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Only return credits, no other sensitive information
    res.json({ 
      credits: user.credits,
      message: "Credits retrieved successfully"
    });
  } catch (error) {
    console.error("Error in credits controller:", error);
    res.status(500).json({ message: "Error in getting credits" });
  }
}

const changeCharacterController = async (req, res)=>{
    const {character} = req.params;
    const systemInstruction = await changeCharacter(character);
    res.json({message: "Character changed successfully"});
}

module.exports = { indexController, creditsController, changeCharacterController }