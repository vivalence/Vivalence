import { v, Vector } from "@vivalence/typology";

export const collapse = new Vector().open(
  {
    nature: "/dock/collapse",
    valence: "collapse the dock, or toggle it. Example: /dock/collapse · /dock/collapse false",
    schema: v.object({ collapsed: v.boolean().desc("the state; absent toggles. Example: true").optional() }),
  },
  (ctx) => {
    const held = ctx.client.dock;
    const collapsed = ctx.signal.body[0] === undefined ? !held.collapsed : String(ctx.signal.body[0]) === "true";
    ctx.client.$dock.set({ ...held, collapsed });
    return ctx.client.dock;
  },
);
