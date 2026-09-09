import { v, Vector, Yield } from "@vivalence/typology";
import { refuse } from "./draw.js";

const SOURCE = v
  .string()
  .desc(
    "The complete Svelte 5 component source, exactly as it would sit in a .svelte file. " +
      "No fences, no prose around it, no partial component. It must open with " +
      "`<script>\\n  let { buffer, terminal } = $props();\\n</script>`, hold one root " +
      '`<article class="page">`, and end with a scoped `<style>` block. See the HOUSE RULES ' +
      "in your context for the frame and the tokens.",
  );

const DATA = v
  .any()
  .desc(
    "The payload the component reads at `buffer.data` — it arrives as a prop, already " +
      "resolved, so put in it exactly what the source destructures. " +
      'Example: { title: "Flamingo", summary: "Wading birds of the family Phoenicopteridae.", sources: [{ title: "Flamingo — Wikipedia", url: "https://en.wikipedia.org/wiki/Flamingo" }] }.',
  )
  .optional();

const LABEL = v.primitives.Label.desc(
  "The name and one-line description on the page's clickable line in the chat and in the " +
    "buffer list — the subject, as the operator would say it. " +
    'Example: { name: "Flamingo", description: "The six species, the pink, and the one-legged stance." }',
);

// THE MINT — the one place this mode mints a buffer by hand. Not in mode.tools, so no model
// reaches it; mounted at aperture /emit + mode.emit by emitter.js. No thread passed to
// buffer.create: the EMITTER trait binds every buffer it drains, and the repository binds
// whenever handed one, so doing both advances thread.counter twice — P-nodoublebind.
export const emitter = new Vector().open(
  {
    nature: "/article",
    input: v.object({
      source: SOURCE,
      label: LABEL,
      data: DATA,
      thread: v
        .string()
        .desc(
          "The thread the page belongs to, so it appears under the right turn. Omitted for a standalone draw.",
        )
        .optional(),
    }),
    // yields Yield.NOMINAL([buffer]) — { kind: "emission", condition, output: { buffer: [row] } }.
    // fromm/yield.js:36 reads the kind, so the drained envelope survives to the tool_result
    // unchanged and turns.js:35 folds it into the m26 bag the client reads as entities.buffer.
  },
  async (ctx) => {
    const view = await ctx.mode.generator.bundle({
      kind: "svelte",
      source: refuse(ctx.input.source),
    });
    const buffer = await ctx.daemon.entities.buffer.create({
      mode: ctx.mode.entity.id,
      view: view.json,
      data: ctx.input.data ?? {},
      traits: ["LABELED"],
      trait: { LABELED: ctx.input.label },
    });
    return Yield.NOMINAL([buffer]);
  },
);

// THE STEERING — GENERATIVE owns the tools (generator_view_render · generator_view_revise · generator_view_inspect · generator_view_list)
// and slurps this vector onto them AFTER: its middleware runs on every draw and revise, and a node
// opened here WITHOUT an effect rewords the trait's while the trait's effect stays (vector.js:59-80).
// Nothing here mints: the mint is the emitter above.
export const generator = new Vector();

generator.branch("/view").use(async (ctx, next) => {
  try {
    if (ctx.input?.source) refuse(ctx.input.source);
  } catch (error) {
    ctx.output = {
      condition: "ERROR",
      message:
        `${error.message}. Fix the source and draw again — do not retry it unchanged.`,
    };
    return;
  }
  await next();
});

generator
  .branch("/view")
  .open({
    nature: "/render",
    valence:
      "Draw a page. Submit a COMPLETE Svelte 5 component as `source`; it is compiled, " +
      "content-addressed and mounted on the operator's screen, and appears in the chat as a " +
      "line they can click open. The HOUSE RULES in your context are binding — a component " +
      "that invents its own styling renders wrong, and one that imports from a URL is refused " +
      "outright. The `label` is what the operator sees on the line — the subject, named " +
      "plainly. Returns the buffer id and the view hash — keep both: generator_view_revise iterates the " +
      "SAME buffer, generator_view_inspect reads the source back by hash.",
    input: v.object({ source: SOURCE, label: LABEL, data: DATA }),
  })
  .open({
    nature: "/revise",
    valence:
      "Iterate a page you already drew: the SAME buffer, on the same clickable line, gets new " +
      "source, label and/or data and re-mounts in place. Pass the buffer id from generator_view_render or " +
      "generator_view_list — not the hash. The HOUSE RULES still bind; a URL import is still refused. " +
      "Use generator_view_inspect first if you no longer have the source; revise from it rather than " +
      "rewriting.",
    input: v.object({
      buffer: v
        .string()
        .desc(
          "The buffer id generator_view_render or generator_view_list reported. " +
            'Example: "01a0856f-425f-72b8-b36f-decc1bb2050e"',
        ),
      source: SOURCE.optional(),
      label: LABEL.optional(),
      data: v
        .any()
        .desc(
          "Data keys to merge over buffer.data; keys you omit stay. " +
            'Example: { summary: "Six species on four continents." }',
        )
        .optional(),
    }),
  });
