import { Pattern, Signature } from "@vivalence/typology";

export class Vector {
  constructor(ancestor, signature = Pattern) {
    this.effect = null;
    this.trajectories = new Map();
    this.carry = [];
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

    const existing = Array.from(this.trajectories.entries()).find(
      ([i]) => i.nature === pattern.nature || i.hash === pattern.hash,
    );

    let descendant;
    if (existing) {
      descendant = existing[1];
    } else {
      descendant = new this.constructor(this, this.signature);
      this.trajectories.set(pattern, descendant);
    }

    if (pattern.heir) {
      return descendant.branch(pattern.heir);
    }
    return descendant;
  }

  open(signature, effect) {
    this.branch(signature).effect = effect;
    return this;
  }

  affect(effect) {
    if (this.effect) return console.log("vector already affected");
    this.effect = effect;
    return this;
  }

  set(vector) {
    console.log("vector.set() is depracated");
    return this.slurp(vector);
  }

  slurp(vector) {
    if (vector.effect) this.effect = vector.effect;

    for (const [pattern, trajectory] of vector.trajectories) {
      const existing = Array.from(this.trajectories.entries()) //
        .find(([i]) => i.nature === pattern.nature)?.[1];
      if (existing) {
        existing.slurp(trajectory);
      } else {
        this.trajectories.set(pattern, trajectory);
      }
    }

    this.carry.push(...vector.carry);

    return this;
  }

  swallow(vector) {
    if (vector.effect) this.effect = vector.effect;

    for (const [pattern, trajectory] of vector.trajectories) {
      const existing = Array.from(this.trajectories.entries()) //
        .find(([i]) => i.nature === pattern.nature)?.[1];
      const branch = existing ?? new this.constructor(this, this.signature);
      branch.swallow(trajectory);
      if (!existing) this.trajectories.set(pattern, branch);
    }

    this.carry.push(...vector.carry);

    return this;
  }

  get patterns() {
    return [...this.trajectories.keys()];
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
    const trajectories = [...this.trajectories.entries()] //
      .map(([signature, descendant]) => visit({ signature, ...descendant.survey(visit) }));
    return { effect: this.effect, trajectories };
  }
}
