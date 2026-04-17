import provider from "./provider/index.js";

export { provider };

export const manifest = {
  type:   "speech",
  slug:   "elevenlabs",
  traits: ["MONK"],
};

export const docs = {
  name:        "ElevenLabs Speech",
  description: "Streaming TTS via ElevenLabs Turbo v2.5. Two pt-BR voices at latency-first tune.",
};
