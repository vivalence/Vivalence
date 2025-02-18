import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class SystemMetrics extends BaseModuleEntity {
  id!: bigint;
  allLogsLogged?: bigint;
  node?: string;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const SystemMetricsSchema = new EntitySchema({
  class: SystemMetrics,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    allLogsLogged: { type: "bigint", nullable: true },
    node: { type: "string", nullable: true, index: "system_metrics_node_index" },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
  },
});
