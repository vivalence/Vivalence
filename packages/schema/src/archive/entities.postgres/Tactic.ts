import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Play } from "./Play.ts";
import { Queue } from "./Queue.ts";
import { Runtime } from "./Runtime.ts";

export class Tactic extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name?: string;
  relations: any & Opt = "{}";
  runtimeId!: Rel<Runtime>;
  masks: any & Opt = "{}";
  slug!: string;
  description?: string;
  installed: boolean & Opt = false;
  version: string & Opt = "0.0.0";
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
}

export const TacticSchema = new EntitySchema({
  class: Tactic,
  tableName: "Tactic",
  uniques: [
    {
      name: "Tactic_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Tactic_slug_runtimeId_key" ON public."Tactic" USING btree (slug, "runtimeId")',
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
    relations: { type: "json" },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    masks: { type: "json" },
    slug: { type: "text" },
    description: { type: "text", nullable: true },
    installed: { type: "boolean" },
    version: { type: "text" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "tacticId" },
    queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "tacticId" },
  },
});
