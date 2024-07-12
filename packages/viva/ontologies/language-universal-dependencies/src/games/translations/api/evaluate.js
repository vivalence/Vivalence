import Mustache from "mustache";
import { EvalTokensPrompt, EvalTranslationPrompt } from "./prompts";

export default async function evaluate(inputs, locals) {
    const perf = performance.now();

    const { scope, sentence } = inputs;
    const language = { spoken: "english", learning: "spanish" };

    const hydratedScope = await locals.client("units/hydrateScope", { scope }).ok();

    const parts = hydratedScope.map((unit, index) => ({
        id: unit.id,
        spoken: unit.data[language.spoken],
        token: unit.token,
        index: index + 1,
        start_char: unit.start_char,
        end_char: unit.end_char,
        tags: unit.tags
            .filter((tag) => tag.type.includes("LEARNABLE"))
            .map((tag) => ({
                id: tag.id,
                name: tag.name,
                branch: tag.data.ONTOLOGICAL.branch,
                leaf: tag.data.ONTOLOGICAL.leaf
            }))
    }));

    const evaluateTranslation = async (parts, sentence) => {
        const pinputs = { parts, language, sentence };
        const prompt = Mustache.render(EvalTranslationPrompt.template, pinputs);

        const schema = {
            ...EvalTranslationPrompt.schema,
            properties: parts.reduce(
                (acc, part) => {
                    acc["token:" + part.token] = { $ref: "#/definitions/token" };
                    return acc;
                },
                { "translation:whole": { $ref: "#/definitions/translation" } }
            )
        };

        schema.properties.required = Object.keys(schema.properties);
        const input = { prompt, schema, provider: EvalTranslationPrompt.provider };
        const evaluation = await locals.llm(input);
        return evaluation;
    };
    const evaluationTranslation = await evaluateTranslation(parts, sentence);

    const evaluateToken = async (part) => {
        const prompt = Mustache.render(EvalTokensPrompt.template, {
            part,
            language,
            evaluation: {
                whole: evaluationTranslation["translation:whole"],
                token: evaluationTranslation["token:" + part.token]
            },
            sentence: {
                ...sentence,
                learning: wrapTextWithTag(sentence.learning, part.start_char, part.end_char, "PART")
            }
        });
        const schema = {
            ...EvalTokensPrompt.schema,
            properties: part.tags.reduce(
                (acc, tag) => {
                    acc["Tag:" + tag.id] = { $ref: "#/definitions/tag" };
                    return acc;
                },
                { ["Unit:" + part.id]: { $ref: "#/definitions/unit" } }
            )
        };
        schema.properties.required = Object.keys(schema.properties);

        const input = { prompt, schema, provider: EvalTokensPrompt.provider };
        const llmResponse = await locals.llm(input);
        const evaluations = Object.entries(llmResponse).map(([key, evaluation]) => {
            const [type, id] = key.split(":");
            return {
                id,
                type,
                evaluation,
                ...(type === "Unit"
                    ? {
                          ...part,
                          tags: undefined
                      }
                    : part.tags.find((tag) => tag.id === id))
            };
        });

        const returnObject = evaluations.reduce((acc, evaluation) => {
            if (evaluation.type === "Unit") acc = { ...evaluation, ...acc };
            else acc.tags ? acc.tags.push(evaluation) : (acc.tags = [evaluation]);
            return acc;
        }, {});

        evaluations.map(async ({ type, id, evaluation }) => {
            if (evaluation.status === "NEUTRAL") return null;
            if (type === "Unit") {
                await locals
                    .client("units/review", {
                        gameId: scope.game.id,
                        gameType: "TRANSLATIONS",
                        unitId: id,
                        response: evaluation.status
                    })
                    .ok();
            } else if (type === "Tag") {
                await locals
                    .client("tags/review", {
                        gameId: scope.game.id,
                        gameType: "TRANSLATIONS",
                        tagId: id,
                        unitId: part.id,
                        response: evaluation.status
                    })
                    .ok();
            }
        });

        return returnObject;
    };
    const evaluationTokens = await Promise.all(parts.map(evaluateToken));

    console.log(`[PERF] evaluate took ${performance.now() - perf}ms`);
    return evaluationTokens;
}

const wrapTextWithTag = (str, start_char, end_char, tag) => {
    return `${str.substring(0, start_char)}<${tag}>${str.substring(start_char, end_char)}</${tag}>${str.substring(end_char)}`;
};
