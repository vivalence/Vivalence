import { Vector } from "@vivalence/typology";

export const close = new Vector().open(
  { nature: "/buffer/close", valence: "close the buffer beside the dock. Example: /buffer/close" },
  (ctx) => {
    if (ctx.terminal === null) throw new Error("no terminal picked — /terminal/new");
    ctx.terminal.$buffer.set(null);
    return { buffer: null };
  },
);
