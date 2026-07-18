const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const githubRepoTool = tool(
    async ({ query, language, sort, maxResults }) => {
        try {
            const params = {
                q: query + (language ? `+language:${language}` : ""),
                sort: sort || "stars",
                order: "desc",
                per_page: Math.min(maxResults || 5, 10),
            };
            const res = await axios.get("https://api.github.com/search/repositories", {
                params,
                headers: { "User-Agent": "ContextualChatbot/1.0", "Accept": "application/vnd.github.v3+json" },
                timeout: 8000,
            });
            const repos = res.data.items;
            if (!repos || repos.length === 0) return `No repositories found for: "${query}"`;

            const formatted = repos.map((r, i) =>
                `${i + 1}. ${r.full_name} (⭐ ${r.stargazers_count})\n   ${r.description || "No description"}\n   Language: ${r.language || "N/A"} | Forks: ${r.forks_count}\n   ${r.html_url}`
            ).join("\n\n");

            return `GitHub Repos for "${query}":\n\n${formatted}`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "github_repo_search",
        description: "Searches GitHub repositories by keyword, language, and sorting. Returns repo name, stars, description, and URL.",
        schema: z.object({
            query: z.string().describe("Search query for repositories, e.g. 'react chat app'."),
            language: z.string().optional().describe("Filter by programming language, e.g. 'javascript', 'python'."),
            sort: z.enum(["stars", "forks", "updated"]).optional().describe("Sort by. Default is 'stars'."),
            maxResults: z.number().optional().describe("Number of results. Default 5, max 10."),
        }),
    }
);

module.exports = githubRepoTool;
