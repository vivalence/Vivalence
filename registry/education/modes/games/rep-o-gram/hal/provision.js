import { v } from "@vivalence/typology";
import * as types from "../types.js";

const PROVISION_RENDER_OUTPUT = v.object({
  reply: v.string().desc("One plain sentence back to the driver — what was set up and why."),
  axes: v
    .object({
      recall: types.recall,
      gameplay: types.gameplay.optional(),
      prompt: types.prompt.optional(),
      preview: types.preview,
      streak: types.streak,
      continuous: types.continuous,
      limit: types.limit,
      forgiving: types.forgiving.optional(),
    })
    .desc("Only the axes the request changes.")
    .optional(),
  symbols: v
    .array(v.string())
    .desc("Symbol slugs scoping the draw — only slugs from the available list; they AND together.")
    .optional(),
  knowables: v
    .array(
      v.object({
        known: v.string().desc("The pair's face in the learner's native language."),
        learning: v.string().desc("The pair's face in the language being learned."),
      }),
    )
    .desc("Inline-authored pairs — only when the request asks for authored content. They rep without touching memory.")
    .optional(),
});

export const provision = {
  output: PROVISION_RENDER_OUTPUT,

  identity: ({ known, learning }) =>
    `You provision a rep buffer for a learner of ${learning.name} whose native language is ${known.name}.
The output schema's descriptions are the documentation — read them and set only what the request asks for.
When the request names a topic without asking for symbols, author knowables inline: ${learning.name} on the learning side, ${known.name} on the known side, correct and natural.`,

  request: (symbols, text) => `Available symbols: ${symbols.join(", ")}

Request: ${text}`,
};
