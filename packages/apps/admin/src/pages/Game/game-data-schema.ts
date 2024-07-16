// @ts-nocheck

import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

import ConjugationsSchema from "./data-schema/conjugations";
import FlashcardsSchema from "./data-schema/flashcards";
import TranslationsSchema from "./data-schema/translations";

interface ExportedConfig {
  FLASHCARDS: JsonFieldSchema;
  TRANSLATIONS: JsonFieldSchema;
  CONJUGATIONS: JsonFieldSchema;
}

const config: ExportedConfig = {
  FLASHCARDS: FlashcardsSchema,
  TRANSLATIONS: TranslationsSchema,
  CONJUGATIONS: ConjugationsSchema,
};

export default config;
