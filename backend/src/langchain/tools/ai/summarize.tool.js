const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

// Uses groq API for AI-powered summarization 
const summarizeTool = tool(
    async ({ text, style }) => {
        try {
            const stylePrompts = {
                brief: "Summarize the following text in 2-3 sentences.",
                detailed: "Provide a detailed summary of the following text with key points.",
                bullets: "Summarize the following text as a bullet point list of key points.",
                tldr: "Give a one-sentence TL;DR of the following text.",
            };
            const prompt = stylePrompts[style] || stylePrompts.brief;

            const res = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: prompt },
                        { role: "user", content: text },
                    ],
                    max_tokens: 512,
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

            return res.data.choices[0]?.message?.content || "Could not generate summary.";
        } catch (error) {
            return `Error generating summary: ${error.message}`;
        }
    },
    {
        name: "summarizer",
        description: "Uses AI to summarize long text, articles, or documents. Supports different styles: brief, detailed, bullets, or tldr. Use when user asks to summarize text.",
        schema: z.object({
            text: z.string().describe("The text or content to summarize."),
            style: z.enum(["brief", "detailed", "bullets", "tldr"]).optional().describe("Summary style. Default is 'brief'."),
        }),
    }
);

module.exports = summarizeTool;
