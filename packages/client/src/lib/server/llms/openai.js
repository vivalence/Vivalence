import OpenAI from "openai";
import { env } from "$env/dynamic/private";
const { OPENAI_API_KEY, SYSTEM_MODE } = env;

const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1"
});

export async function openai(inputs) {
    const { prompt, schema, provider } = inputs;
    const start = Date.now();
    const messages = [{ role: "user", content: prompt }];

    const completion = {
        messages,
        model: provider.model || "gpt-3.5-turbo",
        max_tokens: provider.max_tokens || 100,
        temperature: provider.temperature || 0.2
    };
    if (schema) {
        messages.unshift({
            role: "user",
            content:
                `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
                `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`
        });
        completion["response_format"] = { type: "json_object" };
    }
    const response = await openaiClient.chat.completions.create(completion);
    const text = JSON.parse(response.choices[0].message.content);
    return text;
}
