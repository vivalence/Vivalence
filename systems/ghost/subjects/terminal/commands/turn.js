import { NotFound, Vector, is } from "@vivalence/typology";
import { stream } from "../../../gestalten/belt/harness.js";

export const turn = new Vector().open(
  { nature: "*", valence: "a bare line — a turn to the active terminal's mode, streamed onto the thread's span. Example: ciao" },
  (ctx) => {
    if (ctx.signal.body.length === 0 || !is.object(ctx.signal.body[0])) throw new NotFound(ctx.signal);
    if (!is.object(ctx.terminal.mode)) throw new Error("no mode attached — a turn needs a HARNESSED mode. / for a command");
    if (!ctx.terminal.mode.implements("HARNESSED")) throw new Error(`${ctx.terminal.mode.type}/${ctx.terminal.mode.slug} takes no turn — not HARNESSED. / for a command`);
    return stream(ctx.terminal.mode, ctx.terminal, ctx.signal.body);
  },
);
