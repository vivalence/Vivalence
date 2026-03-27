import { EntitySchema, Collection, types, type Opt, type Rel } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { ThreadEntity } from "../index.ts";

export class TurnEntity extends DataEntity {
  role!: string;
  parts: any[] & Opt = [];
  meta?: any & Opt;

  parent?: Rel<TurnEntity>;
  children = new Collection<TurnEntity>(this);

  thread!: Rel<ThreadEntity>;
  mode!: Rel<ModeEntity>;
}

export const TurnSchema = new EntitySchema<TurnEntity, DataEntity>({
  class: TurnEntity,
  extends: DataSchema,
  tableName: "Turn",
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
      updateRule: "cascade",
      deleteRule: "cascade",
    },
  },
});

export default {
  type: "turn",
  schema: TurnSchema,
  entity: TurnEntity,
};
