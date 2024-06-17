import Anthropic from "@anthropic-ai/sdk";
import { env } from "$env/dynamic/private";
const { ANTHROPIC_API_KEY, SYSTEM_MODE } = env;

const anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export async function anthropic(inputs) {
    let response;
    try {
        const { prompt, schema, provider } = inputs;

        const completion = {
            messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
            model: provider.model || "claude-3-sonnet-20240229",
            max_tokens: provider.max_tokens || 200,
            temperature: provider.temperature || 0.3
        };

        if (schema) {
            completion.system =
                `The return JSON schema is: ${JSON.stringify(schema)}.` +
                `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`;
        }
        response = await anthropicClient.messages.create(completion);
        const text = response.content[0].text;
        return schema ? JSON.parse(text) : text;
    } catch (err) {
        console.error(`[ANTHROPIC ERROR /api/anthropic]`, err.message);
        console.error(err);
        console.error(response);
        return { error: err, status: 500 };
    }
}
