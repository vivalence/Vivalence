//
//
// EXPORTS
//
//
export { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";

export { UserEntity, UserSchema } from "./1_repo/User.ts";
export { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";

export { ServiceEntity, ServiceSchema } from "./2_module/Service.ts";
export { OntologyEntity, OntologySchema } from "./2_module/Ontology.ts";
export { CorpusEntity, CorpusSchema } from "./2_module/Corpus.ts";
export { DomainEntity, DomainSchema } from "./2_module/Domain.ts";
export { GameEntity, GameSchema } from "./2_module/Game.ts";
export { StrategyEntity, StrategySchema } from "./2_module/Strategy.ts";
export { TacticEntity, TacticSchema } from "./2_module/Tactic.ts";

export { TagEntity, TagSchema } from "./4_data/Tag.ts";
export { ConditionEntity, ConditionSchema } from "./4_data/Condition.ts";
export { DependencyEntity, DependencySchema } from "./4_data/Dependency.ts";

export { MemoryEntity, MemorySchema } from "./5_userland/Memory.ts";
export { PlayEntity, PlaySchema } from "./5_userland/Play.ts";
export { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./5_userland/Memory.ts";

export { InstructionEntity, InstructionSchema } from "./6_transient/Instruction.ts";
export { InstructionStatusEnum } from "./6_transient/Instruction.ts";

//
export { TopographyEntity, TopographyRepository } from "./3_topology/Topography.ts";
export { AnnotationEntity, AnnotationRepository } from "./3_topology/Annotation.ts";
export { ConstraintEntity, ConstraintRepository } from "./3_topology/Constraint.ts";
export { IssueEntity, IssueRepository } from "./3_topology/Issue.ts";

//
//
// IMPORTS
//
//

// ENUMS
import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";
import { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./5_userland/Memory.ts";
import { InstructionStatusEnum } from "./6_transient/Instruction.ts";

// ENTITIES
import { UserEntity, UserSchema } from "./1_repo/User.ts";
import { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";

import { ServiceEntity, ServiceSchema } from "./2_module/Service.ts";
import { GameEntity, GameSchema } from "./2_module/Game.ts";
import { StrategyEntity, StrategySchema } from "./2_module/Strategy.ts";
import { OntologyEntity, OntologySchema } from "./2_module/Ontology.ts";
import { CorpusEntity, CorpusSchema } from "./2_module/Corpus.ts";
import { DomainEntity, DomainSchema } from "./2_module/Domain.ts";
import { TacticEntity, TacticSchema } from "./2_module/Tactic.ts";

import { TagEntity, TagSchema } from "./4_data/Tag.ts";
import { UnitEntity, UnitSchema } from "./4_data/Unit.ts";
import { ConditionEntity, ConditionSchema } from "./4_data/Condition.ts";
import { DependencyEntity, DependencySchema } from "./4_data/Dependency.ts";

import { MemoryEntity, MemorySchema } from "./5_userland/Memory.ts";
import { PlayEntity, PlaySchema } from "./5_userland/Play.ts";

import { InstructionEntity, InstructionSchema } from "./6_transient/Instruction.ts";

// import { TopographyEntity } from "./3_ontology/Topography.ts";
// import { AnnotationEntity } from "./3_ontology/Annotation.ts";
// import { ConstraintEntity } from "./3_ontology/Constraint.ts";

export const enums = {
  ModuleInstallation: ModuleInstallationEnum,
  MemoryType: MemoryTypeEnum,
  MemoryFlavor: MemoryFlavorEnum,
  MemoryStatus: MemoryStatusEnum,
  InstructionStatus: InstructionStatusEnum,
};

export const vivaEntities = {};

export const daemonEntites = {
  user: UserEntity,
  // daemon: DaemonEntity,
  // repo: RepoEntity,
  runtime: RuntimeEntity,
  service: ServiceEntity,
  domain: DomainEntity,
  ontology: OntologyEntity,
  corpus: CorpusEntity,
  game: GameEntity,
  tactic: TacticEntity,

  // "strategy": StrategyEntity,
};

export const runtimeEntities = {
  runtime: RuntimeEntity,
  service: ServiceEntity,
  domain: DomainEntity,
  ontology: OntologyEntity,
  corpus: CorpusEntity,
  // issue: IssueEntity,
  // ABOVE TO BE moved into daemon entities. (in memory)
  //
  //
  // "strategy": StrategyEntity,
  tactic: TacticEntity,
  game: GameEntity,
  tag: TagEntity,
  unit: UnitEntity,
  condition: ConditionEntity,
  dependency: DependencyEntity,
  memory: MemoryEntity,
  play: PlayEntity,
  instruction: InstructionEntity,
};

export const entities = {
  user: UserEntity,
  runtime: RuntimeEntity,
  ontology: OntologyEntity,
  corpus: CorpusEntity,
  domain: DomainEntity,
  service: ServiceEntity,
  game: GameEntity,
  tactic: TacticEntity,
  strategy: StrategyEntity,
  tag: TagEntity,
  unit: UnitEntity,
  condition: ConditionEntity,
  dependency: DependencyEntity,
  memory: MemoryEntity,
  play: PlayEntity,
  instruction: InstructionEntity,
  // topography: TopographyEntity,
  // annotation: AnnotationEntity,
  // rule: RuleEntity,
};

export const schemas = [
  UserSchema,
  RuntimeSchema,
  OntologySchema,
  CorpusSchema,
  DomainSchema,
  ServiceSchema,
  GameSchema,
  TacticSchema,
  StrategySchema,
  TagSchema,
  UnitSchema,
  ConditionSchema,
  DependencySchema,
  MemorySchema,
  PlaySchema,
  InstructionSchema,
];

// export default schemas;
