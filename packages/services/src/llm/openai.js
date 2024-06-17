import OpenAI from "openai";

let client;

export default function (KEY) {
    if (!KEY) throw new Error("OpenAI API key is required");
    if (!client) {
        client = new OpenAI({ apiKey: KEY, baseURL: "https://api.openai.com/v1" });
    }

    return async function openai({ prompt, schema, provider }) {
        const start = Date.now();
        const messages = [{ role: "user", content: prompt }];

        const completion = {
            messages,
            model: provider.model || "gpt-3.5-turbo",
            max_tokens: provider.max_tokens || 4096,
            temperature: provider.temperature || 0.5
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
        const response = await client.chat.completions.create(completion);
        const text = JSON.parse(response.choices[0].message.content);
        return text;
    };
}
