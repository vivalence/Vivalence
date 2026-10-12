import { Vector } from "@vivalence/typology";

export const stop = new Vector().open(
  { nature: "/application/stop", valence: "close the frame; the buffer stays on its thread. Example: /application/stop" },
  (ctx) => {
    ctx.terminal.$buffer.set(null);
    return "frame closed";
  },
);
