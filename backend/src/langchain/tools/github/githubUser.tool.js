const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const githubUserTool = tool(
    async ({ username }) => {
        try {
            const res = await axios.get(`https://api.github.com/users/${username}`, {
                headers: { "User-Agent": "ContextualChatbot/1.0", "Accept": "application/vnd.github.v3+json" },
                timeout: 8000,
            });
            const u = res.data;
            return `GitHub User: ${u.name || u.login} (@${u.login})\n` +
                `Bio: ${u.bio || "N/A"}\n` +
                `Location: ${u.location || "N/A"}\n` +
                `Company: ${u.company || "N/A"}\n` +
                `Public Repos: ${u.public_repos}\n` +
                `Followers: ${u.followers} | Following: ${u.following}\n` +
                `Account created: ${new Date(u.created_at).toDateString()}\n` +
                `Profile: ${u.html_url}`;
        } catch (error) {
            if (error.response?.status === 404) return `GitHub user '${username}' not found.`;
            return `Error: ${error.message}`;
        }
    },
    {
        name: "github_user",
        description: "Fetches public profile information of a GitHub user including repos, followers, bio, and location.",
        schema: z.object({
            username: z.string().describe("The GitHub username to look up."),
        }),
    }
);

module.exports = githubUserTool;
