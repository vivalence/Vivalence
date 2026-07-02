// import Mustache from "mustache";
import { EvalPrompt } from "./lib/prompts.js";

export default async function generate(inputs, ctx) {
  const promises = inputs.results //
    .map((c) => ctx.daemon.call("/review/literal", c));

  const output = await Promise.all(promises);

  ctx.daemon.entities.product //
    .nativeUpdate(inputs.scope.product, { status: "DONE" });

  return output;
}

// async function evaluate({ signal, scope }, ctx) {
//   const hydrated = await ctx.runtime.call("/scope/hydrate", {
//     scope: conjugation.scope,
//   });

//   const ontologicalTags = hydrated.tags
//     .filter((tag) => tag.data.ONTOLOGICAL)
//     .map((tag) => ({
//       branch: tag.data.ONTOLOGICAL.branch,
//       leaf: tag.data.ONTOLOGICAL.leaf,
//     }));

//   const evalData = {
//     language: ctx.runtime.statics.language,
//     input: conjugation.input,
//     known: conjugation.known,
//     learning: conjugation.learning,
//     tags: ontologicalTags,
//   };

//   const evaluation = await ctx.runtime.services.llm({
//     prompt: Mustache.render(EvalPrompt.template, evalData),
//     schema: EvalPrompt.schema,
//     provider: EvalPrompt.provider,
//   });

//   sendToReview({ signal: evaluation.status, scope, conjugation }, ctx);

//   return {
//     evaluation,
//     unit: conjugation.scope.unit,
//   };
// }

// async function sendToReview({ signal, conjugation, scope }, ctx) {
//   const evalScope = {
//     ...scope,
//     tag: null,
//     units: null,
//     tags: conjugation.scope.tags,
//     unit: { id: conjugation.scope.unit.id },
//   };

//   await ctx.runtime.call("/review/unit", { signal, scope: evalScope }),
//     await ctx.runtime.call("/review/tag", { signal, scope: evalScope });
// }

// // async function evaluate({ conjugation, scope }, ctx) {const hydrated = await ctx.runtime.call("/scope/hydrate", { scope: conjugation.scope }); console.json({ hydrated });}
// // const [scopeTags, personTags, numberTags] = await Promise.all([ctx.runtime.call("/tags/fromTagIds", { tagIds: scope.tags.map((t) => t.id) }), ctx.runtime.call("/tags/fromOntology", { branch: "person" }), ctx.runtime.call("/tags/fromOntology", { branch: "number" }),]);
// // const tags = {lemma: scopeTags.find((tag) => tag.data.ONTOLOGICAL.branch === "lemma"), tense: scopeTags.find((tag) => tag.data.ONTOLOGICAL.branch === "tense"), mood: scopeTags.find((tag) => tag.data.ONTOLOGICAL.branch === "mood"), persons: personTags, numbers: numberTags,};
// // const { person, number } = getPersonAndNumber(conjugation.meta.index); const personTag = tags.persons.find((tag) => tag.data.ONTOLOGICAL.leaf === person); const numberTag = tags.numbers.find((tag) => tag.data.ONTOLOGICAL.leaf === number);
// // const part = {language, input: inputs[conjugation.scope.unit.id], known: conjugation.known, learning: conjugation.learning, person: personTag.name, number: numberTag.name, verb: tags.lemma.name, tense: tags.tense.name, mood: tags.mood.name,};

// // const prompt = Mustache.render(EvalPrompt.template, part);
// // const input = { prompt, schema: EvalPrompt.schema, provider: EvalPrompt.provider };
// // const evaluation = await ctx.runtime.services.llm(input);

// // // @lf i should rename this to /unit/review, evaluate or update or something
// // await ctx.runtime.call("/review/unit", {
// //   signal: evaluation.status,
// //   scope: { ...scope, tag: null, unit: { id: conjugation.scope.unit.id } },
// // });
// // for (const tag in conjugation.scope.tags) {
// //   await ctx.runtime.call("/review/tag", {
// //     signal: evaluation.status,
// //     scope: { ...scope, unit: null, tag: { id: tag.id } },
// //   });
// // }

// // return {
// //   evaluation,
// //   index: conjugation.meta.index,
// //   unit: { id: conjugation.scope.unit.id },
// // };
