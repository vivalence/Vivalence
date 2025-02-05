import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEventsAb7348d4C4414e6eB1164aedcfa3d65b extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEventsAb7348d4C4414e6eB1164aedcfa3d65bSchema = new EntitySchema({
  class: LogEventsAb7348d4C4414e6eB1164aedcfa3d65b,
  tableName: "log_events_ab7348d4_c441_4e6e_b116_4aedcfa3d65b",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
