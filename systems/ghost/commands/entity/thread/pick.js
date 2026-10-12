import { v, Vector } from "@vivalence/typology";

export const pick = new Vector().open(
  {
    nature: "/thread/:id",
    valence: "seat a thread on the active terminal. Example: /thread/th3",
    schema: v.object({ id: v.string().desc("the thread id. Example: th3") }),
  },
  async (ctx) => {
    if (ctx.terminal === null) throw new Error("no terminal picked — /terminal/new");
    const thread = ctx.runtime.entities.thread.findOneLocal({ id: ctx.params.id });
    if (thread === null) throw new Error(`${ctx.params.id}: no such thread`);
    await ctx.terminal.seat(thread);
    return { terminal: ctx.terminal.id, thread: thread.id };
  },
);
