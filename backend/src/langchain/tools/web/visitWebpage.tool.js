const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");
const cheerio = require("cheerio");

const visitWebpageTool = tool(
    async ({ url }) => {
        try {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            const res = await axios.get(url, {
                timeout: 10000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; ContextualChatbot/1.0)",
                    "Accept": "text/html,application/xhtml+xml",
                },
            });

            const $ = cheerio.load(res.data);

            // Remove scripts, styles, nav, footer
            $("script, style, nav, footer, iframe, noscript, header, .ads, #ads").remove();

            const title = $("title").text().trim();
            const metaDesc = $("meta[name='description']").attr("content") || "";

            // Extract meaningful text
            const bodyText = $("body").text().replace(/\s+/g, " ").trim();
            const truncated = bodyText.substring(0, 3000);

            return `Page: ${title}\nURL: ${url}\nDescription: ${metaDesc}\n\nContent (first 3000 chars):\n${truncated}`;
        } catch (error) {
            if (error.code === "ECONNREFUSED") return `Could not connect to ${url}`;
            return `Error visiting ${url}: ${error.message}`;
        }
    },
    {
        name: "visit_webpage",
        description: "Visits a URL and extracts the readable text content from the webpage. Use when the user wants to read, summarize or analyze a specific URL.",
        schema: z.object({
            url: z.string().describe("The full URL to visit. E.g. 'https://example.com/article'."),
        }),
    }
);

module.exports = visitWebpageTool;
