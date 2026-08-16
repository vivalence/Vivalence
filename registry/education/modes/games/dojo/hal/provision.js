import { v } from "@vivalence/typology";
import * as types from "../types.js";

const PROVISION_RENDER_OUTPUT = v.object({
  reply: v.string().desc("One plain sentence back to the driver — what the rule says and why."),
  clause: types.clause
    .desc(
      "ONE rule the request describes — pick, query, cap. The drawer loads it into the builder for the learner to edit before it is added. Omit when the request describes no material.",
    )
    .optional(),
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
    .desc("Only the axes the request changes; null clears one.")
    .optional(),
});

export const provision = {
  output: PROVISION_RENDER_OUTPUT,

  identity: ({ known, learning }) =>
    `You turn a learner's request into ONE dojo rule for a learner of ${learning.name} whose native language is ${known.name}.
A rule = a clause: pick (the stream) + where (the literal repository's query) + limit. You never add it and never start a session — the learner edits it in the builder first.
The output schema's descriptions are the documentation: read them, write exactly what the learner means, nothing implied.
Symbol constraints are explicit: symbols.$all = every one required, $in = at least one, $none = excluded. Trait constraints likewise: traits.$contains, $overlap, $none.
Axes only when the request names how to play (listen, streak, continuous, a limit).`,

  request: (vocabulary, state, text) => `Available symbols, grouped:
${vocabulary.join("\n")}

Current state:
${JSON.stringify(state)}

Request: ${text}`,
};
