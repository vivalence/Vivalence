import Mustache from "mustache";
import { EvalTokensPrompt, EvalTranslationPrompt } from "./prompts.js";

async function evaluateTokens({ unit, sentence, evaluation }, ctx) {
  const input = {
    prompt: Mustache.render(EvalTokensPrompt.template, {
      part: unit,
      language: ctx.runtime.statics.language,
      evaluation: {
        whole: evaluation["translation:whole"],
        token: evaluation["token:" + unit.token],
      },
      sentence: {
        ...sentence,
        learning: wrapTextWithTag(sentence.learning, unit.start_char, unit.end_char, "PART"),
      },
    }),
    schema: { ...EvalTokensPrompt.schema },
    provider: EvalTokensPrompt.provider,
  };

  return { unit, evaluation: await ctx.runtime.services.llm(input) };
}

async function evaluateSentence({ units, sentence }, ctx) {
  const prompt = Mustache.render(EvalTranslationPrompt.template, {
    parts: units,
    language: ctx.runtime.statics.language,
    sentence,
  });

  const schema = {
    ...EvalTranslationPrompt.schema,
    properties: units.reduce(
      (acc, unit) => {
        acc["token:" + unit.token] = { $ref: "#/definitions/token" };
        return acc;
      },
      { "translation:whole": { $ref: "#/definitions/translation" } },
    ),
  };
  schema.required = Object.keys(schema.properties);

  const evaluation = await ctx.runtime.services.llm({
    prompt,
    schema,
    provider: EvalTranslationPrompt.provider,
  });

  return evaluation;
}

const wrapTextWithTag = (str, start_char, end_char, tag) => {
  return `${str.substring(0, start_char)}<${tag}>${str.substring(
    start_char,
    end_char,
  )}</${tag}>${str.substring(end_char)}`;
};

export default {
  sentence: evaluateSentence,
  tokens: evaluateTokens,
};

// properties: unit.tags.reduce((acc, tag) => {acc["Tag:" + tag.id] = { $ref: "#/definitions/tag" }; return acc;}, { ["Unit:" + unit.id]: { $ref: "#/definitions/unit" } },),},
// input.schema.required = Object.keys(input.schema.properties);
