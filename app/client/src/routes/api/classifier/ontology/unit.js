import { annotations } from "./annotations";
import { pos as POS } from "./pos";
import { unit as defaults } from "./defaults";

export const schema = {
    ...defaults,
    properties: {
        ...defaults.properties,
        annotation: {
            type: "object",
            properties: {
                ...annotations
            },
            required: ["pos", "lemma"],
            allOf: Object.values(POS).map((pos) => {
                // wtf is this?
                const statement = {
                    if: {
                        properties: {
                            pos: { const: pos.schema.properties.annotation.properties.pos.enum }
                        }
                    },
                    then: {
                        required: pos.schema.properties.annotation.required
                    }
                };
                if (pos.schema.properties.annotation.allOf) {
                    statement.then.allOf = pos.schema.properties.annotation.allOf;
                }
                return statement;
            })
        }
    }
};
