const { createReactAgent } = require("@langchain/langgraph/prebuilt");

// Uses createReactAgent which correctly uses Groq's NATIVE function calling format.
// The 'createAgent' from 'langchain' uses old XML-style ReAct prompting which Groq rejects.
const createLangChainAgent = ({ llm, tools, systemPrompt }) => {
    return createReactAgent({
        llm,
        tools,
        stateModifier: systemPrompt,
    });
};

module.exports = createLangChainAgent;