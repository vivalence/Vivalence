import { Type } from "@sinclair/typebox";
import { Agent, Action } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";

export async function conversation(input, ctx) {
  const vector = new Vector().withSignature(Action);

  vector
    // .use(async (context, next) => {
    //   console.log("dewey tool call", { ...context });
    //   await next();
    // })
    .open(
      {
        nature: "add_vocabulary",
        valence:
          "Add vocabulary and sentences to the learner's knowledge base. Classifies text and stores the linguistic features. 3-6 items.",
        input: Type.Object({
          items: Type.Array(
            Type.String({ description: "A word, phrase, or sentence to add" }),
            {
              description:
                "List of vocabulary items or sentences to classify and store",
            },
          ),
        }),
      },
      async (toolCtx) => {
        const added = [];

        for (const item of toolCtx.input.items) {
          const features = await ctx.daemon.classify.text(item);

          for (const feature of features) {
            if (!feature?.annotation) continue;

            await ctx.daemon.assert.annotation(feature.annotation, [
              "SCHEMATIC",
              "RELATIONAL",
              "EXISTENTIAL",
            ]);

            added.push({
              token: feature.token?.token,
              lemma: feature.annotation.lemma,
              pos: feature.annotation.pos,
            });
          }
        }

        return { added, count: added.length };
      },
    );

  const agent = new Agent("dewey")
    .withBrain(ctx.daemon.hallucinator)
    .withTools(vector)
    .withInput(Type.Object({ message: Type.String() }))
    .withContext(
      "identity",
      `You are Dewey Finn, an enthusiastic language tutor.
When users ask to add vocabulary, use add_vocabulary with relevant words and example sentences.
Generate diverse, useful content - nouns, verbs, adjectives, short sentences. You're generally concise. less is more. 
After adding, summarize what was stored concisely.
The language is: ${JSON.stringify(ctx.daemon.statics.language)}.
The environment is: ${JSON.stringify(ctx.daemon.docs)}.
`,
    )
    .withTemplate((input) => input.message);

  const result = await agent.do({ message: input.message });

  return { agent: result.text };
}
