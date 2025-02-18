import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class Plans extends BaseModuleEntity {
  id!: bigint;
  name?: string;
  stripeId?: string;
  insertedAt!: Date;
  updatedAt!: Date;
  period?: string;
  price?: number;
  limitSources?: number;
  limitRateLimit?: number;
  limitAlertFreq?: number;
  limitSourceRateLimit?: number;
  limitSavedSearchLimit?: number;
  limitTeamUsersLimit?: number;
  limitSourceFieldsLimit?: number;
  limitSourceTtl?: bigint;
  type?: string = "standard";
}

export const PlansSchema = new EntitySchema({
  class: Plans,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    name: { type: "string", nullable: true },
    stripeId: { type: "string", nullable: true },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    period: { type: "string", nullable: true },
    price: { type: "integer", nullable: true },
    limitSources: { type: "integer", nullable: true },
    limitRateLimit: { type: "integer", nullable: true },
    limitAlertFreq: { type: "integer", nullable: true },
    limitSourceRateLimit: { type: "integer", nullable: true },
    limitSavedSearchLimit: { type: "integer", nullable: true },
    limitTeamUsersLimit: { type: "integer", nullable: true },
    limitSourceFieldsLimit: { type: "integer", nullable: true },
    limitSourceTtl: { type: "bigint", nullable: true, defaultRaw: `259200000` },
    type: { type: "string", nullable: true },
  },
});
