const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const jsonFormatterTool = tool(
    async ({ json, indent }) => {
        try {
            const parsed = JSON.parse(json);
            const spaces = indent || 2;
            const formatted = JSON.stringify(parsed, null, spaces);
            return `Formatted JSON:\n\`\`\`json\n${formatted}\n\`\`\``;
        } catch (error) {
            return `Invalid JSON: ${error.message}`;
        }
    },
    {
        name: "json_formatter",
        description: "Validates and pretty-formats a JSON string. Use when the user wants to format, beautify, or validate JSON.",
        schema: z.object({
            json: z.string().describe("The raw JSON string to format and validate."),
            indent: z.number().optional().describe("Number of spaces for indentation. Default is 2."),
        }),
    }
);

module.exports = jsonFormatterTool;
