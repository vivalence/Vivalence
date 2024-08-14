export default async (inputs, runtime) => {
  const { language, tactic, strategy, scope, blacklist } = inputs;
  const { games, units, tags } = tactic.relations;

  const FLASHCARD_COUNT = 5;

  // // SCOPE //
  const [articleUnit] = await runtime.call("/units/weakest/fromTagIds", {
    tagIds: [tags.article.id],
    blacklist,
    take: 1,
  });

  const [numberTag] = await runtime.call("/tags/weakest", {
    tags: tactic.relations.tags.numbers,
    take: 1,
  });

  const [genderTag] = await runtime.call("/tags/weakest", {
    tags: tactic.relations.tags.genders,
    take: 1,
  });

  //
  // TRANSLATIONS
  //
  const constraints = [];
  constraints.push(`ARTICLE: "${articleUnit.data.learning} - ${articleUnit.data.known}"`);
  [genderTag, numberTag].forEach((tag) =>
    constraints.push(
      `inflection in agreement with: "${tag.data["ONTOLOGICAL"].branch}: ${tag.data["ONTOLOGICAL"].leaf}"`
    )
  );
  constraints.push(`LENGTH: "Between 4-7 words."`);

  for (const tag of tags.vocabulary) {
    const units = await runtime.call("/units/pending", {
      scope: { ...scope, game: { id: games.flashcards.id } },
      blacklist,
      tagIds: [tags.structural.id, tag.id],
      take: 4,
    });

    console.log(units[0], units.length);

    units.forEach((unit) => {
      constraints.push(
        `${tag.data["ONTOLOGICAL"].leaf}: "${unit.data.learning} - ${unit.data.known}"`
      );
    });
  }
  console.log("constraints", constraints);
  // console.log(JSON.stringify(tactic.relations.games, null, 2));

  // const flashcards = await games.flashcards.call("/provision/fromUnits", {units: articleUnits, scope,});
  // const translations = await games.translations.call(`/provision`, {constraints, language, scope,});

  // locals.scopeToBlacklist({ blacklist, scope: translations.scope });
};

const tmp = {
  games: {
    flashcards: {
      id: "8e77d3db-1d61-4980-8f86-cf5f6ec0b4dd",
      createdAt: "2024-07-25T12:45:54.748",
      updatedAt: "2024-07-25T12:45:54.748",
      name: "Flashcards",
      installed: true,
      version: "0.0.0",
      runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
      slug: "flashcards",
      mask: {
        back: "{{#back.header}}\n    <div class='header'>\n        {{{back.header}}}\n    </div>\n{{/back.header}}\n\n{{#back.content}}\n    <div class='content'>\n        {{{back.content}}}\n    </div>\n{{/back.content}}\n\n{{#back.footer}}\n    <div class='footer'>\n    {{{back.footer}}}\n    </div>\n{{/back.footer}}\n",
        front:
          "{{#front.header}}\n    <div class='header'>\n        {{{front.header}}}\n    </div>\n{{/front.header}}\n\n{{#front.content}}\n    <div class='content'>\n        {{{front.content}}}\n    </div>\n{{/front.content}}\n\n{{#front.footer}}\n    <div class='footer'>\n        {{{front.footer}}}\n    </div>\n{{/front.footer}}\n",
      },
    },
    translations: {
      error: "[object Object]",
    },
  },
  units: {},
  tags: {
    articles: {
      id: "clrzaz4z90009g0jsrf0yyiqu",
      createdAt: "2024-01-29T18:08:40.822",
      updatedAt: "2024-08-01T17:33:55.991",
      name: "Prontype: Articles",
      data: {
        STRUCTURAL: {},
        ONTOLOGICAL: {
          leaf: "art",
          branch: "prontype",
        },
      },
      runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
      traits: ["ONTOLOGICAL"],
      slug: "prontype:art",
    },
    structural: {
      id: "55bdcbd6-fd42-41dd-8014-79668ae6fd07",
      createdAt: "2024-03-02T14:36:22.984",
      updatedAt: "2024-08-01T17:33:55.99",
      name: "A1",
      data: {
        STRUCTURAL: {},
      },
      runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
      traits: ["STRUCTURAL"],
      slug: "structural:a1",
    },
    vocabulary: [
      {
        id: "clpwfwow30008g0n1iruvb7un",
        createdAt: "2023-12-08T08:44:01.539",
        updatedAt: "2024-08-01T17:33:55.991",
        name: "Noun",
        data: {
          ONTOLOGICAL: {
            leaf: "noun",
            branch: "pos",
          },
        },
        runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
        traits: ["ONTOLOGICAL"],
        slug: "pos:noun",
      },
      {
        id: "clpwfwoax0000g0n1wrtqt6q1",
        createdAt: "2023-12-08T08:44:00.777",
        updatedAt: "2024-08-01T17:33:55.99",
        name: "Adjectives",
        data: {
          ONTOLOGICAL: {
            leaf: "adj",
            branch: "pos",
          },
        },
        runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
        traits: ["ONTOLOGICAL"],
        slug: "pos:adj",
      },
    ],
  },
};

// //
// // FLASHCARDS
// //
// const filteredTranslationUnits = await locals
//     .client("memory/filter/units", {
//         units: translations.scope.units,
//         accept: ["UNKNOWN", "LEARNING"]
//     })
//     .ok();

// const flashcardUnits = [];
// for (const tag of vocabularyTags) {
//     const units = await locals
//         .client("units/pending", {
//             gameId: flashcardsGame.id,
//             tagIds: [structuralTag.id, tag.id],
//             blacklist: blacklist.units,
//             take: Math.round((FLASHCARD_COUNT - filteredTranslationUnits.length) / 2)
//         })
//         .ok();
//     flashcardUnits.push(...units);
// }

// const flashcards = await locals
//     .ontology("games/flashcards/generate/fromUnitIds", {
//         unitIds: [...filteredTranslationUnits, ...flashcardUnits].map((u) => u.id),
//         gameId: flashcardsGame.id
//     })
//     .ok();

// return [...locals.shuffle(flashcards), translations];
