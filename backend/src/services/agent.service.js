const Agent = require("../models/agent.model");
const AgentConfig = require("../models/agentconfig.model");
const toolRegistry = require("../langchain/tools/registry")

const createAgent = async (userId, data) => {
    const agent = await Agent.create({
        ...data,
        user: userId,
    });

    return agent;
};
const syncTools = async () => {
    console.log("Syncing tools...");
    const tools = Object.values(toolRegistry).map((tool) => ({
        name: tool.name,
        description: tool.description,
    }));

    await AgentConfig.findOneAndUpdate(
        {},                     // single config document
        { tools },
        {
            upsert: true,
            new: true,
        }
    );

    console.log("Tools synced.");
};


const syncModels = async()=>{
console.log("Syncing models...");
    const models = [
        {
            name: "LLaMA 3.3 70B Versatile",
            modelId: "llama-3.3-70b-versatile",
            description: "Meta's flagship model. Best for complex reasoning, coding, and long conversations. 128k context.",
        },
      
      
    ];

    await AgentConfig.findOneAndUpdate(
        {},
        { models },
        { upsert: true, new: true }
    );

    console.log("Models synced.");

}

const syncDemoAgents = async()=>{
console.log("Syncing demo agents...");
const demoAgents = [
    {
        name: "Math Tutor",
        description: "A friendly tutor who helps with math problems.",
        thumbnail: "https://example.com/math-tutor.png",
        isPublished: true,
        version: "1.0.0",
        tools: ['calculator'],
        graph: [],
        settings: {
            model: "gemini-3-pro-preview",
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: "You are a helpful math tutor.",
        },
    },
    {
        name: "History Expert",
        description: "An expert in history who can answer your questions.",
        thumbnail: "https://example.com/history-expert.png",
        isPublished: true,
        version: "1.0.0",
        tools: ['calculator'],
        graph: [],
        settings: {
            model: "gemini-3-pro-preview",
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: "You are a helpful history expert.",
        },
    },
    {
        name: "Science Assistant",
        description: "An assistant who can help with science questions.",
        thumbnail: "https://example.com/science-assistant.png",
        isPublished: true,
        version: "1.0.0",
        tools: ['calculator'],
        graph: [],
        settings: {
            model: "gemini-3-pro-preview",
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: "You are a helpful science assistant.",
        },
    },
];

await AgentConfig.findOneAndUpdate(
    {},
    { demoAgents },
    { upsert: true, new: true }
);
console.log("Demo agents synced.");

}


const createDefaultAgent = async (userId) => {
    return await Agent.create({
        user: userId,
        name: "Kael",
        isBuiltIn: true,
        thumbnail:'/uploads/agent-logo.png',    
        description: "Your personal AI assistant",
        isPublished: true,
        settings: {
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            systemPrompt: "You are a helpful AI assistant. Answer questions accurately and concisely."
        },
        tools: ['calculator']
    });
};

module.exports = {
    createAgent,
    syncTools,
    syncDemoAgents,
    syncModels,
    createDefaultAgent,
};