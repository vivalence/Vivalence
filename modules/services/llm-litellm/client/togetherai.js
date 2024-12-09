import config from "@vivalence/config";
import Together from "together-ai";

export default () => {
  const KEY = config.env.get("TOGETHERAI_API_KEY");
  if (!KEY) throw new Error("TOGETHERAI API key is required");

  const together = new Together({ apiKey: KEY });

  return async function togetherai({ prompt, schema, provider }) {
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
      model: provider.model,
      max_tokens: provider.max_tokens || 4096,
      temperature: provider.temperature || 0.7,
      stream: false,
    };

    let response, text, result;
    try {
      response = await together.chat.completions.create(completion);

      console.log(response);
      // for await (const token of response) {
      // }

      text = response.choices[0].message.content;
      result = schema ? JSON.parse(text) : text;
      return result;
    } catch (error) {
      console.log("groq error", error);
      throw new Error(JSON.stringify({ error, response, text, result }));
    }
  };
};
