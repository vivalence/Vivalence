import verbs from "./verb-conjugation.js"; // caab159c-8689-4812-9b16-5f0bec7e7530
import gender from "./gender-number.js"; // "strategyId": "169f6e56-0f30-4d3e-9298-d4a1faca14b0",

export default verbs;
// export default verbs;

// const articleUnits = strategy.Units;
// const structuralTag = strategy.Tags.find((t) => t.type.includes("STRUCTURAL"));
// const learnableTags = strategy.Tags.filter((t) => t.type.includes("LEARNABLE"));

// const vocabularyTags = strategy.Tags.filter(
//     (t) =>
//         t.type.includes("ONTOLOGICAL") &&
//         ["upos"].includes(t.data["ONTOLOGICAL"].branch) &&
//         ["NOUN", "ADJ"].includes(t.data["ONTOLOGICAL"].leaf)
// );

// // GET UNIT / TAG with the weakest MEMORY, prioritizing no memory.
// let articleUnit = articleUnits.find((u) => !u.Memory);
// if (!articleUnit) {
//     articleUnit = articleUnits.reduce((a, b) =>
//         a.Memory.strength < b.Memory.strength ? a : b
//     );
// }

// const numberTags = learnableTags
//     .filter((t) => t.data["ONTOLOGICAL"].branch === "Number")
//     .map((t) => {
//         t.Memory = t.Memory.find((m) => articleUnit.id === m.Unit.id);
//         return t;
//     });

// const genderTags = learnableTags
//     .filter((t) => t.data["ONTOLOGICAL"].branch === "Gender")
//     .map((t) => {
//         t.Memory = t.Memory.find((m) => articleUnit.id === m.Unit.id);
//         return t;
//     });

// let numberTag = numberTags.find((t) => !t.Memory || t.Memory.length === 0);
// let genderTag = genderTags.find((t) => !t.Memory || t.Memory.length === 0);

// if (!numberTag) {
//     numberTag = numberTags.reduce((a, b) => (a.Memory.strength < b.Memory.strength ? a : b));
// }
// if (!genderTag) {
//     genderTag = genderTags.reduce((a, b) => (a.Memory.strength < b.Memory.strength ? a : b));
//

// // GET SENTENCE
// const units = [];
// for (const tag of vocabularyTags) {
//     const response = await locals.get("/api/units", {
//         tagIds: [structuralTag.id, tag.id],
//         gameId: translationsGame.id,
//         blacklist: context.blacklist,
//         take: 3
//     });
//     if (response.error) console.error(response.error);
//     else {
//         response.data.forEach((unit) => {
//             unit.data["type"] = tag.data["ONTOLOGICAL"].leaf;
//         });
//         units.push(...response.data);
//     }
// }

// const lang = context.language;
// const constraints = [];
// constraints.push(
//     `ARTICLE: ${articleUnit.data[lang.learning]} - ${articleUnit.data[lang.spoken]}`
// );
// [genderTag, numberTag].forEach((tag) =>
//     constraints.push(`${tag.data["ONTOLOGICAL"].branch}: ${tag.data["ONTOLOGICAL"].leaf}`)
// );

// constraints.push(
//     ...units.map(({ data }) => `${data["type"]}: ${data[lang.learning]} - ${data[lang.spoken]}`)
// );

// const { data: sentence, error: sentenceError } = await locals.get(
//     `/api/games/translations/generate`,
//     {
//         constraints,
//         language: context.language,
//         innerPrompt: translationsGame.data.innerPrompt.text
//     }
// );
// if (sentenceError) throw sentenceError;

// const { data: nlp } = await locals.get(`/api/nlp`, { sentence: sentence.learning });
// // console.log("nlp", JSON.stringify(nlp, null, 2));

// const flashcardTokens = nlp.sentences[0].tokens
//     .filter((token) => token.unit)
//     .filter((token) => {
//         if (!token.unit.Memory) return true;
//         return ["LEARNING", "UNKNOWN"].includes(token.unit.Memory.status);
//     });
// // console.log("flashcardTokens", JSON.stringify(flashcardTokens, null, 2));
// flashcardTokens.forEach((token) => context.blacklist.push(token.unit.id));

// // GET FLASHCARD
// const { data: flashcardUnits } = await locals.get("/api/units", {
//     tagIds: [structuralTag.id],
//     gameId: flashcardsGame.id,
//     blacklist: context.blacklist,
//     take: 2
// });

// // // MAKE INSTRUCTIONS
// const instructions = [];

// const maskFlashcards = (flashcardsMask, data) => {
//     const mask = flashcardsMask[data.corpusType];
//     const buildMaskData = new Function(`return ${mask.buildData}`)();
//     // const maskData = buildMaskData(data);
//     return {
//         front: locals.Mustache.render(mask["front"], data),
//         back: locals.Mustache.render(mask["back"], data)
//     };
// };

// for (const unit of flashcardUnits) {
//     if (!unit) continue;
//     instructions.push({
//         type: "FLASHCARDS",
//         instructions: maskFlashcards(flashcardsGame.data, {
//             corpusType: unit.corpusType,
//             english: unit.data.english,
//             spanish: unit.data.spanish,
//             usageInEnglish: unit.data.usageInEnglish,
//             usageInSpanish: unit.data.usageInSpanish,
//             gender: unit.data.ud.feats.Gender,
//             number: unit.data.ud.feats.Number,
//             tense: unit.data.ud.feats.Tense,
//             upos: unit.data.ud.upos
//         }),
//         payload: {
//             blacklist: [unit.id],
//             source: "UNIT",
//             corpusType: unit.corpusType,
//             gameId: flashcardsGame.id,
//             unitId: unit.id,
//             strategyId: context.strategyId
//         }
//     });
// }

// for (const token of flashcardTokens) {
//     instructions.push({
//         type: "FLASHCARDS",
//         instructions: maskFlashcards(flashcardsGame.data, {
//             corpusType: token.unit.corpusType,
//             english: token.unit.data.english,
//             spanish: token.token,
//             usageInEnglish: token.unit.data.usageInEnglish,
//             usageInSpanish: token.unit.data.usageInSpanish,
//             gender: token.feats.Gender,
//             number: token.feats.Number,
//             tense: token.feats.Tense,
//             upos: token.upos
//         }),
//         payload: {
//             blacklist: [token.unit.id],
//             corpusType: token.unit.corpusType,
//             source: "TOKEN",
//             token: token,
//             gameId: flashcardsGame.id,
//             unitId: token.unit.id,
//             strategyId: context.strategyId
//         }
//     });
// }

// instructions.push({
//     type: "TRANSLATIONS",
//     instructions: sentence,
//     payload: {
//         blacklist: flashcardTokens.map(({ unit }) => unit.id),
//         gameId: translationsGame.id,
//         unitIds: flashcardTokens.map(({ unit }) => unit.id),
//         tokens: nlp.sentences[0].tokens,
//         strategyId: context.strategyId
//     }
// });
