import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const uiSchema: UiSchema = {
  run: {
    "ui:field": Monaco,
  },
};

export const dataSchema: RJSFSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: {
      title: "Name",
      type: "string",
    },
    run: {
      title: "Run",
      type: "string",
      // format: "code", // Custom format to trigger the Monaco Editor
    },
    age: {
      title: "Age",
      type: "integer",
    },
  },
  required: ["name"],
};

/* language: {
 *   type: "object",
 *   properties: {
 *     learning: { type: "string" },
 *     spoken: { type: "string" },
 *   },
 *   required: ["learning", "spoken"],
 * },
 * tags: {
 *   type: "array",
 *   items: { type: "string" },
 * },
 * provider: {
 *   type: "object",
 *   properties: {
 *     api: { type: "string" },
 *     model: { type: "string" },
 *   },
 *   required: ["api", "model"],
 * },
 * generate: {
 *   type: "object",
 *   properties: {
 *     prompt: {
 *       type: "object",
 *       properties: {
 *         schema: {
 *           type: "object",
 *         },
 *         template: { type: "string" },
 *       },
 *       required: ["schema", "template"],
 *     },
 *     run: { type: "string" },
 *   },
 *   required: ["prompt", "run"],
 * },
   },
   required: ["name", "language", "tags", "provider", "generate"], */
