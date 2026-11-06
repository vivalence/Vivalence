import provider from "./provider/index.js";
export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "openrouter",
};

export const docs = {
  name: "OpenRouter Faculty Provider",
  description:
    "Conversation faculties via OpenRouter chat completions. Three tune points: gpt-5.1 (reasoning), gemini-2.5-flash, gemini-2.5-flash-lite. Override the table via statics.models. Picture faculties via the OpenRouter Image API: gpt-image-2, flux.2-pro, gemini-2.5-flash-image; override via statics.pictures.",
};
