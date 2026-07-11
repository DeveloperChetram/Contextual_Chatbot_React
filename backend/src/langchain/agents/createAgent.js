const { createAgent } = require("langchain");

const createLangChainAgent = ({
    llm,
    tools,
    systemPrompt,
}) => {
    return createAgent({
        model: llm,
        tools,
        systemPrompt,
    });
};

module.exports = createLangChainAgent;