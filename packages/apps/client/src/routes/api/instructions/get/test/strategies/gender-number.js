export default async ({ locals, strategy, context }) => {
    const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");
    const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");
    const { blacklist, language } = context;

    //
    // SCOPE
    //
    const FLASHCARD_COUNT = 5;

    const structuralTag = strategy.tags.find((t) => t.type.includes("STRUCTURAL"));
    const learnableTags = strategy.tags.filter((t) => t.type.includes("LEARNABLE"));
    const vocabularyTags = strategy.tags.filter(
        (t) =>
            t.type.includes("ONTOLOGICAL") &&
            ["pos"].includes(t.data["ONTOLOGICAL"].branch) &&
            ["noun", "adj"].includes(t.data["ONTOLOGICAL"].leaf)
    );

    const articleUnit = await locals
        .client("units/weakest/fromUnitIds", {
            unitIds: strategy.units.map((u) => u.id),
            take: 1
        })
        .single();

    const numberTag = await locals
        .client("tags/weakest", {
            tagIds: learnableTags
                .filter((t) => t.data["ONTOLOGICAL"].branch === "number")
                .map((t) => t.id),
            take: 1
        })
        .single();

    const genderTag = await locals
        .client("tags/weakest", {
            tagIds: learnableTags
                .filter((t) => t.data["ONTOLOGICAL"].branch === "gender")
                .map((t) => t.id),
            take: 1
        })
        .single();

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
    constraints.push(`LENGTH: between 4-7 words.`);

    for (const tag of vocabularyTags) {
        const units = await locals
            .client("units/pending", {
                gameId: translationsGame.id,
                tagIds: [structuralTag.id, tag.id],
                blacklist: blacklist.units,
                take: 4
            })
            .ok();
        units.forEach((unit) => {
            constraints.push(
                `${tag.data["ONTOLOGICAL"].leaf}: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`
            );
        });
    }

    const translations = await locals
        .ontology(`games/translations/generate`, {
            constraints,
            language,
            gameId: translationsGame.id
        })
        .ok();

    locals.scopeToBlacklist({ blacklist, scope: translations.scope });

    //
    // FLASHCARDS
    //
    const filteredTranslationUnits = await locals
        .client("memory/filter/units", {
            units: translations.scope.units,
            accept: ["UNKNOWN", "LEARNING"]
        })
        .ok();

    const flashcardUnits = [];
    for (const tag of vocabularyTags) {
        const units = await locals
            .client("units/pending", {
                gameId: flashcardsGame.id,
                tagIds: [structuralTag.id, tag.id],
                blacklist: blacklist.units,
                take: Math.round((FLASHCARD_COUNT - filteredTranslationUnits.length) / 2)
            })
            .ok();
        flashcardUnits.push(...units);
    }

    const flashcards = await locals
        .ontology("games/flashcards/generate/fromUnitIds", {
            unitIds: [...filteredTranslationUnits, ...flashcardUnits].map((u) => u.id),
            gameId: flashcardsGame.id
        })
        .ok();

    return [...locals.shuffle(flashcards), translations];
};
