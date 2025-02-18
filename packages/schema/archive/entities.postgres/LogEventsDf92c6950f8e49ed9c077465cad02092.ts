import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEventsDf92c6950f8e49ed9c077465cad02092 extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEventsDf92c6950f8e49ed9c077465cad02092Schema = new EntitySchema({
  class: LogEventsDf92c6950f8e49ed9c077465cad02092,
  tableName: "log_events_df92c695_0f8e_49ed_9c07_7465cad02092",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
