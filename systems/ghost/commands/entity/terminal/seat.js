import { v, Vector } from "@vivalence/typology";

export const seat = new Vector().open(
  {
    nature: "/terminal/:id/seat",
    valence: "seat a thread on a terminal and pick it. Example: /terminal/t9/seat th3",
    schema: v.object({ id: v.string().desc("the terminal id. Example: t9"), thread: v.string().desc("the thread id. Example: th3") }),
  },
  async (ctx) => {
    const thread = ctx.runtime.entities.thread.findOneLocal({ id: ctx.signal.body[0] });
    if (thread === null) throw new Error(`${ctx.signal.body[0]}: no such thread`);
    const terminal = ctx.client.terminals.activate(ctx.params.id);
    await terminal.seat(thread);
    return { terminal: terminal.id, thread: thread.id };
  },
);
