import { App, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "spawned",
  name: "Spawned",
  description: "Render target — a numbered card that reports done via buffer.release().",
  version: "0.1.0",
  traits: ["APPLICATION"],
};

// A pure render target. It owns no progression and no persistence — it just renders
// its data and fires `buffer.release()` when finished. The terminal's stall decides
// what release means (STATIC/CONTINUOUS consume it; MANUAL hands it to the app).
export const app = new App(
  "buffer/Spawned.svelte",
  v.buffer({
    data: { label: v.string(), index: v.integer().default(0) },
  }),
);
