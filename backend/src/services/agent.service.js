const Agent = require("../models/agent.model");

const createAgent = async (userId, data) => {
    const agent = await Agent.create({
        ...data,
        user: userId,
    });

    return agent;
};

module.exports = {
    createAgent,
};