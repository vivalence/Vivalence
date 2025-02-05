import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Dependency } from "../3_curriculum/Dependency.ts";
import { Game } from "../2_runtime/Game.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { Tactic } from "../3_curriculum/Tactic.ts";
import { User } from "../0_root/User.ts";

export class Queue extends BaseModuleEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  game?: Rel<Game>;
  tactic?: Rel<Tactic>;
  dependency?: Rel<Dependency>;
  index: number & Opt = 0;
  status: QueueStatus & Opt = QueueStatus.PENDING;
  data: any & Opt = "{}";
}

export enum QueueStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export const QueueSchema = new EntitySchema({
  class: Queue,
  tableName: "Queue",
  properties: {
    id: { primary: true, type: "text" },
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
    user: {
      kind: "m:1",
      entity: () => User,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    runtime: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    game: {
      kind: "m:1",
      entity: () => Game,
      fieldName: "game",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    tactic: {
      kind: "m:1",
      entity: () => Tactic,
      fieldName: "tactic",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    dependency: {
      kind: "m:1",
      entity: () => Dependency,
      fieldName: "dependency",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    index: { type: "integer" },
    status: { enum: true, items: () => QueueStatus },
    data: { type: "json" },
  },
});
