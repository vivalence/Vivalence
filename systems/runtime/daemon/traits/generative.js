import paladin from "@vivalence/paladin";
import { v } from "@vivalence/typology";
import { BufferEntity } from "@vivalence/runtime";

export const GENERATIVE = async (mode, daemon) => {
  if (!daemon.mountpoint) throw new Error("GENERATIVE: daemon carries no mountpoint");
  const bundler = paladin.bundler(`${daemon.mountpoint.absolute}/bundles/${mode.type}/${mode.slug}`);

  mode.gen = {
    bundle: bundler.bundle,
    inspect: bundler.inspect,
    serve: bundler.serve,
    buffer: async ({ view, data = {}, thread = null, literals, symbols, index = 0 }) => {
      const buffer = daemon.entities.em.create(BufferEntity, {
        mode: mode.entity.id,
        data,
        view: view.json,
        index,
      });
      if (thread) {
        const found = await daemon.entities.thread.findOne(thread);
        buffer.thread = found;
        buffer.index = found.counter++;
      }
      if (literals) buffer.literals.add(await daemon.entities.literal.findByIdentifiers(literals));
      if (symbols) buffer.symbols.add(await daemon.entities.symbol.findByIdentifiers(symbols));
      return buffer;
    },
  };

  if (mode.module.generator) mode.tools.slurp(mode.module.generator);
  else fallback(mode.tools.branch("/view"));
};

function fallback(tools) {
  tools
    .open(
      {
        nature: "/render",
        valence:
          "Render a live interface: submit a COMPLETE Svelte 5 component (runes only; props {buffer, terminal}; self-contained). It mounts on the user's screen at once.",
        input: v.object({
          source: v.string(),
          kind: v.string().optional(),
          data: v.any().optional(),
        }),
      },
      async (ctx) => {
        try {
          const view = await ctx.mode.gen.bundle({ kind: ctx.input.kind ?? "svelte", source: ctx.input.source });
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
        valence: "Read back the exact source of a rendered view by its hash, to revise it.",
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
}
