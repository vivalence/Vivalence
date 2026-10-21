import { mime, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "card",
  name: "Card",
  description:
    "A render target — a dealt card; reports done via buffer.release().",
  version: "0.1.0",
  traits: ["VIEWABLE"],
};

export const buffer = v.buffer({ data: { face: v.string() } });

export const views = [{ slug: "card", mount: "buffer/Card.svelte", mime: mime.dom.svelte }];
