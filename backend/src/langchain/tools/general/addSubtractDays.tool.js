const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const addSubtractDaysTool = tool(
    async ({ date, days, operation }) => {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return `Error: Invalid date '${date}'.`;

            const amount = operation === "subtract" ? -Math.abs(days) : Math.abs(days);
            d.setDate(d.getDate() + amount);

            const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
            const formatted = new Intl.DateTimeFormat("en-US", options).format(d);
            const iso = d.toISOString().split("T")[0];

            return `${operation === "subtract" ? "Subtracting" : "Adding"} ${Math.abs(days)} day(s) to ${date} gives:\n${formatted} (${iso})`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "add_subtract_days",
        description: "Adds or subtracts a number of days from a given date. Useful for date calculations like 'what date is 30 days from now'.",
        schema: z.object({
            date: z.string().describe("Starting date, e.g. '2024-01-01' or 'today' (use today's date if 'today')."),
            days: z.number().describe("Number of days to add or subtract."),
            operation: z.enum(["add", "subtract"]).describe("Whether to 'add' or 'subtract' the days."),
        }),
    }
);

module.exports = addSubtractDaysTool;
