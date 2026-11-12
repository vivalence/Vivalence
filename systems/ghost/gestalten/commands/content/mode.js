import { Vector } from "@vivalence/typology";
import * as belt from "../../belt/index.js";
import * as shard from "../../shard/index.js";

const hosted = (modes) => Object.entries(Object.groupBy(modes, (mode) => mode.reference.absolute.split("/mode/")[0]));

const listed = ([host, modes]) => [host, ...modes.map((mode) => `/${mode.type}/${mode.slug}`), ""].join("\n");

const MODE = {
  nature: "/mode",
  valence:
    "the seated thread moves onto the mode; no thread seated, a new one is minted on it; " +
    "a reference, or words that narrow to one, moves; else the repl narrows the references. Example: /mode memo",
  chord: "leader/m",
};

const references = (ctx) => ctx.client.runtime.entities.mode.$entities.get().map((mode) => mode.reference.absolute);

const moved = async (ctx, mode) => {
  const thread = ctx.terminal.thread === null
    ? await ctx.client.runtime.entities.thread.create({
      user: ctx.client.runtime.lighthouse.user.id,
      mode: mode.id,
    })
    : await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, { mode: mode.id });
  await ctx.terminal.setThread(thread);
  return `${mode.reference.absolute} · thread #${thread.id}`;
};

export const mode = new Vector().open(
  { nature: "/modes", valence: "every mode, grouped under its runtime or daemon. Example: /modes" },
  (ctx) => hosted(ctx.client.runtime.entities.mode.$entities.get()).map(listed).join("\n"),
);

mode
  .branch(MODE)
  .use(shard.chooser.narrowing(MODE, references))
  .do((ctx) => {
    const words = ctx.signal.body.map((datum) => String(datum));
    const [reference] = belt.catalog.narrowed(references(ctx), words);
    const modes = ctx.client.runtime.entities.mode.$entities.get();
    return moved(ctx, modes.find((mode) => mode.reference.absolute === reference));
  });
