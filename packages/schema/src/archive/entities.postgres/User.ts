import { BaseModuleEntity, Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { HEAD } from "./HEAD.ts";
import { Memory } from "./Memory.ts";
import { Play } from "./Play.ts";
import { Queue } from "./Queue.ts";
import { RuntimeToUser } from "./RuntimeToUser.ts";
import { Strategy } from "./Strategy.ts";

export class User extends BaseModuleEntity {
  id!: string;
  roles?: string[];
  config: any & Opt = "{}";
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeToUserCollection = new Collection<RuntimeToUser>(this);
  hEADCollection = new Collection<HEAD>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
  strategyCollection = new Collection<Strategy>(this);
}

export const UserSchema = new EntitySchema({
  class: User,
  tableName: "User",
  properties: {
    id: { primary: true, type: "text", unique: "User_id_key" },
    roles: {
      type: "string[]",
      columnType: "UserRolesEnum[]",
      nullable: true,
      defaultRaw: `ARRAY['USER'::"UserRolesEnum"]`,
    },
    config: { type: "json" },
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
    runtimeToUserCollection: {
      kind: "1:m",
      entity: () => RuntimeToUser,
      mappedBy: "B",
    },
    hEADCollection: { kind: "1:m", entity: () => HEAD, mappedBy: "userId" },
    memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "userId" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "userId" },
    queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "userId" },
    strategyCollection: {
      kind: "1:m",
      entity: () => Strategy,
      mappedBy: "userId",
    },
  },
});
