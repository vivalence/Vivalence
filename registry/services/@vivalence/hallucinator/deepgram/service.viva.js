import provider from "./provider/index.js";

export { provider };

export const manifest = {
  type:   "hallucinator",
  slug:   "deepgram",
  traits: ["MONK"],
};

export const docs = {
  name:        "Deepgram Verbatim",
  description: "Streaming ASR + Flux-style turn detection via Deepgram Nova. pt-BR + en.",
};
