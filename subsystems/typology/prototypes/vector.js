import { Pattern, Signature } from "@vivalence/typology";

export class Vector {
  constructor(ancestor, signature = Pattern) {
    this.effect = null;
    this.trie = new Map();
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

  branch(signature, vector) {
    const pattern = new this.signature(signature);

    if (pattern.nature == null && !pattern.heir) return this;

    let edge = this.trie.get(pattern.nature);
    if (!edge) {
      edge = { pattern, trajectory: (!pattern.heir && vector) || new this.constructor(this, this.signature) };
      this.trie.set(pattern.nature, edge);
    } else if (vector && !pattern.heir) {
      edge.trajectory.graft(vector);
    }

    if (pattern.heir) {
      return edge.trajectory.branch(pattern.heir, vector);
    }
    return edge.trajectory;
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

  graft(vector) {
    if (vector === this) return this;
    if (vector.effect) this.effect = vector.effect;

    for (const [nature, edge] of vector.trie) {
      const existing = this.trie.get(nature);
      const branch = existing?.trajectory ?? new this.constructor(this, this.signature);
      branch.graft(edge.trajectory);
      if (existing) existing.pattern = edge.pattern;
      else this.trie.set(nature, { pattern: edge.pattern, trajectory: branch });
    }

    this.carry.push(...vector.carry);

    return this;
  }

  get patterns() {
    return [...this.trie.values()].map((edge) => edge.pattern);
  }
  get descendants() {
    return [...this.trie.values()].map((edge) => edge.trajectory);
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
    const trajectories = [...this.trie.values()] //
      .map((edge) => visit({ signature: edge.pattern, ...edge.trajectory.survey(visit) }));
    return { effect: this.effect, trajectories };
  }
}
