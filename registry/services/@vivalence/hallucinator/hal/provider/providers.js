import { createAnthropic } from "@ai/providers/anthropic";

const providers = {
  anthropic: (config = {}) => {
    // console.log("anthropic provider", { config });
    if (typeof config === "string") config = { apiKey: config };
    return createAnthropic(config);
  },
};

export default providers;
