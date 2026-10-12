import { v, Vector } from "@vivalence/typology";

export const create = new Vector().open(
  {
    nature: "/thread/new",
    valence: "create a thread on a mode and seat it on the active terminal. Example: /thread/new /daemon/chess/mode/game/dojo",
    schema: v.object({ mode: v.string().desc("a mode reference or id. Example: /daemon/chess/mode/game/dojo") }),
  },
  async (ctx) => {
    if (ctx.terminal === null) throw new Error("no terminal picked — /terminal/new");
    const held = ctx.signal.body[0];
    const mode = ctx.runtime.entities.mode.$entities.get().find((row) => row.reference.absolute === held || String(row.id) === held);
    if (mode === undefined) throw new Error(`${held}: no such mode — /mode lists them`);
    const thread = await ctx.runtime.entities.thread.create({ mode: mode.id });
    await ctx.terminal.seat(thread);
    return { thread: thread.id, mode: mode.reference.absolute };
  },
);
