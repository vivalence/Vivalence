import config from "@vivalence/config";
import { OpenAI } from "openai";

export default () => {
  const KEY = config.env.get("GROQ_API_KEY");
  if (!KEY) throw new Error("GROQ API key is required");

  const client = new OpenAI({ apiKey: KEY, baseURL: "https://api.groq.com/openai/v1" });

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
        content: `Return 1 (one) JSON object. return the applied properties:{} object from this schema: ${JSON.stringify(
          schema,
          null,
          2,
        )}. apply the properties.`,
      });
    }
    // console.log("groq completion", completion);

    let response, text, result;
    try {
      response = await client.chat.completions.create(completion);
      // console.log("groq response", response);
      text = response.choices[0].message.content;
      result = schema ? JSON.parse(text) : text;
      return result;
    } catch (error) {
      console.log("groq error", error);
      throw new Error(JSON.stringify({ error, response, text, result }));
    }
  };
};
