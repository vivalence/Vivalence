import OpenAI from "openai";
import fetch from "node-fetch";
import { log } from "./logging.js";

// const openaiApiKey =;
const MODEL = "gpt-3.5-turbo-1106" || "mistralai/Mistral-7B-Instruct-v0.1";

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
});
const anyscaleClient = new OpenAI({
    apiKey: process.env.ANYSCALE_TOKEN,
    baseURL: "https://api.endpoints.anyscale.com/v1",
});

// const fetchOpenAI = async (endpoint, payload) => {const openaiHeaders = {"Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}`,}; const response = await fetch(endpoint, {method: "POST", headers: openaiHeaders, body: JSON.stringify(payload),}); if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);} return await response.json();};

async function anyscale({ prompt, schema, model }) {
    try {
        const start = Date.now();

        const messages = [{ role: "user", content: prompt }];
        if (schema)
            messages.unshift({
                role: "user",
                content:
                    `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
                    `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`,
            });

        const chatCompletion = await anyscaleClient.chat.completions.create({
            messages,
            model,
            response_format: { type: "json_object", schema },
        });
        const content = chatCompletion.choices[0].message.content;
        const response = JSON.parse(content);
        log("anyscale", { messages, response, model, duration: (Date.now() - start) / 1000 });
        return response;
    } catch (error) {
        console.error(error);
        log("error", { where: "anyscale", error });
    }
}

async function openai({ prompt, model, schema }) {
    try {
        const start = Date.now();
        const messages = [{ role: "user", content: prompt }];

        if (schema)
            messages.unshift({
                role: "user",
                content:
                    `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
                    `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`,
            });

        const chatCompletion = await openaiClient.chat.completions.create({
            messages,
            model,
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(chatCompletion.choices[0].message.content);
        log("openai", { messages, response, model, duration: (Date.now() - start) / 1000 });
        return response;
    } catch (error) {
        console.error(error);
        log("error", { where: "openai", error });
    }
}

export default { anyscale, openai };
// export { fetchOpenAI, getGPTResponse };
