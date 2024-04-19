async ({ locals, strategy, context }) => {
    const FLASHCARD_COUNT = 4;
    const translationsGame = strategy.Games.find((g) => g.type === "TRANSLATIONS");
    const flashcardsGame = strategy.Games.find((g) => g.type === "FLASHCARDS");

    const articleUnits = strategy.Units;

    const structuralTag = strategy.Tags.find((t) => t.type.includes("STRUCTURAL"));
    const learnableTags = strategy.Tags.filter((t) => t.type.includes("LEARNABLE"));
    const vocabularyTags = strategy.Tags.filter(
        (t) =>
            t.type.includes("ONTOLOGICAL") &&
            ["upos"].includes(t.data["ONTOLOGICAL"].branch) &&
            ["NOUN", "ADJ"].includes(t.data["ONTOLOGICAL"].leaf)
    );

    // GET UNIT / TAG with the weakest MEMORY, prioritizing no memory.
    let articleUnit = articleUnits.find((u) => !u.Memory || u.Memory.length === 0);
    if (!articleUnit) {
        articleUnit = articleUnits.reduce((a, b) =>
            a.Memory.strength > b.Memory.strength ? a : b
        );
    }

    const numberTags = learnableTags
        .filter((t) => t.data["ONTOLOGICAL"].branch === "Number")
        .map((t) => {
            t.Memory = t.Memory.find((m) => articleUnit.id === m.Unit.id);
            return t;
        });

    const genderTags = learnableTags
        .filter((t) => t.data["ONTOLOGICAL"].branch === "Gender")
        .map((t) => {
            t.Memory = t.Memory.find((m) => articleUnit.id === m.Unit.id);
            return t;
        });

    let numberTag = numberTags.find((t) => !t.Memory || t.Memory.length === 0);
    let genderTag = genderTags.find((t) => !t.Memory || t.Memory.length === 0);

    if (!numberTag) {
        numberTag = numberTags.reduce((a, b) => (a.Memory.strength > b.Memory.strength ? a : b));
    }
    if (!genderTag) {
        genderTag = genderTags.reduce((a, b) => (a.Memory.strength > b.Memory.strength ? a : b));
    }

    // GET SENTENCE
    const units = [];
    for (const tag of vocabularyTags) {
        const response = await locals.get("/api/units", {
            tagIds: [structuralTag.id, tag.id],
            gameId: translationsGame.id,
            blacklist: context.blacklist.units,
            take: 5
        });
        if (response.error) console.error(response.error);
        else {
            response.data.forEach((unit) => {
                unit.data["type"] = tag.data["ONTOLOGICAL"].leaf;
            });
            units.push(...response.data);
        }
    }

    const lang = context.language;
    const constraints = [];
    constraints.push(
        `ARTICLE: ${articleUnit.data[lang.learning]} - ${articleUnit.data[lang.spoken]}`
    );
    [genderTag, numberTag].forEach((tag) =>
        constraints.push(`${tag.data["ONTOLOGICAL"].branch}: ${tag.data["ONTOLOGICAL"].leaf}`)
    );

    constraints.push(
        ...units.map(({ data }) => `${data["type"]}: ${data[lang.learning]} - ${data[lang.spoken]}`)
    );

    const { data: sentence, error: sentenceError } = await locals.get(
        `/api/games/translations/generate`,
        {
            constraints,
            language: context.language,
            innerPrompt: translationsGame.data.innerPrompt.text
        }
    );
    if (sentenceError) throw sentenceError;

    const { data: nlp } = await locals.get(`/api/nlp`, { sentence: sentence.learning });

    const translationTokens = nlp.sentences[0].tokens
        .filter((token) => token.unit)
        .filter((token) => {
            if (!token.unit.Memory) return true;
            return ["LEARNING", "UNKNOWN"].includes(token.unit.Memory.status);
        });
    translationTokens.forEach((token) => context.blacklist.units.push(token.unit.id));

    // GET FLASHCARD
    const { data: flashcardUnits } = await locals.get("/api/units", {
        tagIds: [structuralTag.id],
        gameId: flashcardsGame.id,
        blacklist: context.blacklist.units,
        take: FLASHCARD_COUNT
    });

    // // MAKE INSTRUCTIONS
    const instructions = [];

    const maskFlashcards = (flashcardsMask, { data, ...unit }) => {
        const mask = flashcardsMask[unit.corpusType];
        const isNoun = data.ud.upos === "NOUN";
        const { Gender, Number } = data.ud.feats;
        const article = isNoun ? (["Fem", "Feminine"].includes(Gender) ? "La " : "El ") : "";
        const frontFooter = [Gender, Number].filter((f) => f).join(" - ");
        const maskData = {
            front: {
                header: `<h2>${data.english}<h2>`,
                content: `<p>${data.usageInEnglish}<p>`,
                footer: `<h5>${frontFooter}</h5>`
            },
            back: {
                header: `<h2>${article}${data.spanish}<h2>`,
                content: `<p>${data.usageInSpanish}<p>`
            }
        };

        return {
            front: locals.Mustache.render(mask["front"], maskData),
            back: locals.Mustache.render(mask["back"], maskData)
        };
    };

    for (const unit of flashcardUnits) {
        if (!unit) continue;
        instructions.push({
            type: "FLASHCARDS",
            instruction: maskFlashcards(flashcardsGame.data, unit),
            blacklist: { units: [unit.id], tags: [] },
            payload: {
                source: "UNIT",
                corpusType: unit.corpusType,
                gameId: flashcardsGame.id,
                unitId: unit.id,
                strategyId: context.strategyId
            }
        });
    }

    for (const token of translationTokens) {
        instructions.unshift({
            type: "FLASHCARDS",
            instruction: maskFlashcards(flashcardsGame.data, {
                ...token.unit,
                data: {
                    ...token.unit.data,
                    spanish: token.token,
                    ud: token
                }
            }),
            blacklist: { units: [token.unit.id], tags: [] },
            payload: {
                corpusType: token.unit.corpusType,
                source: "TOKEN",
                token: token,
                gameId: flashcardsGame.id,
                unitId: token.unit.id,
                strategyId: context.strategyId
            }
        });
    }
    locals.shuffle(instructions);
    instructions.push({
        type: "TRANSLATIONS",
        instruction: sentence,
        blacklist: { units: translationTokens.map(({ unit }) => unit.id), tags: [] },
        payload: {
            gameId: translationsGame.id,
            unitIds: translationTokens.map(({ unit }) => unit.id),
            tokens: nlp.sentences[0].tokens,
            strategyId: context.strategyId
        }
    });

    // console.log("instructions", JSON.stringify(instructions, null, 2));
    return instructions;
};
