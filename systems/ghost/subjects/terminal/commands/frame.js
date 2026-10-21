import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Framing = v.object({ slug: v.string().desc('The view the framed buffer shows. Example: "play"') });

export const frame = new Vector().open(
  { nature: "/frame/set", valence: "which view the framed buffer shows. Example: /frame/set play", input: Framing, chord: "leader/e/a" },
  async (ctx) => {
    const { slug } = belt.input.cast(Framing, ctx.signal);
    if (ctx.terminal.buffer === null) throw new Error("no frame open");
    const slugs = (await belt.view.candidates(ctx.terminal.buffer, ctx.client.runtime.attach)).filter((view) => view.traits.includes("FRAME")).map((view) => view.slug);
    if (!slugs.includes(slug)) throw new Error(`${ctx.terminal.buffer.trait.LABELED.name} frames ${slugs.join(" · ") || "none"}`);
    await ctx.client.runtime.entities.buffer.updateOne({ id: ctx.terminal.buffer.id }, traits.patch(ctx.terminal.buffer, { RENDERED: { frame: slug } }));
    return `${ctx.terminal.buffer.trait.LABELED.name} · frame ${slug}`;
  },
);
