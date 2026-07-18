const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const regexTesterTool = tool(
    async ({ pattern, flags, testString }) => {
        try {
            const regex = new RegExp(pattern, flags || "g");
            const matches = [...testString.matchAll(regex)];

            if (matches.length === 0) {
                return `No matches found for pattern /${pattern}/${flags || ""} in the test string.`;
            }

            const results = matches.map((m, i) => {
                let info = `Match ${i + 1}: "${m[0]}" at index ${m.index}`;
                if (m.length > 1) {
                    const groups = m.slice(1).map((g, gi) => `  Group ${gi + 1}: "${g}"`).join("\n");
                    info += `\n${groups}`;
                }
                return info;
            });

            return `Found ${matches.length} match(es):\n${results.join("\n\n")}`;
        } catch (error) {
            return `Error: Invalid regex — ${error.message}`;
        }
    },
    {
        name: "regex_tester",
        description: "Tests a regular expression pattern against a string and returns all matches and capture groups.",
        schema: z.object({
            pattern: z.string().describe("The regular expression pattern (without slashes), e.g. '(\\\\d+)'"),
            flags: z.string().optional().describe("Regex flags like 'g', 'i', 'gi'. Default is 'g'."),
            testString: z.string().describe("The string to test the regex against."),
        }),
    }
);

module.exports = regexTesterTool;
