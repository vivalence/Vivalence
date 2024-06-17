import Mustache from "mustache";

const Prompt = {
    language: { spoken: "english", learning: "spanish" },
    provider: { api: "openai", model: "gpt-4o" },
    // provider: { api: "anthropic", model: "claude-3-sonnet-20240229" },
    // provider: { api: "anthropic", model: "claude-3-haiku-20240307", max_tokens: 256, temperature: 0.3 },
    // provider: { api: "anyscale", model: "mistralai/Mixtral-8x7B-Instruct-v0.1" },
    // provider: { api: "groq", model: "mixtral-8x7b-32768", temperature: 0.2 },
    schema: {
        title: "Evaluations",
        type: "object",
        definitions: {
            evaluation: {
                type: "object",
                properties: {
                    reasoning: {
                        description:
                            "Explain how confident the user knows or doesn't <PART> why in short sentence",
                        type: "string"
                    },
                    status: {
                        title: "Evaluation status",
                        description: `KNOWN indicates correct usage of PART in the translation. UNKNOWN marks incorrect usage, including spelling and missing words. NEUTRAL applies for successful alternative use. Absence of PART is UNKNOWN.`,
                        enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
                        type: "string"
                    }
                },
                required: ["reasoning", "status"]
            }
        },
        properties: {}
    },

    template: `Evaluate a <PART> of translated sentence.
We ignore capitalization.
We do not ignore severe spelling errors.
If the learner used an equivalent alternative, then select NEUTRAL.
If the <PART> is missing, then select UNKNOWN.

### TRANSLATION
PROMPT: "{{{sentence.spoken}}}"
EXPECTED: "{{{sentence.learning}}}" (the tag <PART> was added now for your emphasis)
USER: "{{{sentence.translation}}}"

The <PART> you evaluate now is made up of the word (Unit) "{{part.token}}"
and the UniversalDependencys (Tags) of{{#part.tags}} {{branch}}{{/part.tags}}.

### Unit:{{part.id}}
{{{language.spoken}}}: "{{{part.spoken}}}"
{{{language.learning}}}: "{{{part.token}}}"

{{#part.tags}}
### Tag:{{id}}: {{branch}} "{{leaf}}"
Was {{branch}} "{{leaf}}" used correctly?

{{/part.tags}}

Return a JSON object with the evaluation of <PART>.
`
};

export default async function generate(inputs, locals) {
    const { scope, sentence } = inputs;
    const { language } = Prompt;

    const evaluateToken = async (token, i) => {
        const learningTagged = wrapTextWithTag(
            sentence.learning,
            token.start_char,
            token.end_char,
            "PART"
        );
        const { data: unit, error: unitError } = await locals.supabase
            .from("Unit")
            .select("*")
            .eq("id", token.id)
            .single();

        const { data: tags, error: tagsError } = await locals.supabase
            .from("Tag")
            .select("*")
            .in(
                "id",
                token.tags.map((tag) => tag.id)
            );

        const part = {
            spoken: unit.data[language.spoken],
            learning: unit.data[language.learning],
            token: token.token,
            annotation: unit.data.annotation,
            tags: tags
                .filter((tag) => tag.type.includes("LEARNABLE"))
                .map((tag) => ({
                    id: tag.id,
                    branch: tag.data.ONTOLOGICAL.branch,
                    leaf: tag.data.ONTOLOGICAL.leaf
                }))
        };

        const prompt = Mustache.render(Prompt.template, {
            part,
            language,
            sentence: { ...sentence, learning: learningTagged }
        });

        const schema = {
            ...Prompt.schema,
            properties: part.tags.reduce(
                (acc, tag) => {
                    acc["Tag:" + tag.id] = { $ref: "#/definitions/evaluation" };
                    return acc;
                },
                { ["Unit:" + unit.id]: { $ref: "#/definitions/evaluation" } }
            )
        };
        schema.properties.required = Object.keys(schema.properties);

        const input = { prompt, schema, provider: Prompt.provider };
        const evaluations = await locals.llm(input);

        return Promise.all(
            Object.keys(evaluations).map(async (key) => {
                const evaluation = evaluations[key];
                const [type, id] = key.split(":");
                evaluation.id = id;
                evaluation.type = type;

                if (evaluation.status === "NEUTRAL") null;
                else if (type === "Unit") {
                    evaluation.response = await locals.client("units", {
                        gameId: scope.game.id,
                        gameType: "TRANSLATIONS",
                        unitId: id,
                        response: evaluation.status
                    });
                } else if (type === "Tag") {
                    evaluation.response = await locals.client("tags", {
                        gameId: scope.game.id,
                        gameType: "TRANSLATIONS",
                        unitId: unit.id,
                        tagId: id,
                        response: evaluation.status
                    });
                }
                return evaluation;
            })
        );
    };

    const results = await Promise.all(scope.units.map(evaluateToken));
    return results;
}

const wrapTextWithTag = (str, start_char, end_char, tag) => {
    return `${str.substring(0, start_char)}<${tag}>${str.substring(start_char, end_char)}</${tag}>${str.substring(end_char)}`;
};
