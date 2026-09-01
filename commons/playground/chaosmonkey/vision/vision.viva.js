import { App, v } from "@vivalence/typology";

export const manifest = {
  type: "chaosmonkey",
  slug: "vision",
  name: "Vision",
  description: "Emitted by the oracle — a sassy one-line vision of what you asked, with a return.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE"],
};

export const app = new App(
  "Vision.svelte",
  v.buffer({ data: { prompt: v.string().default(""), vision: v.string().default(""), mood: v.string().default("") } }),
);
