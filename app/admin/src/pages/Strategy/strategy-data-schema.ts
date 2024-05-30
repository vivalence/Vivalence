// @ts-nocheck

import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

const StrategyUiSchema: UiSchema = {
    provisioning: Fields.JSField,
};

const StrategyDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        provisioning: {
            type: "string",
            title: "Provisioning",
            description: "How does the Strategy provision instructions?",
        },
    },
};

const config: JsonFieldSchema = {
    data: StrategyDataSchema,
    ui: StrategyUiSchema,
};

export default config;
