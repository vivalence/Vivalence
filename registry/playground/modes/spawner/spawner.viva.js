import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "spawner",
  name: "Spawner",
  description: "Render-phase rig — the persistent hub that spawns Spawned buffers.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EMITTER"],
};

// The hub is a control surface, not data — its buffer carries nothing.
export const app = new App("buffer/Spawner.svelte", v.buffer({ data: {} }));

export const emitter = new Vector().open(
  {
    nature: "/playground/spawn",
    input: v.object({ count: v.integer({ minimum: 1 }).default(2) }),
  },
  async (ctx) => {
    // console.log("playground/spawn", ctx.input);
    const spawned = ctx.daemon.modes.playground.spawned;
    // emit `count` render targets; no self-sentinel — the single spawner buffer is the hub.
    for (let index = 0; index < ctx.input.count; index++)
      ctx.pool.add(spawned.buffer({ data: { label: `spawned ${index}`, index } }));
  },
);

// export const dataset = {intent: [{slug: "spawn", name: "Spawn", traits: ["MASKED", "AIMED", "QUEUEING"], trait: {MASKED: { round: 0 }, AIMED: { mount: "/emit/playground/spawn" }, QUEUEING: { depth: 2 },},},],};
