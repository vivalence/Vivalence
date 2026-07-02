import { OpenAI } from "openai";

export default (KEY) => {
  if (!KEY) throw new Error("GROQ API key is required");

  const client = new OpenAI({
    apiKey: KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  return async function groq({ prompt, schema, provider }) {
    const messages = [{ role: "user", content: prompt }];

    const completion = {
      messages,
      model: provider.model,
      max_tokens: provider.max_tokens || 4096,
      temperature: provider.temperature || 0.7,
    };

    if (schema) {
      completion["response_format"] = { type: "json_object" };
      messages.unshift({
        role: "user",
        content: `Return 1 (one) JSON object. return the applied properties:{} object from this schema: ${JSON.stringify(schema)}. apply the properties.`,
      });
    }

    const response = await client.chat.completions.create(completion);
    const text = response.choices[0].message.content;
    return schema ? JSON.parse(text) : text;
  };
};
