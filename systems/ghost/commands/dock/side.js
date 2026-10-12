import { v, Vector } from "@vivalence/typology";
import { dock } from "../../gestalten/belt/index.js";

export const side = new Vector().open(
  {
    nature: "/dock/side",
    valence: "which edge the dock hangs on. Example: /dock/side left",
    schema: v.object({ side: v.string().desc("top · right · bottom · left. Example: left") }),
  },
  (ctx) => {
    ctx.client.$dock.set({ ...ctx.client.dock, side: dock.normalizeSide(ctx.signal.body[0]) });
    return ctx.client.dock;
  },
);
