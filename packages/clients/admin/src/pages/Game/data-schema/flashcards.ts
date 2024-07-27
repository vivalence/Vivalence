// @ts-nocheck

import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

// const FlashcardUiSchema: UiSchema = {front: Fields.HTMLField, back: Fields.HTMLField, buildData: Fields.JSField,};

const ui: UiSchema = {
  front: Fields.HTMLField,
  back: Fields.HTMLField,
  // WORD: FlashcardUiSchema, CONJUGATION: FlashcardUiSchema,
};

const data: RJSFSchema = {
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
        // buildData: {type: "string", title: "Build Data", description: "Function to build card data", format: "code",},
      },
      required: ["back", "front"],
    },
  },
  properties: {
    $ref: "#/$defs/flashcard",
    // WORD: {$ref: "#/$defs/flashcard",}, CONJUGATION: {$ref: "#/$defs/flashcard",},
  },
};

export default { data, ui };
