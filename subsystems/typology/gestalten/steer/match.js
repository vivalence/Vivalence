import { NotFound } from "../../prototypes/errors/vector.js";

export function feed(matches, signal) {
  if (!matches.length) throw new NotFound(signal);
  if (signal.heir) return matches[0];
  return matches.find(([, , effect]) => effect) ?? matches[0];
}

export function greedy(vector, signal) {
  for (const [pattern, trajectory] of vector.trie) {
    const match = pattern.apply(signal);
    if (match) return [[match, trajectory, trajectory.effect ?? null]];
  }

  return [];
}

export function scope(vector, signal) {
  const scope = [];

  for (const [pattern, trajectory] of vector.trie) {
    if (pattern.type === "wildcard") continue;
    const match = pattern.apply(signal);
    if (match) scope.push([match, trajectory, trajectory.effect ?? null]);
  }

  const wildcard = vector.edge("*");
  if (scope.length > 0 || !wildcard) return scope;

  const [pattern, trajectory] = wildcard;
  return [[pattern.apply(signal), trajectory, trajectory.effect ?? null]];
}
