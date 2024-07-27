import annotate from "./annotate.js";

export default async function ({ text }, ctx) {
  const { analysis } = await ctx.services.nlp({ text });

  const annotations = analysis.sentences.map((sentence) => {
    return sentence.tokens.map(annotate, ctx);
  });

  return annotations;
}
