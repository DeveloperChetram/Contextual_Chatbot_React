const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const makeGroqRequest = async (systemPrompt, userText) => {
    const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userText },
            ],
            max_tokens: 1024,
            temperature: 0.3,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 15000,
        }
    );
    return res.data.choices[0]?.message?.content || "Could not process request.";
};

const translatorTool = tool(
    async ({ text, targetLanguage, sourceLanguage }) => {
        try {
            const from = sourceLanguage ? ` from ${sourceLanguage}` : "";
            return await makeGroqRequest(
                `Translate the following text${from} to ${targetLanguage}. Return only the translation, no explanation.`,
                text
            );
        } catch (error) {
            return `Translation error: ${error.message}`;
        }
    },
    {
        name: "translator",
        description: "Translates text from one language to another using AI. Supports all major world languages.",
        schema: z.object({
            text: z.string().describe("The text to translate."),
            targetLanguage: z.string().describe("Target language name. E.g. 'French', 'Hindi', 'Japanese', 'Spanish'."),
            sourceLanguage: z.string().optional().describe("Source language (optional, auto-detected if not provided)."),
        }),
    }
);

const grammarFixerTool = tool(
    async ({ text }) => {
        try {
            return await makeGroqRequest(
                "Fix the grammar, spelling, and punctuation of the following text. Return only the corrected version with no explanation.",
                text
            );
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "grammar_fixer",
        description: "Fixes grammar, spelling, and punctuation errors in text using AI.",
        schema: z.object({
            text: z.string().describe("The text with grammar issues to fix."),
        }),
    }
);

const rewriterTool = tool(
    async ({ text, style }) => {
        try {
            const styleInstructions = {
                formal: "Rewrite the following text in a formal, professional tone.",
                casual: "Rewrite the following text in a casual, friendly tone.",
                simple: "Rewrite the following text in simple, easy-to-understand language.",
                creative: "Rewrite the following text in a creative, engaging way.",
                concise: "Rewrite the following text to be more concise and to the point.",
            };
            return await makeGroqRequest(
                (styleInstructions[style] || "Rewrite the following text to be clearer and better.") + " Return only the rewritten text.",
                text
            );
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "rewriter",
        description: "Rewrites text in different styles: formal, casual, simple, creative, or concise using AI.",
        schema: z.object({
            text: z.string().describe("The text to rewrite."),
            style: z.enum(["formal", "casual", "simple", "creative", "concise"]).optional().describe("Writing style. Default is 'simple'."),
        }),
    }
);

const sentimentAnalysisTool = tool(
    async ({ text }) => {
        try {
            return await makeGroqRequest(
                "Analyze the sentiment of the following text. Respond with: Sentiment (Positive/Negative/Neutral/Mixed), Confidence (Low/Medium/High), and a one-sentence explanation. Format it clearly.",
                text
            );
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "sentiment_analysis",
        description: "Analyzes the sentiment (positive, negative, neutral, mixed) of text using AI.",
        schema: z.object({
            text: z.string().describe("The text to analyze for sentiment."),
        }),
    }
);

const keywordExtractorTool = tool(
    async ({ text, maxKeywords }) => {
        try {
            const count = maxKeywords || 10;
            return await makeGroqRequest(
                `Extract the top ${count} most important keywords or key phrases from the following text. Return them as a numbered list.`,
                text
            );
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "keyword_extractor",
        description: "Extracts the most important keywords and key phrases from text using AI.",
        schema: z.object({
            text: z.string().describe("The text to extract keywords from."),
            maxKeywords: z.number().optional().describe("Maximum number of keywords to extract. Default is 10."),
        }),
    }
);

module.exports = {
    translatorTool,
    grammarFixerTool,
    rewriterTool,
    sentimentAnalysisTool,
    keywordExtractorTool,
};
