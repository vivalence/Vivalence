export default async ({ locals, strategy, context }) => {
    const instructions = [];

    const { blacklist, language } = context;

    const conjugationsGame = strategy.games.find((g) => g.type === "CONJUGATIONS");
    const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");
    const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");

    //
    // SCOPE
    //
    const verbTagIds = [
        // temporary hardcode
        "95c57480-2b9d-4617-8293-6b428f26a68e", // estar
        "bce30a11-51a0-4c46-8db0-ae8c12970c81", // ser
        "05a4c4ab-2c70-4e72-b5ca-cdb19a9b36d2", // haber
        "a813d3ba-ca1a-48ac-982b-8002403496df", // tener
        "660cd59b-cee3-4d57-8845-ce21f0d7518e", // hacer
        "33ba7fa1-2743-451f-afdc-c905e6f52847", // ir
        "d12a26e6-9b32-4da6-a5a8-7c126c6e0286", // saber
        "7b7da598-2253-474a-8342-a3363bed81c6", // decir
        "4786c606-85a4-416b-9d16-fbd26c0025e7", // poder
        "97ec1972-bdf0-49e1-86dc-1fd4bbc3fbd1", // dar
        "e46c9773-8fd0-4cfb-932a-be8e3ab80615" // ver
    ];
    const tenseTags = [
        "clrzb19mp0079g0m3badzek07" // present tense
    ];

    const { data: verbTags, error: verbError } = await locals.post("/api/tags/weakest", {
        tagIds: verbTagIds,
        blacklist: blacklist.tags,
        take: 1
    });
    if (verbError || !verbTags) throw verbError || new Error("No verb tag found.");
    const verbTag = verbTags[0];

    //
    // CONJUGATIONS
    //
    const { data: conjugations, error: conjugationsError } = await locals.post(
        "/api/games/conjugations/generate/fromTagIds",
        {
            tags: { verb: { id: verbTag.id }, tense: { id: tenseTags[0] } },
            gameId: conjugationsGame.id
        }
    );
    if (conjugationsError) throw conjugationsError;

    //
    // TRANSLATIONS
    //
    const { data, error: unitsError } = await locals.post("/api/units/weakest/fromTagIds", {
        tagIds: [verbTag.id, tenseTags[0]],
        blacklist,
        take: 1
    });
    if (unitsError) throw unitsError;
    const unit = data[0];

    const constraints = [];
    constraints.push(`VERB: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`);
    constraints.push(`NOUN: Don't use obvious nouns like 'estudiante'.`);
    constraints.push(`NOUN: Be more creative in your choice of noun.`);
    constraints.push(
        `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`
    );
    constraints.push(`GRAMMAR: Allways without the pronoun in spanish!`);

    const { data: translations, error: sentenceError } = await locals.post(
        `/api/games/translations/generate`,
        {
            language,
            constraints,
            gameId: translationsGame.id
        }
    );
    if (sentenceError) throw sentenceError;
    locals.scopeToBlacklist({ blacklist, scope: translations.scope });

    //
    // FLASHCARDS
    // from translation
    const { data: filteredTranslationUnits } = await locals.post("/api/memory/filter/units", {
        units: translations.scope.units,
        accept: ["UNKNOWN", "LEARNING"]
    });
    const { data: translationFlashcards } = await locals.post(
        "/api/games/flashcards/generate/fromUnitIds",
        {
            unitIds: filteredTranslationUnits.map((u) => u.id),
            gameId: flashcardsGame.id
        }
    );

    //
    // FLASHCARDS
    // from conjugation
    const { data: flashcardUnits } = await locals.post("/api/units/fromTagIds", {
        tagIds: [verbTag.id, tenseTags[0]],
        blacklist: blacklist.units
    });
    const { data: filteredFlashcardUnits } = await locals.post("/api/memory/filter/units", {
        units: flashcardUnits,
        accept: ["UNKNOWN", "LEARNING"]
    });
    let { data: flashcards, error: flashcardsError } = await locals.post(
        "/api/games/flashcards/generate/fromUnits",
        {
            units: filteredFlashcardUnits,
            gameId: flashcardsGame.id
        }
    );
    if (flashcardsError) throw flashcardsError;

    return [
        ...locals.shuffle([...flashcards, ...translationFlashcards]),
        conjugations,
        translations
    ];
};
