const toolRegistry = require("./registry");

const loadTools = (toolNames = []) => {
    return toolNames
        .map((toolName) => toolRegistry[toolName])
        .filter(Boolean);
};

module.exports = loadTools;