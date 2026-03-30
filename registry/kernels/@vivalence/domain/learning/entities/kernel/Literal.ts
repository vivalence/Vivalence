import {
  types,
  Collection,
  EntitySchema,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
// import { maps } from "@vivalence/typology/entities";
import { literal as base } from "@vivalence/typology/entities";
import { object, is } from "@vivalence/typology";

import { MemoryEntity } from "../userspace/Memory.ts";
import { TraceEntity } from "../userspace/Trace.ts";
import { SymbolEntity } from "./Symbol.ts";
import { drivers } from "../../memory/index.js";

export enum LiteralTraitsEnum {
  TRANSLATED = "TRANSLATED",
  EXEMPLIFIED = "EXEMPLIFIED",
  RANKED = "RANKED",
  ANNOTATED = "ANNOTATED",
  VOCALIZED = "VOCALIZED",
}

export class LiteralRepository extends base.repository {
  async feed({ limit, blacklist, where }: any) {
    const due = await this.due({ limit, blacklist, where });
    if (due.length >= limit) return due.slice(0, limit);

    const novel = await this.novel({
      limit: limit - due.length,
      blacklist: { literals: [...(blacklist?.literals || []), ...due.map((d) => d.id)] },
      where,
    });
    return [...due, ...novel];
  }

  async novel({ limit, blacklist, where }: any) {
    return this.find(
      object.merge(
        { memories: { $none: {} } },
        is.array(blacklist?.literals) && blacklist.literals.length
          ? { id: { $nin: blacklist.literals } }
          : {},
        where,
      ),
      { orderBy: { rank: "ASC" }, limit: limit },
    );
  }

  async due({ limit, blacklist, where }: any) {
    return this.find(
      object.merge(
        { memories: { nextAt: { $lt: new Date() } } },
        is.array(blacklist?.literals) && blacklist.literals.length
          ? { id: { $nin: blacklist.literals } }
          : {},
        where,
      ),
      {
        populate: ["memories"],
        limit: limit,
      },
    );
  }

  async byStrength({ limit, blacklist, where }: any) {
    return this.find(
      object.merge(
        { memories: {} },
        is.array(blacklist?.literals) && blacklist.literals.length
          ? { id: { $nin: blacklist.literals } }
          : {},
        where,
      ),
      {
        populate: ["memories"],
        orderBy: { memories: { strength: "ASC" } },
        limit: limit,
      },
    );
  }
}

export class LiteralEntity extends base.entity {
  traits: LiteralTraitsEnum[] & Opt = [];
  rank!: number & Opt;
  memories = new Collection<MemoryEntity>(this);
  [EntityRepositoryType]?: LiteralRepository;

  get memory(): MemoryEntity | undefined {
    return this.memories.isInitialized() ? this.memories.getItems()[0] : undefined;
  }

  get translated() {
    return this.trait.TRANSLATED;
  }

  get example() {
    return this.trait.EXEMPLIFIED;
  }

  implements(trait: string): boolean {
    return this.traits.includes(trait as LiteralTraitsEnum);
  }

  async review(signal, ctx) {
    const em = ctx.daemon.entities.em;
    const user = ctx.user.id;

    let memory = this.memory;
    if (!memory) {
      memory = await em.findOne(MemoryEntity, { literal: this.id });
    }

    if (!memory) {
      memory = em.create(MemoryEntity, {
        user,
        literal: this.id,
        driver: "BAYESIAN",
        type: "INDIVIDUAL",
        status: "UNTOUCHED",
        state: null,
      });
      em.persist(memory);
    }

    const driver = drivers[memory.driver];
    const result = memory.evolve(signal, driver);

    const trace = em.create(TraceEntity, {
      user,
      literal: this.id,
      memory: memory,
      mode: ctx.mode?.id ?? null,
      thread: ctx.thread?.id ?? null,
      signal: result.signal,
      status: result.status,
      snapshot: {
        state: result.state,
        nextIn: result.nextIn,
        nextAt: result.nextAt,
      },
    });
    em.persist(trace);

    await em.flush();
    return memory;
  }
}

export const LiteralSchema = new EntitySchema({
  class: LiteralEntity,
  extends: base.schema,
  tableName: "Literal",
  name: "Literal",
  repository: () => LiteralRepository,
  properties: {
    traits: {
      items: () => LiteralTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },

    rank: {
      type: types.integer,
      formula: (table) => `COALESCE(json_extract(${table}.trait, '$.RANKED.rank'), 999999)`,
      persist: true,
      nullable: true,
    },

    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.literal,
    },
  },
});

export default {
  type: "literal",
  traits: LiteralTraitsEnum,
  schema: LiteralSchema,
  entity: LiteralEntity,
  repository: LiteralRepository,
};
