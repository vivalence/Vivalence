import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Play } from "./Play.ts";
import { Queue } from "./Queue.ts";
import { Runtime } from "./Runtime.ts";

export class Game extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name?: string;
  installed: boolean & Opt = false;
  version: string & Opt = "0.0.0";
  runtimeId!: Rel<Runtime>;
  slug!: string;
  mask: any & Opt = "{}";
  description?: string;
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
}

export const GameSchema = new EntitySchema({
  class: Game,
  tableName: "Game",
  uniques: [
    {
      name: "Game_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Game_slug_runtimeId_key" ON public."Game" USING btree (slug, "runtimeId")',
      properties: ["slug", "runtimeId"],
    },
  ],
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
    name: { type: "text", nullable: true },
    installed: { type: "boolean" },
    version: { type: "text" },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    slug: { type: "text" },
    mask: { type: "json" },
    description: { type: "text", nullable: true },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "gameId" },
    queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "gameId" },
  },
});
