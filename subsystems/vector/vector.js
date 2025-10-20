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
  // branch(signature) {
  //   let pattern = new Pattern(signature);
  //   // console.log("p", { signature, pattern });
  //   let position = this;

  //   while (pattern) {
  //     // console.log("while", pattern);
  //     // console.log("@pattern", !!pattern);
  //     for (const entry of position.trajectories.entries()) {
  //       if (entry[0].hash === pattern.hash) {
  //         position = entry[1];
  //         pattern = pattern.heir;
  //         continue;
  //       }
  //     }
  //     if (pattern) {
  //       // console.log("@pattern", !!pattern);
  //       const location = new Vector(this);
  //       // console.log("@pattern", !!pattern);
  //       position.trajectories.set(pattern, location);
  //       // console.log("@pattern", !!pattern);
  //       position = location;
  //       // console.log("@pattern", !!pattern);
  //       pattern = pattern.heir;
  //     }
  //   }

  //   return position;
  // }

  branch(signature) {
    const pattern = new Pattern(signature);

    let descendant = Array.from(this.trajectories.entries()) //
      .find(([i]) => i.hash === pattern.hash)?.[1];

    if (!descendant) {
      descendant = new Vector(this);
      this.trajectories.set(pattern, descendant);
    }

    if (pattern.heir) {
      return descendant.branch(pattern.heir);
    }
    return descendant;
  }
  open(signature, effect) {
    const pattern = new Pattern(signature);

    if (pattern.heir) {
      const finn = pattern.finn.pop();
      this.branch(pattern).effects.set(finn, effect);
    } else {
      this.effects.set(pattern, effect);
    }

    return this;
  }

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
