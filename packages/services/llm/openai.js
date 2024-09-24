import config from "@vivalence/config";
import { OpenAI } from "openai/mod.ts";

export default () => {
  const KEY = config.env.get("PRIVATE_OPENAI_API_KEY");
  if (!KEY) throw new Error("OpenAI API key is required");
  const client = new OpenAI({ apiKey: KEY, baseURL: "https://api.openai.com/v1" });

  return async function openai({ prompt, schema, provider }) {
    const start = Date.now();
    const messages = [{ role: "user", content: prompt }];
    const completion = {
      messages,
      model: provider.model || "gpt-4o-2024-08-06", // gpt-4o-mini
      max_tokens: provider.max_tokens || 4096,
      temperature: provider.temperature || 0.5,
    };

    if (schema) {
      completion["response_format"] = {
        type: "json_schema",
        json_schema: {
          name: "response",
          strict: true,
          schema,
        },
      };
    }

    const response = await client.chat.completions.create(completion);
    const text = JSON.parse(response.choices[0].message.content);
    return text;
  };
};
