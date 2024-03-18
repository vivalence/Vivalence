import { SYSTEM_MODE } from "$env/static/private";
import { json } from "@sveltejs/kit";
import Mustache from "mustache";

const gamePrompt = {
    // provider: { api: "anthropic", model: "claude-3-sonnet-20240229", temperature: 0.8 },
    provider: { api: "anthropic", model: "claude-3-haiku-20240307" },
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
{{innerPrompt}}

Don't use words more advanced than those provided. We want the learner to be successfull.
Keep the sentence between 3-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.

### Task
generate a sentence in {{language.learning}} (learning) and its translation in {{language.spoken}} (spoken).

build the sentence using these words:
{{#units}}
{{learning}} {{spoken}}
{{/units}}

Return a JSON object with the spoken and learning sentence.`
};

export async function GET({ fetch, locals, ...props }) {
    try {
        const { units, language, innerPrompt } = locals.params();
        // console.log("SENTENCE GENERATION");
        // console.log(units, language, innerPrompt);
        // console.log(JSON.stringify(locals.params(), null, 2));

        if (SYSTEM_MODE && +SYSTEM_MODE < 2) {
            console.log("STUBBING TRANSLATION GENERATION");
            return json({
                data: {
                    spoken: "The father should have a good new house.",
                    learning: "El padre debería tener una casa nueva buena."
                }
            });
        }

        const inputs = {
            units: units.map((unit) => ({
                learning: unit.data[language.learning],
                spoken: unit.data[language.spoken]
            })),
            language,
            innerPrompt
        };

        const message = Mustache.render(gamePrompt.template, inputs);

        const { data: sentences, error } = await locals.get("/api/llm", {
            prompt: message,
            schema: gamePrompt.schema,
            provider: gamePrompt.provider
        });

        if (error) throw error;

        return json({ data: sentences, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/translation/generate", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
