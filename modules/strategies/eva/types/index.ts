import { Type, Static } from "@sinclair/typebox";
import { Slug } from "@vivalence/schema";

export { Slug };

export const Planning = Type.String({
  description: `Go through the task step by step.`,
});

export const Prompt = Type.String({
  description: `
    A Prompt is the most minimal and concise way possible to request the knowledge.
    A prompt doesnt include chatter and there is no feel-good talk. A prompt is direct.
    Without revealing the learnable. Its consise, direct and structured. No more than 200 characters.
    """Good prompt example:
	Lets start with the sentence "The girl sings."

	Latin clues:
	- 'girl' is 'puella'.
	- 'canere' is the infinitive of 'to sing.
	- For third person singular add "-it" to the stem "can-".

	What's "the girl sings" in latin?
    """
    This prompt starts with the goal, give clues but not solutions, and then expects active learning.
    Multiple lines, bits of information. We don't want full text or conversation.`,

  // maxLength: 300,
});

export const History = Type.Array(
  Type.Object({
    role: Type.String(),
    content: Type.Array(Type.Any()),
  }),
);

// export type StepType = Static<typeof Step>;
// export type ProcessType = Static<typeof Process>;
// export type LearnableType = Static<typeof Learnable>;
// export type LearnablesType = Static<typeof Learnables>;

// state: Type.Optional(Type.String({description: "Current state of the learnable (e.g., 'todo', 'completed')",}),),
