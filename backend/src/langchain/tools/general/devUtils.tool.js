const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const yaml = require("js-yaml");

const jwtDecoderTool = tool(
    async ({ token }) => {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return "Invalid JWT format. JWT must have 3 parts separated by dots.";

            const decodeBase64 = (str) => {
                const padded = str + "==".slice(0, (4 - str.length % 4) % 4);
                return JSON.parse(Buffer.from(padded, "base64url").toString("utf-8"));
            };

            const header = decodeBase64(parts[0]);
            const payload = decodeBase64(parts[1]);

            let expInfo = "";
            if (payload.exp) {
                const expDate = new Date(payload.exp * 1000);
                const isExpired = expDate < new Date();
                expInfo = `\nExpiry: ${expDate.toISOString()} (${isExpired ? "❌ EXPIRED" : "✅ Valid"})`;
            }

            return `JWT Decoded:\n\n**Header:**\n\`\`\`json\n${JSON.stringify(header, null, 2)}\n\`\`\`\n\n**Payload:**\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`\n\n⚠️ Signature NOT verified (only decoding).${expInfo}`;
        } catch (error) {
            return `Error decoding JWT: ${error.message}`;
        }
    },
    {
        name: "jwt_decoder",
        description: "Decodes a JWT token and shows the header and payload. NOTE: This only decodes, it does NOT verify the signature.",
        schema: z.object({
            token: z.string().describe("The JWT token string to decode."),
        }),
    }
);

const yamlValidatorTool = tool(
    async ({ yaml: yamlText, convertTo }) => {
        try {
            const parsed = yaml.load(yamlText);
            if (convertTo === "json") {
                return `Valid YAML! Converted to JSON:\n\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``;
            }
            return `Valid YAML! Parsed object:\n\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``;
        } catch (error) {
            return `Invalid YAML at line ${error.mark?.line || "?"}: ${error.message}`;
        }
    },
    {
        name: "yaml_validator",
        description: "Validates a YAML string and optionally converts it to JSON. Returns the parsed content or error details.",
        schema: z.object({
            yaml: z.string().describe("The YAML string to validate."),
            convertTo: z.enum(["json"]).optional().describe("Optionally convert to 'json'."),
        }),
    }
);

const randomNumberTool = tool(
    async ({ min, max, count, isFloat }) => {
        const lo = min ?? 0;
        const hi = max ?? 100;
        const amount = Math.min(count || 1, 50);
        const nums = Array.from({ length: amount }, () => {
            const n = Math.random() * (hi - lo) + lo;
            return isFloat ? parseFloat(n.toFixed(4)) : Math.floor(n);
        });
        return amount === 1 ? String(nums[0]) : nums.join(", ");
    },
    {
        name: "random_number",
        description: "Generates one or more random numbers within a specified range.",
        schema: z.object({
            min: z.number().optional().describe("Minimum value (inclusive). Default is 0."),
            max: z.number().optional().describe("Maximum value (inclusive). Default is 100."),
            count: z.number().optional().describe("How many numbers to generate. Default 1, max 50."),
            isFloat: z.boolean().optional().describe("Whether to generate floating-point numbers. Default false (integers)."),
        }),
    }
);

const qrCodeTool = tool(
    async ({ text, size }) => {
        try {
            const encodedText = encodeURIComponent(text);
            const s = size || 200;
            // Uses free goqr.me API — no key needed
            const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedText}&size=${s}x${s}&format=png`;
            return `QR Code for: "${text}"\n\nImage URL: ${url}\n\nYou can open the above URL in a browser to view/download the QR code.`;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "qr_code_generator",
        description: "Generates a QR code for any text, URL, or data. Returns a URL to the QR code image.",
        schema: z.object({
            text: z.string().describe("The text, URL, or data to encode into the QR code."),
            size: z.number().optional().describe("Size of the QR code image in pixels. Default is 200."),
        }),
    }
);

module.exports = { jwtDecoderTool, yamlValidatorTool, randomNumberTool, qrCodeTool };
