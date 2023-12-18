import OpenAI from "openai";
import fetch from "node-fetch";
import { log } from "./logging.js";

// const openaiApiKey =;
const KEY = process.env.OPENAI_API_KEY || process.env.ANYSCALE_TOKEN;
const MODEL = "gpt-3.5-turbo-1106" || "mistralai/Mistral-7B-Instruct-v0.1";
const URL = "https://api.openai.com/v1" || "https://api.endpoints.anyscale.com/v1";

const openai = new OpenAI({ apiKey: KEY, baseURL: URL });

const fetchOpenAI = async (endpoint, payload) => {
    const openaiHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
    };
    const response = await fetch(endpoint, {
        method: "POST",
        headers: openaiHeaders,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

// "gpt-4-1106-preview"
async function getGPTResponse({ prompt = [], adminPrompt = null, model = MODEL, schema }) {
    const messages = [...prompt.map((p) => ({ role: "user", content: p }))].filter((m) => !!m);
    if (schema)
        messages.unshift({
            role: "user",
            content: `The return JSON schema is: ${JSON.stringify(schema)}`,
        });
    if (adminPrompt)
        messages.unshift({
            role: "user",
            content: adminPrompt,
        });

    const chatCompletion = await openai.chat.completions.create({
        messages,
        model,
        response_format: { type: "json_object" },
    });

    // const stream = await openai.beta.chat.completions.stream({model, messages, response_format: { type: "json_object" }, stream: true,});

    // let chunkcounter = 0; for await (const chunk of stream) {chunkcounter++; chunkcounter % 10 === 0 && console.log("chunkcounter", chunkcounter, chunk.choices[0]?.delta?.content);}

    // const chatCompletion = await stream.finalChatCompletion();
    const response = JSON.parse(chatCompletion.choices[0].message.content);
    log("openai", { messages, response, model });
    return response;
}

export { fetchOpenAI, getGPTResponse };
