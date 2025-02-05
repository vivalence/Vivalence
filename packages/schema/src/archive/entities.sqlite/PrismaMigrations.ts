import { BaseEntity, EntitySchema, type Opt } from '@mikro-orm/core';

export class PrismaMigrations extends BaseEntity {
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
  tableName: '_prisma_migrations',
  properties: {
    id: { primary: true, type: 'text' },
    checksum: { type: 'text' },
    finishedAt: { type: 'datetime', nullable: true },
    migrationName: { type: 'text' },
    logs: { type: 'text', nullable: true },
    rolledBackAt: { type: 'datetime', nullable: true },
    startedAt: { type: 'datetime', defaultRaw: `current_timestamp` },
    appliedStepsCount: { type: 'integer' },
  },
});
