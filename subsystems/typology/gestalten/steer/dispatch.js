import { Signal } from "../../prototypes/signal.js";
import { Signature } from "../../prototypes/signature.js";
import { Long, Short, NotFound } from "../../prototypes/errors/vector.js";
import * as middleware from "../belt/middleware.js";
import { scope, feed } from "./match.js";
import { request, resolve } from "./strategy.js";
import { descend } from "./trie.js";

export const execute = (vector, context, signal = new Signal()) => {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return carry(context, resolve(effect));
};

export function traverse(vector, signals) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let remainder = 0;
  let missing = null;

  const miss = () => {
    if (missing === null) return [null, carry, steps, position];
    const match = missing.edge.pattern.apply(signals.array[missing.depth]);
    return [missing.edge.trajectory.effect, descend(missing.carry, missing.position), [...steps.slice(0, missing.depth), match], missing.edge.trajectory];
  };

  for (const signal of signals.array) {
    if (position.trie.has("*")) missing = { edge: position.trie.get("*"), carry, position, depth: steps.length };

    if (signal.nature == null) {
      if (position.effect) return [position.effect, descend(carry, position), steps, position];
      return miss();
    }

    let match, trajectory, effect;
    try {
      [match, trajectory, effect] = feed(scope(position, signal), signal);
    } catch (error) {
      if (error instanceof NotFound) return miss();
      throw error;
    }

    steps.push(match);

    if (match.type === "remainder") {
      match.parameter = String(remainder);
      match.parameters = { [remainder]: match.nature };
      remainder++;

      if (signals.length === steps.length) {
        carry = descend(carry, position);
        if (effect) return [effect, carry, steps, position];
      }

      continue;
    }

    carry = descend(carry, position);

    if (effect && trajectory && signals.length !== steps.length) {
      position = trajectory;
      continue;
    }
    if (effect) return [effect, carry, steps, position];
    if (trajectory) position = trajectory;
  }

  if (position.effect) return [position.effect, carry, steps, position];
  return miss();
}

export function invoke(vector, signal, execute = request) {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry, steps] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return execute(carry, effect, steps, signal);
}

export function shotgun(vector, signal, execute = request) {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  let position = vector;
  let carry = middleware.forward;
  let steps = [];

  for (let i = 0; i < signal.array.length; i++) {
    const seg = signal.array[i];
    const matches = scope(position, seg);

    carry = descend(carry, position);

    if (i === signal.array.length - 1) {
      return matches
        .filter(([, , effect]) => effect)
        .map(([match, , effect]) => execute(carry, effect, [...steps, match], signal));
    }

    const trajectory = matches.find(([, t]) => t);
    if (!trajectory) return [];
    steps.push(trajectory[0]);
    position = trajectory[1];
  }

  return [];
}

export async function walk(vector, more) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let signal;

  while (position.patterns.length) {
    if (steps.length >= 20) throw new Long();
    if (!signal?.nature) signal = await more(position.patterns);
    if (!signal.nature) throw new Short(position);

    const [effect, luggage, path, trajectory] = traverse(position, signal);
    if (!effect && path.length < signal.array.length) throw new NotFound(signal);

    carry = middleware.chain(carry, luggage);
    steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
