import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Named = v.object({ name: v.string().desc('The label the thread shows. Example: "flamingo — six species"') });

const named = (thread) => thread.trait.LABELED.name;

const seated = async (ctx, thread) => {
  await ctx.terminal.setThread(thread);
  return `thread #${thread.id} · ${thread.mode.reference.absolute}`;
};

export const thread = new Vector()
  .open(
    { nature: "/thread", valence: "seat a thread by its id or label; the words narrow, one match seats, else the candidates are the answer. Example: /thread flamingo", chord: "leader/e/t" },
    (ctx) => {
      const words = ctx.signal.body.map((datum) => String(datum));
      const found = ctx.client.runtime.entities.thread.$entities.get().filter((held) => words.every((word) => [held.id, held.word].join(" ").includes(word)));
      if (found.length !== 1) return { which: found.map((held) => ({ id: held.id, label: named(held) })) };
      return seated(ctx, found[0]);
    },
  )
  .open(
    { nature: "/thread/new", valence: "a new thread on the seated mode, seated. Example: /thread/new" },
    async (ctx) => seated(ctx, await ctx.client.runtime.entities.thread.create({ mode: ctx.terminal.mode.id })),
  )
  .open(
    { nature: "/thread/label", valence: "name the seated thread — LABELED. Example: /thread/label \"flamingo — six species\"", input: Named, chord: "leader/e/l" },
    async (ctx) => {
      const { name } = belt.input.cast(Named, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { LABELED: { name } }));
      return `thread #${ctx.terminal.thread.id} · ${name}`;
    },
  )
  .open(
    { nature: "/thread/delete", valence: "the seated thread removed with its turns and buffers; the terminal seats the mode's newest other thread, or none. Example: /thread/delete" },
    async (ctx) => {
      const gone = ctx.terminal.thread;
      const others = ctx.client.runtime.entities.thread.$entities.get().filter((held) => held !== gone && held.mode === gone.mode);
      await ctx.terminal.setThread(others.length === 0 ? null : others.at(-1));
      await ctx.client.runtime.entities.thread.removeOne({ id: gone.id });
      return `thread #${gone.id} removed`;
    },
  );
