const { createDefaultAgent } = require("../services/agent.service");
const Agent = require("../models/agent.model");
// const Agent = require("../models/agent.model");

const useGroq = require("../langchain/providers/groq.provider");
const loadTools = require("../langchain/tools/loadTools");
const createAgent = require("../langchain/agents/createAgent");
const runAgent = require("../langchain/chains/chatChain");
const createLangChainAgent = require("../langchain/agents/createAgent");
const AgentConfig = require("../models/agentconfig.model");




const createAgentController = async (req, res) => {
    try {
        const {
            name,
            description,
            isPublished,
            version,
            tools,
            graph,
            settings
        } = req.body;

        // Use uploaded file path or default image
        let thumbnailPath = "uploads/agent-logo.png";
        if (req.file) {
            thumbnailPath = `uploads/${req.file.filename}`;
        }

        const parsedTools = tools ? (typeof tools === 'string' ? JSON.parse(tools) : tools) : [];
        const parsedSettings = settings ? (typeof settings === 'string' ? JSON.parse(settings) : settings) : {};

        const agent = await Agent.create({
            user: req.user._id,
            name,
            description,
            thumbnail: thumbnailPath,
            isPublished,
            version,
            tools: parsedTools,
            graph,
            settings: parsedSettings,
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

const editAgentController = async (req, res) => {
    try {
        const { agentId } = req.params;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.thumbnail = `uploads/${req.file.filename}`;
        }

        if (updateData.tools && typeof updateData.tools === 'string') {
            updateData.tools = JSON.parse(updateData.tools);
        }
        if (updateData.settings && typeof updateData.settings === 'string') {
            updateData.settings = JSON.parse(updateData.settings);
        }

        const updatedAgent = await Agent.findOneAndUpdate(
            { _id: agentId, user: req.user._id, isBuiltIn: { $ne: true } },
            updateData,
            { new: true }
        );

        if (!updatedAgent) {
            return res.status(404).json({ success: false, message: "Agent not found or cannot be edited" });
        }

        return res.status(200).json({ success: true, data: updatedAgent });
    } catch (error) {
        console.error("Error editing agent:", error);
        return res.status(500).json({ success: false, message: "Failed to edit agent" });
    }
};

const deleteAgentController = async (req, res) => {
    try {
        const { agentId } = req.params;
        const deletedAgent = await Agent.findOneAndDelete({ _id: agentId, user: req.user._id, isBuiltIn: { $ne: true } });

        if (!deletedAgent) {
            return res.status(404).json({ success: false, message: "Agent not found or cannot be deleted" });
        }

        return res.status(200).json({ success: true, message: "Agent deleted successfully" });
    } catch (error) {
        console.error("Error deleting agent:", error);
        return res.status(500).json({ success: false, message: "Failed to delete agent" });
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

        const agent = await createLangChainAgent({
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
const getAgentsController = async (req, res) => {
    try {
        const user = req.user;
        let agents = await Agent.find({
            user: user._id,
        });

        // Automatically create a default agent if the user has none
        if (agents.length === 0) {
            const defaultAgent = await createDefaultAgent(user._id);
            agents = [defaultAgent];
        }
        return res.status(200).json({
            success: true,
            data: agents,
        });
    } catch (error) {
        console.error("Error getting agents:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get agents.",
        });
    }
};
const getAgentConfigController = async (req, res) => {
    try {

        const agentConfig = await AgentConfig.find();
        if (!agentConfig) {
            return res.status(404).json({
                success: false,
                message: "Agent config not found."
            });
        }
        return res.status(200).json({
            success: true,
            data: agentConfig,
        });
    } catch (error) {
        console.error("Error getting agent config:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get agent config.",
        });
    }
};


module.exports = {
    createAgentController,
    editAgentController,
    deleteAgentController,
    chatController,
    getAgentsController,
    getAgentConfigController
};