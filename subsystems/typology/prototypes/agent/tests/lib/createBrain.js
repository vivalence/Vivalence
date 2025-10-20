import config from "@vivalence/paladin";
import { createAnthropic } from "@ai/providers/anthropic";
import {
  jsonSchema,
  tool as makeTool,
  generateObject,
  generateText,
} from "@ai/sdk";

// @lj hot
const auth = { apiKey: config.env.get("ANTHROPIC_API_KEY") };
export const provider = createAnthropic(auth);

export const brain = {
  mock: {
    generate: {
      object: async ({ schema, system, prompt }) => {
        return { object: { evaluation: "hallo world" } };
      },
    },
  },
  hot: {
    generate: {
      object: async ({ schema, system, prompt, tools, ...i }) => {
        const input = {
          model: provider("claude-3-7-sonnet-latest"),
          schema: formatSchema(schema),
          system: system.replace(/\s+/g, " ").trim(),
          prompt,
        };
        const response = await generateObject(input);
        return JSON.parse(response.object);
      },
    },
    call: {
      tools: async ({ schema, system, tools, prompt }) => {
        const input = {
          providerOptions: {
            anthropic: { thinking: { type: "enabled", budgetTokens: 6000 } },
          },
          maxSteps: 8,
          model: provider("claude-3-7-sonnet-latest"),
          system: formatSystemPrompt(system, schema),
          tools: formatTools(tools),
          prompt,
        };
        const output = await generateText(input);

        console.log("[BRAIN output]", output.text);

        return output;
        // TODO: validate output.text given schema. on fail => generateObject(input,output,schema)
      },
    },
  },
};

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

function formatSystemPrompt(system, schema) {
  return system // + `### Response\nYour response must be JSON of schema: ${JSON.stringify(schema)}`
    .replace(/\s+/g, " ")
    .trim();
}

// {"object":{"expression":"hallo world"},"finishReason":"tool-calls","usage":{"promptTokens":401,"completionTokens":37,"totalTokens":438},"warnings":[],"providerMetadata":{"anthropic":{"cacheCreationInputTokens":0,"cacheReadInputTokens":0}},"experimental_providerMetadata":{"anthropic":{"cacheCreationInputTokens":0,"cacheReadInputTokens":0}},"response":{"id":"msg_01EsbNKDH8SwpzRQRxAEJiw2","timestamp":"2025-05-22T19:22:44.290Z","modelId":"claude-3-7-sonnet-20250219","headers":{"anthropic-organization-id":"2258ec43-f37e-43a7-b703-a0f0ec7527c8","anthropic-ratelimit-input-tokens-limit":"200000","anthropic-ratelimit-input-tokens-remaining":"200000","anthropic-ratelimit-input-tokens-reset":"2025-05-22T19:22:43Z","anthropic-ratelimit-output-tokens-limit":"80000","anthropic-ratelimit-output-tokens-remaining":"80000","anthropic-ratelimit-output-tokens-reset":"2025-05-22T19:22:44Z","anthropic-ratelimit-requests-limit":"4000","anthropic-ratelimit-requests-remaining":"3999","anthropic-ratelimit-requests-reset":"2025-05-22T19:22:41Z","anthropic-ratelimit-tokens-limit":"280000","anthropic-ratelimit-tokens-remaining":"280000","anthropic-ratelimit-tokens-reset":"2025-05-22T19:22:43Z","cf-cache-status":"DYNAMIC","cf-ray":"943eaf0949fa6a63-HAM","content-type":"application/json","date":"Thu, 22 May 2025 19:22:44 GMT","request-id":"req_011CPP7XTdc6pn59LCbuwZNh","server":"cloudflare","strict-transport-security":"max-age=31536000; includeSubDomains; preload","via":"1.1 google","x-robots-tag":"none"},"body":{"id":"msg_01EsbNKDH8SwpzRQRxAEJiw2","type":"message","role":"assistant","model":"claude-3-7-sonnet-20250219","content":[{"type":"tool_use","id":"toolu_015AQMiYy96jay44XKzYj2YM","name":"json","input":{"expression":"hallo world"}}],"stop_reason":"tool_use","stop_sequence":null,"usage":{"input_tokens":401,"cache_creation_input_tokens":0,"cache_read_input_tokens":0,"output_tokens":37,"service_tier":"standard"}}},"request":{"body":"{\"model\":\"claude-3-7-sonnet-latest\",\"max_tokens\":4096,\"temperature\":0,\"system\":[{\"type\":\"text\",\"text\":\"you are eva, the emacs virtual assistant. evalute the provided expression.\"}],\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"(eva \\\"say hallo world\\\")\"}]}],\"tools\":[{\"name\":\"json\",\"description\":\"Respond with a JSON object.\",\"input_schema\":{\"type\":\"object\",\"properties\":{\"expression\":{\"type\":\"string\"}},\"required\":[\"expression\"]}}],\"tool_choice\":{\"type\":\"tool\",\"name\":\"json\"}}"}}
