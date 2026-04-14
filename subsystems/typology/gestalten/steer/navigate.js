import { Long, Short, Signal } from "@vivalence/typology";
import { middleware } from "@vivalence/typology";
import { scope, feed } from "./match.js";

export function traverse(vector, signals) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals.array) {
    const [match, trajectory, effect] = feed(scope(position, signal), signal);

    steps.push(match);

    if (match.type === "remainder") {
      match.parameter = String(remainder);
      match.parameters = { [remainder]: match.nature };
      remainder++;

      if (signals.length === steps.length) {
        carry = middleware.chain(carry, middleware.compose(position.carry));
        if (effect) return [effect, carry, steps, position];
      }

      continue;
    }

    carry = middleware.chain(carry, middleware.compose(position.carry));

    if (effect && trajectory && signals.length !== steps.length) {
      position = trajectory;
      continue;
    }
    if (effect) return [effect, carry, steps, position];
    if (trajectory) position = trajectory;
  }

  return [null, carry, steps, position];
}

export function survey(vector, visit = (node) => node, execute) {
  return (function step(position, carry, steps, signal) {
    carry = middleware.chain(carry, middleware.compose(position.carry));

    const effects = [...position.effects].map(([signature, effect]) => {
      const path = [...steps, signature];
      const invoke = execute ? execute(carry, effect, path, signal.branch(signature.nature)) : undefined;
      return visit({ signature, effect, invoke, path });
    });

    const trajectories = [...position.trajectories].map(([signature, descendant]) => {
      const path = [...steps, signature];
      const children = step(descendant, carry, path, signal.branch(signature.nature));
      return visit({ signature, ...children, path });
    });

    return { effects, trajectories };
  })(vector, middleware.forward, [], new Signal());
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

    carry = middleware.chain(carry, luggage);
    steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
