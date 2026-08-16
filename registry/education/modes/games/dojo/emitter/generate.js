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
  const count = ctx.input.count ?? 4;

  const vocabulary = await ctx.daemon.entities.literal.feed(
    object.merge(ctx.input.where, { ontology: "word" }),
    { limit: count * POOL_FACTOR, blacklist: ctx.input.blacklist },
  );
  if (!vocabulary.length) return [];

  const render = await ctx.daemon.cortex.hallucinate.object.render({
    policy: { tune: "capable" },
    system: {
      identity: hal.generate.identity(language),
      pool: hal.generate.pool(vocabulary),
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
    vocabulary.map((literal) => [string.fold(literal.trait?.TRANSLATED?.learning ?? ""), literal]),
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
