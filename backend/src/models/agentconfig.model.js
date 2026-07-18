const mongoose = require("mongoose");

const agentConfigSchema = new mongoose.Schema({
    tools: [
        {
            name: {
                type: String,
                required: true,
                unique: true,
            },
            description: {
                type: String,
                required: true,
            },
        },
    ],

    demoAgents: [
        {
            name: String,
            avatar: String,
            systemInstruction: String,
            model: String,
            tools: [String],
        },
    ],

    models: [
        {
            name: String,
            modelId: String,
            description: String,
        },
    ],
});

const AgentConfig= mongoose.model("AgentConfig", agentConfigSchema);
module.exports = AgentConfig;