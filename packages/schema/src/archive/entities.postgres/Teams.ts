import { BaseModuleEntity, Collection, EntitySchema, type Rel } from "@mikro-orm/core";
import { AnalyticsUsers } from "./AnalyticsUsers.ts";
import { TeamUsers } from "./TeamUsers.ts";

export class Teams extends BaseModuleEntity {
  id!: bigint;
  name?: string;
  user?: Rel<AnalyticsUsers>;
  insertedAt!: Date;
  updatedAt!: Date;
  token?: string;
  teamUsersCollection = new Collection<TeamUsers>(this);
}

export const TeamsSchema = new EntitySchema({
  class: Teams,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    name: { type: "string", nullable: true },
    user: {
      kind: "1:1",
      entity: () => AnalyticsUsers,
      deleteRule: "cascade",
      nullable: true,
      unique: "teams_user_id_index",
    },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    token: {
      type: "string",
      nullable: true,
      defaultRaw: `gen_random_uuid()`,
      unique: "teams_token_index",
    },
    teamUsersCollection: {
      kind: "1:m",
      entity: () => TeamUsers,
      mappedBy: "team",
    },
  },
});
