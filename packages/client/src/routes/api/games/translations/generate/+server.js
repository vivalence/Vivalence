import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";
import Mustache from "mustache";

const gamePrompt = {
    provider: {
        api: "anthropic",
        model: "claude-3-sonnet-20240229",
        temperature: 0.5,
        max_tokens: 256
    },
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

export async function POST({ fetch, locals, ...props }) {
    if (SYSTEM_MODE && +SYSTEM_MODE < 2) {
        return json({
            data: {
                spoken: "The father should have a good new house.",
                learning: "El padre debería tener una casa nueva buena."
            }
        });
    }

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

        const { data: sentence, error: llmError } = await locals.get("/api/llm", {
            prompt: Mustache.render(gamePrompt.template, inputs),
            schema: gamePrompt.schema,
            provider: gamePrompt.provider
        });
        if (llmError) throw llmError;

        const { data: nlp, error: nlpError } = await locals.get(`/api/nlp`, {
            sentence: sentence.learning
        });
        if (nlpError) throw nlpError;

        const tokens = nlp.sentences[0].tokens.filter((token) => !!token.unit);

        const instruction = {
            type: "TRANSLATIONS",
            instruction: sentence,
            blacklist: { units: tokens.map(({ unit }) => unit.id), tags: [] },
            evaluate: {
                game: { id: gameId },
                tokens: tokens.map((token) => ({
                    token: token.token,
                    start_char: token.start_char,
                    end_char: token.end_char,
                    unit: { id: unit.id, tags: unit.Tags.map(({ id }) => ({ id })) }
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
