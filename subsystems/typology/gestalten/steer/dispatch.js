import { Signal, Long, Short, middleware, NotFound } from "@vivalence/typology";
import { scope, feed } from "./match.js";
import { request } from "./strategy.js";
import { descend } from "./trie.js"; // the carry-fold step, shared with the tree family

// PATH family — consume a Signal and descend the vector by MATCHING (early-terminate,
// param/wildcard/remainder binding). Each shares the carry-descend step but mirrors
// its OWN geometry (a path with a tip-fan for shotgun). Counterpart: tree.js, which
// enumerates the whole vector. Do not cross-compare the two families' forms.

export function traverse(vector, signals) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals.array) {
    if (signal.nature == null) {
      carry = descend(carry, position);
      return [position.effect ?? null, carry, steps, position];
    }

    let match, trajectory, effect;
    try {
      [match, trajectory, effect] = feed(scope(position, signal), signal);
    } catch (error) {
      if (error instanceof NotFound) return [null, carry, steps, position];
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

  return [position.effect ?? null, carry, steps, position];
}

export function invoke(vector, signal, execute = request) {
  signal = new Signal(signal);
  const [effect, carry, steps] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return execute(carry, effect, steps, signal);
}

export function shotgun(vector, signal, execute = request) {
  signal = new Signal(signal);
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
