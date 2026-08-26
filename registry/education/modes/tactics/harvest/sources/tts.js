export const tts = ({ daemon }) => ({
  slug: "tts",

  resolve: async ({ text }) => ({
    source: "tts",
    synthesize: text,
    author: "elevenlabs",
    license: "synthetic",
  }),

  fetch: async (found) => await daemon.cortex.hallucinate.speech.render({ source: found.synthesize }),
});
