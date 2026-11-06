import provider from "./provider/index.js";
export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "openrouter",
};

export const docs = {
  name: "OpenRouter Faculty Provider",
  description:
    "Conversation faculties via OpenRouter chat completions. Three tune points: gpt-6.1-sol (reasoning), gemini-3.8-flash, gemini-3.5-flash-lite. Override the table via statics.models. Picture faculties via the OpenRouter Image API: gpt-image-2.6-sunburst, flux-3-image, gemini-nano-banana-2.1; override via statics.pictures.",
};
