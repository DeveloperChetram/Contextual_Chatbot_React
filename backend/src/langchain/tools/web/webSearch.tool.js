const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

// Uses DuckDuckGo's instant answer API (no API key needed) + HTML scraping fallback
const webSearchTool = tool(
    async ({ query, maxResults }) => {
        try {
            const limit = Math.min(maxResults || 5, 10);
            
            // Use DuckDuckGo HTML search (no API key required)
            const response = await axios.get("https://html.duckduckgo.com/html/", {
                params: { q: query },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html",
                },
                timeout: 10000,
            });

            const cheerio = require("cheerio");
            const $ = cheerio.load(response.data);

            const results = [];
            $(".result__body").each((i, el) => {
                if (results.length >= limit) return false;
                const title = $(el).find(".result__title").text().trim();
                const snippet = $(el).find(".result__snippet").text().trim();
                const url = $(el).find(".result__url").text().trim();
                if (title) {
                    results.push({ title, snippet, url });
                }
            });

            if (results.length === 0) {
                return `No search results found for: "${query}"`;
            }

            const formatted = results.map((r, i) =>
                `${i + 1}. **${r.title}**\n   ${r.snippet}\n   ${r.url}`
            ).join("\n\n");

            return `Search results for "${query}":\n\n${formatted}`;
        } catch (error) {
            return `Search failed: ${error.message}`;
        }
    },
    {
        name: "web_search",
        description: "Searches the web using DuckDuckGo and returns relevant results. Use when the user asks for current information, news, or anything that requires browsing the web.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the web."),
            maxResults: z.number().optional().describe("Maximum number of search results to return. Default 5, max 10."),
        }),
    }
);

module.exports = webSearchTool;
