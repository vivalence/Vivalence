import { NotFound, Vector } from "@vivalence/typology";
import { stream } from "../../../gestalten/belt/harness.js";

export const turn = new Vector().open(
  { nature: "*", valence: "a bare line — a turn to the active terminal's mode, streamed onto the thread's span. Example: ciao" },
  (ctx) => {
    if (ctx.signal.body.length === 0) throw new NotFound(ctx.signal);
    return stream(ctx.terminal.mode, ctx.terminal.thread, ctx.signal.body);
  },
);
