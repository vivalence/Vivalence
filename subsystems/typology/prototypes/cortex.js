import { array } from "@vivalence/typology";
import { Hallucinate } from "./hallucinate.js";

export const tiers = {
  frugal:    [0.1, 0.3, 0.9],
  balanced:  [0.4, 0.6, 0.6],
  capable:   [0.6, 0.8, 0.4],
  unleashed: [0.9, 1.0, 0.2],
};

export function nearest(faculties, target) {
  if (typeof target === "string") target = tiers[target] ?? [0.5, 0.5, 0.5];
  return array.nearest(faculties, target, faculty => faculty.tune);
}

export class Cortex {
  table = new Map();

  extend(faculties) {
    for (const faculty of faculties) {
      if (!this.table.has(faculty.type)) this.table.set(faculty.type, []);
      this.table.get(faculty.type).push(faculty);
    }
    return this;
  }

  resolve(type, { tune, via } = {}) {
    const candidates = this.table.get(type) || [];
    const eligible = via ? candidates.filter(faculty => faculty.via[via]) : candidates;
    return nearest(eligible, tune ?? [0.5, 0.5, 0.5]);
  }

  spawn() {
    return new Hallucinate(this);
  }
}
