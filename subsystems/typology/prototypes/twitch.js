import { Vector } from "./vector.js";
import { fire } from "../gestalten/steer/strategy.js";

const sequence = (first, second) => async (ctx) => {
  await fire(first, ctx);
  await fire(second, ctx);
};

export class Twitch extends Vector {
  open(signature, effect) {
    const ear = this.branch(signature);
    ear.effect = ear.effect ? sequence(ear.effect, effect) : effect;
    return this;
  }

  graft(vector) {
    if (vector === this) return this;
    if (vector.effect) this.effect = this.effect ? sequence(this.effect, vector.effect) : vector.effect;
    for (const [nature, edge] of vector.trie) {
      const existing = this.trie.get(nature);
      const ear = existing?.trajectory ?? new this.constructor(this, this.signature);
      ear.graft(edge.trajectory);
      if (existing) existing.pattern = edge.pattern;
      else this.trie.set(nature, { pattern: edge.pattern, trajectory: ear });
    }
    this.carry.push(...vector.carry);
    return this;
  }
}
