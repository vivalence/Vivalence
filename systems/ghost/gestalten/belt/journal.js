import { is } from "@vivalence/typology";

const SPOKEN = ["text"];
const UNSPOKEN = ["tool_use", "tool_result", "thinking"];

export const prose = (parts) =>
  parts
    .filter((part) => !UNSPOKEN.includes(part.type))
    .map((part) => (SPOKEN.includes(part.type) ? part.text : `[${part.type}]`))
    .join("\n");

export const cells = (turn, buffers) =>
  buffers.filter((buffer) => "turns" in buffer && buffer.turns.some((reference) => (is.string(reference) ? reference : reference.id) === turn.id));

export const streamed = (turn) => turn.createdAt === undefined;
