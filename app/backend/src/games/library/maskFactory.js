import Mustache from "mustache";

import validator from "./validator.js";
import prisma from "../../prisma-client.js";
import getUnits from "../library/gameUnits.js";
import llmClients from "../../library/openai-client.js";
import nlp from "../../services/nlp/index.js";

export default async (inputs, inputPrimitives, context, factorySettings = {}) => {
    const { maxTries = 5 } = factorySettings;
    const mask = context.mask;
    const generator = new Function(`return ${mask.run}`)();

    async function createLLMClient({ provider, prompt }) {
        const { api, model } = provider;
        const { schema, template } = prompt;

        const validate = validator({ schema });

        return async function (inputs) {
            const message = Mustache.render(template, inputs);
            let tries = 0;
            while (tries++ < maxTries) {
                const candidate = await llmClients[api]({ prompt: message, schema, model });
                const validation = validate(candidate);
                if (validation.success) return validation.output;
                console.log("validation failed", validation);
            }
            throw new Error("Failed to generate a valid output");
        };
    }

    const primitives = {
        createLLMClient,
        nlp,
        getUnits,
        prisma,
        ...inputPrimitives,
    };
    return await generator(inputs, primitives, context);
};
