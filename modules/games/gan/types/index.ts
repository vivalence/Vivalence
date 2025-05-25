import { Type, Static } from "@sinclair/typebox";
import { Slug } from "@vivalence/schema";

export { Slug };

export const Planning = Type.String({
  description: `Go through the task step by step.`,
});

// learnables agent
export const Status = Type.Union(
  [Type.Literal("UNKNOWN"), Type.Literal("KNOWN")],
  {
    default: "UNKNOWN",
    description:
      "Changes over the course of a session. Session is completed once all are KNOWN.",
  },
);
export const Evaluations = Type.Record(Slug, Status, {
  description: `A map of [Learnable.slug]: [Status.enum].
Reflects all changes to learnable status given the input.
Whatever learnable was successfully demonstraded, flip it to KNOWN.`,
});

export const Learnable = Type.Object(
  {
    slug: Slug,
    status: Status,
    known: Type.String({
      description:
        "The term or concept in the user's known language, including concise examples of use.",
      maxLength: 50,
    }),
    learning: Type.String({
      description:
        "the same text as known, but written entirely in the language being learned.",
      maxLength: 80,
    }),
  },
  {
    description: "An item that can be learned or memorized",
  },
);

export const Learnables = Type.Array(Learnable, {
  description: `A collection of specific learnables to be learned. a learnable might be a word, a phrase, a grammatical insight, or any individual specific bit.`,
});

// session planner / trajectory agent
const Clue = Type.String({
  description: `# Clue 'a way to embed information'. Process of clue construction: 1: a list and explanation of the learnables(by slug) involved 2: the information known and unknown to the user 3: find one way to suggest the information to the user. it must require the user to do the thinking themselves. Its a way to spin the bit of information. Max length: 50 characters`,
  // maxLength: 100,
});

const ExpectedResponse = Type.String({
  description: `the response we expect from the user.`,
  // maxLength: 25,
});
const Prompt = Type.String({
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

const Message = Type.Object(
  {
    index: Type.Number(),
    slug: Slug,
    expectedResponse: ExpectedResponse,
    clue: Clue,
    prompt: Prompt,
  },
  {
    description: `
A: define the learnable in slug and expectation.
B: find a way to spin the learnable in a clue.
C: Design a prompt.
 `,
  },
);
export const Session = Type.Array(Message, {
  description: `a prediction of the conversation that teaches the learnables step by step.`,
});

export const History = Type.Array(
  Type.Object({
    role: Type.String(),
    content: Type.String(),
  }),
);

// export type StepType = Static<typeof Step>;
// export type ProcessType = Static<typeof Process>;
// export type LearnableType = Static<typeof Learnable>;
// export type LearnablesType = Static<typeof Learnables>;

// state: Type.Optional(Type.String({description: "Current state of the learnable (e.g., 'todo', 'completed')",}),),
