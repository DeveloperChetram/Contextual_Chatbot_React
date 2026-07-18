const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const dateDifferenceTool = tool(
    async ({ date1, date2 }) => {
        try {
            const d1 = new Date(date1);
            const d2 = new Date(date2);

            if (isNaN(d1.getTime())) return `Error: Invalid date1 '${date1}'.`;
            if (isNaN(d2.getTime())) return `Error: Invalid date2 '${date2}'.`;

            const diffMs = Math.abs(d2.getTime() - d1.getTime());
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const weeks = Math.floor(days / 7);
            const months = Math.round(days / 30.44);
            const years = Math.round(days / 365.25);

            return `Difference between ${date1} and ${date2}:\n- ${days} day(s)\n- ${weeks} week(s)\n- ~${months} month(s)\n- ~${years} year(s)\n- ${hours} hour(s) remainder\n- ${minutes} minute(s) remainder`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "date_difference",
        description: "Calculates the difference between two dates. Returns the difference in days, weeks, months, and years.",
        schema: z.object({
            date1: z.string().describe("First date in any parseable format, e.g. '2024-01-01' or 'January 1, 2024'."),
            date2: z.string().describe("Second date in any parseable format."),
        }),
    }
);

module.exports = dateDifferenceTool;
