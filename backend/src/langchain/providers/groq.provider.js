const { ChatGroq } = require("@langchain/groq");

const useGroq = ({
    model,
    temperature,
    maxTokens,
    apiKey,
}) => {
    return new ChatGroq({
        apiKey,
        model,
        temperature,
        maxTokens,
    });
};

module.exports = useGroq;