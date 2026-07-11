const runAgent = async ({ agent, message }) => {
    const response = await agent.invoke({
        messages: [
            {
                role: "user",
                content: message,
            },
        ],
    });

    return response;
};

module.exports = runAgent;