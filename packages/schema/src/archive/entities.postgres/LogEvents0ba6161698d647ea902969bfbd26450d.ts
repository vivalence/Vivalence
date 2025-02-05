import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEvents0ba6161698d647ea902969bfbd26450d extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEvents0ba6161698d647ea902969bfbd26450dSchema = new EntitySchema({
  class: LogEvents0ba6161698d647ea902969bfbd26450d,
  tableName: "log_events_0ba61616_98d6_47ea_9029_69bfbd26450d",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
