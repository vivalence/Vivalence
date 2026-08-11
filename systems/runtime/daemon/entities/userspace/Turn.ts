import { EntitySchema, EntityRepositoryType, Collection, types, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { ThreadEntity } from "../index.ts";

export class TurnRepository extends DataRepository {
  history(where, opts?) {
    return this.find(where, { ...opts, orderBy: { createdAt: "ASC" } });
  }

  async chain(data, opts?) {
    const parent = data.parent ?? (await this.history({ thread: data.thread }, opts)).at(-1) ?? null;
    const turn = this.create({ ...data, parent });
    await this.em.flush();
    return turn;
  }

  // history() ana, fold() cata — the same round trip as Signature/Vector/Connection's
  // own pairs. judge renders a verdict on `tract` (replacement data) or a falsy value
  // (pure prune); the anchor reuses tract's last turn in place, so a real compaction
  // never lands a fresh row with a createdAt between a live prompt and its own reply.
  // Re-chaining anything outside `tract` (a surviving tail) is the caller's job — fold
  // only ever touches the span it was handed.
  async fold(tract, judge) {
    const verdict = await judge(tract);
    let anchor = null;
    if (verdict) {
      anchor = tract.at(-1);
      Object.assign(anchor, verdict);
      anchor.parent = null;
    }
    const drop = verdict ? tract.slice(0, -1) : tract;
    for (const turn of drop) this.em.remove(turn);
    await this.em.flush();
    return anchor;
  }
}

export class TurnEntity extends DataEntity {
  role!: string;
  parts: any[] & Opt = [];
  meta?: any & Opt;

  parent?: Rel<TurnEntity>;
  children = new Collection<TurnEntity>(this);

  thread!: Rel<ThreadEntity>;
  mode?: Rel<ModeEntity>;

  [EntityRepositoryType]?: TurnRepository;
}

export const TurnSchema = new EntitySchema<TurnEntity, DataEntity>({
  class: TurnEntity,
  extends: DataSchema,
  tableName: "Turn",
  repository: () => TurnRepository,
  properties: {
    role: { type: types.string },
    parts: { type: types.json, defaultRaw: `'[]'` },
    meta: { type: types.json, nullable: true },

    parent: {
      kind: "m:1",
      entity: () => TurnEntity,
      fieldName: "parent",
      nullable: true,
    },

    children: {
      kind: "1:m",
      entity: () => TurnEntity,
      mappedBy: (turn) => turn.parent,
    },

    thread: {
      kind: "m:1",
      entity: () => ThreadEntity,
      fieldName: "thread",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      nullable: true,
      deleteRule: "set null",
    },
  },
});

export default {
  type: "turn",
  schema: TurnSchema,
  entity: TurnEntity,
  repository: TurnRepository,
};
