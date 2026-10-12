import { v, Vector } from "@vivalence/typology";
import { dock } from "../../gestalten/belt/index.js";

export const share = new Vector().open(
  {
    nature: "/dock/share",
    valence: "the dock's share of the stage, 0.18 to 1. Example: /dock/share 0.4",
    schema: v.object({ share: v.number().desc("the share. Example: 0.4") }),
  },
  (ctx) => {
    ctx.client.$dock.set({ ...ctx.client.dock, share: dock.clampShare(Number(ctx.signal.body[0])) });
    return ctx.client.dock;
  },
);
