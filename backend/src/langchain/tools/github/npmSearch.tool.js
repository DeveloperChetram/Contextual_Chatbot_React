const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const npmSearchTool = tool(
    async ({ query, maxResults }) => {
        try {
            const res = await axios.get("https://registry.npmjs.org/-/v1/search", {
                params: { text: query, size: Math.min(maxResults || 5, 10) },
                timeout: 8000,
            });
            const packages = res.data.objects;
            if (!packages || packages.length === 0) return `No npm packages found for: "${query}"`;

            const formatted = packages.map((p, i) => {
                const pkg = p.package;
                return `${i + 1}. **${pkg.name}** v${pkg.version}\n   ${pkg.description || "No description"}\n   Downloads/week: ~${(p.score?.detail?.popularity * 10000000 || 0).toFixed(0)} | Install: npm install ${pkg.name}\n   ${pkg.links?.npm || ""}`;
            }).join("\n\n");

            return `NPM packages for "${query}":\n\n${formatted}`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "npm_search",
        description: "Searches the NPM registry for Node.js packages. Returns package name, version, description, and install command.",
        schema: z.object({
            query: z.string().describe("Package name or keyword to search for on npm."),
            maxResults: z.number().optional().describe("Number of results. Default 5, max 10."),
        }),
    }
);

module.exports = npmSearchTool;
