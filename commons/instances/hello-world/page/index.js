import { v, Vector, Yield, mime } from "@vivalence/typology";
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

const SLUG = v
  .string()
  .desc('The page\'s name inside this mode — the subject, kebab-cased; the same slug again rewrites the page. Example: "flamingo"');

const MIME = mime.type().desc(`What the code is — always ${mime.dom.svelte} here. Example: "${mime.dom.svelte}"`);

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

const slugged = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const emitter = new Vector().open(
  {
    nature: "/article",
    input: v.object({
      source: SOURCE,
      label: LABEL.optional(),
      data: DATA,
      thread: v.string().desc('The thread the page belongs to, so it appears under the right turn. Example: "th3"'),
    }),
  },
  async (ctx) => {
    const view = await ctx.mode.generator.bundle({
      slug: ctx.input.label === undefined ? "article" : slugged(ctx.input.label.name),
      mime: mime.dom.svelte,
      source: refuse(ctx.input.source),
    });
    const buffer = await ctx.entities.buffer.create({
      mode: ctx.mode.entity.id,
      mime: mime.json,
      ...(ctx.input.data !== undefined && { data: ctx.input.data }),
      ...(ctx.input.label !== undefined && { traits: ["LABELED"], trait: { LABELED: ctx.input.label } }),
      views: [view.id],
    });
    return Yield.NOMINAL([buffer]);
  },
);

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
    nature: "/create",
    valence:
      "Draw a page. Submit a COMPLETE Svelte 5 component as `source`; it is compiled, " +
      "content-addressed and stored as a View of this mode. Then buffer_create with " +
      "`views: [slug]` and the page's `data` and `label` puts it on the operator's screen as a " +
      "line they can click open. The HOUSE RULES in your context are binding — a component " +
      "that invents its own styling renders wrong, and one that imports from a URL is refused " +
      "outright. The same slug again rewrites the page in place; view_update does the same.",
    input: v.object({ slug: SLUG, mime: MIME, source: SOURCE }),
  })
  .open({
    nature: "/update",
    valence:
      "Iterate a page you already drew: the SAME view, by slug, gets new source and every " +
      "buffer showing it re-mounts in place; the buffer's data changes through buffer_update, " +
      "its line through buffer_label. The HOUSE RULES still bind; a URL import is still refused. " +
      "Use view_read first if you no longer have the source; revise from it rather than rewriting.",
    input: v.object({ slug: SLUG, mime: MIME.optional(), source: SOURCE }),
  });
