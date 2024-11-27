import { blacklist as Blacklist, shuffle } from "@vivalence/shared";

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

  // const prose = await games.prose.provision({
  //   constraints: proseConstraints({ aspect, leafs, language, tags }),
  //   scope: {
  //     aspect: { tag: { id: aspect.id } },
  //     leafs: { tags: leafs.map((leaf) => ({ id: leaf.id })) },
  //   },
  // });

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

  const instructions = [prose, ...translations];
  return instructions;
}

const prose = {
  instruction: {
    prose:
      '<p>In Spanish, nouns have a gender. This means that every noun is classified as either masculine or feminine. Understanding noun gender is important because it affects how we use adjectives and articles in sentences. For example, the word <strong>"libro"</strong> (book) is masculine, while <strong>"mesa"</strong> (table) is feminine.</p>\n\n<p>Here are some examples of masculine and feminine nouns:</p>\n<ul>\n  <li><strong>Masculine:</strong> <code>el perro</code> (the dog), <code>el coche</code> (the car), <code>el niño</code> (the boy)</li>\n  <li><strong>Feminine:</strong> <code>la gata</code> (the female cat), <code>la casa</code> (the house), <code>la niña</code> (the girl)</li>\n</ul>',
  },
  scope: {
    dependency: {
      id: "34de578b-985b-44f1-81a0-6d2ca43ea72c",
    },
    tactic: {
      id: "71c4ed7d-1a4a-4017-a794-01267d601e4b",
    },
    user: {
      id: "02cc2c18-aece-4132-9863-225e8ae5dad2",
    },
    game: {
      id: "636a8a9f-ba24-4500-be91-6bc21119f5b1",
    },
    aspect: {
      tag: {
        id: "0e8dacef-796e-4dcd-994d-3142c512d0f6",
      },
    },
    leafs: {
      tags: [
        {
          id: "0862498e-5a83-41a3-994a-9d00f638cf65",
        },
        {
          id: "d192bf8b-e0ce-41f5-a3e0-7bd86e44927b",
        },
      ],
    },
  },
  type: "GAME",
  game: {
    id: "636a8a9f-ba24-4500-be91-6bc21119f5b1",
    slug: "prose",
    url: "/r/eng2esp/g/prose",
    bundle: "http://localhost:5175/r/eng2esp/g/prose/bundle/game.svelte.js",
  },
};
