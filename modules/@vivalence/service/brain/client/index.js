import {
  jsonSchema,
  generateText,
  tool as makeTool,
  generateObject,
} from "@ai/sdk";
import Providers from "./providers.js";

export default async function (service) {
  const provider = Providers.anthropic(service.secret.providers.anthropic);
  return {
    generate: {
      object: async ({ schema, system, prompt }) => {
        const input = {
          model: provider("claude-3-7-sonnet-latest"),
          schema: formatSchema(schema),
          system: formatSystem(system),
          prompt,
        };

        const output = await generateObject(input);

        return { object: output.object };
      },
    },
    call: {
      tools: async ({ schema, system, tools, prompt }) => {
        const input = {
          maxSteps: 8,
          model: provider("claude-3-7-sonnet-latest"),
          // providerOptions: {anthropic: { thinking: { type: "enabled", budgetTokens: 6000 } },},
          system: formatSystem(system),
          tools: formatTools(tools),
          prompt,
        };
        const output = await generateText(input);
        // TODO: map tool calls and results to output.
        // console.log("tools", output.response.messages.filter((m) => m.role === "tool"),);
        return { text: output.text, messages: output.response.messages };
      },
    },
  };
}

function formatTools(tools) {
  return Object.entries(tools) //
    .reduce((tools, [slug, tool]) => {
      tools[slug] = makeTool({
        description: tool.valence,
        parameters: formatSchema(tool.input),
        execute: tool.execute,
      });
      return tools;
    }, {});
}

function formatSchema(schema) {
  return jsonSchema(JSON.parse(JSON.stringify(schema)));
}

function formatSystem(system) {
  return system //+ `### Response\nYour response must be JSON of schema: ${JSON.stringify(schema)}`
    .replace(/\s+/g, " ")
    .trim();
}
