import { Vector } from "./vector.js";
import { shotgun } from "../gestalten/steer/dispatch.js";
import { fire } from "../gestalten/steer/strategy.js";

const sequence = (first, second) => async (ctx) => {
  await fire(first, ctx);
  await fire(second, ctx);
};

export class Twitch extends Vector {
  open(signature, effect) {
    const trajectory = this.branch(signature);
    trajectory.effect = trajectory.effect ? sequence(trajectory.effect, effect) : effect;
    return this;
  }

  graft(vector) {
    if (vector === this) return this;
    if (vector.effect) this.effect = this.effect ? sequence(this.effect, vector.effect) : vector.effect;
    for (const [pattern, trajectory] of vector.trie) this.seat(pattern).graft(trajectory);
    this.carry.push(...vector.carry);
    return this;
  }

  async dispatch(signal, input) {
    for (const effect of shotgun(this, signal)) await effect(input);
  }
}
