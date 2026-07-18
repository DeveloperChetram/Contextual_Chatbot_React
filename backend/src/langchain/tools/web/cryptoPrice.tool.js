const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

// Uses free CoinGecko API — no API key required
const cryptoPriceTool = tool(
    async ({ coins }) => {
        try {
            const ids = coins.map(c => c.toLowerCase().replace(/\s+/g, "-")).join(",");
            const res = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
                params: {
                    ids,
                    vs_currencies: "usd,inr",
                    include_24hr_change: true,
                    include_market_cap: true,
                },
                timeout: 8000,
                headers: { "User-Agent": "ContextualChatbot/1.0" },
            });

            const data = res.data;
            if (!Object.keys(data).length) {
                return `No data found. Make sure you use CoinGecko IDs like 'bitcoin', 'ethereum', 'dogecoin'.`;
            }

            const lines = Object.entries(data).map(([coin, info]) => {
                const change = info.usd_24h_change?.toFixed(2);
                const arrow = change >= 0 ? "🟢 +" : "🔴 ";
                return `${coin.charAt(0).toUpperCase() + coin.slice(1)}:\n  USD: $${info.usd?.toLocaleString()}\n  INR: ₹${info.inr?.toLocaleString()}\n  24h Change: ${arrow}${change}%`;
            });

            return `Crypto Prices (CoinGecko):\n\n${lines.join("\n\n")}`;
        } catch (error) {
            return `Error fetching crypto prices: ${error.message}`;
        }
    },
    {
        name: "crypto_price",
        description: "Fetches real-time cryptocurrency prices in USD and INR including 24h change. Uses free CoinGecko API. Use CoinGecko IDs like 'bitcoin', 'ethereum', 'solana', 'dogecoin'.",
        schema: z.object({
            coins: z.array(z.string()).describe("List of cryptocurrency CoinGecko IDs to fetch. E.g. ['bitcoin', 'ethereum', 'solana']."),
        }),
    }
);

module.exports = cryptoPriceTool;
