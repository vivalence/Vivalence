import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEventsA3fce3d43cef4ef481e45777218f3ecf extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEventsA3fce3d43cef4ef481e45777218f3ecfSchema = new EntitySchema({
  class: LogEventsA3fce3d43cef4ef481e45777218f3ecf,
  tableName: "log_events_a3fce3d4_3cef_4ef4_81e4_5777218f3ecf",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
