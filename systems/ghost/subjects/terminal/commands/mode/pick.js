import { Vector } from "@vivalence/typology";

export const pick = new Vector().open(
  { nature: "/mode", valence: "the seated thread moves onto the mode; no thread seated, a new one is minted on it; the words narrow, one match moves, else the candidates are the answer. Example: /mode memo", chord: "leader/m" },
  async (ctx) => {
    const words = ctx.signal.body.map((datum) => String(datum));
    const found = ctx.client.runtime.entities.mode.$entities.get().filter((mode) => words.every((word) => mode.reference.absolute.includes(word)));
    if (found.length !== 1) return { which: found.map((mode) => mode.reference.absolute) };
    const [mode] = found;
    const thread = ctx.terminal.thread === null
      ? await ctx.client.runtime.entities.thread.create({
        user: ctx.client.runtime.lighthouse.user.id,
        mode: mode.id,
      })
      : await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, { mode: mode.id });
    await ctx.terminal.setThread(thread);
    return `${mode.reference.absolute} · thread #${thread.id}`;
  },
);
