import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Celled = v.object({
  slug: v.string().desc('The view the buffer shows as its cell. Example: "board"'),
  name: v.string().desc('The buffer\'s label, the signal\'s remaining words. Example: "play #1"'),
});

const labeled = (signal) => ({ ...signal, body: signal.body.length < 2 ? signal.body : [signal.body[0], signal.body.slice(1).join(" ")] });

const named = (buffer) => buffer.trait.LABELED.name;

export const cell = new Vector().open(
  { nature: "/cell/set", valence: "which view a buffer shows as its cell in the journal. Example: /cell/set board play #1", input: Celled },
  async (ctx) => {
    const { slug, name } = belt.input.cast(Celled, labeled(ctx.signal));
    const found = ctx.terminal.thread.$buffers.get().find((candidate) => named(candidate) === name);
    if (found === undefined) throw new Error(`no buffer ${name} on thread #${ctx.terminal.thread.id} — its buffers: ${ctx.terminal.thread.$buffers.get().map(named).join(" · ") || "none"}`);
    const slugs = (await belt.view.candidates(found, ctx.client.runtime.attach)).filter((view) => view.traits.includes("CELL")).map((view) => view.slug);
    if (!slugs.includes(slug)) throw new Error(`${name} cells ${slugs.join(" · ") || "none"}`);
    await ctx.client.runtime.entities.buffer.updateOne({ id: found.id }, traits.patch(found, { RENDERED: { cell: slug } }));
    return `${name} · cell ${slug}`;
  },
);
