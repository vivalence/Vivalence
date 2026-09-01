import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "automaton",
  name: "Automaton",
  description: "Intent-driven: open one of its intents and the thread self-configures + self-manages.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EMITTER"],
};

// the hub renders a self-description of how its intent configured the thread.
export const app = new App("buffer/Automaton.svelte", v.buffer({ data: {} }));

// AIMED intents pull `card` buffers (reuse the Group-2 target) — cross-mode again.
export const emitter = new Vector().open(
  { nature: "/tick", input: v.object({ count: v.integer({ minimum: 1 }).default(1) }) },
  async (ctx) => {
    const card = ctx.daemon.modes.playground.card;
    const start = ctx.thread?.counter ?? 0;
    for (let i = 0; i < ctx.input.count; i++)
      ctx.pool.add(card.buffer({ data: { face: `#${start + i}` } }));
  },
);

// MULTIPLE intents — each a different disposition. opening one creates a thread that
// inherits its traits + trait + phase, then self-manages. The four cover every model:
export const dataset = {
  intent: [
    // auto-feed: AIMED + QUEUEING + continuous → the stall pulls + manages, hands-free.
    {
      slug: "auto",
      name: "Auto-feed",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: { AIMED: { mount: "/emit/tick" }, MASKED: {}, QUEUEING: { depth: 3 } },
      phase: "continuous",
    },
    // round-trip: AIMED + escort → seize the moat, walk, return home on drain.
    {
      slug: "round",
      name: "Round trip",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: { AIMED: { mount: "/emit/tick" }, MASKED: {}, QUEUEING: { depth: 2 } },
      phase: "escort",
    },
    // single: no AIMED → manual cursor discipline; the app/user drives (f-panel Open
    // renders the automaton hub itself, since there's no emitter to pull).
    { slug: "single", name: "Single", traits: [], trait: {}, phase: "manual" },
    // dormant: inert → the system does nothing until the app acts.
    { slug: "dormant", name: "Dormant", traits: [], trait: {}, phase: "inert" },
  ],
};
