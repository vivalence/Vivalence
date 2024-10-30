import Mustache from "mustache";
import { EvalPrompt } from "./lib/prompts.js";
import { getPersonAndNumber } from "./lib/index.js";

export default async function generate({ inputs, scope, instruction }, ctx) {
  const { language } = ctx.runtime.statics;

  const [scopeTags, personTags, numberTags] = await Promise.all([
    ctx.runtime.call("/tags/fromTagIds", { tagIds: scope.tags.map((t) => t.id) }),
    ctx.runtime.call("/tags/fromOntology", { branch: "person" }),
    ctx.runtime.call("/tags/fromOntology", { branch: "number" }),
  ]);

  const tags = {
    lemma: scopeTags.find((tag) => tag.data.ONTOLOGICAL.branch === "lemma"),
    tense: scopeTags.find((tag) => tag.data.ONTOLOGICAL.branch === "tense"),
    mood: scopeTags.find((tag) => tag.data.ONTOLOGICAL.branch === "mood"),
    persons: personTags,
    numbers: numberTags,
  };

  const promises = instruction.conjugations.map((conjugation) =>
    evaluateConjugation({ conjugation, tags, language, inputs, scope }, ctx),
  );

  const result = await Promise.all(promises);

  return result.reduce((acc, e) => ((acc[e.unit.id] = e), acc), {});
}

async function evaluateConjugation({ conjugation, tags, language, inputs, scope }, ctx) {
  const { person, number } = getPersonAndNumber(conjugation.meta.index);
  const personTag = tags.persons.find((tag) => tag.data.ONTOLOGICAL.leaf === person);
  const numberTag = tags.numbers.find((tag) => tag.data.ONTOLOGICAL.leaf === number);

  const part = {
    language,
    input: inputs[conjugation.scope.unit.id],
    known: conjugation.known,
    learning: conjugation.learning,
    person: personTag.name,
    number: numberTag.name,
    verb: tags.lemma.name,
    tense: tags.tense.name,
    mood: tags.mood.name,
  };

  const prompt = Mustache.render(EvalPrompt.template, part);

  const input = { prompt, schema: EvalPrompt.schema, provider: EvalPrompt.provider };
  const evaluation = await ctx.runtime.services.llm(input);

  // @lf i should rename this to /unit/review, evaluate or update or something
  await ctx.runtime.call("/units/review", {
    gameType: "CONJUGATIONS",
    response: evaluation.status,
    scope: { ...scope, tag: null, unit: { id: conjugation.scope.unit.id } },
  });
  for (const tag in conjugation.scope.tags) {
    await ctx.runtime.call("/tags/review", {
      gameType: "CONJUGATIONS",
      response: evaluation.status,
      scope: { ...scope, unit: null, tag: { id: tag.id } },
    });
  }

  return {
    evaluation,
    index: conjugation.meta.index,
    unit: { id: conjugation.scope.unit.id },
  };
}
