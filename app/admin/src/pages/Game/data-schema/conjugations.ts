// @ts-nocheck

import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

const ui: UiSchema = {
    innerPrompt: { text: Fields.HandlebarsField },
};

const data: RJSFSchema = {
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

export default { data, ui };
