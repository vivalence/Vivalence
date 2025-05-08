import { OpenAI } from "openai";

export default (KEY) => {
  if (!KEY) throw new Error("OpenAI API key is required");
  const client = new OpenAI({
    apiKey: KEY,
    baseURL: "https://api.openai.com/v1",
  });

  return async function openai({ prompt, schema, provider }) {
    const messages = [{ role: "user", content: prompt }];
    const completion = {
      messages,
      model: provider.model || "gpt-4o",
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
    const text = response.choices[0].message.content;
    return schema ? JSON.parse(text) : text;
  };
};
