import provider from "./provider/index.js";

export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "elevenlabs",
  traits: ["MONK"],
};

export const docs = {
  name: "ElevenLabs Speech",
  description:
    "Streaming TTS (speech) and realtime STT via Scribe (verbatim), one faculty per entry of the ledger row's faculties.",
};
