const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");

const uuidTool = tool(
    async ({ count }) => {
        const amount = Math.min(count || 1, 10); // max 10 at a time
        const ids = Array.from({ length: amount }, () => uuidv4());
        return ids.join("\n");
    },
    {
        name: "uuid_generator",
        description: "Generates one or more random UUIDs (v4). Useful when the user needs a unique ID, identifier, or token.",
        schema: z.object({
            count: z.number().optional().describe("Number of UUIDs to generate. Defaults to 1, max is 10."),
        }),
    }
);

module.exports = uuidTool;
