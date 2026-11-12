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
    "Dialogue faculties via the Anthropic Messages API, one per entry of the ledger row's faculties.",
};
