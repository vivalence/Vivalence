import { object, string } from "@vivalence/typology";
import * as hal from "../hal/index.js";
import { buffer } from "./buffer.js";

const POOL_FACTOR = 4;

const tokenize = (sentence, pool) =>
  string
    .clean(sentence)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const literal = pool.get(string.fold(word));
      return {
        form: word,
        gloss: literal?.trait?.TRANSLATED?.known ?? "",
        ...(literal && { literal: literal.id }),
      };
    });

export const generate = async (ctx) => {
  const language = ctx.daemon.statics.language;
  const literal = ctx.daemon.entities.literal;
  const count = ctx.input.count ?? 4;
  const target = count * POOL_FACTOR;
  const where = object.merge(ctx.input.where, { ontology: "word" });

  const anchors = ctx.input.anchors?.length
    ? await literal.findByIdentifiers(ctx.input.anchors)
    : [];

  const drawn = [...(ctx.input.blacklist?.literals ?? []), ...anchors.map((row) => row.id)];
  const weak = await literal.byStrength(where, {
    limit: Math.ceil(target / 2),
    blacklist: { literals: drawn },
  });
  drawn.push(...weak.map((row) => row.id));
  const familiar = await literal.sample(where, {
    limit: target - weak.length,
    blacklist: { literals: drawn },
  });
  drawn.push(...familiar.map((row) => row.id));
  const vocabulary = [...weak, ...familiar];
  if (vocabulary.length < target) {
    vocabulary.push(
      ...(await literal.feed(where, {
        limit: target - vocabulary.length,
        blacklist: { literals: drawn },
      })),
    );
  }
  if (!vocabulary.length && !anchors.length) return [];

  const render = await ctx.daemon.cortex.hallucinate.object.render({
    policy: { tune: "capable" },
    system: {
      identity: hal.generate.identity(language),
      pool: hal.generate.pool(vocabulary),
      ...(anchors.length && { anchors: hal.generate.anchors(anchors) }),
    },
    turns: [
      {
        role: "user",
        parts: [
          { type: "text", text: hal.generate.compose(language, count, ctx.input.instructions) },
        ],
      },
    ],
    output: { schema: hal.generate.output },
  });

  const pool = new Map(
    [...vocabulary, ...anchors].map((row) => [
      string.fold(row.trait?.TRANSLATED?.learning ?? ""),
      row,
    ]),
  );

  const knowables = (render.output.object?.sentences ?? []).slice(0, count).map((sentence) => ({
    ontology: "sentence",
    known: sentence.known,
    learning: sentence.learning,
    tokens: tokenize(sentence.learning, pool),
    judge: "LLM",
  }));
  if (!knowables.length) return [];

  return buffer(ctx, { set: [{ pick: "authored", knowables }] });
};
