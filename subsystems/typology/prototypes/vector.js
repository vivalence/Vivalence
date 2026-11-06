import { Pattern } from "./pattern.js";
import { Signature } from "./signature.js";

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

  use(...middlewares) {
    this.carry.push(...middlewares);
    return this;
  }

  branch(signature, vector) {
    const pattern = new this.signature(signature);
    if (pattern.nature == null && !pattern.heir) return this;
    if (pattern.heir) return this.seat(pattern).branch(pattern.heir, vector);
    const seated = this.seat(pattern, vector);
    if (vector && seated !== vector) seated.graft(vector);
    return seated;
  }

  edge(nature) {
    for (const entry of this.trie) if (entry[0].nature === nature) return entry;
    return null;
  }

  seat(pattern, trajectory = new this.constructor(this, this.signature)) {
    const { trace, gauges, ...declared } = pattern;
    const [own, seated] = this.edge(pattern.nature) ?? [
      new this.signature(pattern.nature),
      trajectory,
    ];
    this.trie.set(Object.assign(own, declared), seated);
    return seated;
  }

  trim(signature) {
    const pattern = new this.signature(signature);
    const edge = this.edge(pattern.nature);
    if (!edge) return this;
    if (pattern.heir) edge[1].trim(pattern.heir);
    else this.trie.delete(edge[0]);
    return this;
  }

  open(signature, effect) {
    this.branch(signature).effect = effect;
    return this;
  }

  do(effect) {
    this.effect = effect;
    return this;
  }

  affect(effect) {
    return this.do(effect);
  }

  graft(...vectors) {
    for (const vector of vectors) {
      if (vector === this) continue;
      if (vector.effect) this.effect = vector.effect;
      for (const [pattern, trajectory] of vector.trie) this.seat(pattern).graft(trajectory);
      this.carry.push(...vector.carry);
    }
    return this;
  }

  get patterns() {
    return [...this.trie.keys()];
  }
  get descendants() {
    return [...this.trie.values()];
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
    const trajectories = [...this.trie] //
      .map(([pattern, trajectory]) => visit({ signature: pattern, ...trajectory.survey(visit) }));
    return { effect: this.effect, trajectories };
  }
}
