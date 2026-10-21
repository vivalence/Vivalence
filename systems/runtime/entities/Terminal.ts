import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Vector } from "@vivalence/typology";
import { DataEntity, DataSchema, DataRepository } from "@vivalence/typology/entities";
import { UserEntity, DaemonEntity, ThreadEntity } from "./index.ts";

export class TerminalRepository extends DataRepository {
  async create({ user, ...fields }: any) {
    const owner = await this.em.findOneOrFail(UserEntity, user);
    const last = await this.findOne({ user: owner }, { orderBy: { index: "DESC" } });
    return super.create({ ...fields, user: owner, index: last === null ? 0 : last.index + 1 });
  }

  async ensure(query: any) {
    return (await this.findOne(query)) ?? (await this.create(query));
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

const twitch = new Vector();
twitch.open("/after/user/create", async (ctx) => {
  ctx.input.em.setFilterParams("user", { user: ctx.input.entity.id });
  await ctx.input.em.getRepository(TerminalEntity).ensure({ user: ctx.input.entity.id });
  await ctx.input.em.flush();
});
twitch.open("/before/thread/delete", async (ctx) => {
  const seated = await ctx.input.em.getRepository(TerminalEntity).find({ thread: ctx.input.entity.id });
  for (const terminal of seated) terminal.assign({ thread: null, daemon: null });
  await ctx.input.em.flush();
});
twitch.open("/after/terminal/delete", async (ctx) => {
  await ctx.input.em.getRepository(TerminalEntity).ensure({ user: ctx.input.entity.user.id });
  await ctx.input.em.flush();
});

export default {
  type: "terminal",
  schema: TerminalSchema,
  entity: TerminalEntity,
  repository: TerminalRepository,
  twitch,
};
