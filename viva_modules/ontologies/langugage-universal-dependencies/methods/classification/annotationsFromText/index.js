import annotate from "./annotate.js";

export default async function ({ text }, ctx) {
  const { analysis, ...rest } = await ctx.runtime.services.nlp({ text });

  const annotations = analysis.sentences.map((sentence) => {
    return sentence.tokens.map((t) => annotate(t, ctx));
  });

  return annotations;
}
