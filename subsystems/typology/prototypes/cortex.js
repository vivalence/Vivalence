import { cast, recipe } from "@vivalence/typology";
import { Hallucination } from "./hallucination.js";
import { v } from "../schematics/v.js";
import { Faculty, Tier, Tune } from "../schematics/primitives/hallucination.js"; //@beef bad. should be just v.

// named desires in tune-space — see schematics/primitives/hallucination `axes`.
//                [intelligence, reasoning, speed, thrift]  (each 0-1, 1 = max)
export const tiers = {
  frugal: [0.1, 0.3, 0.9, 1.0], // dumb but fast + cheapest
  fast: [0.4, 0.3, 1.0, 0.8], // speed above all, chat-capable, cheap-leaning
  balanced: [0.4, 0.6, 0.6, 0.6], // even trade across all four
  capable: [0.6, 0.8, 0.4, 0.4], // strong, moderate cost
  unleashed: [0.9, 1.0, 0.2, 0.2], // max capability, cost no object
  eager: [0.3, 0.5, 0.5, 0.1], // engagement-first, spend-tolerant
};

export function nearest(faculties, target) {
  return recipe.nearest(faculties, target, { tiers });
}

const WHERE = v.object({
  type: v.string().optional(),
  via: v.enum(["render", "stream"]).optional(),
  tune: v.union([Tier, Tune], { default: [0.5, 0.5, 0.5, 0.5] }),
});

const where = (supplied = {}) => {
  const query = v.cast(WHERE, { ...supplied });
  const failure = [...v.errors(WHERE, query)][0];
  if (failure) throw new Error(`[cortex] invalid query ${failure.path}: ${failure.message}`);
  return query;
};

export class Cortex {
  faculties = new Map(); // type → Faculty[]
  #hallucinate;

  // the typed-fetch surface, built once — stateless; policy rides each request
  get hallucinate() {
    return (this.#hallucinate ??= Hallucination(this));
  }

  register(supplied) {
    for (const faculty of cast.array(supplied)) {
      const failure = [...v.errors(Faculty, faculty)][0];
      if (failure) throw new Error(`[cortex] invalid faculty ${failure.path}: ${failure.message}`);
      const tune = faculty.tune.length === 3 ? [...faculty.tune, 0.5] : faculty.tune;
      const stored = this.faculties.get(faculty.type) ?? [];
      this.faculties.set(faculty.type, [...stored, { ...faculty, tune }]);
    }
    return this;
  }

  find(supplied) {
    const query = where(supplied);
    const stored = query.type
      ? (this.faculties.get(query.type) ?? [])
      : [...this.faculties.values()].flat();
    return query.via ? stored.filter((faculty) => faculty.via[query.via]) : stored;
  }

  findOne(supplied) {
    const query = where(supplied);
    const native = nearest(this.find(query), query.tune);
    return native ?? DERIVATIONS[query.type]?.(this, query);
  }
}

const DERIVATIONS = {
  object: (cortex, query) => {
    if (query.via && query.via !== "render") return undefined;
    return cortex.findOne({ type: "dialogue", tune: query.tune, via: "render" });
  },
};

// ── beef's original sketch — the seed  ──────────────
// import { cast, array, Vector } from "@vivalence/typology";
//
// export class Cortex {
//   faculties = new Map();
//
//   register(faculties = []) {
//     this.faculties.AddSomeFForInput(cast.array(faculties));
//   }
//   findOne(where) {} // handles nearest neighbours etc. bind by tier, by config, etc. handles derive!
//   find(where) {}
// }
