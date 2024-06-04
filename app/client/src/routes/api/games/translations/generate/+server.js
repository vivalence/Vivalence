import { json } from "@sveltejs/kit";
import Mustache from "mustache";

const gamePrompt = {
    // provider: {api: "anthropic", model: "claude-3-sonnet-20240229", temperature: 0.5, max_tokens: 256},
    provider: { api: "openai", model: "gpt-4o" },
    schema: {
        title: "LanguageLearningSentence",
        type: "object",
        properties: {
            spoken: {
                title: "SpokenSentence",
                description: "Sentence in the familiar language",
                type: "string"
            },
            learning: {
                title: "LearningSentence",
                description: "Sentence in the language to be learned",
                type: "string"
            }
        },
        required: ["spoken", "learning"]
    },
    template: `### Instructions
You Generate one single sentence in {{language.spoken}} and its translation in {{language.learning}} as language learning material for a user learning {{language.learning}}.

Follow this strategy:
<STRATEGY>

{{innerPrompt}}

</STRATEGY>

Don't use words more advanced than those provided. We want the learner to be successfull.
The sentence must be semantically correct and either a reasonable or common thing to say.

### Constraints
Build the sentence using these constraints:
{{#constraints}}
{{.}}
{{/constraints}}

Return a JSON object with the spoken and learning sentence.`
};
// import { env } from "$env/dynamic/private";
// const { SYSTEM_MODE } = env;
// if (SYSTEM_MODE && +SYSTEM_MODE < 2) {return json({data: {spoken: "The father should have a good new house.", learning: "El padre debería tener una casa nueva buena."}});}

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, constraints, language } = await request.json();

        const { data: game, error: gameError } = await locals.supabase
            .from("Game")
            .select(`*`)
            .eq("id", gameId)
            .single();
        if (gameError) throw gameError;

        const inputs = {
            constraints,
            language,
            innerPrompt: game.data.innerPrompt
        };

        // const sentence = { spoken: "We have a book.", learning: "Nosotros tenemos un libro." };
        const { data: sentence, error: llmError } = await locals.get("/api/llm", {
            prompt: Mustache.render(gamePrompt.template, inputs),
            schema: gamePrompt.schema,
            provider: gamePrompt.provider
        });
        if (llmError) throw llmError;

        const { data: annotations, error: nlpError } = await locals.post(
            `/api/classifier/annotate/fromText`,
            { text: sentence.learning }
        );
        if (nlpError) throw nlpError;

        const tokens = await Promise.all(
            annotations.flat().map(async (annotation) => {
                const input = { annotation };
                const { data: units } = await locals.post("/api/units/fromAnnotation", input);
                return { annotation, unit: units[0] };
            })
        );

        const instruction = {
            type: "TRANSLATIONS",
            instruction: {
                sentence // @lj TODO for feedback: deconstruct the sentence and send the deconstruction
            },
            scope: {
                game: { id: gameId },
                units: tokens
                    .filter((t) => !!t.unit)
                    .map((token) => ({
                        id: token.unit.id,
                        token: token.annotation.meta.token,
                        start_char: token.annotation.meta.start_char,
                        end_char: token.annotation.meta.end_char,
                        tags: token.unit.tags.map(({ id }) => ({ id }))
                    }))
            }
        };

        return json({ data: instruction, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/translation/generate", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
