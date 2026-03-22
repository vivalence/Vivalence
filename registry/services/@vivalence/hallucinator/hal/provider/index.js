import { Type } from "@vivalence/typology";
import {
  jsonSchema,
  tool as makeTool,
  generateObject,
  ToolLoopAgent,
  stepCountIs,
} from "@ai/sdk";
import Providers from "./providers.js";

export default async function (service) {
  const provider = Providers.anthropic(service.secrets.anthropic);

  return {
    object: async ({ schema, system, prompt }) => {
      schema.type = "object";
      schema.additionalProperties = false;

      const result = await generateObject({
        model: provider("claude-sonnet-4-5"),
        // schema: jsonSchema(JSON.parse(JSON.stringify(schema))),
        schema: jsonSchema(schema),
        system: normalize(system),
        prompt,
      });
      return { object: result.object };
    },

    action: async ({ system, tools, prompt }) => {
      const agent = new ToolLoopAgent({
        model: provider("claude-sonnet-4-5"),
        instructions: normalize(system),
        tools: formatTools(tools),
        // toolChoice: "auto",
        stopWhen: stepCountIs(10),
      });

      const result = await agent.generate({ prompt });

      return {
        text: result.text,
        toolResults: result.steps
          ?.map((step) => ({
            toolName: step.toolCalls?.[0]?.toolName,
            result: step.toolResults?.[0]?.result,
          }))
          .filter((r) => r.toolName),
      };
    },
  };
}

function formatTools(agentic) {
  const tools = agentic.tools || agentic;

  return Object.entries(tools).reduce((acc, [name, tool]) => {
    const schema = tool.input || Type.Object({});
    const jsonSchemaObj = JSON.parse(JSON.stringify(schema));
    if (!jsonSchemaObj.type) jsonSchemaObj.type = "object";

    acc[name] = makeTool({
      description: tool.valence || "",
      inputSchema: jsonSchema(jsonSchemaObj),
      execute: tool.execute,
    });
    return acc;
  }, {});
}

// function formatTools(tools) {console.log("formatting tools:", { tools }); return Object.entries(tools).reduce((acc, [name, tool]) => {console.log("singletool", { name, tool }); const schema = tool.input || Type.Object({}); const jsonSchemaObj = JSON.parse(JSON.stringify(schema)); if (!jsonSchemaObj.type) jsonSchemaObj.type = "object"; acc[name] = makeTool({description: tool.valence || "", inputSchema: jsonSchema(jsonSchemaObj), execute: tool.execute,}); return acc;}, {});}

function normalize(text) {
  return text?.replace(/\s+/g, " ").trim() || "";
}
// import {
//   jsonSchema,
//   generateText,
//   tool as makeTool,
//   generateObject,
// } from "@ai/sdk";
// import Providers from "./providers.js";

// // export default async function provider (hallunicatorMask) {

// export default async function (service) {
//   const provider = Providers.anthropic(service.secrets.anthropic);
//   return {
//     persona: async ({ schema, system, prompt }) => {},
//     object: async ({ schema, system, prompt }) => {
//       const input = {
//         model: provider("claude-sonnet-4-5"),
//         schema: formatSchema(schema),
//         system: formatSystem(system),
//         prompt,
//       };

//       // console.log({ input });
//       const output = await generateObject(input);
//       // console.log(JSON.stringify({ output }, null, 2));

//       return { object: output.object };
//     },
//     action: async ({ schema, system, tools, prompt }) => {
//       const input = {
//         maxSteps: 8,
//         model: provider("claude-sonnet-4-5"),
//         // providerOptions: {anthropic: { thinking: { type: "enabled", budgetTokens: 6000 } },},
//         system: formatSystem(system),
//         tools: formatTools(tools),
//         prompt,
//       };
//       console.log(JSON.stringify({ input }, null, 2));
//       const output = await generateText(input);
//       console.log(JSON.stringify({ output }, null, 2));

//       // TODO: map tool calls and results to output.
//       // console.log("tools", output.response.messages.filter((m) => m.role === "tool"),);
//       return { text: output.text, messages: output.response.messages };
//     },
//     // response: async () => {},
//   };
// }

// function formatTools(tools) {
//   return Object.entries(tools) //
//     .reduce((tools, [slug, tool]) => {
//       tools[slug] = makeTool({
//         description: tool.valence,
//         parameters: formatSchema(tool.input),
//         execute: tool.execute,
//       });
//       return tools;
//     }, {});
// }

// function formatSchema(schema) {
//   return jsonSchema(JSON.parse(JSON.stringify(schema)));
// }

// function formatSystem(system) {
//   return system //+ `### Response\nYour response must be JSON of schema: ${JSON.stringify(schema)}`
//     .replace(/\s+/g, " ")
//     .trim();
// }
