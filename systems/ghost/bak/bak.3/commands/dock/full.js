import { v, Vector } from "@vivalence/typology";

export const full = new Vector().open(
  {
    nature: "/dock/full",
    valence: "the dock over the whole stage, or toggle it. Example: /dock/full",
    schema: v.object({ full: v.boolean().desc("the state; absent toggles. Example: true").optional() }),
  },
  (ctx) => {
    const held = ctx.client.dock;
    const full = ctx.signal.body[0] === undefined ? !held.full : String(ctx.signal.body[0]) === "true";
    ctx.client.$dock.set({ ...held, full });
    return ctx.client.dock;
  },
);
