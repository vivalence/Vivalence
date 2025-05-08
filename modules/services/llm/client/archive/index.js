import openai from "./openai.js";
import groq from "./groq.js";
import anthropic from "./anthropic.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const ai = new AxAI(ctx.services.llms.providers.profiles.STRATEGIST);
// // {name: "openai", apiKey: process.env.OPENAI_API_KEY, config: {temperature: 0.2, model: "gpt-4o",},}
// const Roles = [
//   "QUICKBOT",
//   "GENERALIST",
//   "EXPERT",
//   "REFORMER",
//   "CREATOR",
//   "STRATEGIST",
//   "VAULTKEEPER",
// ];

export default (service, ctx) => {
  const llms = {
    openai: openai(service.config.keys.openai),
    groq: groq(service.config.keys.groq),
    anthropic: anthropic(service.config.keys.anthropic),
  };

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

  async function serve(inputs) {
    const provider = inputs.provider;
    if (!llms[provider.api])
      throw new Error("Provider not found: " + provider.api);

    try {
      const result = await retry(() => llms[provider.api](inputs));
      return result;
    } catch (e) {
      console.log("[llm error]");
      console.error(e);
      throw e;
    }
  }

  serve.providers = {
    profiles: {
      STRATEGIST: {
        //
      },
    },
  };

  return serve;
};
