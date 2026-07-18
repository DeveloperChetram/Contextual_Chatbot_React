const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const base64Tool = tool(
    async ({ text, mode }) => {
        try {
            if (mode === "decode") {
                const decoded = Buffer.from(text, "base64").toString("utf-8");
                return `Decoded (Base64 → Text):\n${decoded}`;
            } else {
                const encoded = Buffer.from(text, "utf-8").toString("base64");
                return `Encoded (Text → Base64):\n${encoded}`;
            }
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "base64",
        description: "Encodes a string to Base64 or decodes a Base64 string back to plain text. Use when user says 'encode to base64' or 'decode from base64'.",
        schema: z.object({
            text: z.string().describe("The text to encode or the Base64 string to decode."),
            mode: z.enum(["encode", "decode"]).describe("Whether to 'encode' to Base64 or 'decode' from Base64."),
        }),
    }
);

module.exports = base64Tool;
