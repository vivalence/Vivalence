import { blacklist as Blacklist, shuffle } from "@vivalence/shared";

export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;
  const language = ctx.runtime.statics.language;

  const [aspect] = await ctx.runtime.call("/memory/filter/tags/byStatus", {
    status: tactic.masks.aspects.memory.accept,
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

  const prose = await games.prose.call("/provision", {
    constraints: proseConstraints({ aspect, leafs, language, tags }),
    scope: { tags: [{ id: aspect.id }] },
  });

  const constraints = [
    `The grammatical concept and examples are provided in this prose: ${JSON.stringify(prose.instruction.prose)} `,
    "the vocabulary of the sentence should be extracted from the prose examples.",
    "extract accurately, without adding vocabulary thats not in the prose. this is first contact.",
    "conceptual example: 'x es masculino.' or 'y es femenino.'",
    "limit the vocabulary to whats used in the prose.",
    "very simple and concise 2 or 3 word phrases or statements.",
  ];

  const translations = await games.translations
    .call("/provision", { constraints })
    .then(async (translations) => {
      constraints.push(
        `We already have one sentence. The first sentence is: ${JSON.stringify(translations)}`,
        "extract a different, second sentence from the prose.",
        "highlight a different aspect in the second sentence.",
      );
      return [translations, await games.translations.call("/provision", { constraints })];
    });
  const instructions = [prose, ...translations];

  return instructions;
}

function proseConstraints({ aspect, leafs, language, tags }) {
  return [
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
  ];
}
