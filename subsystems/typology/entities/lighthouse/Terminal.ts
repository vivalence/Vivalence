import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataEntity, DataSchema, DataRepository } from "../base/DataEntity.ts";
import { IdentityEntity } from "./Identity.ts";
import { DaemonEntity } from "./Daemon.ts";

export enum TerminalTraitsEnum {
  DOCKED = "DOCKED",
  LABELED = "LABELED",
}

export class TerminalRepository extends DataRepository {
  async create({ identity, ...fields }: any) {
    const owner = await this.em.findOneOrFail(IdentityEntity, identity);
    const index = await this.count({ identity: owner });
    return super.create({ ...fields, identity: owner, index });
  }
}

export class TerminalEntity extends DataEntity {
  identity!: Rel<IdentityEntity>;
  daemon: Rel<DaemonEntity> | null & Opt = null;
  thread: string | null & Opt = null;
  index: number & Opt = 0;
  traits: TerminalTraitsEnum[] & Opt = [];
  trait: any & Opt = {};
}

export const TerminalSchema = new EntitySchema({
  class: TerminalEntity,
  extends: DataSchema,
  repository: () => TerminalRepository,
  name: "Terminal",
  tableName: "Terminal",
  filters: {
    identity: {
      cond: (args: any) => ({ identity: args.identity }),
      default: true,
    },
  },
  properties: {
    identity: { kind: "m:1", entity: () => IdentityEntity, updateRule: "cascade", deleteRule: "cascade" },
    daemon: { kind: "m:1", entity: () => DaemonEntity, nullable: true, updateRule: "cascade", deleteRule: "set null" },
    thread: { type: types.string, nullable: true },
    index: { type: types.integer, default: 0 },
    traits: {
      items: () => TerminalTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      columnType: "json",
    },
    trait: { type: types.json, defaultRaw: `'{}'` },
  },
});

export default {
  type: "terminal",
  schema: TerminalSchema,
  entity: TerminalEntity,
  repository: TerminalRepository,
};
