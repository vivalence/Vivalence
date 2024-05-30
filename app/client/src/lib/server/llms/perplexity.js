import api from "api";
import { env } from "$env/dynamic/private";
const { PERPLEXITY_API_KEY, SYSTEM_MODE } = env;

const perplexityClient = api("@pplx/v0#b2wdhb1klq5dn1d6");
perplexityClient.auth(PERPLEXITY_API_KEY);

export async function perplexity({ prompt, model, schema }) {
    const start = Date.now();
    const messages = [{ role: "user", content: prompt }];

    if (schema) {
        messages.unshift({
            role: "system",
            content:
                `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
                `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`
        });
    }
    const chatCompletion = await perplexityClient.post_chat_completions({
        model,
        messages
    });

    const response = JSON.parse(chatCompletion.data.choices[0].message.content);
    return response;
}
