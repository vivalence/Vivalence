import { Vector, v } from "@vivalence/typology";

const AUTHOR = [
  "Author a COMPLETE Svelte 5 component (runes; props {buffer, terminal}; self-contained;",
  'imports only "svelte"/"nanostores"; scoped <style>; root fills + scrolls).',
  "Output ONLY the component source — no fences, no prose.",
].join(" ");

export const emitter = new Vector().open(
  { nature: "/conjure", input: v.object({ brief: v.string() }) },
  async (ctx) => {
    const scribe = ctx.daemon.cortex.hallucination();
    scribe.context.system(AUTHOR);
    scribe.entities.turn.append({ role: "user", parts: [{ type: "text", text: ctx.input.brief }] });
    const source = await scribe.verbatim.render();
    const view = await ctx.mode.gen.bundle({ kind: "svelte", source });
    const buffer = await ctx.mode.gen.buffer({ view });
    return { condition: "NOMINAL", entities: { buffer: [buffer] } };
  },
);
