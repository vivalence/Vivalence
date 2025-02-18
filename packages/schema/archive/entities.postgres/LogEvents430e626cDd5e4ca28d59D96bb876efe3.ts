import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEvents430e626cDd5e4ca28d59D96bb876efe3 extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEvents430e626cDd5e4ca28d59D96bb876efe3Schema = new EntitySchema({
  class: LogEvents430e626cDd5e4ca28d59D96bb876efe3,
  tableName: "log_events_430e626c_dd5e_4ca2_8d59_d96bb876efe3",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
