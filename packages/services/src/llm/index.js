import openai from "./openai";
import groq from "./groq.js";

const llms = { openai, groq };

export default (keys) => {
    return async function (inputs) {
        const provider = inputs.provider;
        if (!llms[provider.api]) throw new Error("Provider not found: " + provider.api);
        const llm = llms[provider.api](keys[provider.api]);
        return await llm(inputs);
    };
};
