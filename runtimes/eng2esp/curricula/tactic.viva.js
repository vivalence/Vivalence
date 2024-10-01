import { blacklist as Blacklist, shuffle } from "@vivalence/shared";

async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;
  const language = ctx.runtime.statics.language;

  const [aspect] = await ctx.runtime.call("/memory/filter/tags", {
    accept: tactic.masks.aspect.accept,
    tags: tags.aspects,
    take: 1,
    blacklist,
  });

  if (!aspect) {
    return [{ type: "SIGNAL", signal: "COMPLETED" }];
  }

  const leafs = await ctx.runtime.call("/tags/fromOntology", {
    ...aspect.data.ONTOLOGICAL,
    leaf: "*",
  });

  const prose = await games.prose.provision({
    constraints: [
      `The learner's native language is ${language.known} and the target language being learned is ${language.learning}.`,
      `The grammatical feature to be explained is:
${tags.root.name}${tags.root.description ? ". " + tags.root.description : ""}
universal dependencies annotation: ${JSON.stringify(tags.root.data)}

The specific aspect of ${tags.root.name} to be focused on is this branch:
${aspect.name}${aspect.description ? ". " + aspect.description : ""}
UD: ${JSON.stringify(aspect.data)}

Cover the following leafs of ${aspect.name}:
${leafs.map((leaf) => leaf.name).join(", ")}.`,
      "Use clear, simple explanations suitable for absolute beginners.",
      "Provide 3-5 examples for the concept introduced.",
      "Around 150 words or 2 paragraphs.",
    ],
    scope: {
      aspect: { tag: { id: aspect.id } },
      leafs: { tags: leafs.map((leaf) => ({ id: leaf.id })) },
    },
  });

  const constraints = [
    `The grammatical concept and examples are provided in this prose: ${JSON.stringify(prose.instruction.prose)} `,
    "the sentence should be extracted from the prose examples.",
    "extract accurately, without adding vocabulary thats not in the prose. this is first contact.",
    "conceptual example: 'x es masculino.' or 'y es femenino.'",
    "limit the vocabulary to whats used in the prose.",
  ];

  const translations = await games.translations
    .provision({ constraints })
    .then(async (translations) => {
      constraints.push(
        `We already have one sentence. The first sentence is: ${JSON.stringify(translations)}`,
        "extract a different, second sentence from the prose.",
        "highlight a different aspect in the second sentence.",
      );
      return [translations, await games.translations.provision({ constraints })];
    });

  return [prose, ...translations];
}

const tactic = {
  relations: {
    tags: {
      aspects: [],
    },
    games: {
      prose: { slug: "prose" },
      translations: { slug: "translations" },
    },
  },
  masks: {
    aspect: { accept: [null] },
    prose: {
      prompt: {
        goal: `The reader is a language learner that is introduced to a grammatical concept.
Generate clear, beginner-friendly language learning content explaining a specific grammatical feature.
Use simple language, plenty of examples, and visual aids (using HTML and Tailwind Typography's .prose elements) to illustrate the concept.
Assume the reader is an absolute beginner encountering this grammatical aspect for the first time.
Include examples to reinforce understanding.`,
      },
    },

    translations: {
      prompt: {
        goal: `
You're given an explanation of a grammatical concept, that includes examples.
Your task is to extract an example sentence from the explanation.
The goal is for the user to translate that sentence for practice.

1. Extract a sentence from the explanation that demonstrates the concept. 
2. Use simple, everyday vocabulary suitable for the learner's level.
3. The sentence should be clear, concise, and make sense in conversation or writing.
4. Ensure the sentence untilizes correct grammar and vocabulary.
`,
      },
    },
  },
};

const manifest = {
  type: "Tactic",
  name: "Grammar Branch Introduction",
  slug: "ontological-branch-introduction",
  version: "0.0.6",
  description: "",
};

export { manifest, tactic, provision };
