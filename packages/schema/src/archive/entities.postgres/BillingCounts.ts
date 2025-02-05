import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { AnalyticsUsers } from "./AnalyticsUsers.ts";

export class BillingCounts extends BaseModuleEntity {
  id!: bigint;
  node?: string;
  count?: number;
  user?: Rel<AnalyticsUsers>;
  sourceId?: bigint;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const BillingCountsSchema = new EntitySchema({
  class: BillingCounts,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    node: { type: "string", nullable: true },
    count: { type: "integer", nullable: true },
    user: {
      kind: "m:1",
      entity: () => AnalyticsUsers,
      deleteRule: "cascade",
      nullable: true,
      index: true,
    },
    sourceId: {
      type: "bigint",
      nullable: true,
      index: "billing_counts_source_id_index",
    },
    insertedAt: {
      type: "datetime",
      columnType: "timestamp(0)",
      index: "billing_counts_inserted_at_index",
    },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
  },
});
