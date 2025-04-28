import config from "@vivalence/config";
import { Collection, EntitySchema, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { UserEntity } from "../1_repo/User.ts";
import { ServiceEntity } from "../2_module/Service.ts";
import { DomainEntity } from "../2_module/Domain.ts";
// import { GameEntity } from "../2_module/Game.ts";
// import { OntologyEntity } from "../2_module/Ontology.ts";
// import { CorpusEntity } from "../2_module/Corpus.ts";

export class RuntimeEntity extends BaseModuleEntity {
  users = new Collection<UserEntity>(this);
  services = new Collection<ServiceEntity>(this);
  domain!: Rel<DomainEntity>;
  // strategies = new Collection<StrategyEntity>(this);

  // modules
  // ontology?: Rel<OntologyEntity>;
  // corpora = new Collection<CorpusEntity>(this);
  // games = new Collection<GameEntity>(this);
  // strategies = new Collection<StrategyEntity>(this);

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
    users: {
      kind: "m:n",
      entity: () => UserEntity,
    },
    services: { kind: "1:m", entity: () => ServiceEntity },
    domain: { kind: "1:1", entity: () => DomainEntity },
    // ontology: { kind: "1:1", entity: () => OntologyEntity, mappedBy: "runtime" },
    // corpora: { kind: "1:m", entity: () => CorpusEntity, mappedBy: (c) => c.runtime },
    // games: { kind: "1:m", entity: () => GameEntity, mappedBy: "runtime" },

    url: { type: "method", persist: false, getter: true, getterName: "url" },
  },
});

// Not really required.
// plays: {kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.runtime, lazy: true,}, memories: {kind: "1:m", entity: () => MemoryEntity, mappedBy: (memory) => memory.runtime, lazy: true,}, instructions: {kind: "1:m", entity: () => InstructionEntity, mappedBy: (instruction) => instruction.runtime, lazy: true,}, units: tags.
// memories = new Collection<MemoryEntity>(this); plays = new Collection<PlayEntity>(this); instructions = new Collection<InstructionEntity>(this);

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
