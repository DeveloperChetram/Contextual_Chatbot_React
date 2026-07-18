const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const currentDateTimeTool = tool(
    async ({ timezone }) => {
        try {
            const tz = timezone || "UTC";
            const now = new Date();
            const options = {
                timeZone: tz,
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            };
            const formatted = new Intl.DateTimeFormat("en-US", options).format(now);
            return `Current date and time in ${tz}: ${formatted} (Unix timestamp: ${Math.floor(now.getTime() / 1000)})`;
        } catch (error) {
            return `Error: Invalid timezone '${timezone}'. Try a valid timezone like 'America/New_York' or 'Asia/Kolkata'.`;
        }
    },
    {
        name: "current_datetime",
        description: "Returns the current date and time. Optionally accepts a timezone (e.g. 'Asia/Kolkata', 'America/New_York', 'UTC'). Use this whenever the user asks about the current time, date, or day.",
        schema: z.object({
            timezone: z.string().optional().describe("IANA timezone string, e.g. 'Asia/Kolkata'. Defaults to UTC."),
        }),
    }
);

module.exports = currentDateTimeTool;
