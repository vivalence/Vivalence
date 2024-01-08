import Mustache from "mustache";

import validator from "./validator.js";
import prisma from "../../prisma-client.js";
import llmClients from "../../library/openai-client.js";
import nlp from "../../services/nlp/index.js";

export default async (inputs, inputPrimitives, context, factorySettings = {}) => {
    const { maxTries = 5 } = factorySettings;

    const { schema, model, ...mask } = context.mask;
    const generator = new Function(`return ${mask.run}`)();
    const validate = validator({ schema });

    const renderTemplate = (inputs) => Mustache.render(mask.prompt.text, inputs);

    const llmAndValidate = async (prompt) => {
        let tries = 0;
        while (tries++ < maxTries) {
            const candidate = await llmClients[mask.api]({ prompt, schema, model });
            const validation = validate(candidate);

            if (!validation.success) {
                console.log("validation failed", validation);
                continue;
            }

            return validation.output;
        }
        throw new Error("Failed to generate a valid output");
    };

    const primitives = {
        template: renderTemplate,
        llm: llmAndValidate,
        nlp,
        prisma,
        ...inputPrimitives,
    };
    const maskOutput = await generator(inputs, primitives, context);
    return maskOutput;
};
