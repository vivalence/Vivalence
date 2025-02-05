import config from "@vivalence/config";
import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { ModuleInstallationEnum } from "../0_root/BaseModuleEntity.ts";
import { UserEntity } from "../0_root/User.ts";
import { ServiceEntity } from "../1_repo/Service.ts";
import { DomainEntity } from "../2_runtime/Domain.ts";
import { OntologyEntity } from "../2_runtime/Ontology.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";

export class RuntimeEntity extends BaseModuleEntity {
  config: any & Opt = "{}"; // modules, services, statics - file state.
  users = new Collection<UserEntity>(this);
  domain?: Rel<DomainEntity>;

  services = new Collection<ServiceEntity>(this);
  ontology?: Rel<OntologyEntity>;
  curricula = new Collection<CurriculumEntity>(this);

  get url() {
    return new URL(`/runtime/${this.slug}`, config.env.get("VIVA_DAEMON_URL"));
  }
}

export const RuntimeSchema = new EntitySchema<RuntimeEntity, BaseModuleEntity>({
  class: RuntimeEntity,
  extends: BaseModuleSchema,
  tableName: "Runtime",
  uniques: [{ properties: ["slug"] }],
  properties: {
    config: {
      type: "json",
      default: {},
      onCreate: () => ({}),
    },
    users: {
      kind: "m:n",
      entity: () => UserEntity,
      inversedBy: "runtimes",
      pivotTable: "_RuntimeToUser",
    },
    services: { kind: "1:m", entity: () => ServiceEntity, mappedBy: "runtime" },
    domain: { kind: "1:1", entity: () => DomainEntity, mappedBy: "runtime" },
    ontology: { kind: "1:1", entity: () => OntologyEntity, mappedBy: "runtime" },
    curricula: { kind: "1:m", entity: () => CurriculumEntity, mappedBy: "runtime" },
    url: { type: "method", persist: false, getter: true, getterName: "url" },
  },
});

// imports
// import { Condition } from "../3_curriculum/Condition.ts";
// import { Dependency } from "../3_curriculum/Dependency.ts";
// import { Game } from "../2_runtime/Game.ts";
// import { HEAD } from "../5_transient/HEAD.ts";
// import { Memory } from "../4_userland/Memory.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Queue } from "../5_transient/Queue.ts";
// import { Session } from "../5_transient/Session.ts";
// import { Strategy } from "../2_runtime/Strategy.ts";
// import { Tactic } from "../3_curriculum/Tactic.ts";
// import { Tag } from "../3_curriculum/Tag.ts";
// import { Unit } from "../3_curriculum/Unit.ts";
// class
// conditionCollection = new Collection<Condition>(this);
// dependencyCollection = new Collection<Dependency>(this);
// gameCollection = new Collection<Game>(this);
// HEAD?: Rel<HEAD>;
// memoryCollection = new Collection<Memory>(this);
// playCollection = new Collection<Play>(this);
// queueCollection = new Collection<Queue>(this);
// sessionCollection = new Collection<Session>(this);
// strategyCollection = new Collection<Strategy>(this);
// tacticCollection = new Collection<Tactic>(this);
// tagCollection = new Collection<Tag>(this);
// unitCollection = new Collection<Unit>(this);
// schema
// conditionCollection: { kind: "1:m", entity: () => Condition, mappedBy: "runtime" },
// dependencyCollection: { kind: "1:m", entity: () => Dependency, mappedBy: "runtime" },
// gameCollection: { kind: "1:m", entity: () => Game, mappedBy: "runtime" },
// HEAD: { kind: "1:1", entity: () => HEAD, mappedBy: "runtime" },
// memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "runtime" },
// playCollection: { kind: "1:m", entity: () => Play, mappedBy: "runtime" },
// queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "runtime" },
// sessionCollection: { kind: "1:m", entity: () => Session, mappedBy: "runtime" },
// strategyCollection: { kind: "1:m", entity: () => Strategy, mappedBy: "runtime" },
// tacticCollection: { kind: "1:m", entity: () => Tactic, mappedBy: "runtime" },
// tagCollection: { kind: "1:m", entity: () => Tag, mappedBy: "runtime" },
// unitCollection: { kind: "1:m", entity: () => Unit, mappedBy: "runtime" },
