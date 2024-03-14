import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY, SYSTEM_MODE } from "$env/static/private";

const anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export async function anthropic(inputs) {
    const { prompt, schema, provider } = inputs;

    const completion = {
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        model: provider.model || "claude-3-sonnet-20240229",
        max_tokens: provider.max_tokens || 100,
        temperature: provider.temperature || 0.2
    };

    if (schema) {
        completion.system =
            `The return JSON schema is: ${JSON.stringify(schema)}.` +
            `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`;
    }

    const response = await anthropicClient.messages.create(completion);
    const text = response.content[0].text;
    return schema ? JSON.parse(text) : text;
}
