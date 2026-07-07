import { v } from "@vivalence/typology";

export const GRADES = ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"];

export const RIDDLER_BUFFER_HISTORY = v.array(v.primitives.hallucination.Turn);

export const ASSISTANT_MESSAGE_INPUT = v.object({
  buffer: v.rel(v.buffer()).desc("The riddle buffer this message belongs to."),
  message: v.string().desc("The challenger's answer or question."),
});

export const ASSISTANT_EVALUATE_INPUT = v.object({ buffer: v.rel(v.buffer()) });
