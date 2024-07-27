import openai from "./openai.js";
import groq from "./groq.js";
import anthropic from "./anthropic.js";

export default () => {
  const llms = { openai: openai(), groq: groq(), anthropic: anthropic() };

  return async function (inputs) {
    const provider = inputs.provider;
    if (!llms[provider.api]) throw new Error("Provider not found: " + provider.api);
    const result = await llms[provider.api](inputs);
    return result;
  };
};
