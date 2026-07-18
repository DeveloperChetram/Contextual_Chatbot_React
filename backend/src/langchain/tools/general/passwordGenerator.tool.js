const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const crypto = require("crypto");

const passwordGeneratorTool = tool(
    async ({ length, includeNumbers, includeSymbols, includeUppercase, count }) => {
        const len = Math.min(length || 16, 128);
        const amount = Math.min(count || 1, 10);

        let charset = "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase !== false) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers !== false) charset += "0123456789";
        if (includeSymbols) charset += "!@#$%^&*()-_=+[]{}|;:,.<>?";

        const generate = () => {
            let password = "";
            for (let i = 0; i < len; i++) {
                password += charset[Math.floor(Math.random() * charset.length)];
            }
            return password;
        };

        const passwords = Array.from({ length: amount }, generate);
        return passwords.join("\n");
    },
    {
        name: "password_generator",
        description: "Generates one or more strong random passwords. You can control length and character types.",
        schema: z.object({
            length: z.number().optional().describe("Length of each password. Default is 16, max is 128."),
            includeNumbers: z.boolean().optional().describe("Include numbers. Default true."),
            includeUppercase: z.boolean().optional().describe("Include uppercase letters. Default true."),
            includeSymbols: z.boolean().optional().describe("Include special symbols like !@#$. Default false."),
            count: z.number().optional().describe("How many passwords to generate. Default 1, max 10."),
        }),
    }
);

module.exports = passwordGeneratorTool;
