import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Teams } from "./Teams.ts";

export class TeamUsers extends BaseModuleEntity {
  id!: bigint;
  email?: string;
  token?: string;
  provider?: string;
  emailPreferred?: string;
  name?: string;
  image?: string;
  emailMeProduct: boolean & Opt = false;
  phone?: string;
  validGoogleAccount: boolean & Opt = false;
  providerUid?: string;
  team?: Rel<Teams>;
  insertedAt!: Date;
  updatedAt!: Date;
  preferences?: any;
}

export const TeamUsersSchema = new EntitySchema({
  class: TeamUsers,
  schema: "_analytics",
  uniques: [
    {
      name: "team_users_provider_uid_team_id_index",
      properties: ["providerUid", "team"],
    },
  ],
  properties: {
    id: { primary: true, type: "bigint" },
    email: { type: "string", nullable: true },
    token: { type: "string", nullable: true },
    provider: { type: "string", nullable: true },
    emailPreferred: { type: "string", nullable: true },
    name: { type: "string", nullable: true },
    image: { type: "string", nullable: true },
    emailMeProduct: { type: "boolean" },
    phone: { type: "string", nullable: true },
    validGoogleAccount: { type: "boolean" },
    providerUid: { type: "string", nullable: true },
    team: {
      kind: "m:1",
      entity: () => Teams,
      deleteRule: "cascade",
      nullable: true,
      index: true,
    },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    preferences: { type: "json", nullable: true },
  },
});
