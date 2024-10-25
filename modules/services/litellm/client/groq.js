import config from "@vivalence/config";
import { OpenAI } from "openai";

export default () => {
  const KEY = config.env.get("PRIVATE_GROQ_API_KEY");
  if (!KEY) throw new Error("GROQ API key is required");

  const client = new OpenAI({ apiKey: KEY, baseURL: "https://api.groq.com/openai/v1" });

  return async function groq({ prompt, schema, provider }) {
    const messages = [{ role: "user", content: prompt }];

    if (schema) {
      messages.unshift({
        role: "user",
        content:
          `The return JSON schema is: ${JSON.stringify(schema, null)}.` +
          `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`,
      });
    }

    const completion = {
      messages,
      model: provider.model || "llama2-70b-4096",
      max_tokens: provider.max_tokens || 4096,
      temperature: provider.temperature || 0.8,
    };

    let response, text, result;
    try {
      response = await client.chat.completions.create(completion);
      text = response.choices[0].message.content;
      result = schema ? JSON.parse(text) : text;
      return result;
    } catch (error) {
      throw new Error(JSON.stringify({ error, response, text, result }));
    }
  };
};
