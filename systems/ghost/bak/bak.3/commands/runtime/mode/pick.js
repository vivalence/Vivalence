import { v, Vector } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";
import { seating } from "./seating.js";

export const pick = new Vector().open(
  {
    nature: "/mode",
    valence: "pick a mode and seat it on the active terminal — its newest thread, or a new one; a query narrows, one match seats. Example: /mode memo",
    schema: v.object({ query: v.string().desc("words of a reference. Example: memo").optional() }),
  },
  async (ctx) => {
    if (ctx.terminal === null) throw new Error("no terminal picked — /terminal/new");
    const rows = [ctx.runtime.daemon, ...ctx.runtime.daemons]
      .flatMap((host) => host.modes)
      .map((mode) => ({ reference: mode.reference.absolute, type: mode.type, slug: mode.slug, daemon: mode.host.slug, mode }));
    const lens = {
      label: "mode",
      rows,
      keys: ["reference", "type", "slug", "daemon"],
      facets: ["type", "daemon"],
      columns: ["slug", "type", "daemon", "reference"],
      identifier: (row) => row.reference,
    };
    const query = ctx.signal.body.join(" ");
    const chosen = await belt.pick(ctx, lens, query);
    if (chosen === null) throw new Error(`${query}: no such mode — /modes lists them`);
    if (chosen.aborted) return { aborted: true };
    const thread = await seating(ctx, chosen.row.mode);
    return { terminal: ctx.terminal.id, thread: thread.id, mode: chosen.identifier };
  },
);
