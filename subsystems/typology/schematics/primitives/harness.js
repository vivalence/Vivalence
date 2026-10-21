import { v } from "../v.js";
import * as hallucination from "./hallucination.js";

export const Call = v.object({
  body: v.array(v.unknown()).desc('The words after the verb, as a Signal carries them. Example: ["ciao"]'),
  flags: v.record(v.string(), v.unknown()).desc('The --flags, as a Signal carries them. Example: { "pace": "40ms" }'),
});

export const Signal = v.object({
  nature: v.string().desc('The effect\'s route. Example: "/mode/console/whoami"'),
  body: v.array(v.unknown()).desc('The words after the nature. Example: ["ciao"]'),
  flags: v.record(v.string(), v.unknown()).desc('The --flags. Example: { "pace": "40ms" }'),
});

export const Request = v.object({
  thread: v.string().desc('The thread the turn appends to. Example: "th3"'),
  terminal: v.string().optional().desc('The calling terminal, whenever a terminal calls. Example: "t1"'),
  turn: v.string().optional().desc('The id the user turn is minted under; the caller picks it to find the turn again. Example: "6f1c0d2e"'),
  parts: v.array(hallucination.Part.Any).desc('The user turn\'s parts. Example: [{ "type": "text", "text": "ciao" }]'),
  tune: hallucination.Tune.optional(),
  config: v.record(v.string(), v.unknown()).optional().desc('Policy overrides. Example: { "rounds": 2 }'),
  system: v.record(v.string(), v.unknown()).optional().desc('Named primer sections, each a string or a Primer. Example: { "system": "You are memo." }'),
  output: v.record(v.string(), v.unknown()).optional().desc('A schema the answer must fit. Example: { "type": "object" }'),
  tools: v.record(v.string(), v.unknown()).optional().desc('In-process tools a caller supplies. Example: { "echo": { "execute": fn } }'),
});
