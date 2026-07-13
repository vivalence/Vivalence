import { v } from "@vivalence/typology";

export const PRIMER_HISTORY = v.array(v.primitives.hallucination.Turn);

export const SCENE = v.object({
  prose: v
    .string()
    .desc(
      "The next passage of the tale, two to four sentences, addressed to the child as the hero. Weave the target concept into the events so that learning it IS advancing the plot. Never name it as a lesson.",
    ),
  question: v
    .string()
    .desc("One in-world question the hero must answer to go on, which turns on the target concept."),
  choices: v
    .array(
      v.object({
        label: v.string().desc("A short in-world answer the child can choose."),
        correct: v.boolean().desc("True for the one answer that shows the concept is understood."),
      }),
      { minItems: 2, maxItems: 2 },
    )
    .desc("Exactly two answers; exactly one correct."),
});

export const VIEW_SCENE = v.object({
  prose: v.string(),
  question: v.string(),
  choices: v.array(v.object({ label: v.string() })),
});

export const TURN_INPUT = v.object({
  buffer: v.rel(v.buffer()).desc("The primer story buffer."),
  choice: v.integer({ minimum: 0 }).optional().desc("Index of the chosen answer; omit to open the tale."),
  thread: v.string().optional(),
});

export const TURN_OUTPUT = v.object({
  concept: v.object({ slug: v.string(), name: v.string() }).optional(),
  scene: VIEW_SCENE.optional(),
  progress: v.object({ mastered: v.integer(), total: v.integer() }),
  done: v.boolean().default(false),
});
