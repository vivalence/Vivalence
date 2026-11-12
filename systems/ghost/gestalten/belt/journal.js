import { belt, is } from "@vivalence/typology";

const SPOKEN = ["text"];
const UNSPOKEN = ["tool_use", "tool_result", "thinking"];

export const prose = (parts) =>
  parts
    .filter((part) => !UNSPOKEN.includes(part.type))
    .map((part) => (SPOKEN.includes(part.type) ? part.text : `[${part.type}]`))
    .join("\n");

export const yields = (turns) => turns.flatMap((turn) => turn.parts.filter((part) => part.type === "tool_result"));

const surfaced = (turn, yields) =>
  turn.parts
    .filter((part) => part.type === "tool_use")
    .map((call) => yields.find((result) => result.id === call.id))
    .filter((result) => result !== undefined && is.object(result.product) && "buffer" in result.product)
    .flatMap((result) => result.product.buffer.map((buffer) => buffer.id));

export const cells = (turn, buffers, yields) =>
  buffers.filter((buffer) => surfaced(turn, yields).includes(buffer.id));

export const streamed = (turn) => turn.createdAt === undefined;

const origin = (entry) => ("record" in entry ? entry.record : entry.turn);

const folded = (entry) => ("record" in entry ? [] : entry.turns);

const unchanged = (held, entry) =>
  origin(held) === origin(entry) &&
  held.row.kind === entry.row.kind &&
  held.at === entry.at &&
  folded(held).length === folded(entry).length &&
  folded(held).every((turn, index) => turn === folded(entry)[index]) &&
  belt.object.equals(held.row, entry.row);

export const retain = (prior, entries) => {
  const kept = entries.map((entry) => prior.find((held) => unchanged(held, entry)) ?? entry);
  return kept.length === prior.length && kept.every((entry, index) => entry === prior[index]) ? prior : kept;
};
