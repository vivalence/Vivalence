import OpenAI from "openai";
import { env } from "$env/dynamic/private";
const { ANYSCALE_API_KEY, SYSTEM_MODE } = env;

const anyscaleClient = new OpenAI({
  apiKey: ANYSCALE_API_KEY || "",
  baseURL: "https://api.endpoints.anyscale.com/v1",
});
// model: "mistralai/Mixtral-8x7B-Instruct-v0.1"

export async function anyscale({ prompt, schema, provider }) {
  const messages = [{ role: "user", content: prompt }];

  if (schema) {
    messages.unshift({
      role: "user",
      content: `The return JSON schema is: ${JSON.stringify(schema)}.` +
        `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`,
    });
  }
  const completion = {
    messages,
    model: provider.model,
  };

  if (schema && provider.model.startsWith("mistralai/")) {
    completion["response_format"] = { type: "json_object", schema };
  }

  const response = await anyscaleClient.chat.completions.create(completion);
  const text = response.choices[0].message.content;
  return schema ? JSON.parse(text) : text;
}
