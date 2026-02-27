const userModel = require('../models/user.model');

const indexController = (req, res) => {
  res.json({ message: "Server is running" });
};

const creditsController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select('credits');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ credits: user.credits });
  } catch (error) {
    console.error("creditsController error:", error.message);
    res.status(500).json({ message: "Error retrieving credits" });
  }
};

// FLAW-03: changeCharacterController removed — server-side global character caused
// multi-user race conditions. Character is now sent per-message in socket payload.

module.exports = { indexController, creditsController };