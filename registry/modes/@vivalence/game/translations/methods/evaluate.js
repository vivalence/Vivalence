const TokenEvaluationSchema = {
  type: "object",
  properties: {
    overall: {
      type: "object",
      properties: {
        signal: {
          type: "string",
          enum: ["SUCCESS", "MISTAKE", "NEUTRAL"],
          description:
            "SUCCESS: all content words correct. NEUTRAL: minor issues or acceptable alternatives. MISTAKE: any content word wrong.",
        },
        feedback: {
          type: ["string", "null"],
          description: "One brief sentence summarizing the result. Null if perfect.",
        },
      },
      required: ["signal"],
      additionalProperties: false,
    },
    tokens: {
      type: "array",
      description: "One evaluation entry per expected token, in order",
      items: {
        type: "object",
        properties: {
          index: {
            type: "number",
            description: "Token index matching the expected token list",
          },
          signal: {
            type: "string",
            enum: ["SUCCESS", "MISTAKE", "NEUTRAL"],
            description:
              "SUCCESS: correctly translated. NEUTRAL: acceptable alternative. MISTAKE: wrong, missing, or misspelled.",
          },
          correction: {
            type: ["string", "null"],
            description: "What the user should have written. Only for MISTAKE.",
          },
          feedback: {
            type: ["string", "null"],
            description: "One concise sentence about the specific error. Only for MISTAKE.",
          },
        },
        required: ["index", "signal"],
        additionalProperties: false,
      },
    },
  },
  required: ["overall", "tokens"],
  additionalProperties: false,
};

export default async function evaluate(input, ctx) {
  const { translation, sentence, tokens, scope } = input;
  const language = ctx.daemon.statics.language;

  // Build token table for the LLM
  const contentTokens = (tokens || []).filter((t) => t.token && t.token.trim().length > 0);

  const tokenTable = contentTokens
    .map(
      (t) =>
        `  [${t.index}] "${t.token}"${t.known ? ` (${language.known}: "${t.known}")` : ""}${t.pos ? ` [${t.pos}]` : ""}`,
    )
    .join("\n");

  const prompt = `Evaluate a translation from ${language.known} to ${language.learning}, token by token.

Original (${language.known}): "${sentence.known}"
Expected (${language.learning}): "${sentence.learning}"
User wrote: "${translation}"

Expected tokens to evaluate:
${tokenTable}

Rules:
- For EACH token above, determine whether the user's translation correctly expresses it
- Ignore capitalization differences and minor punctuation
- SUCCESS: the token's meaning is correctly present in the user's translation
- NEUTRAL: an acceptable alternative was used (synonym, valid regional variant, reordering)
- MISTAKE: wrong word, missing word, misspelled, or grammatically incorrect form
- Punctuation-only tokens (. , ! ? ;) should be SUCCESS unless the sentence structure is broken
- Provide correction and feedback ONLY for MISTAKE tokens
- For overall: SUCCESS if all content tokens correct, NEUTRAL if only minor issues, MISTAKE if any content token is wrong`;

  const evaluation = await ctx.hallucinate(prompt, TokenEvaluationSchema);

  // Merge evaluations back onto token data
  const evalMap = new Map((evaluation.tokens || []).map((e) => [e.index, e]));

  const tokenResults = contentTokens.map((token) => {
    const tokenEval = evalMap.get(token.index);
    return {
      ...token,
      signal: tokenEval?.signal || "SUCCESS",
      correction: tokenEval?.correction || null,
      feedback: tokenEval?.feedback || null,
    };
  });

  // Send per-literal review signals for tokens that map to known literals
  const literalReviews = tokenResults
    .filter((t) => t.literal)
    .map((t) => {
      const signal = t.signal === "NEUTRAL" ? "SUCCESS" : t.signal;
      return ctx.daemon.call("/review/literal", {
        signal,
        scope: { ...scope, literal: t.literal },
      });
    });

  // Send overall product review
  const productReview = ctx.daemon.call("/review/product", {
    signal: evaluation.overall.signal,
    scope,
  });

  await Promise.all([productReview, ...literalReviews]);

  return {
    overall: evaluation.overall,
    tokens: tokenResults,
  };
}
// const EvaluationSchema = {
//   type: "object",
//   properties: {
//     signal: {
//       type: "string",
//       enum: ["SUCCESS", "MISTAKE", "NEUTRAL"],
//       description:
//         "SUCCESS: correct translation. NEUTRAL: acceptable alternative. MISTAKE: any error.",
//     },
//     correction: {
//       type: ["string", "null"],
//       description: "The correct translation, only if the user made a mistake.",
//     },
//     feedback: {
//       type: ["string", "null"],
//       description:
//         "One concise sentence about what went wrong, only for MISTAKE.",
//     },
//   },
//   required: ["signal", "correction", "feedback"],
//   additionalProperties: false,
// };

// export default async function evaluate(input, ctx) {
//   const { translation, sentence, scope } = input;
//   const language = ctx.daemon.statics.language;

//   const prompt = buildPrompt({ translation, sentence, language });
//   const evaluation = await ctx.hallucinate(prompt, EvaluationSchema);

//   await ctx.daemon.call("/review/product", {
//     signal: evaluation.signal,
//     scope,
//   });

//   return evaluation;
// }

// function buildPrompt({ translation, sentence, language }) {
//   return `Evaluate a translation from ${language.known} to ${language.learning}.

// Original sentence: "${sentence.known}"
// Expected translation: "${sentence.learning}"
// User's translation: "${translation}"

// Rules:
// - Ignore capitalization differences
// - Ignore minor punctuation differences
// - SUCCESS: Correct translation matching the expected meaning
// - NEUTRAL: Acceptable alternative that conveys the same meaning with different but valid word choices
// - MISTAKE: Any grammatical error, wrong vocabulary, missing words, or meaning change
// - If MISTAKE, provide the correction and brief feedback
// - If SUCCESS or NEUTRAL, correction and feedback should be null`;
// }
