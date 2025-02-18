import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class LogEvents168ea6368e354f57825d3812675bb202 extends BaseModuleEntity {
  id!: string;
  body?: any;
  eventMessage?: string;
  timestamp?: Date;
}

export const LogEvents168ea6368e354f57825d3812675bb202Schema = new EntitySchema({
  class: LogEvents168ea6368e354f57825d3812675bb202,
  tableName: "log_events_168ea636_8e35_4f57_825d_3812675bb202",
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "string" },
    body: { type: "json", nullable: true },
    eventMessage: { type: "text", nullable: true },
    timestamp: { type: "datetime", columnType: "timestamp(6)", nullable: true },
  },
});
