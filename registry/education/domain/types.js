import { v } from "@vivalence/typology";

// the learning-domain scales the whole mode speaks in — retention statuses (the
// acquisition ladder) and trace signals (per-exercise outcomes).
export const STATUS = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];
export const SIGNAL = ["MASTERY", "SUCCESS", "NEUTRAL", "MISTAKE", "FAILURE"];

export const TUTOR_MESSAGE_INPUT = v.object({
  prompt: v.string().desc("The learner's message to the tutor."),
  thread: v.string().optional().desc("Binds the exchange to the caller's thread."),
});
