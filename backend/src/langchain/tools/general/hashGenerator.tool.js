const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const crypto = require("crypto");

const hashGeneratorTool = tool(
    async ({ text, algorithm }) => {
        try {
            const algo = (algorithm || "sha256").toLowerCase();
            const validAlgos = ["md5", "sha1", "sha256", "sha512"];
            if (!validAlgos.includes(algo)) {
                return `Error: Unsupported algorithm '${algo}'. Choose from: ${validAlgos.join(", ")}`;
            }
            const hash = crypto.createHash(algo).update(text).digest("hex");
            return `${algo.toUpperCase()} hash of "${text}":\n${hash}`;
        } catch (error) {
            return `Error generating hash: ${error.message}`;
        }
    },
    {
        name: "hash_generator",
        description: "Generates a cryptographic hash of the given text. Supports MD5, SHA1, SHA256, SHA512. Use when user wants to hash a string or check integrity.",
        schema: z.object({
            text: z.string().describe("The text or string to hash."),
            algorithm: z.string().optional().describe("Hash algorithm to use: 'md5', 'sha1', 'sha256', or 'sha512'. Default is sha256."),
        }),
    }
);

module.exports = hashGeneratorTool;
