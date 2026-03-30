// Dead steer controllers — no live consumers as of 2026-03-30.
// shine renamed to shotgun in apply.js.
// shotgun (old, fire-along-the-way) moved here.
// spray + harvest moved here.
// collect (one-level) moved here from navigate.js.

import { Signal, middleware } from "@vivalence/typology"
import { scope } from "./match.js";
import { direct } from "./strategy.js";

// Old shotgun: fire all effects along the path (not just terminal)
export function shotgun_along(vector, signal, execute = direct) {
  signal = new Signal(signal)
  let position = vector
  let carry = middleware.forward
  let steps = []
  const collected = []

  for (let i = 0; i < signal.array.length; i++) {
    const seg = signal.array[i]
    const matches = scope(position, seg)

    carry = middleware.chain(carry, middleware.compose(position.carry))

    for (const [match, , effect] of matches) {
      if (effect) collected.push(execute(carry, effect, [...steps, match], signal))
    }

    if (i < signal.array.length - 1) {
      const trajectory = matches.find(([, t]) => t)
      if (!trajectory) break
      steps.push(trajectory[0])
      position = trajectory[1]
    }
  }

  return collected
}

export function spray(vector, signal, execute = direct) {
  signal = new Signal(signal)
  let position = vector
  let carry = middleware.forward
  let steps = []

  for (const seg of signal.array) {
    carry = middleware.chain(carry, middleware.compose(position.carry))
    const matches = scope(position, seg)

    const trajectory = matches.find(([, t]) => t)
    if (!trajectory) return []
    steps.push(trajectory[0])
    position = trajectory[1]
  }

  return harvest(position, carry, steps, signal, execute)
}

function harvest(vector, carry, steps, signal, execute) {
  carry = middleware.chain(carry, middleware.compose(vector.carry))
  const collected = []

  for (const [pattern, effect] of vector.effects) {
    collected.push(execute(carry, effect, [...steps, pattern], signal))
  }

  for (const [pattern, descendant] of vector.trajectories) {
    collected.push(...harvest(descendant, carry, [...steps, pattern], signal, execute))
  }

  return collected
}

export const collect = (vector, signals) =>
  signals
    .flatMap((signal) => scope(vector, signal))
    .filter(([match]) => match)
    .map(([match, trajectory, effect]) => ({
      effect,
      carry: middleware.compose([vector.carry, trajectory?.carry].flat().filter(Boolean)),
      steps: [match],
      match,
    }))
