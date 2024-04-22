import Mustache from "mustache";
import { json } from "@sveltejs/kit";

const Prompt = {
    language: { spoken: "english", learning: "spanish" },
    provider: { api: "anthropic", model: "claude-3-haiku-20240307" },
    schema: {
        title: "Evaluation",
        type: "object",
        properties: {
            confidence: {
                title: "Confidence level",
                description: "How confident are you that the user knows the conjugation?",
                type: "number",
                minimum: 0.0,
                maximum: 1.0
            },
            status: {
                title: "Evaluation status",
                description: `KNOWN indicates correct conjugation. UNKNOWN marks incorrect conjugation, including spelling or absence.`,
                enum: ["KNOWN", "UNKNOWN"],
                type: "string"
            }
        },
        required: ["confidence", "status"]
    },
    template: `Evaluate this conjugation of {{{verb}}} from {{language.spoken}} to {{language.learning}} and return JSON:
tense: {{{tense}}}
person: {{{person}}} {{{number}}}
prompt: {{{spoken}}}
user input: {{{input}}}
correct: {{{learning}}}`
};

export async function POST({ fetch, locals, request }) {
    try {
        const { user } = await locals.getSession();
        const { inputs, instruction, payload } = await request.json();
        const { language } = Prompt;

        const promises = [];
        for (const conjugation of instruction.conjugations) {
            promises.push(
                (async (conjugation) => {
                    const part = {
                        verb: instruction.verb.learning,
                        tense: instruction.tense,
                        person: conjugation.Person,
                        number: conjugation.Number,
                        spoken: conjugation.spoken,
                        learning: conjugation.learning,
                        input: inputs[conjugation.index]
                    };

                    const prompt = Mustache.render(Prompt.template, {
                        ...part,
                        language
                    });

                    const input = { prompt, schema: Prompt.schema, provider: Prompt.provider };
                    const { data: evaluation, error } = await locals.get("/api/llm", input);
                    if (error) throw error;

                    await locals.post("/api/units", {
                        gameId: payload.gameId,
                        gameType: "CONJUGATIONS",
                        unitId: conjugation.payload.unit.id,
                        response: evaluation.status
                    });
                    for (const tag in conjugation.payload.unit.tags) {
                        await locals.post("/api/tags", {
                            gameId: payload.gameId,
                            gameType: "CONJUGATIONS",
                            tagId: tag.id,
                            unitId: conjugation.payload.unit.id,
                            response: evaluation.status
                        });
                    }
                    return {
                        data: {
                            index: conjugation.index,
                            unitId: conjugation.payload.unit.id,
                            evaluation: evaluation.status
                        },
                        error
                    };
                })(conjugation)
            );
        }

        const results = await Promise.all(promises);

        const evaluations = [
            results.reduce((acc, r) => {
                if (r.data && ["KNOWN", "GRADUATE"].includes(r.data.evaluation)) acc += 1;
                return acc;
            }, 0),
            results.length
        ];
        console.log("EVALUATIONS", evaluations);

        // should be returned to client
        for (const tagId in Object.keys(payload.tags)) {
            const result = await locals.post("/api/tags", {
                gameId: payload.gameId,
                gameType: "CONJUGATIONS",
                tagId: tagId,
                response: evaluations
            });
            results.push(result);
        }

        return json({
            data: results.map((r) => r.data),
            error: results.find((r) => r.error),
            errors: results.map((r) => r.error)
        });
    } catch (error) {
        console.error("[CONJUGATIONS/EVALUATION ERROR]", error.message);
        return json({ error: error.message }, { status: 500 });
    }
}
