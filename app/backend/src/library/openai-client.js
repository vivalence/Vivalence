import OpenAI from "openai";
import fetch from "node-fetch";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: openaiApiKey });

// Set up OpenAI headers
const openaiHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiApiKey}`,
};

const fetchOpenAI = async (endpoint, payload) => {
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
async function getGPTResponse({ prompt = [], adminPrompt = null, model = "gpt-3.5-turbo-1106" }) {
    const messages = [...prompt.map((p) => ({ role: "user", content: p }))].filter((m) => !!m);
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
    return JSON.parse(chatCompletion.choices[0].message.content);
}

export { fetchOpenAI, getGPTResponse };
