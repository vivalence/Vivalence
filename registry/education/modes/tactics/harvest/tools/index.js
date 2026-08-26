import { Vector, sleep, v } from "@vivalence/typology";
import { tatoeba } from "../sources/tatoeba.js";
import { commons } from "../sources/commons.js";
import { tts } from "../sources/tts.js";
import { normalize } from "../belt/audio.js";

const AGENT = "vivalence-harvest/0.1";
const BREATHER = 2000;
const SOURCES = { tatoeba, commons, tts };

const topographies = (daemon) => Object.values(daemon.modes.topography ?? {});

const anchored = (daemon, slug) =>
  slug
    ? daemon.modes.topography?.[slug]
    : topographies(daemon).find((mode) => mode.implements("FRAUGHT") && mode.datasink);

const kind = (literal) => (literal.ontology === "sentence" ? "sentence" : "word");

const unvocalized = async (daemon, { band, limit }) => {
  const found = await daemon.entities.literal.find(
    {
      ontology: { $in: ["word", "sentence"] },
      ...(band ? { rank: { $lte: band } } : {}),
    },
    { orderBy: { rank: "ASC" } },
  );
  return found.filter((literal) => !literal.traits?.includes("VOCALIZED")).slice(0, limit ?? 20);
};

const SURVEY_INPUT = v.object({
  topography: v.string().desc("Topography slug. Omit to take the mounted one.").optional(),
  band: v.number().desc("Only literals ranked at or under this.").optional(),
  limit: v.number().default(50),
});

const VOCALIZE_INPUT = v.object({
  topography: v.string().optional(),
  language: v.string().desc("ISO 639-3 of the learning language — e.g. ita. Name it every sweep."),
  source: v
    .enum(["auto", "tatoeba", "commons", "tts"])
    .default("auto")
    .desc("auto = tatoeba for sentences, commons for words — NEVER tts unless named explicitly."),
  slugs: v.array(v.string()).desc("Exact literals. Omit to sweep the band.").optional(),
  band: v.number().optional(),
  limit: v.number().default(20),
  dry: v.boolean().desc("Resolve and report without touching freight or entities.").default(false),
});

const DRAIN_INPUT = v.object({ topography: v.string().optional() });

export const tools = new Vector()
  .open(
    {
      nature: "/survey",
      valence:
        "The first move of every session: count and list the literals that still have no voice. " +
        "Returns the working queue ordered by rank — slug, kind (word/sentence), rank, learning text. " +
        "Scope with band (rank ceiling) when the operator names one.",
      input: SURVEY_INPUT,
    },
    async (ctx) => {
      const topography = anchored(ctx.daemon, ctx.input.topography);
      if (!topography) return { condition: "ERROR", message: "no topography mounted" };
      const targets = await unvocalized(ctx.daemon, ctx.input);
      return {
        total: targets.length,
        band: ctx.input.band ?? null,
        targets: targets.map((literal) => ({
          slug: literal.slug,
          kind: kind(literal),
          rank: literal.trait?.RANKED?.rank ?? null,
          learning: literal.trait?.TRANSLATED?.learning ?? "",
        })),
      };
    },
  )
  .open(
    {
      nature: "/vocalize",
      valence:
        "Resolve and land audio for unvocalized literals: pick a source, fetch, normalize, receive " +
        "into the topography's freight, stamp VOCALIZED with attribution. Name the language every " +
        "sweep. Run dry:true first and show the operator what would land; go wet only on their word. " +
        "auto never synthesizes — tts must be named explicitly and its result is marked synthetic. " +
        "Misses are honest: a literal no source can voice stays in the report, never papered over.",
      input: VOCALIZE_INPUT,
    },
    async (ctx) => {
      const topography = anchored(ctx.daemon, ctx.input.topography);
      if (!topography) return { condition: "ERROR", message: "no topography mounted" };
      if (!topography.freight?.receive)
        return { condition: "ERROR", message: `${topography.slug} carries no receivable freight` };

      const { language, source: pick } = ctx.input;
      const targets = ctx.input.slugs?.length
        ? await ctx.daemon.entities.literal.find({ slug: { $in: ctx.input.slugs } })
        : await unvocalized(ctx.daemon, ctx.input);

      const report = { vocalized: [], missed: [], failed: [] };
      for (const literal of targets) {
        if (literal.traits?.includes("VOCALIZED")) continue;
        const shelf = kind(literal);
        const chosen = pick === "auto" ? (shelf === "sentence" ? "tatoeba" : "commons") : pick;
        const source = SOURCES[chosen]({ agent: AGENT, daemon: ctx.daemon });
        const text = literal.trait?.TRANSLATED?.learning;
        try {
          const found = text ? await source.resolve({ text, kind: shelf, language }) : null;
          if (!found) report.missed.push(literal.slug);
          else if (ctx.input.dry) report.vocalized.push({ slug: literal.slug, ...found, dry: true });
          else {
            const bytes = await normalize(await source.fetch(found));
            if (!bytes) report.failed.push(literal.slug);
            else {
              const path = `${shelf}s/${literal.slug}.mp3`;
              await topography.freight.receive(path, bytes);
              literal.assign({
                traits: [...new Set([...(literal.traits ?? []), "VOCALIZED"])],
                trait: {
                  ...literal.trait,
                  VOCALIZED: {
                    asset: { path },
                    attribution: { author: found.author, license: found.license, source: found.source },
                  },
                },
              });
              report.vocalized.push({ slug: literal.slug, path, source: found.source, license: found.license });
            }
          }
        } catch {
          report.failed.push(literal.slug);
        }
        if (!ctx.input.dry) await sleep.ms(BREATHER);
      }
      if (!ctx.input.dry) await ctx.daemon.entities.em.flush();
      return report;
    },
  )
  .open(
    {
      nature: "/drain",
      valence:
        "Write the daemon's current truth back to the topography's dataset files through its " +
        "datasink — the explicit flush of the katabolic loop. Returns the drain report verbatim.",
      input: DRAIN_INPUT,
    },
    async (ctx) => {
      const topography = anchored(ctx.daemon, ctx.input.topography);
      if (!topography?.datasink?.drain)
        return { condition: "ERROR", message: "no drainable topography mounted" };
      return topography.datasink.drain({ all: true });
    },
  );
