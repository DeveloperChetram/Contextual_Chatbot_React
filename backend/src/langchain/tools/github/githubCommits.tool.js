const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const githubCommitsTool = tool(
    async ({ owner, repo, branch, maxResults }) => {
        try {
            const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
                params: {
                    sha: branch || "main",
                    per_page: Math.min(maxResults || 5, 10),
                },
                headers: { "User-Agent": "ContextualChatbot/1.0", "Accept": "application/vnd.github.v3+json" },
                timeout: 8000,
            });

            const commits = res.data;
            if (!commits.length) return `No commits found for ${owner}/${repo}.`;

            const formatted = commits.map((c, i) =>
                `${i + 1}. ${c.sha.substring(0, 7)} — ${c.commit.message.split("\n")[0]}\n   Author: ${c.commit.author.name} | Date: ${new Date(c.commit.author.date).toDateString()}`
            ).join("\n\n");

            return `Recent commits for ${owner}/${repo} (${branch || "main"}):\n\n${formatted}`;
        } catch (error) {
            if (error.response?.status === 404) return `Repository ${owner}/${repo} not found or branch '${branch}' doesn't exist.`;
            return `Error: ${error.message}`;
        }
    },
    {
        name: "github_commits",
        description: "Lists recent commits for a GitHub repository including commit message, author, and date.",
        schema: z.object({
            owner: z.string().describe("GitHub repository owner name."),
            repo: z.string().describe("Repository name."),
            branch: z.string().optional().describe("Branch name. Defaults to 'main'."),
            maxResults: z.number().optional().describe("Number of commits to return. Default 5."),
        }),
    }
);

module.exports = githubCommitsTool;
