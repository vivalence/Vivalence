// Cortex — daemon-level faculty orchestrator
// Collects faculties from hallucinator services, resolves by type + tune, builds harnesses.

import { Vector } from "@vivalence/typology";

// --- tune resolution ---

export const tiers = {
  frugal: [0.1, 0.3, 0.9],
  balanced: [0.4, 0.6, 0.6],
  capable: [0.6, 0.8, 0.4],
  unleashed: [0.9, 1.0, 0.2],
};

export function nearest(faculties, target) {
  if (typeof target === "string") target = tiers[target] ?? [0.5, 0.5, 0.5];
  let best = null;
  let bestDistance = Infinity;
  for (const faculty of faculties) {
    const d = Math.sqrt(
      (faculty.tune[0] - target[0]) ** 2 +
        (faculty.tune[1] - target[1]) ** 2 +
        (faculty.tune[2] - target[2]) ** 2,
    );
    if (d < bestDistance) {
      bestDistance = d;
      best = faculty;
    }
  }
  return best;
}

// --- cortex ---

export function Cortex(faculties) {
  const table = new Map();
  for (const faculty of faculties) {
    if (!table.has(faculty.type)) table.set(faculty.type, []);
    table.get(faculty.type).push(faculty);
  }

  return {
    table,

    resolve(type, { tune, via } = {}) {
      const candidates = table.get(type) || [];
      const eligible = candidates.filter((f) => !via || f.via[via]);
      return nearest(eligible, tune ?? [0.5, 0.5, 0.5]);
    },

    harness(types) {
      const vector = new Vector();
      for (const type of types) {
        const branch = vector.branch(type);
        const vias = new Set();
        for (const faculty of this.table.get(type) || []) {
          for (const v of Object.keys(faculty.via)) vias.add(v);
        }
        for (const v of vias) {
          branch.open(v, async (input, ctx) => {
            const faculty = this.resolve(type, { tune: ctx.tune, via: v });
            return faculty.via[v](input.turns, ctx);
          });
        }
      }
      return vector;
    },
  };
}
