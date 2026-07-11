const Agent = require("../models/agent.model");
// const Agent = require("../models/agent.model");

const useGroq = require("../langchain/providers/groq.provider");
const loadTools = require("../langchain/tools/loadTools");
const createAgent = require("../langchain/agents/createAgent");
const runAgent = require("../langchain/chains/chatChain");




const createAgentController = async (req, res) => {
    try {
        const {
            name,
            description,
            thumbnail,
            isPublished,
            version,
            tools,
            graph,
            settings
        } = req.body;

        const agent = await Agent.create({
            // user: req.user._id,

            name,
            description,
            thumbnail,
            isPublished,
            version,
            tools,

            graph,

            settings,
        });

        return res.status(201).json({
            success: true,
            data: agent,
        });

    } catch (error) {
        console.error("Error creating agent:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create agent.",
        });
    }
};


const chatController = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { message } = req.body;

        const agentConfig = await Agent.findById(agentId);

        if (!agentConfig) {
            return res.status(404).json({
                success: false,
                message: "Agent not found."
            });
        }

        const llm = useGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: agentConfig.settings.model,
            temperature: agentConfig.settings.temperature,
            maxTokens: agentConfig.settings.maxTokens,
        });

        const tools = loadTools(agentConfig.tools);

        const agent  = await createAgent({
            llm,
            tools,
            systemPrompt: agentConfig.settings.systemPrompt,
        });

        const response = await runAgent({
            agent,
            tools,
            message,
        });

        return res.status(200).json(response);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    createAgentController,
    chatController,
};