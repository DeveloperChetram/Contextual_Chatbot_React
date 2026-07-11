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
            "Useful for solving mathematical expressions like addition, subtraction, multiplication, division, percentages, powers, square roots, etc.",

        schema: z.object({
            expression: z
                .string()
                .describe("Mathematical expression to evaluate."),
        }),
    }
);

module.exports = calculatorTool;