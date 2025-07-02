import { Type, Static } from "@sinclair/typebox";
import { Slug } from "@vivalence/types/schema";

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
      description: `The term, phrase or sentence in the user's known language, including concise examples of use.
	No special characters. 
	`,
      maxLength: 50,
    }),
    learning: Type.String({
      description:
        "the same text as known, but written entirely in the language being learned.",
      maxLength: 80,
    }),
  },
  {
    description: `An item that can be learned or memorized. the slug is allways in the language to be learnt.
	A Learnable only ever one single gender/plurality/case/tense. never multiple. no /`,
  },
);

export const Learnables = Type.Array(Learnable, {
  description: `A collection of specific learnables to be learned. a learnable might be a word, a phrase, a grammatical insight, or any individual specific bit.`,
});

export const Session = Type.Object(
  {
    dependencies: Type.Array(
      Type.String({ description: "slug->slug, maybe slug->slug->slug" }),
      {
        description: "A DAG of conditions among the learnables.",
      },
    ),
    sections: Type.Array(
      Type.String({
        description: `a single section for example: "(slug, slug, slug) 'must be mastered first'"`,
      }),
      {
        description: `groups of learnables. set in stages.
	first we cover the basics and preconditions.
	then we cover the material, grouped into self-similar sections.
	each starting small and moving up towards one final, bigger integration.`,
      },
    ),
  },
  {
    description: `
	Your Session Plan. This is your place to design a great learning journey.
	A good session plan covers what things are to be learned, tracks dependencies between learnables, and defines implicit knowledge and preconditions.

	A good session plan lays out an approach and a coherent perspective towards the session.
	You can use differnt methods to structure a session.
	Maybe defining stages and milestones is a good idea. Maybe create a DAG to map dependencies.

	Our overarching methodology is active learning. At every step the user is expected to do some unit of mental work, by remembering, combining, changing, predicting, etc.
	`,
  },
);

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
