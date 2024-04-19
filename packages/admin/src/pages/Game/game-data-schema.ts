// @ts-nocheck

import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

const FlashcardUiSchema: UiSchema = {
    front: Fields.HTMLField,
    back: Fields.HTMLField,
    buildData: Fields.JSField,
};

const GameFlashcardsUiSchema: UiSchema = {
    WORD: FlashcardUiSchema,
    CONJUGATION: FlashcardUiSchema,
};

const GameFlashcardsDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    $defs: {
        flashcard: {
            type: "object",
            properties: {
                front: {
                    type: "string",
                    title: "Front",
                    description: "Template for the front of the card",
                },
                back: {
                    type: "string",
                    title: "Back",
                    description: "Template for the back of the card",
                },
                // buildData: {
                //     type: "string",
                //     title: "Build Data",
                //     description: "Function to build card data",
                //     format: "code",
                // },
            },
            required: ["back", "front"],
        },
    },
    properties: {
        WORD: {
            $ref: "#/$defs/flashcard",
        },
        CONJUGATION: {
            $ref: "#/$defs/flashcard",
        },
    },
};

const GameTranslationsUiSchema: UiSchema = {
    innerPrompt: { text: Fields.HandlebarsField },
};

const GameTranslationsDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        innerPrompt: {
            type: "object",
            title: "",
            properties: {
                text: {
                    type: "string",
                    title: "Inner Prompt",
                    description:
                        "Specifics instructions for sentence generation instructions",
                },
            },
        },
    },
};

const GameConjugationsUiSchema: UiSchema = {
    innerPrompt: { text: Fields.HandlebarsField },
};

const GameConjugationsDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        innerPrompt: {
            type: "object",
            title: "",
            properties: {
                text: {
                    type: "string",
                    title: "Inner Prompt",
                    description:
                        "Specifics instructions for sentence generation instructions",
                },
            },
        },
    },
};

interface ExportedConfig {
    FLASHCARDS: JsonFieldSchema;
    TRANSLATIONS: JsonFieldSchema;
    CONJUGATIONS: JsonFieldSchema;
}

const config: ExportedConfig = {
    FLASHCARDS: {
        data: GameFlashcardsDataSchema,
        ui: GameFlashcardsUiSchema,
    },
    TRANSLATIONS: {
        data: GameTranslationsDataSchema,
        ui: GameTranslationsUiSchema,
    },
    CONJUGATIONS: {
        data: GameConjugationsDataSchema,
        ui: GameConjugationsUiSchema,
    },
};

export default config;
