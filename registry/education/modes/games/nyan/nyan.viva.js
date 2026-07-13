import { Vector, App, v } from "@vivalence/typology";
import { GAMEPLAYS, fold } from "./buffer/engine.js";

const manifest = {
  type: "game",
  slug: "nyan",
  name: "Nyan",
  description:
    "Standalone typing trainer. Setup, practice, review. One keystroke stream split into recall / spelling / motor. Generic words, or learning-domain literals graded back to memory.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER", "STANDALONE", "TOOLED"],
};

const app = new App(
  "buffer/Nyan.svelte",
  v.buffer({
    data: {
      gameplay: v.enum(Object.keys(GAMEPLAYS), { default: "PLAIN" }),
      revealing: v
        .enum(["on", "off"], { default: "off" })
        .desc(
          "Reveal each word's translation once it's committed — the typed word is replaced inline by its gloss. Domain buffers only.",
        ),
      layout: v
        .enum(["block", "river"], { default: "block" })
        .desc(
          "Typing layout. block: words wrap in a paragraph. river: the current word is pinned at center while past and upcoming words flow right-to-left beneath it.",
        ),
      words: v.array(v.string()).optional(),
      // owners[i] = the literal id that word i belongs to; "" for untracked
      // function words (articles, etc). parallel to words — the grade alignment.
      owners: v.array(v.string()).optional(),
    },
    literals: v.array(v.rel(v.literal())).optional(),
  }),
);

const surfaceOf = (literal) => literal.trait?.TRANSLATED?.learning ?? literal.slug;

// turn domain literals into a flat typeable plan: the words the engine types,
// and a parallel owner-id per word so the buffer can grade each token back to
// the literal it trained. ontology decides the expansion:
//   word        → one word, owns itself
//   conjugation → its paradigm forms (falo · fala · falamos · falam), each owns its form literal
//   sentence    → its tokens, each aligned to a `uses` component by folded surface ("" = function word)
async function planLiterals(ctx, literals) {
  const words = [];
  const owners = [];
  for (const literal of literals) {
    if (literal.ontology === "conjugation") {
      const slugs = Object.values(literal.trait?.CONJUGATED?.paradigm ?? {});
      const forms = slugs.length
        ? await ctx.daemon.entities.literal.find({ slug: { $in: slugs } })
        : [];
      for (const form of forms) {
        words.push(surfaceOf(form));
        owners.push(form.id);
      }
    } else if (literal.ontology === "sentence") {
      const uses = literal.uses?.getItems?.() ?? [];
      for (const token of surfaceOf(literal).split(/\s+/).filter(Boolean)) {
        const owner = uses.find((component) => fold(surfaceOf(component)) === fold(token));
        words.push(token);
        owners.push(owner?.id ?? "");
      }
    } else {
      words.push(surfaceOf(literal));
      owners.push(literal.id);
    }
  }
  return { words, owners };
}

const emitter = new Vector()
  // generic, domain-free: type an explicit word list (or land on setup).
  .open("/play", async (ctx) => {
    const data = {};
    if (ctx.input.gameplay) data.gameplay = ctx.input.gameplay;
    if (ctx.input.words) data.words = ctx.input.words;
    return ctx.mode.app.buffer({ data });
  })
  // domain ingress: type learning literals; the buffer carries the owner index
  // so finishing grades each token back to memory (see buffer/Nyan.svelte).
  .open(
    {
      nature: "/literals",
      // rels — id or entity, both fine now that v.rel passes entities through cast()
      // without mauling Collections. we normalize to ids and refetch managed entities
      // (fresh + `uses` populated, whether the caller sent ids or full entities).
      input: v.object({
        literals: v.array(v.rel(v.literal())),
        gameplay: v.enum(Object.keys(GAMEPLAYS), { default: "PLAIN" }),
        layout: v.enum(["block", "river"], { default: "block" }),
      }),
    },
    async (ctx) => {
      const ids = ctx.input.literals.map((rel) => (typeof rel === "string" ? rel : rel.id));
      const found = await ctx.daemon.entities.literal.find(
        { id: { $in: ids } },
        { populate: ["uses"] },
      );
      const byId = new Map(found.map((literal) => [literal.id, literal]));
      const literals = ids.map((id) => byId.get(id)).filter(Boolean); // preserve order
      const { words, owners } = await planLiterals(ctx, literals);
      if (!words.length) return [];
      return ctx.mode.app.buffer({
        data: { gameplay: ctx.input.gameplay, layout: ctx.input.layout, words, owners },
        literals,
      });
    },
  );

const tools = new Vector().open(
  {
    nature: "play",
    valence:
      "Open the Nyan typing trainer. Pass `words` to drill that list now; omit to land on the setup screen. Default to plain.",
    input: v.object({
      gameplay: v
        .enum(Object.keys(GAMEPLAYS), { default: "PLAIN" })
        .desc("PLAIN: mistakes allowed. SUDDENDEATH: one wrong key ends the run."),
      words: v
        .array(v.string())
        .optional()
        .desc("Exact words to type, in order. Omit to choose in setup. Between 20-50 words."),
    }),
    output: v.object({}),
  },
  async (ctx) => ctx.mode.emit.play(ctx.input),
);

export { manifest, app, emitter, tools };
