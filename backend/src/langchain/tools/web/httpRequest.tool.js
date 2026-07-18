const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const httpRequestTool = tool(
    async ({ url, method, headers, body }) => {
        try {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            const parsedHeaders = headers ? JSON.parse(headers) : {};
            const parsedBody = body ? JSON.parse(body) : undefined;
            const httpMethod = (method || "GET").toUpperCase();

            const response = await axios({
                method: httpMethod,
                url,
                headers: {
                    "User-Agent": "ContextualChatbot/1.0",
                    "Content-Type": "application/json",
                    ...parsedHeaders,
                },
                data: parsedBody,
                timeout: 10000,
                validateStatus: () => true, // don't throw on 4xx/5xx
            });

            const responseBody = typeof response.data === "object"
                ? JSON.stringify(response.data, null, 2)
                : String(response.data).substring(0, 2000);

            return `HTTP ${httpMethod} ${url}\nStatus: ${response.status} ${response.statusText}\n\nResponse:\n${responseBody}`;
        } catch (error) {
            return `HTTP Request failed: ${error.message}`;
        }
    },
    {
        name: "http_request",
        description: "Makes an HTTP request to any URL. Supports GET, POST, PUT, DELETE methods. Useful for calling APIs, fetching data, or testing endpoints.",
        schema: z.object({
            url: z.string().describe("The full URL to send the request to."),
            method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional().describe("HTTP method. Default is GET."),
            headers: z.string().optional().describe("Optional JSON string of request headers. E.g. '{\"Authorization\": \"Bearer token\"}'."),
            body: z.string().optional().describe("Optional JSON string of request body for POST/PUT. E.g. '{\"key\": \"value\"}'."),
        }),
    }
);

module.exports = httpRequestTool;
