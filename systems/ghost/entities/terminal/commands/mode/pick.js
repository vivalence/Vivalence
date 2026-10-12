import { Vector } from "@vivalence/typology";

const latest = async (ctx, mode) => {
  const held = ctx.runtime.entities.thread.$entities.get().filter((thread) => thread.mode !== null && thread.mode.reference.absolute === mode.reference.absolute).sort((left, right) => String(right.id).localeCompare(String(left.id)));
  return held.length > 0 ? held[0] : await ctx.runtime.entities.thread.create({ mode: mode.id });
};

export const pick = new Vector().open(
  { nature: "/mode", valence: "set the active terminal's thread to a mode's newest thread, or a new one; the words narrow, one match sets, else the candidates are the answer. Example: /mode memo" },
  async (ctx) => {
    const words = ctx.signal.body.map((datum) => String(datum));
    const found = ctx.runtime.entities.mode.$entities.get().filter((mode) => words.every((word) => mode.reference.absolute.includes(word)));
    if (found.length !== 1) return { which: found.map((mode) => mode.reference.absolute) };
    const thread = await latest(ctx, found[0]);
    await ctx.terminal.setThread(thread);
    return `${found[0].reference.absolute} · thread #${thread.id}`;
  },
);
