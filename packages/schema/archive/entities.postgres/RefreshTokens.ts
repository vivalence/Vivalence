import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { Sessions } from "./Sessions.ts";

export class RefreshTokens extends BaseModuleEntity {
  instanceId?: string;
  id!: bigint;
  token?: string;
  userId?: string;
  revoked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  parent?: string;
  session?: Rel<Sessions>;
}

export const RefreshTokensSchema = new EntitySchema({
  class: RefreshTokens,
  schema: "auth",
  comment: "Auth: Store of tokens used to refresh JWT tokens once they expire.",
  indexes: [
    {
      name: "refresh_tokens_instance_id_user_id_idx",
      properties: ["instanceId", "userId"],
    },
    {
      name: "refresh_tokens_session_id_revoked_idx",
      properties: ["session", "revoked"],
    },
  ],
  properties: {
    instanceId: {
      type: "uuid",
      nullable: true,
      index: "refresh_tokens_instance_id_idx",
    },
    id: { primary: true, type: "bigint" },
    token: {
      type: "string",
      nullable: true,
      unique: "refresh_tokens_token_unique",
    },
    userId: { type: "string", nullable: true },
    revoked: { type: "boolean", nullable: true },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: {
      type: "datetime",
      nullable: true,
      index: "refresh_tokens_updated_at_idx",
    },
    parent: { type: "string", nullable: true, index: "refresh_tokens_parent_idx" },
    session: {
      kind: "m:1",
      entity: () => Sessions,
      deleteRule: "cascade",
      nullable: true,
    },
  },
});
