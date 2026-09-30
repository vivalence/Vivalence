import { types, Collection, EntitySchema, EntityRepositoryType, type Opt, type Rel } from "@mikro-orm/core";
import { EventSubscriber, type EventArgs } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { ThreadEntity } from "../index.ts";
import { LiteralEntity } from "../index.ts";
import { SymbolEntity } from "../index.ts";

export enum BufferStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DONE = "DONE",
  ERROR = "ERROR",
  STALE = "STALE",
}

export enum BufferTraitsEnum {
  LABELED = "LABELED", // for name and description
}

export class BufferRepository extends DataRepository {
  // every query first, the mint last: a query auto-flushes a pending row, and a row flushed
  // before its seat is taken is named for the wrong index.
  async create({ thread, literals, symbols, ...fields }: any) {
    const bound = thread ? await this.em.findOneOrFail(ThreadEntity, thread) : null;
    const buffer = super.create({
      ...fields,
      ...(literals && { literals: await this.em.getRepository(LiteralEntity).findByIdentifiers(literals) }),
      ...(symbols && { symbols: await this.em.getRepository(SymbolEntity).findByIdentifiers(symbols) }),
    });
    bound?.bindBuffer(buffer);
    return buffer;
  }
}

export class BufferEntity extends DataEntity {
  status: BufferStatusEnum & Opt = BufferStatusEnum.PENDING;
  data: any & Opt = {};
  view: any & Opt = null;
  index: number & Opt = 0;
  traits: BufferTraitsEnum[] & Opt = [];
  trait: any & Opt = {};

  mode!: Rel<ModeEntity>;
  thread?: Rel<ThreadEntity>;

  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
  [EntityRepositoryType]?: BufferRepository;
}

export const BufferSchema = new EntitySchema<BufferEntity, DataEntity>({
  extends: DataSchema,
  name: "Buffer",
  tableName: "Buffer",
  repository: () => BufferRepository,
  abstract: true,
  filters: {
    user: {
      cond: (args: any) => ({ thread: { user: args.user } }),
      default: true,
    },
  },
  properties: {
    status: {
      enum: true,
      items: () => BufferStatusEnum,
      defaultRaw: `'${BufferStatusEnum.PENDING}'`,
    },
    data: { type: types.json, defaultRaw: `'{}'` },
    view: { type: types.json, nullable: true },
    index: { type: types.integer, default: 0 },
    traits: {
      items: () => BufferTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },
    trait: { type: types.json, defaultRaw: `'{}'` },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    thread: {
      kind: "m:1",
      entity: () => ThreadEntity,
      fieldName: "thread",
      nullable: true,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      owner: true,
    },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      owner: true,
    },
  },
});

export class BufferSubscriber implements EventSubscriber<BufferEntity> {
  getSubscribedEntities() {
    return [BufferEntity];
  }

  async beforeCreate({ entity, em }: EventArgs<BufferEntity>) {
    if (entity.traits.includes(BufferTraitsEnum.LABELED)) return;
    const mode = await em.findOne(ModeEntity, entity.mode);
    entity.traits = [...entity.traits, BufferTraitsEnum.LABELED];
    entity.trait = { ...entity.trait, LABELED: { name: `${mode?.slug} #${entity.index}` } };
  }
}

export default {
  type: "buffer",
  traits: BufferTraitsEnum,
  schema: BufferSchema,
  entity: BufferEntity,
  repository: BufferRepository,
  subscriber: BufferSubscriber,
};
