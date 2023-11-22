import fetch from "node-fetch";

const openaiApiKey = process.env.OPENAI_API_KEY;

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

export { fetchOpenAI };
