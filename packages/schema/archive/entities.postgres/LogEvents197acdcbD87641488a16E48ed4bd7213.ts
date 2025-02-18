import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEvents197acdcbD87641488a16E48ed4bd7213 extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEvents197acdcbD87641488a16E48ed4bd7213Schema = new EntitySchema({
  class: LogEvents197acdcbD87641488a16E48ed4bd7213,
  tableName: "log_events_197acdcb_d876_4148_8a16_e48ed4bd7213",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
