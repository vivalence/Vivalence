import Mustache from "mustache";
const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const QueueProvisioningLock = new Map();

export default async ({ blacklist, strategyId, userId, locals }) => {
    if (QueueProvisioningLock.has(`${userId}-${strategyId}`)) {
        return { status: 202 };
    } else {
        QueueProvisioningLock.set(`${userId}-${strategyId}`, new Date());
        makeInstructions({ userId, blacklist, strategyId, locals });
        return { status: 202 };
    }
};

const makeInstructions = async ({ strategyId, blacklist, userId, locals: { get, supabase } }) => {
    const start = performance.now();

    try {
        // GET DATA
        const { data: strategy, error } = await supabase
            .from("Strategy")
            .select(`*, _StrategyToGame (Game: A (*)), _StrategyToTag (Tag: B (*))`)
            .eq("id", strategyId)
            .single();

        if (error) console.error(error);

        const tags = strategy._StrategyToTag.map((t) => t.Tag);
        const structuralTag = tags.find((g) => g.type.includes("STRUCTURAL"));
        const ontologicalTags = tags.filter((g) => g.type.includes("ONTOLOGICAL"));

        const games = strategy._StrategyToGame.map((g) => g.Game);
        const translationsGame = games.find((g) => g.type === "TRANSLATIONS");
        const flashcardsGame = games.find((g) => g.type === "FLASHCARDS");

        (
            await supabase
                .from("Queue")
                .select("data")
                .eq("strategyId", strategyId)
                .eq("userId", userId)
        ).data.map(({ data }) => data.payload.blacklist.forEach((id) => blacklist.push(id)));

        console.log("BLACKLIST queue", blacklist.length);

        // GET SENTENCE
        const units = [];
        for (const tag of ontologicalTags) {
            const response = await get("/api/units", {
                tagIds: [structuralTag.id, tag.id],
                gameId: translationsGame.id,
                blacklist,
                take: 3
            });
            if (response.error) console.error(response.error);
            else units.push(...response.data);
        }
        const language = { learning: "spanish", spoken: "english" };
        const { data: sentence } = await get(`/api/games/translations/generate`, {
            units,
            language,
            innerPrompt: translationsGame.data.innerPrompt.text
        });
        const { data: nlp } = await get(`/api/nlp`, { sentence: sentence.learning });
        const translationUnits = nlp.sentences[0].tokens
            .map((token) => token.unit)
            .filter((unit) => unit);

        translationUnits.forEach((unit) => blacklist.push(unit.id));

        // GET FLASHCARD
        const { data: flashcardUnits } = await get("/api/units", {
            tagIds: [structuralTag.id],
            gameId: flashcardsGame.id,
            blacklist,
            take: 1
        });

        // MAKE INSTRUCTIONS
        const instructions = [];
        for (const unit of flashcardUnits) {
            if (!unit) continue;
            instructions.push({
                type: "FLASHCARDS",
                instructions: applyMaskToFlashcard(flashcardsGame.data, unit),
                payload: {
                    blacklist: [unit.id],
                    gameId: flashcardsGame.id,
                    unitId: unit.id,
                    strategyId
                }
            });
        }

        for (const unit of translationUnits) {
            if (!unit) continue;
            instructions.push({
                type: "FLASHCARDS",
                instructions: applyMaskToFlashcard(flashcardsGame.data, unit),
                payload: {
                    blacklist: [unit.id],
                    gameId: flashcardsGame.id,
                    unitId: unit.id,
                    strategyId
                }
            });
        }
        instructions.push({
            type: "TRANSLATIONS",
            instructions: sentence,
            payload: {
                blacklist: translationUnits.map(({ id }) => id),
                gameId: translationsGame.id,
                unitIds: translationUnits.map(({ id }) => id),
                tokens: nlp.sentences[0].tokens,
                strategyId
            }
        });

        // PERSIST INSTRUCTIONS
        const insert = await supabase
            .from("Queue")
            .insert(instructions.map((data) => ({ userId, strategyId, data })));

        if (insert.error) throw insert.error;

        const end = performance.now();
        console.log(`PROVISIONING took seconds: ${(end - start) / 1000}`);
        console.log(`${instructions.length} instructions made`);
    } catch (error) {
        console.error(`[PROVISIONING ERROR]`, error.message);
        console.error(error);
    } finally {
        QueueProvisioningLock.delete(`${userId}-${strategyId}`);
    }
};

const applyMaskToFlashcard = (flashcardsMask, unit) => {
    const mask = flashcardsMask[unit.corpusType];
    const buildMaskData = new Function(`return ${mask.buildData}`)();
    const maskData = buildMaskData(unit);
    return {
        front: Mustache.render(mask["front"], maskData),
        back: Mustache.render(mask["back"], maskData)
    };
};
