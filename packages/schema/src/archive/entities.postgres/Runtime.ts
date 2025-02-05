import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Corpus } from "./Corpus.ts";
import { Dependency } from "./Dependency.ts";
import { Domain } from "./Domain.ts";
import { Game } from "./Game.ts";
import { HEAD } from "./HEAD.ts";
import { Memory } from "./Memory.ts";
import { Ontology } from "./Ontology.ts";
import { Play } from "./Play.ts";
import { PublicCondition } from "./PublicCondition.ts";
import { Queue } from "./Queue.ts";
import { RuntimeToUser } from "./RuntimeToUser.ts";
import { Strategy } from "./Strategy.ts";
import { Tactic } from "./Tactic.ts";
import { Tag } from "./Tag.ts";
import { Unit } from "./Unit.ts";

export class Runtime extends BaseModuleEntity {
  id!: string & Opt;
  slug!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name?: string;
  installed: boolean & Opt = false;
  version: string & Opt = "0.0.0";
  description?: string;
  icon?: any;
  runtimeToUserCollection = new Collection<RuntimeToUser>(this);
  publicConditionCollection = new Collection<PublicCondition>(this);
  corpusCollection = new Collection<Corpus>(this);
  dependencyCollection = new Collection<Dependency>(this);
  domain?: Rel<Domain>;
  gameCollection = new Collection<Game>(this);
  hEAD?: Rel<HEAD>;
  memoryCollection = new Collection<Memory>(this);
  ontology?: Rel<Ontology>;
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
  strategyCollection = new Collection<Strategy>(this);
  tacticCollection = new Collection<Tactic>(this);
  tagCollection = new Collection<Tag>(this);
  unitCollection = new Collection<Unit>(this);
}

export const RuntimeSchema = new EntitySchema({
  class: Runtime,
  tableName: "Runtime",
  properties: {
    id: { primary: true, type: "text", defaultRaw: `uuid_generate_v4()` },
    slug: { type: "text", unique: "Runtime_slug_key" },
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
    description: { type: "text", nullable: true },
    icon: { type: "json", nullable: true },
    runtimeToUserCollection: {
      kind: "1:m",
      entity: () => RuntimeToUser,
      mappedBy: "A",
    },
    publicConditionCollection: {
      kind: "1:m",
      entity: () => PublicCondition,
      mappedBy: "runtimeId",
    },
    corpusCollection: { kind: "1:m", entity: () => Corpus, mappedBy: "runtimeId" },
    dependencyCollection: {
      kind: "1:m",
      entity: () => Dependency,
      mappedBy: "runtimeId",
    },
    domain: { kind: "1:1", entity: () => Domain, mappedBy: "runtimeId" },
    gameCollection: { kind: "1:m", entity: () => Game, mappedBy: "runtimeId" },
    hEAD: { kind: "1:1", entity: () => HEAD, mappedBy: "runtimeId" },
    memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "runtimeId" },
    ontology: { kind: "1:1", entity: () => Ontology, mappedBy: "runtimeId" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "runtimeId" },
    queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "runtimeId" },
    strategyCollection: {
      kind: "1:m",
      entity: () => Strategy,
      mappedBy: "runtimeId",
    },
    tacticCollection: { kind: "1:m", entity: () => Tactic, mappedBy: "runtimeId" },
    tagCollection: { kind: "1:m", entity: () => Tag, mappedBy: "runtimeId" },
    unitCollection: { kind: "1:m", entity: () => Unit, mappedBy: "runtimeId" },
  },
});
