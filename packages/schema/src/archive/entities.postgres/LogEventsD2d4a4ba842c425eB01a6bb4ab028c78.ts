import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEventsD2d4a4ba842c425eB01a6bb4ab028c78 extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEventsD2d4a4ba842c425eB01a6bb4ab028c78Schema = new EntitySchema({
  class: LogEventsD2d4a4ba842c425eB01a6bb4ab028c78,
  tableName: "log_events_d2d4a4ba_842c_425e_b01a_6bb4ab028c78",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
