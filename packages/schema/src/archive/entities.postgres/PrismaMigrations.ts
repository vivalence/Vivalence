import { BaseModuleEntity, EntitySchema, type Opt } from "@mikro-orm/core";

export class PrismaMigrations extends BaseModuleEntity {
  id!: string;
  checksum!: string;
  finishedAt?: Date;
  migrationName!: string;
  logs?: string;
  rolledBackAt?: Date;
  startedAt!: Date & Opt;
  appliedStepsCount: number & Opt = 0;
}

export const PrismaMigrationsSchema = new EntitySchema({
  class: PrismaMigrations,
  tableName: "_prisma_migrations",
  properties: {
    id: { primary: true, type: "string", length: 36 },
    checksum: { type: "string", length: 64 },
    finishedAt: { type: "datetime", nullable: true },
    migrationName: { type: "string" },
    logs: { type: "text", nullable: true },
    rolledBackAt: { type: "datetime", nullable: true },
    startedAt: { type: "datetime", defaultRaw: `now()` },
    appliedStepsCount: { type: "integer" },
  },
});
