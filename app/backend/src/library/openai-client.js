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

async function getGPTResponse({ prompt = [], adminPrompt = "", model = "gpt-4-1106-preview" }) {
    const stream = await openai.beta.chat.completions.stream({
        model,
        messages: [
            adminPrompt && {
                role: "user",
                content: adminPrompt,
            },
            ...prompt.map((p) => ({ role: "user", content: p })),
        ],
        response_format: { type: "json_object" },
        stream: true,
    });

    // let chunkcounter = 0; for await (const chunk of stream) {chunkcounter++; chunkcounter % 10 === 0 && console.log("chunkcounter", chunkcounter, chunk.choices[0]?.delta?.content);}

    const chatCompletion = await stream.finalChatCompletion();
    return JSON.parse(chatCompletion.choices[0].message.content);
}

export { fetchOpenAI, getGPTResponse };
