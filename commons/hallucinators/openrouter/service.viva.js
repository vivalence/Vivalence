import provider from "./provider/index.js";
export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "openrouter",
};

export const docs = {
  name: "OpenRouter Faculty Provider",
  description:
    "Dialogue faculties via OpenRouter chat completions, choice faculties via its decisions API, picture faculties via its Image API, one per entry of the ledger row's faculties.",
};
