import OpenAI from "openai";
import { OPENAI_API_KEY } from "$env/static/private";

const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1"
});

export async function openai({ prompt, model, schema }) {
    const start = Date.now();
    const messages = [{ role: "user", content: prompt }];

    if (schema)
        messages.unshift({
            role: "user",
            content:
                `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
                `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`
        });

    const chatCompletion = await openaiClient.chat.completions.create({
        messages,
        model,
        response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
}
