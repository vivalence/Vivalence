import Mustache from "mustache";
import { json } from "@sveltejs/kit";

const Prompt = {
    language: { spoken: "english", learning: "spanish" },
    provider: { api: "anthropic", model: "claude-3-haiku-20240307" },
    schema: {
        title: "Evaluation",
        type: "object",
        properties: {
            reasoning: {
                description:
                    "Explain how confident the user knows or doesn't <PART> why in short sentence",
                type: "string"
            },
            status: {
                title: "Evaluation status",
                description: `KNOWN indicates correct conjugation. UNKNOWN marks incorrect conjugation, including spelling or absence.`,
                enum: ["KNOWN", "UNKNOWN"],
                type: "string"
            }
        },
        required: ["reasoning", "status"]
    },
    template: `Evaluate this conjugation of {{{verb}}} from {{language.spoken}} to {{language.learning}} and return JSON:
tense: "{{{tense}}}"
person: "{{{person}}} {{{number}}}"
prompt: "{{{spoken}}}"
user input: "{{{input}}}"
correct: "{{{learning}}}"`
};

export async function POST({ fetch, locals, request }) {
    try {
        const { user } = await locals.getSession();
        const { inputs, instruction, scope } = await request.json();
        const { language } = Prompt;

        const evaluateConjugation = async (conjugation) => {
            // TODO: use full annotation here
            const part = {
                input: inputs[conjugation.scope.unit.id],
                person: conjugation.person,
                number: conjugation.number,
                spoken: conjugation.spoken,
                learning: conjugation.learning,

                verb: instruction.verb.learning,
                tense: instruction.tense,
                language
            };

            const prompt = Mustache.render(Prompt.template, part);

            const input = { prompt, schema: Prompt.schema, provider: Prompt.provider };
            const { data: evaluation, error } = await locals.get("/api/llm", input);
            if (error) throw error;

            await locals.post("/api/units", {
                // @lf i should rename this to /unit/review or something
                gameId: scope.game.id,
                gameType: "CONJUGATIONS",
                unitId: conjugation.scope.unit.id,
                response: evaluation.status
            });
            for (const tag in conjugation.scope.unit.tags) {
                await locals.post("/api/tags", {
                    gameId: scope.game.id,
                    gameType: "CONJUGATIONS",
                    tagId: tag.id,
                    unitId: conjugation.scope.unit.id,
                    response: evaluation.status
                });
            }

            return {
                data: {
                    index: conjugation.meta.index,
                    unitId: conjugation.scope.unit.id,
                    evaluation: evaluation.status
                },
                error
            };
        };

        const promises = instruction.conjugations.map(evaluateConjugation);
        const results = await Promise.all(promises);

        const evaluations = [
            results.reduce((acc, r) => {
                if (r.data && ["KNOWN", "GRADUATE"].includes(r.data.evaluation)) acc += 1;
                return acc;
            }, 0),
            results.length
        ];

        for (const tag of scope.tags) {
            const result = await locals.post("/api/tags", {
                gameId: scope.game.id,
                gameType: "CONJUGATIONS",
                tagId: tag.id,
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
        console.error(error);
        return json({ error: error.message, status: 500 });
    }
}
