import OpenAI from "openai";
import { env } from "$env/dynamic/private";
const { GROQ_API_KEY, SYSTEM_MODE } = env;

const groqClient = new OpenAI({
    apiKey: GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1"
});

export async function groq(inputs) {
    const { prompt, schema, provider } = inputs;

    const messages = [{ role: "user", content: prompt }];

    if (schema)
        messages.unshift({
            role: "user",
            content:
                `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
                `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`
        });

    const completion = {
        messages,
        model: provider.model || "llama2-70b-4096",
        max_tokens: provider.max_tokens || 100,
        temperature: provider.temperature || 0.2
    };

    const response = await groqClient.chat.completions.create(completion);
    const text = response.choices[0].message.content;
    return schema ? JSON.parse(text) : text;
}
