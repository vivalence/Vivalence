import { Vector, v } from "@vivalence/typology";

const RENDER = [
  "Render a live interface for the user — submit a COMPLETE Svelte 5 component as `source`.",
  "",
  "RULES: runes only ($props/$state/$derived/$effect); `let { buffer, terminal } = $props();`",
  '(payload at buffer.data); imports only "svelte"/"nanostores"; scoped <style>, no global CSS;',
  "root fills + scrolls (height:100%; overflow-y:auto); build real controls as $state.",
  "",
  "EXAMPLE source:",
  "<script>let { buffer } = $props(); let n = $state(0);</script>",
  "<button onclick={() => n++}>{buffer.data.label}: {n}</button>",
  "<style>button { font-size: 1.2rem; }</style>",
].join("\n");

export const generator = new Vector();

generator
  .branch("/view")
  .open(
    { nature: "/render", valence: RENDER, input: v.object({ source: v.string(), data: v.any().optional() }) },
    async (ctx) => {
      try {
        const view = await ctx.mode.gen.bundle({ kind: "svelte", source: ctx.input.source });
        const buffer = await ctx.mode.gen.buffer({ view, data: ctx.input.data ?? {}, thread: ctx.thread ?? null });
        await ctx.daemon.entities.em.flush();
        return { message: `view ${view.hash.slice(0, 16)} on screen`, buffer: [buffer] };
      } catch (error) {
        return { message: `render refused: ${error.message}` };
      }
    },
  )
  .open(
    {
      nature: "/inspect",
      valence: "Read back a rendered view's exact source by its hash, to revise it.",
      input: v.object({ hash: v.string() }),
    },
    async (ctx) => {
      try {
        return await ctx.mode.gen.inspect(ctx.input.hash);
      } catch (error) {
        return { message: error.message };
      }
    },
  );
