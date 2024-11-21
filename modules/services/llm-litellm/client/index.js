import openai from "./openai.js";
import groq from "./groq.js";
import anthropic from "./anthropic.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default () => {
  const llms = { openai: openai(), groq: groq(), anthropic: anthropic() };

  const retry = async (fn, maxRetries = 1, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
  };

  return async function llm(inputs) {
    const provider = inputs.provider;
    if (!llms[provider.api]) throw new Error("Provider not found: " + provider.api);

    try {
      const result = await retry(() => llms[provider.api](inputs));
      return result;
    } catch (e) {
      console.log("[llm error]");
      console.error(e);
      throw e;
    }
  };
};
