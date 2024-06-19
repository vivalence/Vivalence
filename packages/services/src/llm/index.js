import openai from "./openai";
import groq from "./groq.js";

const llms = { openai, groq };

export default async function (inputs) {
    const provider = inputs.provider;
    if (!llms[provider.api]) throw new Error("Provider not found: " + provider.api);
    const result = await llms[provider.api](inputs);
    return result;
}
