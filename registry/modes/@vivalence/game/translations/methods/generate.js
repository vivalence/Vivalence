import { ProductionResult, Agent } from "@vivalence/typology";

export async function pending(input, ctx) {
  const { scope } = input;
  const language = ctx.daemon.statics.language;

  const [verb, noun, adj] = await Promise.all([
    ctx.daemon.call("/pick/literal/feed", input),
    ctx.daemon.call("/pick/literal/feed", input),
    ctx.daemon.call("/pick/literal/due", input),
  ]);

  // if (literals.length === 0) return await ungrounded(scope, ctx);

  //   const vocabulary = literals.map((lit) => ({
  //     id: lit.id,
  //     known: lit.data.known,
  //     learning: lit.data.learning,
  //     pos: lit.annotation?.pos || null,
  //     example: lit.data.example,
  //   }));

  //   const vocabLines = vocabulary
  //     .map(
  //       (v) =>
  //         `- ${language.learning}: "${v.learning}" — ${language.known}: "${v.known}"${v.pos ? ` [${v.pos}]` : ""}`,
  //     )
  //     .join("\n");

  //   const agent = new Agent("sentence-grounded")
  //     .withBrain(ctx.mode.brain)
  //     .withOutput(SentenceSchema)
  //     .enhance(
  //       `Generate one sentence pair for translation practice.
  // The learner's native language is ${language.known}. The target language is ${language.learning}.

  // The sentence MUST naturally incorporate vocabulary from this pool:
  // ${vocabLines}

  // Guidelines:
  // - Use as many of the listed words as fit naturally into a single sentence
  // - The sentence must be grammatically correct and sound natural in ${language.learning}
  // - Keep it to one clear sentence — no compounds, no run-ons
  // - Do not force vocabulary that creates an awkward or unnatural sentence
  // - Favor practical, everyday scenarios: daily routine, conversation, opinions, directions
  // - Vary between statements, questions, and negations across calls
  // - Complexity should match the vocabulary level provided

  // Produce the sentence in both languages.`,
  //     );

  //   const sentence = await agent.generate({});

  //   if (!sentence?.known || !sentence?.learning)
  //     return ProductionResult.cast.exhausted({
  //       reason: "generation returned empty sentence",
  //     });

  //   // Classify the generated sentence to get token-level structure
  //   const classified = await ctx.daemon.call("/classify/text", {
  //     text: sentence.learning,
  //   });

  //   const tokens = (classified || []).map((feature, index) => ({
  //     index,
  //     token: feature.token?.token ?? feature.token,
  //     start_char: feature.token?.start_char ?? feature.start_char,
  //     end_char: feature.token?.end_char ?? feature.end_char,
  //     literal: feature.literal?.id || null,
  //     known: feature.literal?.data?.known || null,
  //     pos: feature.annotation?.pos || null,
  //   }));

  //   const matchedLiterals = tokens.filter((t) => t.literal).map((t) => t.literal);

  //   return ProductionResult.cast.nominal({
  //     data: {
  //       sentence,
  //       tokens,
  //       sourceLiterals: vocabulary.map((v) => v.id),
  //     },
  //     scope: { ...scope, literals: matchedLiterals },
  //   });
}

// Fallback when no literals are available from the daemon
async function ungrounded(scope, ctx) {
  const language = ctx.daemon.statics.language;

  const agent = new Agent("sentence-ungrounded")
    .withBrain(ctx.mode.brain)
    .withOutput(SentenceSchema)
    .enhance(
      `Generate one sentence pair for translation practice.
The learner's native language is ${language.known}. The target language is ${language.learning}.

Guidelines:
- Use common, everyday vocabulary suitable for beginner to intermediate learners
- The sentence must be clear, natural, and something that could occur in conversation
- Keep it to a single sentence, not compound
- Vary between statements, questions, and negations
- Favor practical scenarios

Produce the sentence in both languages.`,
    );

  const sentence = await agent.generate({});

  if (!sentence?.known || !sentence?.learning)
    return ProductionResult.cast.exhausted({
      reason: "ungrounded generation returned empty sentence",
    });

  const classified = await ctx.daemon.call("/classify/text", {
    text: sentence.learning,
  });

  const tokens = (classified || []).map((feature, index) => ({
    index,
    token: feature.token?.token ?? feature.token,
    start_char: feature.token?.start_char ?? feature.start_char,
    end_char: feature.token?.end_char ?? feature.end_char,
    literal: feature.literal?.id || null,
    known: feature.literal?.data?.known || null,
    pos: feature.annotation?.pos || null,
  }));

  return ProductionResult.cast.nominal({
    data: { sentence, tokens, sourceLiterals: [] },
    scope: { ...scope, literals: tokens.filter((t) => t.literal).map((t) => t.literal) },
  });
}

const SentenceSchema = {
  type: "object",
  properties: {
    known: {
      type: "string",
      description: "Sentence in the learner's native language",
    },
    learning: {
      type: "string",
      description: "Sentence in the target language being learned",
    },
  },
  required: ["known", "learning"],
  additionalProperties: false,
};
// import { ProductionResult, Agent } from "@vivalence/typology";

// export async function pending(input, ctx) {
//   const { scope } = input;
//   const language = ctx.daemon.statics.language;

//   const agent = new Agent("dewey")
//     .withBrain(ctx.mode.brain)
//     .withOutput(SentenceSchema)
//     .enhance(
//       `Generate one sentence pair for translation practice.
// 	The learner's native language is ${language.known}. The target language is ${language.learning}.

// 	Guidelines:
// 	- Use common, everyday vocabulary suitable for beginner to intermediate learners
// 	- The sentence must be clear, natural, and something that could occur in conversation or writing
// 	- Keep it to a single sentence, not a compound
// 	- Vary between statements, questions, and negations
// 	- Favor practical scenarios: ordering food, asking directions, describing daily routine, expressing opinions

// 	Produce the sentence in both languages.`,
//     );

//   const result = await agent.hallucinate.object();

//   const sentence = await ctx.mode.brain.object(prompt, SentenceSchema);

//   if (!sentence?.known || !sentence?.learning)
//     return ProductionResult.cast.exhausted({
//       reason: "hallucination returned empty sentence",
//     });

//   return ProductionResult.cast.nominal({ data: { sentence }, scope });
// }

// const SentenceSchema = {
//   type: "object",
//   properties: {
//     known: {
//       type: "string",
//       description: "Sentence in the learner's native language",
//     },
//     learning: {
//       type: "string",
//       description: "Sentence in the target language being learned",
//     },
//   },
//   required: ["known", "learning"],
//   additionalProperties: false,
// };
