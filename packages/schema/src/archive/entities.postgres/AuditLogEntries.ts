import { BaseModuleEntity, EntitySchema, type Opt } from "@mikro-orm/core";

export class AuditLogEntries extends BaseModuleEntity {
  instanceId?: string;
  id!: string;
  payload?: any;
  createdAt?: Date;
  ipAddress: string & Opt = "";
}

export const AuditLogEntriesSchema = new EntitySchema({
  class: AuditLogEntries,
  schema: "auth",
  comment: "Auth: Audit trail for user actions.",
  properties: {
    instanceId: {
      type: "uuid",
      nullable: true,
      index: "audit_logs_instance_id_idx",
    },
    id: { primary: true, type: "uuid" },
    payload: { type: "json", columnType: "json", nullable: true },
    createdAt: { type: "datetime", nullable: true },
    ipAddress: { type: "string", length: 64 },
  },
});
