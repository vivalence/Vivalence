import Mustache from "mustache";
import { EvalTokensPrompt, EvalTranslationPrompt } from "./lib/prompts.js";

export default async function evaluate({ scope, sentence }, ctx) {
  const perf = performance.now();

  const units = await isolatePos({ scope }, ctx);
  delete scope.units;
  delete scope.tags;

  const evaluation = await evaluateSentence({ units, sentence }, ctx);
  const evaluations = await Promise.all(
    units.map((unit) => evaluatePos({ unit, sentence, evaluation }, ctx)),
  );

  evaluations.map((evaluation) => evaluateByType({ ...evaluation, scope }, ctx));
  const result = prettifyEvaluations({ evaluations, scope }, ctx);

  console.log(`[PERF] evaluate took ${performance.now() - perf}ms`);
  return result;
}

function prettifyEvaluations({ evaluations, scope }, ctx) {
  const units = evaluations
    .map(({ evaluations, unit }) => {
      return evaluations.reduce(
        (acc, obj) => {
          if (obj.type === "Unit") acc.unit = { ...unit, ...obj };
          else if (obj.type === "Tag") acc.tags.push(obj);
          return acc;
        },
        { unit, tags: [] },
      );
    })
    .map(({ unit, tags }) => {
      unit.tags = unit.tags.map((tag) => {
        const evaluation = tags.find((tagEval) => tagEval.id === tag.id);
        return { ...tag, evaluation: evaluation.evaluation };
      });
      return unit;
    });

  const errors = units.reduce((errors, unit) => {
    unit.evaluation.status !== "KNOWN" && errors++;
    return errors;
  }, 0);

  return { units, sentence: { status: errors === 0 ? "KNOWN" : "UNKNOWN" } };
}

async function evaluateByType({ scope, evaluations }, ctx) {
  evaluations.map(({ type, id, evaluation }) => {
    if (type === "Unit") {
      ctx.runtime.call("/units/review", {
        gameType: "TRANSLATIONS",
        response: evaluation.status,
        scope: { ...scope, unit: { id } },
      });
    } else if (type === "Tag") {
      ctx.runtime.call("/tags/review", {
        gameType: "TRANSLATIONS",
        response: evaluation.status,
        scope: { ...scope, tag: { id } },
      });
    }
  });
}

async function evaluatePos({ unit, sentence, evaluation }, ctx) {
  const prompt = Mustache.render(EvalTokensPrompt.template, {
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
  });
  const schema = {
    ...EvalTokensPrompt.schema,
    properties: unit.tags.reduce(
      (acc, tag) => {
        acc["Tag:" + tag.id] = { $ref: "#/definitions/tag" };
        return acc;
      },
      { ["Unit:" + unit.id]: { $ref: "#/definitions/unit" } },
    ),
  };
  schema.properties.required = Object.keys(schema.properties);

  const llmInput = { prompt, schema, provider: EvalTokensPrompt.provider };
  const llmResponse = await ctx.runtime.locals.services.llm(llmInput);

  const evaluations = Object.entries(llmResponse)
    .map(([key, evaluation]) => {
      let safeId;
      const [type, unsafeId] = key.split(":");
      if (type === "Unit") safeId = unit.id;
      else if (type === "Tag") {
        const tag = unit.tags.find((tag) => tag.id === unsafeId);
        if (tag) safeId = tag.id;
      }
      return { type, id: safeId, evaluation };
    })
    .filter((evaluation) => !!evaluation.id)
    .filter(({ evaluation }) => evaluation.status !== "NEUTRAL");

  return { unit, evaluations };
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
  schema.properties.required = Object.keys(schema.properties);

  const evaluation = await ctx.runtime.locals.services.llm({
    prompt,
    schema,
    provider: EvalTranslationPrompt.provider,
  });

  return evaluation;
}

async function isolatePos({ scope }, ctx) {
  const hydratedScope = await ctx.runtime.call("/scope/hydrate", { scope });

  const units = hydratedScope.units.map((unit, index) => ({
    id: unit.id,
    known: unit.data.known,
    token: unit.token,
    index: index + 1,
    start_char: unit.start_char,
    end_char: unit.end_char,
    tags: unit.tags
      .filter((tag) => tag.traits.includes("LEARNABLE"))
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        branch: tag.data.ONTOLOGICAL.branch,
        leaf: tag.data.ONTOLOGICAL.leaf,
      })),
  }));

  return units;
}

const wrapTextWithTag = (str, start_char, end_char, tag) => {
  return `${str.substring(0, start_char)}<${tag}>${str.substring(
    start_char,
    end_char,
  )}</${tag}>${str.substring(end_char)}`;
};
