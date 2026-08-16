import {
  types,
  Collection,
  EntitySchema,
  EventSubscriber,
  ChangeSetType,
  raw,
} from "@mikro-orm/core";
import {
  EntityRepositoryType,
  type Opt,
  type Rel,
  type EventArgs,
  type FlushEventArgs,
} from "@mikro-orm/core";
import { literal as base } from "@vivalence/runtime";
import { object, is } from "@vivalence/typology";

import { RetentionEntity } from "../userspace/Retention.ts";
import { TraceEntity } from "../userspace/Trace.ts";
import { SymbolEntity } from "./Symbol.ts";
import { drivers } from "../../retention/index.js";

export enum LiteralTraitsEnum {
  TRANSLATED = "TRANSLATED",
  EXEMPLIFIED = "EXEMPLIFIED",
  RANKED = "RANKED",
  ANNOTATED = "ANNOTATED",
  VOCALIZED = "VOCALIZED",
  CONJUGATED = "CONJUGATED",
}

export class LiteralRepository extends base.repository {
  get card() {
    return {
      fields: ["slug", "known", "learning", "ontology", "status"],
      populate: ["retentions"],
      project: (literal) => ({
        slug: literal.slug,
        known: literal.trait?.TRANSLATED?.known ?? "",
        learning: literal.trait?.TRANSLATED?.learning ?? "",
        ontology: literal.ontology,
        status: literal.retention?.status ?? "UNTOUCHED",
      }),
    };
  }

  search(query: any) {
    const like = `%${query.search}%`;
    return [
      { slug: { $like: like } },
      { trait: { TRANSLATED: { known: { $like: like } } } },
      { trait: { TRANSLATED: { learning: { $like: like } } } },
    ];
  }

  constrain(where: any) {
    if (!where || !is.array(where.symbols)) return where;
    const { symbols, ...rest } = where;
    if (!symbols.length) return rest;
    const constraints = symbols.map((slug: string) => ({ symbols: { slug } }));
    return { ...rest, $and: [...(rest.$and || []), ...constraints] };
  }

  async feed(where: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    const due = await this.due(where, { limit, blacklist, populate });
    if (due.length >= limit) return due.slice(0, limit);

    const novel = await this.novel(where, {
      limit: limit - due.length,
      blacklist: { literals: [...(blacklist?.literals || []), ...due.map((d: any) => d.id)] },
      populate,
    });
    return [...due, ...novel];
  }

  async novel(where: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    const filter = object.merge(
      { retentions: { $none: {} } },
      { id: { $nin: blacklist?.literals || [] } },
      this.constrain(where),
    );
    return this.find(filter, { orderBy: { rank: "ASC" }, limit, populate });
  }

  async due(where: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    const filter = object.merge(
      { retentions: { nextAt: { $lt: new Date() } } },
      { id: { $nin: blacklist?.literals || [] } },
      this.constrain(where),
    );
    return this.find(filter, {
      populate: populate ? [...populate, "retentions"] : ["retentions"],
      limit,
    });
  }

  async byStrength(where: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    return this.find(
      object.merge({ retentions: {} }, { id: { $nin: blacklist?.literals || [] } }, this.constrain(where)),
      {
        populate: populate ? [...populate, "retentions"] : ["retentions"],
        orderBy: { retentions: { strength: "ASC" } },
        limit,
      },
    );
  }

  async byLastSignal(signals: string[], where?: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    return this.find(
      object.merge(
        { retentions: { lastSignal: { $in: signals } } },
        { id: { $nin: blacklist?.literals || [] } },
        this.constrain(where),
      ),
      {
        populate: populate ? [...populate, "retentions"] : ["retentions"],
        limit,
      },
    );
  }

  async sample(where: any, opts?: any) {
    const { status, limit, blacklist, populate } = opts || {};
    return this.find(
      object.merge(
        status ? { retentions: { status: { $in: status } } } : { retentions: {} },
        { id: { $nin: blacklist?.literals || [] } },
        this.constrain(where),
      ),
      {
        populate: populate ? [...populate, "retentions"] : ["retentions"],
        orderBy: { [raw("random()")]: "asc" },
        limit,
      },
    );
  }
}

export class LiteralEntity extends base.entity {
  traits: LiteralTraitsEnum[] & Opt = [];
  rank: number & Opt = 999999;
  // strength: ---
  retentions = new Collection<RetentionEntity>(this);
  [EntityRepositoryType]?: LiteralRepository;

  get retention(): RetentionEntity | undefined {
    return this.retentions.isInitialized() ? this.retentions.getItems()[0] : undefined;
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

    let retention = this.retention;
    if (!retention) {
      retention = await em.findOne(RetentionEntity, { literal: this.id });
    }

    if (!retention) {
      retention = em.create(RetentionEntity, {
        user,
        literal: this.id,
        driver: "BAYESIAN",
        type: "INDIVIDUAL",
        status: "UNTOUCHED",
        state: null,
      });
      em.persist(retention);
    }

    const driver = drivers[retention.driver];
    const result = retention.evolve(signal, driver);

    const trace = em.create(TraceEntity, {
      user,
      literal: this.id,
      retention: retention,
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
    return retention;
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
      default: 999999,
      nullable: true,
    },
    // in LiteralSchema properties:
    uses: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: "in",
      orderBy: { strength: "ASC" }, // ← NEW: redeclare base's uses with orderBy
    },

    strength: {
      // ← NEW: Formula column on Literal
      type: types.float,
      formula: (alias) => {
        const cases = Object.values(drivers)
          .filter((d) => d.sql?.strength)
          .map((d) => `WHEN '${d.type}' THEN ${d.sql.strength("m")}`)
          .join(" ");
        return `(SELECT CASE m.driver ${cases} ELSE 0.0 END FROM Retention m WHERE m.literal = ${alias}.id LIMIT 1)`;
      },
      persist: false,
      lazy: true,
      nullable: true,
    },

    retentions: {
      kind: "1:m",
      entity: () => RetentionEntity,
      mappedBy: (retention) => retention.literal,
      strategy: "select-in",
    },
  },
});

export class LiteralSubscriber implements EventSubscriber<LiteralEntity> {
  getSubscribedEntities() {
    return [LiteralEntity];
  }

  beforeCreate({ entity }: EventArgs<LiteralEntity>) {
    entity.rank = entity.trait?.RANKED?.rank ?? 999999;
  }

  beforeUpdate({ entity }: EventArgs<LiteralEntity>) {
    entity.rank = entity.trait?.RANKED?.rank ?? 999999;
  }

  async afterFlush({ em, uow }: FlushEventArgs) {
    const pending = this.collect(uow.getChangeSets());
    if (!pending.length) return;

    const allSlugs = [...new Set(pending.flatMap((p) => p.slugs))];
    const refs = await em.find(LiteralEntity, { slug: { $in: allSlugs } });
    const bySlug = new Map(refs.map((r) => [r.slug, r.id]));

    const rows = pending.flatMap((p) =>
      p.slugs
        .map((s) => bySlug.get(s))
        .filter(Boolean)
        .map((refId) => `('${p.id}', '${refId}')`),
    );

    if (!rows.length) return;
    await em
      .getConnection()
      .execute(
        `INSERT OR IGNORE INTO literal_uses (literal_entity_1_id, literal_entity_2_id) VALUES ${rows.join(", ")}`,
      );
  }

  annotated(entity: LiteralEntity): string[] {
    const tokens = entity.trait?.ANNOTATED?.tokens;
    if (!tokens) return [];
    return tokens.map((t) => t.literal).filter(Boolean);
  }

  conjugated(entity: LiteralEntity): string[] {
    const conj = entity.trait?.CONJUGATED;
    if (!conj) return [];
    const slugs = Object.values(conj.paradigm ?? {});
    if (conj.infinitive) slugs.push(conj.infinitive);
    return slugs.filter(Boolean);
  }

  collect(changeSets) {
    const pending = [];
    for (const cs of changeSets) {
      if (!(cs.entity instanceof LiteralEntity)) continue;
      const slugs = [...new Set([...this.annotated(cs.entity), ...this.conjugated(cs.entity)])];
      if (slugs.length) pending.push({ id: cs.entity.id, slugs });
    }
    return pending;
  }
}

export default {
  type: "literal",
  traits: LiteralTraitsEnum,
  schema: LiteralSchema,
  entity: LiteralEntity,
  repository: LiteralRepository,
  subscriber: LiteralSubscriber,
};
