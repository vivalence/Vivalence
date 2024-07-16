// @ts-nocheck
import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

const UnitUiSchema: UiSchema = {};

const UnitDataSchema: RJSFSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    english: { type: "string" },
    spanish: { type: "string" },
    usageInEnglish: { type: "string" },
    usageInSpanish: { type: "string" },
    index: { type: "number" },
    annotation: {
      type: "object",
      title: "Classifier produced, Unit unique, annotation.",
      properties: {
        pos: {
          type: "string",
          enum: [
            "noun",
            "propn",

            "verb",
            "aux",

            "adj",
            "adv",
            "adp",

            "det",
            "pron",

            "num",

            "sconj",
            "cconj",
            "intj",

            "part",
            "punct",
            "sym",
            "x",
            "degree",
            undefined,
          ],
        },
        lemma: { type: "string" },
      },
      required: ["pos", "lemma"],
      dependencies: {
        pos: {
          oneOf: [
            {
              properties: {
                pos: { enum: ["noun"] },
                gender: { type: "string" },
                number: { type: "string" },
              },
              required: ["gender", "number"],
            },
            {
              properties: {
                pos: { enum: ["propn"] },
              },
            },
            {
              properties: {
                pos: { enum: ["verb", "aux"] },
                verbform: { type: "string" },
                tense: { type: "string" },
                person: { type: "string" },
                number: { type: "string" },
                gender: { type: "string" },
                aspect: { type: "string" },
                mood: { type: "string" },
              },
              required: ["verbform"],
            },
            {
              properties: {
                pos: { enum: ["adj"] },
                gender: { type: "string" },
                number: { type: "string" },
                verbform: { type: "string" },
              },
              required: ["gender", "number"],
            },
            {
              properties: {
                pos: { enum: ["adv"] },
                polarity: { type: "string" },
                prontype: { type: "string" },
                degree: { type: "string" },
              },
            },
            {
              properties: {
                pos: { enum: ["adp"] },
              },
            },
            {
              properties: {
                pos: { enum: ["det"] },
                number: { type: "string" },
                prontype: { type: "string" },
                person: { type: "string" },
                poss: { type: "boolean" },
                definite: { type: "string" },
                gender: { type: "string" },
              },
              required: ["number", "prontype"],
            },
            {
              properties: {
                pos: { enum: ["pron"] },
                number: { type: "string" },
                prontype: { type: "string" },
                gender: { type: "string" },
                person: { type: "string" },
              },
              required: ["number", "prontype"],
            },
            {
              properties: {
                pos: { enum: ["num"] },
                number: { type: "string" },
                numtype: { type: "string" },
                gender: { type: "string" },
              },
              required: ["number", "numtype"],
            },
            {
              properties: {
                pos: { enum: ["punct"] },
                puncttype: { type: "string" },
              },
            },
            {
              properties: {
                pos: {
                  enum: [
                    "adp",
                    "sconj",
                    "cconj",
                    "intj",
                    "propn",
                    // "part", "sym", "x", "degree", undefined,
                  ],
                },
              },
            },
          ],
        },
      },
    },
  },
};

const UnitSchema: JsonFieldSchema = {
  data: UnitDataSchema,
  ui: UnitUiSchema,
};

export default UnitSchema;
