import * as cast from "../gestalten/cast/index.js";
import * as is from "../gestalten/is/index.js";
import * as recipe from "../gestalten/belt/recipe.js";
import * as shape from "../gestalten/shape/index.js";
import * as hallucinate from "../gestalten/shard/hallucinate.js";
import * as steer from "../gestalten/steer/index.js";
import { Vector } from "./vector.js";
import { v } from "../schematics/index.js";
import { Tier, Tune } from "../schematics/primitives/hallucination.js";

// [intelligence, reasoning, speed, thrift]  (each 0-1, 1 = max)
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
  const [fault] = v.faults(WHERE, query);
  if (fault) throw new Error(`[cortex] invalid query ${fault.at}: ${fault.reason}`);
  return query;
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

    this.hallucinate = compile(this.#hallucinator);
  }

  register(supplied) {
    for (const faculty of cast.array(supplied)) {
      const [fault] = v.faults(v.primitives.hallucination.Faculty, faculty);
      if (fault) throw new Error(`[cortex] invalid faculty ${fault.at}: ${fault.reason}`);
      const tune = faculty.tune.length === 3 ? [...faculty.tune, 0.5] : faculty.tune;
      const stored = this.faculties.get(faculty.type) ?? [];
      this.faculties.set(faculty.type, [...stored, { ...faculty, tune }]);
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
    return query.via ? stored.filter((faculty) => faculty.via[query.via]) : stored;
  }

  findOne(supplied) {
    const query = where(supplied);
    const native = nearest(this.find(query), query.tune);
    return native ?? DERIVATIONS[query.type]?.(this, query);
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
  object: (cortex, query) => {
    if (query.via && query.via !== "render") return undefined;
    return cortex.findOne({ type: "dialogue", tune: query.tune, via: "render" });
  },
  verbatim: (cortex, query) => {
    if (query.via !== "render") return undefined;
    return cortex.findOne({ type: "verbatim", tune: query.tune, via: "stream" });
  },
};
