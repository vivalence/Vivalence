import { Signal, is } from "@vivalence/typology";
import { ReplSignal } from "../../prototypes/replsignal.js";

const positional = (pattern) => Object.values(pattern.schema === undefined ? {} : pattern.schema.properties).filter((property) => property.group !== "flags").length;

const follow = (edge, word) =>
  word
    .split("/")
    .filter((part) => part.length > 0)
    .reduce((held, part) => (held !== null && held.trajectory.trie.has(part) ? held.trajectory.trie.get(part) : null), edge);

export function read(vector, input) {
  if (!is.string(input) || input.startsWith("/") || input.startsWith("--")) return new ReplSignal(input);
  const words = Signal.tokens(input);
  const said = words[0] === "viva" ? words.slice(1) : words;
  let edge = { trajectory: vector };
  let walked = 0;
  for (const word of said) {
    const next = follow(edge, word);
    if (next === null || next === edge) break;
    edge = next;
    walked++;
  }
  if (walked === 0 || edge.trajectory.effect === null) return new ReplSignal(input);
  const verb = new ReplSignal([said.slice(0, walked).join("/"), ...said.slice(walked)]);
  return verb.body.length <= positional(edge.pattern) ? verb : new ReplSignal(input);
}
