import { BaseModuleEntity, EntitySchema, type Opt } from "@mikro-orm/core";

export class Subscription extends BaseModuleEntity {
  id!: bigint & Opt;
  subscriptionId!: string;
  entity!: unknown;
  filters: string[] & Opt = "{}";
  claims!: any;
  claimsRole!: unknown & Opt;
  createdAt!: Date & Opt;
}

export const SubscriptionSchema = new EntitySchema({
  class: Subscription,
  schema: "realtime",
  uniques: [
    {
      name: "subscription_subscription_id_entity_filters_key",
      properties: ["subscriptionId", "entity", "filters"],
    },
  ],
  properties: {
    id: { primary: true, type: "bigint", generated: "identity" },
    subscriptionId: { type: "uuid" },
    entity: {
      type: "unknown",
      columnType: "regclass",
      index: "ix_realtime_subscription_entity",
    },
    filters: { type: "string[]", columnType: "user_defined_filter[]" },
    claims: { type: "json" },
    claimsRole: {
      type: "unknown",
      columnType: "regrole",
      generated: "realtime.to_regrole((claims ->> 'role'::text)) stored",
    },
    createdAt: {
      type: "datetime",
      columnType: "timestamp(6)",
      defaultRaw: `timezone('utc'::text, now())`,
    },
  },
});
