import evaluationHelpers from "./lib/evaluations.js";

export default async function evaluate({ scope, sentence }, ctx) {
  const perf = performance.now();
  const units = await isolatePos({ scope }, ctx);
  delete scope.units;
  delete scope.tags;
  const evaluation = await evaluationHelpers.sentence({ units, sentence }, ctx);
  const evaluate = (unit) => evaluationHelpers.tokens({ unit, sentence, evaluation }, ctx);
  const evaluations = await Promise.all(units.map(evaluate));
  sendToReview({ evaluations, scope }, ctx);
  console.log("Evaluation took: ", performance.now() - perf);
  return evaluations;
}

async function isolatePos({ scope }, ctx) {
  const hydratedScope = await ctx.runtime.call("/scope/hydrate", { scope });

  const units = hydratedScope.units.map((unit, index) => ({
    id: unit.id,
    known: unit.data.known,
    index: index + 1,
    token: unit.token?.token,
    start_char: unit.token?.start_char,
    end_char: unit.token?.end_char,
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

async function sendToReview({ evaluations, scope }, ctx) {
  evaluations.map(async ({ unit, evaluation }) => {
    const evalScope = { ...scope, unit: { id: unit.id } };

    await ctx.runtime.call("/review/unit", {
      signal: mapSignal(evaluation.status),
      scope: evalScope,
    });
    await unit.tags.map(async ({ id }) => {
      await ctx.runtime.call("/review/tag", {
        signal: mapSignal(evaluation.status),
        scope: { ...evalScope, tag: { id } },
      });
    });
  });
}

const mapSignal = (status) =>
  ({
    KNOWN: "SUCCESS",
    UNKNOWN: "MISTAKE",
    NEUTRAL: "NEUTRAL",
  })[status];
