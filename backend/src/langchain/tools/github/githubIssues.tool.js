const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const githubIssuesTool = tool(
    async ({ owner, repo, state, maxResults }) => {
        try {
            const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                params: { state: state || "open", per_page: Math.min(maxResults || 5, 10) },
                headers: { "User-Agent": "ContextualChatbot/1.0", "Accept": "application/vnd.github.v3+json" },
                timeout: 8000,
            });
            const issues = res.data.filter(i => !i.pull_request); // exclude PRs
            if (!issues.length) return `No ${state || "open"} issues found for ${owner}/${repo}.`;

            const formatted = issues.map((issue, i) =>
                `${i + 1}. #${issue.number} — ${issue.title}\n   State: ${issue.state} | Comments: ${issue.comments}\n   Created: ${new Date(issue.created_at).toDateString()}\n   ${issue.html_url}`
            ).join("\n\n");

            return `Issues for ${owner}/${repo} (${state || "open"}):\n\n${formatted}`;
        } catch (error) {
            if (error.response?.status === 404) return `Repository ${owner}/${repo} not found.`;
            return `Error: ${error.message}`;
        }
    },
    {
        name: "github_issues",
        description: "Lists open or closed GitHub issues for a repository.",
        schema: z.object({
            owner: z.string().describe("GitHub repository owner/organization name."),
            repo: z.string().describe("Repository name."),
            state: z.enum(["open", "closed", "all"]).optional().describe("Issue state. Default is 'open'."),
            maxResults: z.number().optional().describe("Number of issues to return. Default 5."),
        }),
    }
);

module.exports = githubIssuesTool;
