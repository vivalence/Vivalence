import { App, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "card",
  name: "Card",
  description: "A render target — a dealt card; reports done via buffer.release().",
  version: "0.1.0",
  traits: ["APPLICATION"],
};

export const app = new App("buffer/Card.svelte", v.buffer({ data: { face: v.string() } }));
