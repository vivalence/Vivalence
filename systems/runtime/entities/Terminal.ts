import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataEntity, DataSchema, DataRepository } from "@vivalence/typology/entities";
import { UserEntity, DaemonEntity, ThreadEntity } from "./index.ts";

export class TerminalRepository extends DataRepository {
  async create({ user, ...fields }: any) {
    const owner = await this.em.findOneOrFail(UserEntity, user);
    const index = await this.count({ user: owner });
    return super.create({ ...fields, user: owner, index });
  }
}

export class TerminalEntity extends DataEntity {
  user!: Rel<UserEntity>;
  daemon: Rel<DaemonEntity> | null & Opt = null;
  thread: Rel<ThreadEntity> | null & Opt = null;
  index: number & Opt = 0;
  traits: string[] & Opt = [];
  trait: any & Opt = {};
}

export const TerminalSchema = new EntitySchema({
  class: TerminalEntity,
  extends: DataSchema,
  repository: () => TerminalRepository,
  name: "Terminal",
  tableName: "Terminal",
  filters: {
    user: {
      cond: (args: any) => ({ user: args.user }),
      default: true,
    },
  },
  properties: {
    user: { kind: "m:1", entity: () => UserEntity, updateRule: "cascade", deleteRule: "cascade" },
    daemon: { kind: "m:1", entity: () => DaemonEntity, nullable: true, updateRule: "cascade", deleteRule: "set null" },
    thread: { kind: "m:1", entity: () => ThreadEntity, nullable: true, updateRule: "cascade", deleteRule: "set null" },
    index: { type: types.integer, default: 0 },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },
  },
});

export default {
  type: "terminal",
  schema: TerminalSchema,
  entity: TerminalEntity,
  repository: TerminalRepository,
};
