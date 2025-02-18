import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Dependency } from "./Dependency.ts";
import { Game } from "./Game.ts";
import { Runtime } from "./Runtime.ts";
import { Tactic } from "./Tactic.ts";
import { User } from "./User.ts";

export class Queue extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  userId!: Rel<User>;
  status: QueueStatus & Opt = QueueStatus.PENDING;
  data: any & Opt = "{}";
  index: number & Opt = 0;
  tacticId?: Rel<Tactic>;
  runtimeId!: Rel<Runtime>;
  dependencyId?: Rel<Dependency>;
  gameId?: Rel<Game>;
}

export enum QueueStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  FAILED = "FAILED",
}

export const QueueSchema = new EntitySchema({
  class: Queue,
  tableName: "Queue",
  properties: {
    id: { primary: true, type: "text", defaultRaw: `uuid_generate_v4()` },
    createdAt: {
      type: "datetime",
      fieldName: "createdAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: "datetime",
      fieldName: "updatedAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    userId: {
      kind: "m:1",
      entity: () => User,
      fieldName: "userId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    status: { enum: true, items: () => QueueStatus },
    data: { type: "json" },
    index: { type: "integer" },
    tacticId: {
      kind: "m:1",
      entity: () => Tactic,
      fieldName: "tacticId",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    dependencyId: {
      kind: "m:1",
      entity: () => Dependency,
      fieldName: "dependencyId",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    gameId: {
      kind: "m:1",
      entity: () => Game,
      fieldName: "gameId",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
  },
});
