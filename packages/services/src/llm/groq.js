import OpenAI from "openai";

let client;

export default async function groq({ prompt, schema, provider }) {
    const { GROQ_API_KEY: KEY } = process.env;
    if (!KEY) throw new Error("GROQ API key is required");
    if (!client) {
        client = new OpenAI({ apiKey: KEY, baseURL: "https://api.groq.com/openai/v1" });
    }
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
        max_tokens: provider.max_tokens || 4096,
        temperature: provider.temperature || 0.8
    };

    const response = await client.chat.completions.create(completion);
    const text = response.choices[0].message.content;
    return schema ? JSON.parse(text) : text;
}
