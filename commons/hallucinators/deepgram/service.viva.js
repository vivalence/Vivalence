import provider from "./provider/index.js";

export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "deepgram",
  traits: ["MONK"],
};

export const docs = {
  name: "Deepgram Verbatim",
  description:
    "Streaming ASR via Deepgram Nova (listen v1) and Flux turn detection (listen v2), one verbatim faculty per entry of the ledger row's faculties.",
};
