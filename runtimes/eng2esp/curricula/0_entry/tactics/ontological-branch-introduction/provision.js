import { blacklist as Blacklist, shuffle } from "@vivalence/shared";

const dummyInstructions = [
  {
    instruction: {
      front: {
        // "    <div class='header'>\n        <h2>the<h2>\n    </div>\n\n    <div class='content'>\n        <p>The girls sing.<p>\n    </div>\n\n",
        header: "the",
        content: "the girls sing",
        footer: null,
      },
      back: {
        // "    <div class='header'>\n        <h2>las<h2>\n    </div>\n\n    <div class='content'>\n        <p>Las niñas cantan. <p>\n    </div>\n\n",
        header: "las",
        content: "las niñas cantan",
      },
    },
    scope: {
      user: {
        id: "02cc2c18-aece-4132-9863-225e8ae5dad2",
      },
      game: {
        id: "5ef2ee19-0558-4c73-aa48-c99d449bcd5a",
      },
      unit: {
        id: "e0587beb-6ec8-4e5c-9a3a-adc666e6bb08",
      },
    },
    type: "GAME",
    game: {
      id: "5ef2ee19-0558-4c73-aa48-c99d449bcd5a",
      slug: "flashcards",
      url: "/r/eng2esp/g/flashcards",
      bundle: "http://localhost:5175/r/eng2esp/g/flashcards/bundle/game.svelte.js",
    },
  },
  {
    instruction: {
      prose:
        "<h1>Understanding Nouns in Spanish: Gender</h1>\n<p>In Spanish, nouns are words that name people, places, things, or ideas. One important aspect of nouns in Spanish is gender. Nouns can be either <strong>feminine</strong> or <strong>masculine</strong>. This means that every noun is assigned a gender, which affects how we use other words with it, like articles and adjectives.</p>\n<h2>Feminine and Masculine Nouns</h2>\n<p>Feminine nouns usually end in <em>-a</em>, while masculine nouns often end in <em>-o</em>. Here are some examples:</p>\n<ul>\n    <li><strong>Feminine:</strong> <em>la casa</em> (the house), <em>la mesa</em> (the table)</li>\n    <li><strong>Masculine:</strong> <em>el perro</em> (the dog), <em>el libro</em> (the book)</li>\n</ul>\n<p>Remember, the gender of the noun affects the articles. Use <em>la</em> for feminine and <em>el</em> for masculine nouns.</p>",
    },
    scope: {
      dependency: {
        tag: {
          id: "8d5025c5-864d-40c3-b3fb-1d8468d7b91d",
        },
      },
      user: {
        id: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
      },
      tactic: {
        id: "7aca2532-7c13-45e7-8639-341e46816c3b",
      },
      game: {
        id: "1477e30f-4c70-4e93-9f97-5ed3ffffaa08",
      },
      aspect: {
        tag: {
          id: "a2db7b46-3537-4297-8b2e-fdec097a9ad5",
        },
      },
      leafs: {
        tags: [
          {
            id: "0fcab578-ef82-4958-a1a7-6f5ab2fab364",
          },
          {
            id: "3e05cf68-9e1b-4bbd-94d9-253004ac3e20",
          },
        ],
      },
    },
    type: "GAME",
    game: {
      id: "1477e30f-4c70-4e93-9f97-5ed3ffffaa08",
      slug: "prose",
      url: "/r/eng2esp/g/prose",
      bundle: "http://localhost:5175/r/eng2esp/g/prose/bundle/Prose.svelte",
    },
  },
  {
    instruction: {
      sentence: {
        known: "The house is feminine.",
        learning: "La casa es femenina.",
      },
      tokens: [
        {
          token: "La",
          start_char: 0,
          end_char: 2,
        },
        {
          token: "casa",
          start_char: 3,
          end_char: 7,
        },
        {
          token: "es",
          start_char: 8,
          end_char: 10,
        },
        {
          token: "femenina",
          start_char: 11,
          end_char: 19,
        },
        {
          token: ".",
          start_char: 19,
          end_char: 20,
        },
      ],
    },
    scope: {
      dependency: {
        tag: {
          id: "8d5025c5-864d-40c3-b3fb-1d8468d7b91d",
        },
      },
      user: {
        id: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
      },
      tactic: {
        id: "7aca2532-7c13-45e7-8639-341e46816c3b",
      },
      game: {
        id: "deeb866e-5fd1-4b52-a0ac-62191daaff28",
      },
      units: [
        {
          id: "a2bc4b0b-dc6e-4b46-8002-ab29c8519664",
          tags: [
            {
              id: "822dfeb7-7d24-44a9-8925-d5fe8ad537a5",
            },
            {
              id: "0fcab578-ef82-4958-a1a7-6f5ab2fab364",
            },
            {
              id: "56034f0b-725c-4b3c-ba79-20feb44a1d95",
            },
            {
              id: "5b120d56-49bd-4afb-8e6e-9fc8fd912d61",
            },
            {
              id: "3cc6bd7e-359b-4f1d-80e4-9facabe1123a",
            },
          ],
        },
        {
          id: "2dec7457-a43d-44c2-b0dc-cbf50a476342",
          tags: [
            {
              id: "2fa9c237-7d4d-4fdd-a295-28012d72eb97",
            },
            {
              id: "0fcab578-ef82-4958-a1a7-6f5ab2fab364",
            },
            {
              id: "3cc6bd7e-359b-4f1d-80e4-9facabe1123a",
            },
          ],
        },
      ],
      tags: [
        {
          id: "822dfeb7-7d24-44a9-8925-d5fe8ad537a5",
        },
        {
          id: "0fcab578-ef82-4958-a1a7-6f5ab2fab364",
        },
        {
          id: "56034f0b-725c-4b3c-ba79-20feb44a1d95",
        },
        {
          id: "5b120d56-49bd-4afb-8e6e-9fc8fd912d61",
        },
        {
          id: "3cc6bd7e-359b-4f1d-80e4-9facabe1123a",
        },
        {
          id: "2fa9c237-7d4d-4fdd-a295-28012d72eb97",
        },
      ],
    },
    type: "GAME",
    game: {
      id: "deeb866e-5fd1-4b52-a0ac-62191daaff28",
      slug: "translations",
      url: "/r/eng2esp/g/translations",
      bundle: "http://localhost:5175/r/eng2esp/g/translations/bundle/Translations.svelte",
    },
  },
  {
    instruction: {
      sentence: {
        known: "The dog is masculine.",
        learning: "El perro es masculino.",
      },
      tokens: [
        {
          token: "El",
          start_char: 0,
          end_char: 2,
        },
        {
          token: "perro",
          start_char: 3,
          end_char: 8,
        },
        {
          token: "es",
          start_char: 9,
          end_char: 11,
        },
        {
          token: "masculino",
          start_char: 12,
          end_char: 21,
        },
        {
          token: ".",
          start_char: 21,
          end_char: 22,
        },
      ],
    },
    scope: {
      dependency: {
        tag: {
          id: "8d5025c5-864d-40c3-b3fb-1d8468d7b91d",
        },
      },
      user: {
        id: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
      },
      tactic: {
        id: "7aca2532-7c13-45e7-8639-341e46816c3b",
      },
      game: {
        id: "deeb866e-5fd1-4b52-a0ac-62191daaff28",
      },
      units: [
        {
          id: "3fe18999-f8e7-455a-945b-9e9154f741e8",
          tags: [
            {
              id: "822dfeb7-7d24-44a9-8925-d5fe8ad537a5",
            },
            {
              id: "56034f0b-725c-4b3c-ba79-20feb44a1d95",
            },
            {
              id: "3e05cf68-9e1b-4bbd-94d9-253004ac3e20",
            },
            {
              id: "5b120d56-49bd-4afb-8e6e-9fc8fd912d61",
            },
            {
              id: "3cc6bd7e-359b-4f1d-80e4-9facabe1123a",
            },
          ],
        },
      ],
      tags: [
        {
          id: "822dfeb7-7d24-44a9-8925-d5fe8ad537a5",
        },
        {
          id: "56034f0b-725c-4b3c-ba79-20feb44a1d95",
        },
        {
          id: "3e05cf68-9e1b-4bbd-94d9-253004ac3e20",
        },
        {
          id: "5b120d56-49bd-4afb-8e6e-9fc8fd912d61",
        },
        {
          id: "3cc6bd7e-359b-4f1d-80e4-9facabe1123a",
        },
      ],
    },
    type: "GAME",
    game: {
      id: "deeb866e-5fd1-4b52-a0ac-62191daaff28",
      slug: "translations",
      url: "/r/eng2esp/g/translations",
      bundle: "http://localhost:5175/r/eng2esp/g/translations/bundle/Translations.svelte",
    },
  },
];

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
  return [dummyInstructions[0]];
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;
  const language = ctx.runtime.statics.language;

  const [aspect] = await ctx.runtime.call("/memory/filter/tags/byStatus", {
    status: tactic.masks.aspect.memory.accept,
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
    constraints: proseConstraints({ aspect, leafs, language, tags }),
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

  const instructions = [prose, ...translations];
  return instructions;
}
