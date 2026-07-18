const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

// Uses frankfurter.dev — free, no API key needed
const currencyConverterTool = tool(
    async ({ amount, fromCurrency, toCurrencies }) => {
        try {
            const from = fromCurrency.toUpperCase();
            const to = toCurrencies.map(c => c.toUpperCase()).join(",");

            const res = await axios.get(`https://api.frankfurter.app/latest`, {
                params: { from, to },
                timeout: 8000,
            });

            const rates = res.data.rates;
            const results = Object.entries(rates).map(([currency, rate]) => {
                const converted = (amount * rate).toFixed(2);
                return `${amount} ${from} = ${converted} ${currency}`;
            });

            return `Exchange rates (from Frankfurter — ECB data):\n${results.join("\n")}`;
        } catch (error) {
            if (error.response?.data) return `Error: ${JSON.stringify(error.response.data)}`;
            return `Error fetching exchange rates: ${error.message}`;
        }
    },
    {
        name: "currency_converter",
        description: "Converts currency amounts between different world currencies using live exchange rates. Supports all major currencies like USD, EUR, GBP, INR, JPY, etc.",
        schema: z.object({
            amount: z.number().describe("The amount to convert."),
            fromCurrency: z.string().describe("The currency code to convert FROM. E.g. 'USD', 'INR', 'EUR'."),
            toCurrencies: z.array(z.string()).describe("List of currency codes to convert TO. E.g. ['EUR', 'GBP', 'INR']."),
        }),
    }
);

module.exports = currencyConverterTool;
