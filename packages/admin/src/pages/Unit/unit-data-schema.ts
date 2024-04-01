// @ts-nocheck
import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

const UnitWordUiSchema: UiSchema = {
    // index: Fields.NumberField,
    // english: Fields.TextField,
    // spanish: Fields.TextField,
    // lemmaEnglish: Fields.TextField,
    // lemmaSpanish: Fields.TextField,
    // usageInEnglish: Fields.TextField,
    // usageInSpanish: Fields.TextField,
    // pos: Fields.ArrayField,
    // type: Fields.TextField,
    // ud: {
    //     text: Fields.TextField,
    //     upos: Fields.TextField,
    //     xpos: Fields.TextField,
    //     feats: {
    //         Mood: Fields.TextField,
    //         Tense: Fields.TextField,
    //         Number: Fields.TextField,
    //         Person: Fields.TextField,
    //         VerbForm: Fields.TextField,
    //         Gender: Fields.TextField,
    //         PronType: Fields.TextField,
    //         Polarity: Fields.TextField,
    //         PunctType: Fields.TextField,
    //     }
    //     lemma: Fields.TextField,
    //     udFeats: Fields.TextField,
    // },
};

const UnitWordDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        english: { type: "string" },
        spanish: { type: "string" },
        lemmaEnglish: { type: "string" },
        lemmaSpanish: { type: "string" },
        usageInEnglish: { type: "string" },
        usageInSpanish: { type: "string" },
        index: { type: "number" },

        // type: { type: "string" },
        // pos: { type: "array", items: { type: "string" } },
        // ud: {
        //     type: "object",
        //     properties: {
        //         text: { type: "string" },
        //         upos: { type: "string" },
        //         // xpos: { type: "string" },
        //         // lemma: { type: "string" },
        //         udFeats: { type: "string" },
        //         feats: {
        //             type: "object",
        //             properties: {
        //                 Mood: { type: "string" },
        //                 Tense: { type: "string" },
        //                 Number: { type: "string" },
        //                 Person: { type: "string" },
        //                 VerbForm: { type: "string" },
        //                 Gender: { type: "string" },
        //                 PronType: { type: "string" },
        //                 Polarity: { type: "string" },
        //                 PunctType: { type: "string" },
        //             },
        //         },
        //     },
        // },
    },
};

const UnitConjugationUiSchema: UiSchema = {
    // ...UnitWordUiSchema,
    // mood: Fields.TextField,
    // tense: Fields.TextField,
    // ending: Fields.TextField,
    // performer: Fields.TextField,
    // corpusVerbId: Fields.TextField,
};

const UnitConjugationDataSchema: RJSFSchema = {
    ...UnitWordDataSchema, // Inherits the same structure and overrides specific properties
    properties: {
        ...UnitWordDataSchema.properties,
        // mood: { type: "string" },
        // tense: { type: "string" },
        // ending: { type: "string" },
        // performer: { type: "string" },
        corpusVerbId: { type: "string" },
    },
};

interface UnitExportedConfig {
    WORD: JsonFieldSchema;
    CONJUGATION: JsonFieldSchema;
}

const unitConfig: UnitExportedConfig = {
    WORD: {
        data: UnitWordDataSchema,
        ui: UnitWordUiSchema,
    },
    CONJUGATION: {
        data: UnitConjugationDataSchema,
        ui: UnitConjugationUiSchema,
    },
};

export default unitConfig;

// import { RJSFSchema, UiSchema } from "@rjsf/core";
// import { Fields, type JsonFieldSchema } from "$components/json-field/index";

// const FlashcardUiSchema: UiSchema = {
//     front: Fields.HTMLField,
//     back: Fields.HTMLField,
//     buildData: Fields.JSField,
// };

// const GameFlashcardsUiSchema: UiSchema = {
//     WORD: FlashcardUiSchema,
//     CONJUGATION: FlashcardUiSchema,
// };

// const GameFlashcardsDataSchema: RJSFSchema = {
//     $schema: "http://json-schema.org/draft-07/schema#",
//     type: "object",
//     $defs: {
//         flashcard: {
//             type: "object",
//             properties: {
//                 front: {
//                     type: "string",
//                     title: "Front",
//                     description: "Template for the front of the card",
//                 },
//                 back: {
//                     type: "string",
//                     title: "Back",
//                     description: "Template for the back of the card",
//                 },
//                 buildData: {
//                     type: "string",
//                     title: "Build Data",
//                     description: "Function to build card data",
//                     format: "code",
//                 },
//             },
//             required: ["back", "front", "buildData"],
//         },
//     },
//     properties: {
//         WORD: {
//             $ref: "#/$defs/flashcard",
//         },
//         CONJUGATION: {
//             $ref: "#/$defs/flashcard",
//         },
//     },
// };

// const GameTranslationsUiSchema: UiSchema = {
//     innerPrompt: { text: Fields.HandlebarsField },
// };

// const GameTranslationsDataSchema: RJSFSchema = {
//     $schema: "http://json-schema.org/draft-07/schema#",
//     type: "object",
//     properties: {
//         innerPrompt: {
//             type: "object",
//             title: "",
//             properties: {
//                 text: {
//                     type: "string",
//                     title: "Inner Prompt",
//                     description:
//                         "Specifics instructions for sentence generation instructions",
//                 },
//             },
//         },
//     },
// };

// interface ExportedConfig {
//     FLASHCARDS: JsonFieldSchema;
//     TRANSLATIONS: JsonFieldSchema;
// }

// const config: ExportedConfig = {
//     FLASHCARDS: {
//         data: GameFlashcardsDataSchema,
//         ui: GameFlashcardsUiSchema,
//     },
//     TRANSLATIONS: {
//         data: GameTranslationsDataSchema,
//         ui: GameTranslationsUiSchema,
//     },
// };

// export default config;
