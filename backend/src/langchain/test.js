const useGroq = require("./providers/groq.provider");
const createLangChainAgent = require("./agents/createAgent");
const calculator = require("./tools/calculator.tool");

async function main() {
    const llm = useGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
    });

    const agent = createLangChainAgent({
        llm,
        tools: [calculator],
        systemPrompt:
            "You are a helpful assistant. Always use the calculator tool for math.",
    });

    const response = await agent.invoke({
        messages: [
            {
                role: "user",
                content: "What is 256 * 37?",
            },
        ],
    });

    console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);