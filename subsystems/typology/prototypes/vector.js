import { Pattern, Signature } from "@vivalence/typology";

export class Vector {
  constructor(ancestor, signature = Pattern) {
    this.effects = new Map(); // <Pattern->Effect>
    this.trajectories = new Map(); // <Pattern->Vector>
    this.carry = []; // middlewares
    if (ancestor) this.ancestor = ancestor;
    this.signature = signature;
  }

  withSignature(signature) {
    this.signature = signature;
    return this;
  }

  use(middleware) {
    this.carry.push(middleware);
    return this;
  }

  branch(signature) {
    const pattern = new this.signature(signature);

    let descendant = Array.from(this.trajectories.entries()) //
      .find(([i]) => i.nature === pattern.nature || i.hash === pattern.hash)?.[1];

    if (!descendant) {
      descendant = new this.constructor(this, this.signature);
      this.trajectories.set(pattern, descendant);
    }

    if (pattern.heir) {
      return descendant.branch(pattern.heir);
    }
    return descendant;
  }

  open(signature, effect) {
    const pattern = new this.signature(signature);

    if (pattern.heir) {
      const fin = pattern.fin.pop();
      this.branch(pattern).effects.set(fin, effect);
    } else {
      this.effects.set(pattern, effect);
    }

    return this;
  }
  affect(effect) {
    if (this.effects.has(null)) return console.log("vector already affected");
    this.effects.set(null, effect);
    return this;
  }

  set(vector) {
    console.log("vector.set() is depracated");
    return this.slurp(vector);
  }

  slurp(vector) {
    for (const [pattern, effect] of vector.effects) {
      this.effects.set(pattern, effect);
    }

    for (const [pattern, trajectory] of vector.trajectories) {
      const existing = Array.from(this.trajectories.entries()).find(
        ([i]) => i.nature === pattern.nature,
      )?.[1];
      if (existing) {
        existing.slurp(trajectory);
      } else {
        this.trajectories.set(pattern, trajectory);
      }
    }

    this.carry.push(...vector.carry);

    return this;
  }

  // slurp shares a grafted branch by reference (dest.branch IS src.branch — a live
  // link, edit-either-affects-both: structural sharing, by design). swallow is the
  // owning variant: it deep-copies the subtree so dest carries an independent tree.
  // Both share effect handlers + carry by ref (functions are immutable); only the
  // mutable trajectory containers are copied.
  // @beef note: maybe find vector root first? aka slurp from root??? hm.
  swallow(vector) {
    for (const [pattern, effect] of vector.effects) {
      this.effects.set(pattern, effect);
    }

    for (const [pattern, trajectory] of vector.trajectories) {
      const existing = Array.from(this.trajectories.entries()).find(
        ([i]) => i.nature === pattern.nature,
      )?.[1];
      const branch = existing ?? new this.constructor(this, this.signature);
      branch.swallow(trajectory); // recurse into an OWNED branch — never share the ref
      if (!existing) this.trajectories.set(pattern, branch);
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
  get root() {
    let position = this;
    while (position.ancestor) position = position.ancestor;
    return position;
  }
  get heir() {
    return this.descendants[0];
  }

  survey(visit = (node) => node) {
    const effects = [...this.effects.entries()].map(([signature, effect]) =>
      visit({ signature, effect }),
    );
    const trajectories = [...this.trajectories.entries()].map(([signature, descendant]) =>
      visit({ signature, ...descendant.survey(visit) }),
    );
    return { effects, trajectories };
  }
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
