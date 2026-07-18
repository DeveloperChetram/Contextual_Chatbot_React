const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { evaluate } = require("mathjs");

const calculatorTool = tool(
    
    async ({ expression }) => {
        try {
            const result = evaluate(expression);

            return String(result);
        } catch (error) {
            return "Invalid mathematical expression.";
        }
    },
    {
        name: "calculator",
        description:
            "Useful ONLY for evaluating pure mathematical numbers and expressions (e.g. 2 + 2, 5 * 10, etc). DO NOT use this tool to write, run, or evaluate programming code like JavaScript, Python, or console.log. If the user asks you to write code, do NOT use this tool; just output the code directly in your chat response.",

        schema: z.object({
            expression: z
                .string()
                .describe("Mathematical expression to evaluate."),
        }),
    }
);

module.exports = calculatorTool;