import { BaseModuleEntity, Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { Extensions } from "./Extensions.ts";

export class Tenants extends BaseModuleEntity {
  id!: string;
  name?: string;
  externalId?: string;
  jwtSecret?: string;
  maxConcurrentUsers: number & Opt = 200;
  insertedAt!: Date;
  updatedAt!: Date;
  maxEventsPerSecond: number & Opt = 100;
  postgresCdcDefault?: string = "postgres_cdc_rls";
  maxBytesPerSecond: number & Opt = 100000;
  maxChannelsPerClient: number & Opt = 100;
  maxJoinsPerSecond: number & Opt = 500;
  suspend?: boolean = false;
  jwtJwks?: any;
  notifyPrivateAlpha?: boolean = false;
  extensionsCollection = new Collection<Extensions>(this);
}

export const TenantsSchema = new EntitySchema({
  class: Tenants,
  schema: "_realtime",
  properties: {
    id: { primary: true, type: "uuid" },
    name: { type: "text", nullable: true },
    externalId: {
      type: "text",
      nullable: true,
      unique: "tenants_external_id_index",
    },
    jwtSecret: { type: "text", nullable: true },
    maxConcurrentUsers: { type: "integer" },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    maxEventsPerSecond: { type: "integer" },
    postgresCdcDefault: { type: "text", nullable: true },
    maxBytesPerSecond: { type: "integer" },
    maxChannelsPerClient: { type: "integer" },
    maxJoinsPerSecond: { type: "integer" },
    suspend: { type: "boolean", nullable: true },
    jwtJwks: { type: "json", nullable: true },
    notifyPrivateAlpha: { type: "boolean", nullable: true },
    extensionsCollection: {
      kind: "1:m",
      entity: () => Extensions,
      mappedBy: "tenant",
    },
  },
});
