import { is } from "@vivalence/shared";
import { Pattern } from "@vivalence/typology";

export class Vector {
  // extends Signature
  constructor(ancestor) {
    // super(ancestor)
    this.effects = new Map(); // <Pattern->Effect>
    this.trajectories = new Map(); // <Pattern->Vector>
    this.carry = []; // middlewares
    if (ancestor) this.ancestor = ancestor;
  }
  // legacy
  get middlewares() {
    console.log("vector.middlewares is now vector.carry");
    throw new Error("vector.middlewares is now vector.carry");
  }

  use(middleware) {
    this.carry.push(middleware);
    return this;
  }

  branch(signature) {
    const pattern = new Pattern(signature);

    let descendant = Array.from(this.trajectories.entries()) //
      .find(([{ hash }]) => hash === pattern.hash)?.[1];

    if (!descendant) {
      descendant = new Vector(this);
      this.trajectories.set(pattern, descendant);
    }

    return pattern.heir ? descendant.branch(pattern.heir) : descendant;
  }
  open(signature, effect) {
    const pattern = new Pattern(signature);

    if (pattern.fin) {
      const fin = pattern.fin.pop();
      this.branch(pattern).effects.set(fin, effect);
    } else this.effects.set(pattern, effect);

    return this;
  }

  // slurp(vector) {}
  set(vector) {
    for (const [pattern, effect] of vector.effects) {
      this.effects.set(pattern, effect);
    }

    for (const [pattern, trajectory] of vector.trajectories) {
      this.trajectories.set(pattern, trajectory);
    }

    this.carry.push(...vector.carry);

    return this;
  }

  // TODO move getters to @controller
  get patterns() {
    return [...this.effects.keys(), ...this.trajectories.keys()];
  }
  get descendants() {
    return [...this.trajectories.values()];
  }
  get heir() {
    return this.descendants[0];
  }
}
