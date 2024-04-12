// @ts-nocheck

import { RJSFSchema, UiSchema } from "@rjsf/core";
import { Fields, type JsonFieldSchema } from "$components/json-field/index";

type TagType = ("STRUCTURAL" | "ONTOLOGICAL" | "LEARNABLE")[];

const TagOntologicalUiSchema: UiSchema = {};
const TagLearnableUiSchema: UiSchema = {};
const TagStructuralUiSchema: UiSchema = {};

const TagOntologicalDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        branch: {
            type: "string",
            title: "Branch",
            description: "Group this tag belongs to",
        },
        leaf: {
            type: "string",
            title: "Leaf",
            description: "The tag itself",
        },
    },
};

const TagLearnableDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {},
};
const TagStructuralDataSchema: RJSFSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {},
};

interface ExportedConfig {
    STRUCTURAL: JsonFieldSchema;
    LEARNABLE: JsonFieldSchema;
    ONTOLOGICAL: JsonFieldSchema;
}

const config: ExportedConfig = {
    ONTOLOGICAL: {
        data: TagOntologicalDataSchema,
        ui: TagOntologicalUiSchema,
    },
    LEARNABLE: {
        data: TagLearnableDataSchema,
        ui: TagLearnableUiSchema,
    },
    STRUCTURAL: {
        data: TagStructuralDataSchema,
        ui: TagStructuralUiSchema,
    },
};

export default config;
