import provider from "./provider/index.js";
export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "anthropic",
  // traits: ["MONK"],
};

export const docs = {
  name: "Anthropic Faculty Provider",
  description:
    "Conversation faculties via Anthropic Messages API. Three tune points: opus (thinking), sonnet, haiku.",
};
