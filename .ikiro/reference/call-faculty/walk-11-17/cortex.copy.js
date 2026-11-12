import { cascade } from "./cascade.sketch.js";
import * as cast from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/cast/index.js";
import * as is from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/is/index.js";
import * as recipe from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/recipe.js";
import * as shape from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/shape/index.js";
import * as hallucinate from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/shard/hallucinate.js";
import * as steer from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/steer/index.js";
import { Vector } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/vector.js";
import { v } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/index.js";
import { FacultyType, Selector } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/primitives/hallucination.js";

// [intelligence, reasoning, speed, thrift]  (each 0-1, 1 = max)
export const tiers = {
  frugal: [0.1, 0.9, 1.0],
  fast: [0.4, 1.0, 0.8],
  balanced: [0.4, 0.6, 0.6],
  capable: [0.6, 0.4, 0.4],
  unleashed: [0.9, 0.2, 0.2],
  eager: [0.3, 0.5, 0.1],
};

export function nearest(faculties, target) {
  return recipe.nearest(faculties, target);
}

const WHERE = v.object({
  type: FacultyType.optional(),
  via: v.enum(["render", "stream"]).optional(),
  ...Selector,
  hear: v.object({ ...Selector }).optional(),
  mind: v.object({ ...Selector }).optional(),
  speak: v.object({ ...Selector }).optional(),
});

const where = (supplied = {}) => {
  const query = v.cast(WHERE, { ...supplied });
  const [fault] = v.faults(WHERE, query);
  if (fault) throw new Error(`[cortex] invalid query ${fault.at}: ${fault.reason}`);
  return query.tier && !query.tune ? { ...query, tune: tiers[query.tier] } : query;
};

export class Cortex {
  faculties = new Map();
  hallucinate = null;
  #hallucinator = new Vector();

  constructor() {
    const { Audio, Packet, Verbatim } = v.primitives.hallucination;
    for (const avenue of ["dialogue", "object"]) {
      this.#hallucinator
        .branch(avenue)
        .use(hallucinate.lowering())
        .open({ nature: "stream", yields: Packet.Response }, hallucinate.streaming(this, avenue))
        .open("render", hallucinate.rendering(this, avenue));
    }

    this.#hallucinator
      .branch("/verbatim")
      .use(hallucinate.sourcing())
      .open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, hallucinate.transcribing(this, "stream"))
      .open("render", hallucinate.transcribing(this, "render"));

    this.#hallucinator
      .branch("/speech")
      .use(hallucinate.sourcing())
      .open({ nature: "stream", yields: Audio.Any }, hallucinate.synthesizing(this))
      .open("render", hallucinate.vocalizing(this));

    this.#hallucinator
      .branch("/choice")
      .use(hallucinate.tagging())
      .use(hallucinate.bounding(this))
      .open("render", hallucinate.choosing(this));

    this.#hallucinator
      .branch("/picture")
      .use(hallucinate.picturing())
      .open({ nature: "render", output: v.primitives.hallucination.Picture.Response }, hallucinate.depicting(this));

    this.hallucinate = compile(this.#hallucinator);
  }

  register(supplied) {
    for (const faculty of cast.array(supplied)) {
      const [fault] = v.faults(v.primitives.hallucination.Faculty, faculty);
      if (fault) throw new Error(`[cortex] invalid faculty ${fault.at}: ${fault.reason}`);
      const stored = this.faculties.get(faculty.type) ?? [];
      this.faculties.set(faculty.type, [...stored, faculty]);
    }
    return this;
  }

  split(supplied) {
    const cortex = new Cortex();
    for (const [type, held] of this.faculties) cortex.faculties.set(type, [...held]);
    return cortex.register(supplied);
  }

  find(supplied) {
    const query = where(supplied);
    const stored = query.type
      ? (this.faculties.get(query.type) ?? [])
      : [...this.faculties.values()].flat();
    return stored.filter(
      (faculty) =>
        (!query.via || faculty.via[query.via]) &&
        (!query.provider || faculty.provider === query.provider) &&
        (!query.id || faculty.id === query.id),
    );
  }

  findOne(supplied) {
    const query = where(supplied);
    const found = this.find(query);
    if (query.tune) return nearest(found, query.tune) ?? DERIVATIONS[query.type]?.(this, query);
    if (found.length > 1) throw new Error(`[cortex] ${found.length} '${query.type}' faculties match — name a tier, a tune or an id`);
    return found[0] ?? DERIVATIONS[query.type]?.(this, query);
  }
}

function compile(hallucinator) {
  const { Hallucination } = v.primitives.hallucination;
  return shape.object(hallucinator, (carry, effect, steps, signal) => {
    const { avenue } = hallucinate.routing(steps);
    const schema = Hallucination[avenue];
    const strategy = steer.strategy.resolve(effect);
    return async (input) => {
      const filled = schema.fill(input ?? {});
      const [fault] = schema.faults(filled);
      if (fault) throw new Error(`[cortex] invalid ${avenue} hallucination ${fault.at}: ${fault.reason}`);
      if (!is.Controller(filled.controller)) throw new Error("[cortex] a hallucination requires a controller");
      const ctx = { input: filled, output: undefined, controller: filled.controller, policy: filled.policy, steps, signal };
      await carry(ctx, strategy);
      return ctx.output;
    };
  });
}

const DERIVATIONS = {
  call: (cortex, query) => {
    const ear = cortex.findOne({ ...query.hear, type: "verbatim", via: "stream" });
    const mind = cortex.findOne({ ...query.mind, type: "dialogue", via: "stream" });
    const mouth = cortex.findOne({ ...query.speak, type: "speech", via: "stream" });
    return ear && mind && mouth ? cascade(ear, mind, mouth) : undefined;
  },
  object: (cortex, query) => {
    if (query.via && query.via !== "render") return undefined;
    return cortex.findOne({ ...query, type: "dialogue", via: "render" });
  },
  verbatim: (cortex, query) => {
    if (query.via !== "render") return undefined;
    return cortex.findOne({ ...query, type: "verbatim", via: "stream" });
  },
};
