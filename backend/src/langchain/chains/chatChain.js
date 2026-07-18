const runAgent = async ({ agent, message, callbacks }) => {
    const config = callbacks ? { callbacks } : {};
    const response = await agent.invoke({
        messages: [
            {
                role: "user",
                content: message,
            },
        ],
    }, config);

    return response;
};

module.exports = runAgent;