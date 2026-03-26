import {
  types,
  Collection,
  EntitySchema,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { maps } from "@vivalence/typology/entities";
import { object } from "@vivalence/typology";

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

export class LiteralRepository extends maps.kernel.literal.repository {
  async findForUser(where, opts: any = {}) {
    const { user, ...query } = where;
    return this.find(query, {
      ...opts,
      populate: [...(opts.populate || []), "memories"],
      populateWhere: {
        ...(opts.populateWhere || {}),
        memories: { user },
      },
    });
  }

  async findOneForUser(where, opts: any = {}) {
    const { user, ...query } = where;
    return this.findOne(query, {
      ...opts,
      populate: [...(opts.populate || []), "memories"],
      populateWhere: {
        ...(opts.populateWhere || {}),
        memories: { user },
      },
    });
  }

  async feed({ symbols, user, take, blacklist }: any) {
    const due = await this.due({ symbols, user, take, blacklist });
    if (due.length >= take) return due.slice(0, take);

    const novel = await this.novel({
      symbols,
      user,
      take: take - due.length,
      blacklist: { literals: [...(blacklist?.literals || []), ...due.map((d) => d.id)] },
    });
    return [...due, ...novel];
  }

  async novel({ symbols, user, take, blacklist }: any) {
    return this.findBySymbols(
      {
        ...(symbols?.length && { all: symbols }),
        memories: { $none: { user } },
        ...(blacklist?.literals?.length && { id: { $nin: blacklist.literals } }),
      },
      { orderBy: { rank: "ASC" }, limit: take },
    );
  }

  async due({ symbols, user, take, blacklist }: any) {
    return this.findBySymbols(
      {
        ...(symbols?.length && { all: symbols }),
        memories: { user, nextAt: { $lt: new Date() } },
        ...(blacklist?.literals?.length && { id: { $nin: blacklist.literals } }),
      },
      {
        populate: ["memories"],
        populateWhere: { memories: { user } },
        limit: take,
      },
    );
  }

  async byStrength({ symbols, user, take, blacklist }: any) {
    return this.findBySymbols(
      {
        ...(symbols?.length && { all: symbols }),
        memories: { user },
        ...(blacklist?.literals?.length && { id: { $nin: blacklist.literals } }),
      },
      {
        populate: ["memories"],
        populateWhere: { memories: { user } },
        orderBy: { memories: { strength: "ASC" } },
        limit: take,
      },
    );
  }

  async findBySymbols(query, opts: any = {}) {
    if (Array.isArray(query)) query = { all: query };

    const { all, any, none } = query;
    const where: any = object.omit(query, ["all", "any", "none"]);

    const symbolRepo = this.em.getRepository(SymbolEntity);
    const idOpts = { fields: ["id"] };
    const [allSyms, anySyms, noneSyms] = await Promise.all([
      all?.length ? symbolRepo.findByIdentifiers(all, idOpts) : [],
      any?.length ? symbolRepo.findByIdentifiers(any, idOpts) : [],
      none?.length ? symbolRepo.findByIdentifiers(none, idOpts) : [],
    ]);

    if (allSyms.length) {
      where.$and = [...(where.$and || []), ...allSyms.map((s) => ({ symbols: s.id }))];
    }

    if (anySyms.length) {
      where.symbols = { ...(where.symbols || {}), id: { $in: anySyms.map((s) => s.id) } };
    }

    if (noneSyms.length) {
      where.symbols = {
        ...(where.symbols || {}),
        $none: { id: { $in: noneSyms.map((s) => s.id) } },
      };
    }

    return this.find(where, opts);
  }
}

export class LiteralEntity extends maps.kernel.literal.entity {
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
      memory = await em.findOne(MemoryEntity, { user, literal: this.id });
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
      session: ctx.session?.id ?? null,
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
  extends: maps.kernel.literal.schema,
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
      persist: false,
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
