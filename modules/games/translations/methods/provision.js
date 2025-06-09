import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";

const ProvisionInput = Type.Object({
  constraints: Type.Array(Type.String(), {
    description:
      "Array of constraints that the generated sentence must satisfy",
  }),
  mask: Type.Object({
    goal: Type.String({
      description: "The learning objective for the sentence generation",
    }),
  }),
});

const ProvisionOutput = Type.Object({
  sentence: Type.Object({
    known: Type.String({
      description: "Sentence in the learner's native language",
    }),
    learning: Type.String({
      description: "Sentence in the target language being learned",
    }),
  }),
});

export default async function provision(inputs, ctx) {
  const agent = new Agent("translations-provision")
    .withBrain(ctx.runtime.services.brain)
    .withInput(ProvisionInput)
    .withOutput(ProvisionOutput);

  agent.enhance(`### Task
	Generate one educational sentence pair for translation practice.
	The sentence must satisfy all provided constraints and achieve the specified learning goal.
	Focus on creating realistic, useful sentences that a language learner would encounter.`)
    .enhance(`### Sentence Quality Guidelines
	- Use vocabulary appropriate for the learner's level
	- Create sentences that are semantically correct and natural
	- Ensure the sentence would reasonably occur in conversation or writing
	- Keep sentences clear and unambiguous for learning purposes
	- Match the complexity level indicated by the constraints`)
    .enhance(`### Language Context
	Native Language: ${ctx.runtime.statics.language.known}
	Target Language: ${ctx.runtime.statics.language.learning}
	Generate content that helps bridge these two languages effectively.`);

  const result = await agent.generate(inputs);

  const features = await ctx.runtime.classify.text({
    text: result.sentence.learning,
  });

  const instruction = {
    instruction: {
      sentence: result.sentence,
      tokens: features
        .map((feature) => ({
          token: feature.token.token,
          start_char: feature.token.start_char,
          end_char: feature.token.end_char,
        }))
        .sort((a, b) => a.start_char - b.start_char),
    },
    scope: {
      ...inputs.scope,
      units: features.tokens
        .filter((t) => !!t.unit)
        .map((token) => ({
          id: token.unit.id,
          tags: token.unit.tags.map(({ id }) => ({ id })),
        })),
      tags: Array.from(
        features.reduce((acc, feature) => {
          feature.token.unit?.tags?.forEach(({ id }) => {
            if (!acc.has(id)) acc.add(id);
          });
          return acc;
        }, new Set()),
      ).map((id) => ({ id })),
    },
  };

  return [instruction];
}
