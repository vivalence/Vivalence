import { mime, v, Vector } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "switchboard",
  name: "Switchboard",
  description:
    "Thread-driven: hot-swap the stall phase + the render cursor live; watch the stall re-engage.",
  version: "0.1.0",
  traits: ["VIEWABLE", "EMITTER"],
};

export const buffer = v.buffer({ data: {} });

export const views = [{ slug: "switchboard", mount: "buffer/Switchboard.svelte", mime: mime.dom.svelte }];

// feed `card` buffers on demand (cross-mode) — the set you then switch phases over.
export const emitter = new Vector().open(
  {
    nature: "/feed",
    input: v.object({ count: v.integer({ minimum: 1 }).default(3) }),
  },
  async (ctx) => {
    const card = ctx.modes.playground.card;
    const start = ctx.thread?.counter ?? 0;
    for (let i = 0; i < ctx.input.count; i++) {
      ctx.pool.add(card.buffer({ data: { face: `#${start + i}` } }));
    }
  },
);
