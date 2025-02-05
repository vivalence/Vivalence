import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEvents142456295f314040A5383c768ad99969 extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEvents142456295f314040A5383c768ad99969Schema = new EntitySchema({
  class: LogEvents142456295f314040A5383c768ad99969,
  tableName: "log_events_14245629_5f31_4040_a538_3c768ad99969",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
