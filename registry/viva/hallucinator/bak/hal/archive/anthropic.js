import { Anthropic } from "@anthropic-ai/sdk";

export default (KEY) => {
  if (!KEY) throw new Error("Anthropic API key is required");

  const client = new Anthropic({ apiKey: KEY });

  return async function anthropic({ prompt, schema, provider }) {
    const completion = {
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
      model: provider.model || "claude-3-sonnet-20240229",
      max_tokens: provider.max_tokens || 200,
      temperature: provider.temperature || 0.3,
    };

    if (schema) {
      completion.system =
        `The return JSON schema is: ${JSON.stringify(schema)}.` +
        `Respond in JSON. No comments, syntax, newline, escape, decoration, special character or any other text or symbol is allowed.`;
    }
    const response = await client.messages.create(completion);
    const text = response.content[0].text;
    return schema ? JSON.parse(text) : text;
  };
};
