import { NotFound, Vector, is } from "@vivalence/typology";
import { stream } from "../../belt/harness.js";

export const turn = new Vector().open(
  { nature: "*", rank: "hidden", valence: "a bare line — a turn to the active terminal's mode, streamed onto the thread's span. Example: ciao" },
  (ctx) => {
    if (ctx.signal.body.length === 0 || !is.object(ctx.signal.body[0])) throw new NotFound(ctx.signal);
    if (!is.object(ctx.terminal.mode)) throw new Error("no mode attached — a turn needs a HARNESS mode. / for a command");
    if (!ctx.terminal.mode.implements("HARNESS")) throw new Error(`${ctx.terminal.mode.type}/${ctx.terminal.mode.slug} takes no turn — not HARNESS. / for a command`);
    const uploads = ctx.client.app.bridge.uploads;
    if (uploads.some((upload) => upload.file === null))
      throw new Error("an upload is still going up — send when it has landed");
    ctx.client.app.bridge.$uploads.set([]);
    return stream(ctx.terminal.mode, ctx.terminal, [
      ...ctx.signal.body,
      ...uploads.map((upload) => ({ type: "file", file: upload.file.id })),
    ]);
  },
);
