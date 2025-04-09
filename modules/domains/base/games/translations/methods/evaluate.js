import Mustache from "mustache";
import { EvalTranslationPrompt, EvalTokensPrompt } from "./lib/prompts.js";
import evaluationHelpers from "./lib/evaluations.js";

export default async function evaluate({ scope, sentence }, ctx) {
  const perf = performance.now();

  // Extract and prepare units for evaluation
  const units = await isolatePos({ scope }, ctx);
  delete scope.units;
  delete scope.tags;

  // Get the overall sentence evaluation
  const evaluation = await evaluationHelpers.sentence({ units, sentence }, ctx);

  // Evaluate each token individually
  const evaluator = (unit) => evaluationHelpers.tokens({ unit, sentence, evaluation }, ctx);
  const evaluations = await Promise.all(units.map(evaluator));

  // Send evaluation results to review system for tracking learner progress
  await sendToReview({ evaluations, scope }, ctx);

  // Calculate performance metrics
  const timeTaken = performance.now() - perf;
  console.log("Evaluation took: ", timeTaken);

  // Add performance metrics for analysis
  const enhancedEvaluations = evaluations.map((evaluation) => ({
    ...evaluation,
    meta: {
      evaluationTime: timeTaken,
      timestamp: new Date().toISOString(),
    },
  }));

  return enhancedEvaluations;
}

async function isolatePos({ scope }, ctx) {
  // Hydrate the scope to get full unit and tag data
  const hydratedScope = await ctx.runtime.call("/scope/hydrate", { scope });

  // Map units to a format suitable for evaluation
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
  // Process each evaluation and send results to the review system
  const reviewPromises = evaluations.map(async ({ unit, evaluation }) => {
    const evalScope = { ...scope, unit: { id: unit.id } };

    // Update unit evaluation
    const unitReview = ctx.runtime.call("/review/unit", {
      signal: mapSignal(evaluation.status),
      scope: evalScope,
    });

    // Update tag evaluations
    const tagReviews = Promise.all(
      unit.tags.map(async ({ id }) => {
        return ctx.runtime.call("/review/tag", {
          signal: mapSignal(evaluation.status),
          scope: { ...evalScope, tag: { id } },
        });
      }),
    );

    return Promise.all([unitReview, tagReviews]);
  });

  return Promise.all(reviewPromises);
}

// Maps evaluation status to review signal
const mapSignal = (status) =>
  ({
    KNOWN: "SUCCESS",
    UNKNOWN: "MISTAKE",
    NEUTRAL: "NEUTRAL",
  })[status];
