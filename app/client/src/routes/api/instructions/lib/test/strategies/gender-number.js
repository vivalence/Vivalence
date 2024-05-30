export default async ({ locals, strategy, context }) => {
    const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");
    const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");
    const { blacklist, language } = context;

    //
    // SCOPE
    //
    const FLASHCARD_COUNT = 4;

    const structuralTag = strategy.tags.find((t) => t.type.includes("STRUCTURAL"));
    const learnableTags = strategy.tags.filter((t) => t.type.includes("LEARNABLE"));
    const vocabularyTags = strategy.tags.filter(
        (t) =>
            t.type.includes("ONTOLOGICAL") &&
            ["upos"].includes(t.data["ONTOLOGICAL"].branch) &&
            ["NOUN", "ADJ"].includes(t.data["ONTOLOGICAL"].leaf)
    );

    const { data: articleUnits, error: unitsError } = await locals.post(
        "/api/units/weakest/fromUnitIds",
        {
            unitIds: strategy.units.map((u) => u.id),
            take: 1
        }
    );
    if (unitsError || !articleUnits) throw unitsError || new Error("No article units found.");
    const articleUnit = articleUnits[0];

    const { data: numberTags, error: numberError } = await locals.post("/api/tags/weakest", {
        tagIds: learnableTags
            .filter((t) => t.data["ONTOLOGICAL"].branch === "Number")
            .map((t) => t.id),
        take: 1
    });
    if (numberError || !numberTags) throw numberError || new Error("No number tags found.");
    const numberTag = numberTags[0];

    const { data: genderTags, error: genderError } = await locals.post("/api/tags/weakest", {
        tagIds: learnableTags
            .filter((t) => t.data["ONTOLOGICAL"].branch === "Gender")
            .map((t) => t.id),
        take: 1
    });
    if (genderError || !genderTags) throw genderError || new Error("No gender tags found.");
    const genderTag = genderTags[0];

    //
    // TRANSLATIONS
    //
    const constraints = [];
    constraints.push(
        `ARTICLE: ${articleUnit.data[language.learning]} - ${articleUnit.data[language.spoken]}`
    );
    [genderTag, numberTag].forEach((tag) =>
        constraints.push(`${tag.data["ONTOLOGICAL"].branch}: ${tag.data["ONTOLOGICAL"].leaf}`)
    );

    for (const tag of vocabularyTags) {
        const { data: units, error } = await locals.post("/api/units/fromTagIds", {
            tagIds: [structuralTag.id, tag.id],
            blacklist: blacklist.units,
            take: 5
        });
        if (error) throw error;
        units.forEach((unit) => {
            constraints.push(
                `${tag.data["ONTOLOGICAL"].leaf}: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`
            );
        });
    }

    const { data: translations, error: translationsError } = await locals.post(
        `/api/games/translations/generate`,
        {
            constraints,
            language,
            gameId: translationsGame.id
        }
    );
    if (translationsError) throw translationsError;

    //
    // FLASHCARDS
    //
    // const { data: flashcards, error: flashcardsError } = await locals.post(
    //     "/api/games/flashcards/generate/fromUnitIds",
    //     {
    //         gameId: flashcardsGame.id,
    //         unitIds: translations.scope.units.map((u) => u.id)
    //     }
    // );
    // if (flashcardsError) throw flashcardsError;
    const { data: filteredTranslationUnits } = await locals.post("/api/memory/filter/units", {
        units: translations.scope.units,
        accept: ["UNKNOWN", "LEARNING"]
    });
    const { data: flashcards } = await locals.post("/api/games/flashcards/generate/fromUnitIds", {
        unitIds: filteredTranslationUnits.map((u) => u.id),
        gameId: flashcardsGame.id
    });

    return [...locals.shuffle(flashcards), translations];
};
