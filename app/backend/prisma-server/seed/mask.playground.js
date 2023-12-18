import { PrismaClient } from "@prisma/client";

const mask = {
    evaluate: {
        schema: {
            title: "Evaluations",
            type: "object",
            properties: {
                evaluations: {
                    title: "Evaluations",
                    type: "array",
                    items: {
                        $ref: "#/definitions/Evaluation",
                    },
                },
            },
            required: ["evaluations"],
            definitions: {
                EvaluationEnum: {
                    title: "EvaluationEnum",
                    description: "An enumeration.",
                    enum: ["KNOWN", "UNKNOWN"],
                    type: "string",
                },
                Evaluation: {
                    title: "Evaluation",
                    type: "object",
                    properties: {
                        ID: {
                            title: "Id",
                            type: "string",
                        },
                        evaluation: {
                            $ref: "#/definitions/EvaluationEnum",
                        },
                    },
                    required: ["ID", "evaluation"],
                },
            },
        },

        prompt: `A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.
You provide a technical evaluation on the successfull usage of specific words.

Respond in JSON format. Example:
"""
input {
    learning: "Haber un año",
    spoken: "To have a year",
    translation: "tener un año",
    units: [
        id; {{language.spoken}}; {{language.learning}};
        ID; to have; haber;
        ID; thing; cosa;
        ID; year; año;
    ],
}
return {
    evaluations: [
        { id: "ID", evaluation: "UNKNOWN" },
        { id: "ID", evaluation: "KNOWN" },
    ]
}
"""

Evaluation:
Evaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.

The learner was prompted with this sentence:
{{{sentence.spoken}}}

The learner has provided this translation:
{{translation}}

This was the originially intended translation, but the learner never saw it:
{{sentence.learning}}

The sentence was generated from these words:
id; {{language.spoken}}; {{language.learning}};
{{#units}}
{{id}}; {{spoken}}; {{learning}};
{{/units}}
`,
    },
    feedback: {
        schema: {
            title: "Feedback",
            type: "object",
            properties: {
                parts: {
                    title: "Parts",
                    type: "array",
                    items: {
                        $ref: "#/definitions/Part",
                    },
                },
                correction: {
                    title: "Correction",
                    type: "string",
                },
                score: {
                    title: "Score",
                    minimum: 0.0,
                    maximum: 1.0,
                    type: "number",
                },
                classification: {
                    $ref: "#/definitions/FeedbackEnum",
                },
                feedback: {
                    title: "Feedback",
                    type: "string",
                },
            },
            required: ["parts", "score", "classification", "feedback"],
            definitions: {
                FeedbackEnum: {
                    title: "FeedbackEnum",
                    description: "An enumeration.",
                    enum: ["correct", "info", "mistake", "failure"],
                    type: "string",
                },
                Part: {
                    title: "Part",
                    type: "object",
                    properties: {
                        part: {
                            title: "Part",
                            type: "string",
                        },
                        correction: {
                            title: "Correction",
                            type: "string",
                        },
                        translation: {
                            title: "Translation",
                            type: "string",
                        },
                        classification: {
                            $ref: "#/definitions/FeedbackEnum",
                        },
                    },
                    required: ["part", "translation", "classification"],
                },
            },
        },

        prompt: `
A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.
You provide feedback on the translation for the user. Assess each part-of-speech (PoS) and the overall quality of the translation. Include a score and classification for both individual parts and the entire sentence.

Respond in JSON format. Example:
"""input {
    learning: "Él hace comida deliciosa todos los días",
    spoken: "He makes delicious food every day",
    translation: "el hace delicioso cada día",
}
return {
  feedback: {
    parts: [
      { part: "Él", translation: "el", correction: "Él", classification: "info" },
      { part: "hace", translation: "hace", classification: "correct" },
      { part: "comida", translation: "", correction: "comida", classification: "failure" },
      { part: "deliciosa", translation: "delicioso", correction: "deliciosa", classification: "mistake" },
      { part: "todos los días", translation: "cada día", correction: "todos los días", classification: "info" }
    ],
    correction: "Él hace comida deliciosa todos los días",
    score: 0.4,
    classification: "failure",
    feedback: "You missed the noun 'food' ('comida') and used 'delicioso' instead of 'deliciosa', which should agree in gender with 'comida'. Additionally, 'todos los días' is a more common translation for 'every day' then 'cada día'."
  }
}"""

Feedback:
The learner was prompted with this sentence:
{{{sentence.spoken}}}

The learner has provided this translation:
{{translation}}

This was the originially intended translation, but the learner never saw it:
{{sentence.learning}}`,
    },
    generate: {
        schema: {
            title: "LanguageModel",
            type: "object",
            properties: {
                spoken: {
                    title: "Spoken",
                    description: "Sentence in the spoken language",
                    type: "string",
                },
                learning: {
                    title: "Learning",
                    description: "Sentence in the learning language",
                    type: "string",
                },
                ids: {
                    title: "Ids",
                    description:
                        "List of IDs corresponding to the words used to generate the sentence",
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            },
            required: ["spoken", "learning", "ids"],
        },
        prompt: `You are generating language learning material for a user learning {{language.learning}}.
Don't use words more advanced than those provided. We want the learner to be successfull.
Keep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.

Using the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}:

Tense: {{constraints.tense}},
mood: {{constraints.mood}},
performer: {{constraints.performer}},

Select from among these words:
id; {{language.spoken}}; {{language.learning}}; tags;
{{#units}}
{{id}}; {{spoken}}; {{learning}}; {{tags}};
{{/units}}`,
    },
};

const prisma = new PrismaClient({});

async function read({ id }) {
    const where = { id };
    const mask = await prisma.mask.findUnique({ where });
    // console.log(mask.data.evaluate.prompt.replace(/\\n/g, "\n"));
    // console.log(mask.data.generate.prompt.replace(/\\n/g, "\n"));
    return mask;
}

async function update({ id }) {
    const where = {
        id,
    };
    const data = { data: mask };
    const update = await prisma.mask.update({ where, data });
    return update;
}

async function main() {
    const id = "clpr5668n0002g01pnxhkh8nf";
    return await update({ id });
}

console.log(await main());

// const lorem = [{prompt: 'A language learner was prompted with a english sentence and asked to provide the spanish translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>Having some form of time</prompt>\n\nThe learner provided this translation:\n<translation>habiendo algo forma de tiempo</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>Tener alguna forma de tiempo</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{ id: "clnt09ibg0000g0nujj6f1cab", english: "of, from", spanish: "de" },\n{ id: "clnt09id2000wg0nufn1s6ohl", english: "already, still", spanish: "ya" },\n{ id: "clnt09ie1001ug0nu4tekfb9z", english: "time (general)", spanish: "tiempo" },\n{ id: "clnt09if1002rg0nuzisepwfp", english: "form, shape, way", spanish: "forma" },\n{ id: "clpl45fs6001mg0s3mavzhcjx", english: "to have", spanish: "tener" },\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""', input: {mask: {id: "clpr5668n0002g01pnxhkh8nf", createdAt: "2023-12-04T16:44:37.271Z", updatedAt: "2023-12-04T16:44:37.271Z", data: {evaluate: {prompt: 'A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>{{{sentence.spoken}}}</prompt>\n\nThe learner provided this translation:\n<translation>{{translation}}</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>{{sentence.learning}}</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}" },\n{{/units}}\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""',}, generate: {prompt: 'You are generating language learning material for a user learning {{language.learning}}.\nUsing the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}:\n\nTense: {{constraints.tense}},\nmood: {{constraints.mood}},\nperformer: {{constraints.performer}},\n\nSelect from among these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}", tags: [ {{#tags}}{{.}}, {{/tags}}] },\n{{/units}}\n\nReturn the following JSON structure:\n{\n  "spoken": "Sentence in {{language.spoken}}",\n  "learning": "Sentence in {{language.learning}}",\n  "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.\n}\n\nDon\'t use words more advanced than those provided. We want the learner to be successfull.\nKeep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.',},},}, language: { learning: "spanish", spoken: "english" }, sentence: {learning: "Tener alguna forma de tiempo", spoken: "Having some form of time",}, translation: "habiendo algo forma de tiempo", units: [{ id: "clnt09ibg0000g0nujj6f1cab", word: { learning: "de", spoken: "of, from" } }, {id: "clnt09id2000wg0nufn1s6ohl", word: { learning: "ya", spoken: "already, still" },}, {id: "clnt09ie1001ug0nu4tekfb9z", word: { learning: "tiempo", spoken: "time (general)" },}, {id: "clnt09if1002rg0nuzisepwfp", word: { learning: "forma", spoken: "form, shape, way" },}, { id: "clpl45fs6001mg0s3mavzhcjx", word: { learning: "tener", spoken: "to have" } },],}, response: {feedback: {parts: [{part: "habiendo", correction: "tener", translation: "having", classification: "mistake",}, { part: "algo", translation: "some", classification: "correct" }, { part: "forma", translation: "form", classification: "correct" }, { part: "de", translation: "of", classification: "correct" }, { part: "tiempo", translation: "time", classification: "correct" },], correction: "Tener alguna forma de tiempo", score: 0.4, classification: "mistake", feedback: "The sentence is understandable but uses 'habiendo' incorrectly; 'tener' is the right verb to use here for 'having'. Also, 'alguna' is a better choice than 'algo' for 'some' in the context of this sentence.",}, evaluations: [{ id: "clnt09ibg0000g0nujj6f1cab", evaluation: "KNOWN" }, { id: "clnt09id2000wg0nufn1s6ohl", evaluation: "UNKNOWN" }, { id: "clnt09ie1001ug0nu4tekfb9z", evaluation: "KNOWN" }, { id: "clnt09if1002rg0nuzisepwfp", evaluation: "KNOWN" }, { id: "clpl45fs6001mg0s3mavzhcjx", evaluation: "UNKNOWN" },],}, duration: 31.265, model: "gpt-4-1106-preview",}, {prompt: 'A language learner was prompted with a english sentence and asked to provide the spanish translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>Having some form of time</prompt>\n\nThe learner provided this translation:\n<translation>Teniendo alguna forma te tiempo</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>Tener alguna forma de tiempo</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{ id: "clnt09ibg0000g0nujj6f1cab", english: "of, from", spanish: "de" },\n{ id: "clnt09id2000wg0nufn1s6ohl", english: "already, still", spanish: "ya" },\n{ id: "clnt09ie1001ug0nu4tekfb9z", english: "time (general)", spanish: "tiempo" },\n{ id: "clnt09if1002rg0nuzisepwfp", english: "form, shape, way", spanish: "forma" },\n{ id: "clpl45fs6001mg0s3mavzhcjx", english: "to have", spanish: "tener" },\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""', input: {mask: {id: "clpr5668n0002g01pnxhkh8nf", createdAt: "2023-12-04T16:44:37.271Z", updatedAt: "2023-12-04T16:44:37.271Z", data: {evaluate: {prompt: 'A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>{{{sentence.spoken}}}</prompt>\n\nThe learner provided this translation:\n<translation>{{translation}}</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>{{sentence.learning}}</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}" },\n{{/units}}\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""',}, generate: {prompt: 'You are generating language learning material for a user learning {{language.learning}}.\nUsing the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}:\n\nTense: {{constraints.tense}},\nmood: {{constraints.mood}},\nperformer: {{constraints.performer}},\n\nSelect from among these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}", tags: [ {{#tags}}{{.}}, {{/tags}}] },\n{{/units}}\n\nReturn the following JSON structure:\n{\n  "spoken": "Sentence in {{language.spoken}}",\n  "learning": "Sentence in {{language.learning}}",\n  "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.\n}\n\nDon\'t use words more advanced than those provided. We want the learner to be successfull.\nKeep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.',},},}, language: { learning: "spanish", spoken: "english" }, sentence: {learning: "Tener alguna forma de tiempo", spoken: "Having some form of time",}, translation: "Teniendo alguna forma te tiempo", units: [{ id: "clnt09ibg0000g0nujj6f1cab", word: { learning: "de", spoken: "of, from" } }, {id: "clnt09id2000wg0nufn1s6ohl", word: { learning: "ya", spoken: "already, still" },}, {id: "clnt09ie1001ug0nu4tekfb9z", word: { learning: "tiempo", spoken: "time (general)" },}, {id: "clnt09if1002rg0nuzisepwfp", word: { learning: "forma", spoken: "form, shape, way" },}, { id: "clpl45fs6001mg0s3mavzhcjx", word: { learning: "tener", spoken: "to have" } },],}, response: {feedback: {parts: [{ part: "Teniendo", translation: "Having", classification: "correct" }, { part: "alguna forma", translation: "some form", classification: "correct" }, { part: "te", correction: "de", translation: "of", classification: "mistake" }, { part: "tiempo", translation: "time", classification: "correct" },], correction: "Tener alguna forma de tiempo", score: 0.75, classification: "mistake", feedback: "The sentence has an error with the preposition 'de'. It was mistakenly translated as 'te'. The rest of the translation captures the intended meaning.",}, evaluations: [{ id: "clnt09ibg0000g0nujj6f1cab", evaluation: "KNOWN" }, { id: "clnt09id2000wg0nufn1s6ohl", evaluation: "UNKNOWN" }, { id: "clnt09ie1001ug0nu4tekfb9z", evaluation: "KNOWN" }, { id: "clnt09if1002rg0nuzisepwfp", evaluation: "KNOWN" }, { id: "clpl45fs6001mg0s3mavzhcjx", evaluation: "KNOWN" },],}, duration: 22.669, model: "gpt-4-1106-preview",}, {prompt: 'A language learner was prompted with a english sentence and asked to provide the spanish translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>Having a day off</prompt>\n\nThe learner provided this translation:\n<translation>Haber un dia libre</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>Habiendo un día libre</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{ id: "clnt09idr001ig0nucxde695w", english: "day", spanish: "día" },\n{ id: "clpl45ciq0001g0s3wlr0dsal", english: "to have", spanish: "haber" },\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""', input: {mask: {id: "clpr5668n0002g01pnxhkh8nf", createdAt: "2023-12-04T16:44:37.271Z", updatedAt: "2023-12-04T16:44:37.271Z", data: {evaluate: {prompt: 'A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>{{{sentence.spoken}}}</prompt>\n\nThe learner provided this translation:\n<translation>{{translation}}</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>{{sentence.learning}}</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}" },\n{{/units}}\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""',}, generate: {prompt: 'You are generating language learning material for a user learning {{language.learning}}.\nUsing the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}:\n\nTense: {{constraints.tense}},\nmood: {{constraints.mood}},\nperformer: {{constraints.performer}},\n\nSelect from among these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}", tags: [ {{#tags}}{{.}}, {{/tags}}] },\n{{/units}}\n\nReturn the following JSON structure:\n{\n  "spoken": "Sentence in {{language.spoken}}",\n  "learning": "Sentence in {{language.learning}}",\n  "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.\n}\n\nDon\'t use words more advanced than those provided. We want the learner to be successfull.\nKeep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.',},},}, language: { learning: "spanish", spoken: "english" }, sentence: { learning: "Habiendo un día libre", spoken: "Having a day off" }, translation: "Haber un dia libre", units: [{ id: "clnt09idr001ig0nucxde695w", word: { learning: "día", spoken: "day" } }, { id: "clpl45ciq0001g0s3wlr0dsal", word: { learning: "haber", spoken: "to have" } },],}, response: {feedback: {parts: [{part: "Haber", correction: "Habiendo", translation: "Having", classification: "info",}, { part: "un", translation: "a", classification: "correct" }, {part: "dia", correction: "día", translation: "day", classification: "mistake",}, { part: "libre", translation: "off", classification: "correct" },], correction: "Habiendo un día libre", score: 0.75, classification: "mistake", feedback: "The translation communicates the idea but lacks the correct use of the gerund form and accents in Spanish.",}, evaluations: [{ id: "clpl45ciq0001g0s3wlr0dsal", evaluation: "KNOWN" }, { id: "clnt09idr001ig0nucxde695w", evaluation: "UNKNOWN" },],}, duration: 32.783, model: "gpt-4-1106-preview",}, {prompt: 'A language learner was prompted with a english sentence and asked to provide the spanish translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>To have a year</prompt>\n\nThe learner provided this translation:\n<translation>Haber un año</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>Haber un año</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{ id: "clnt09idu001lg0nuvwrmvg5u", english: "thing", spanish: "cosa" },\n{ id: "clpl45c750000g0s3j9uzqac7", english: "to have", spanish: "haber" },\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""', input: {mask: {id: "clpr5668n0002g01pnxhkh8nf", createdAt: "2023-12-04T16:44:37.271Z", updatedAt: "2023-12-04T16:44:37.271Z", data: {evaluate: {prompt: 'A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.\nYou provide feedback on the translation for the user,\nand you provide an technical evaluation on the successfull usage of specific individual words.\n\nFeedback:\nAssess each part-of-speech and the overall quality of the translation.\nInclude a score and classification for both individual parts and the entire sentence.\n\nThe learner was prompted with this sentence:\n<prompt>{{{sentence.spoken}}}</prompt>\n\nThe learner provided this translation:\n<translation>{{translation}}</translation>\n\nThis was the originially intended translation, but the learner never saw it:\n<translation>{{sentence.learning}}</translation>\n\nEvaluation:\nThe sentence was generated from these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}" },\n{{/units}}\nEvaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.\n\n\nRespond in this json structure exactly:\n"""\nFeedbackEnum = "correct" // If it is correct\n    | "info" // If it is correct but not the best way to say it\n    | "mistake" // If it is incorrect but understandable\n    | "failure" // If it is incorrect and not understandable\n\nEvaluationEnum = "KNOWN" | "UNKNOWN" \n\n{\n  "feedback": {\n    "parts": [{ // Breakdown of the sentence into parts of speech\n\t"part": String, // The part in the sentence\n\t"correction": Optional<String>, // The correction of the word, if the word was not perfectly correct\n\t"translation": String, // The translation of the part of speech\n\t"classification": FeedbackEnum, // Categorized quality of this part of speech\n    }],\n    "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect\n    "score": Float, // Number between 0 and 1, indicating the quality of the translation.\n    "classification": FeedbackEnum, // Categorized quality of the translation\n    "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner\n  },\n  "evaluations": [{\n    id: "ID",\n    evaluation: EvaluationEnum\n  }]\n}"""',}, generate: {prompt: 'You are generating language learning material for a user learning {{language.learning}}.\nUsing the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}:\n\nTense: {{constraints.tense}},\nmood: {{constraints.mood}},\nperformer: {{constraints.performer}},\n\nSelect from among these words:\n{{#units}}\n{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}", tags: [ {{#tags}}{{.}}, {{/tags}}] },\n{{/units}}\n\nReturn the following JSON structure:\n{\n  "spoken": "Sentence in {{language.spoken}}",\n  "learning": "Sentence in {{language.learning}}",\n  "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.\n}\n\nDon\'t use words more advanced than those provided. We want the learner to be successfull.\nKeep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.',},},}, language: { learning: "spanish", spoken: "english" }, sentence: { learning: "Haber un año", spoken: "To have a year" }, translation: "Haber un año", units: [{ id: "clnt09idu001lg0nuvwrmvg5u", word: { learning: "cosa", spoken: "thing" } }, { id: "clpl45c750000g0s3j9uzqac7", word: { learning: "haber", spoken: "to have" } },],}, response: {feedback: {parts: [{part: "to have", correction: "tener", translation: "haber", classification: "mistake",}, {part: "a year", correction: null, translation: "un año", classification: "correct",},], correction: "Tener un año", score: 0.5, classification: "mistake", feedback: "The verb 'to have' when used in the context of possession or experiencing something should be 'tener' in Spanish rather than 'haber'.",}, evaluations: [{ id: "clpl45c750000g0s3j9uzqac7", evaluation: "UNKNOWN" }, { id: "clnt09idu001lg0nuvwrmvg5u", evaluation: "KNOWN" },],}, duration: 13.747, model: "gpt-4-1106-preview",},];
