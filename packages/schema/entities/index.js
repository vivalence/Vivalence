//
//
// EXPORTS
//
//
export { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";

export { UserEntity, UserSchema } from "./1_repo/User.ts";
export { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";
export { ServiceEntity, ServiceSchema } from "./1_repo/Service.ts";

export { OntologyEntity, OntologySchema } from "./2_runtime/Ontology.ts";
export { CurriculumEntity, CurriculumSchema } from "./2_runtime/Curriculum.ts";
export { DomainEntity, DomainSchema } from "./2_runtime/Domain.ts";
export { GameEntity, GameSchema } from "./2_runtime/Game.ts";
export { StrategyEntity, StrategySchema } from "./2_runtime/Strategy.ts";

export { TacticEntity, TacticSchema } from "./4_curriculum/Tactic.ts";
export { TagEntity, TagSchema } from "./4_curriculum/Tag.ts";
export { ConditionEntity, ConditionSchema } from "./4_curriculum/Condition.ts";
export { DependencyEntity, DependencySchema } from "./4_curriculum/Dependency.ts";

export { MemoryEntity, MemorySchema } from "./5_userland/Memory.ts";
export { PlayEntity, PlaySchema } from "./5_userland/Play.ts";
export { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./5_userland/Memory.ts";

export { InstructionEntity, InstructionSchema } from "./6_transient/Instruction.ts";
export { InstructionStatusEnum } from "./6_transient/Instruction.ts";

//
export { TopographyEntity, TopographyRepository } from "./3_ontology/Topography.ts";
export { AnnotationEntity, AnnotationRepository } from "./3_ontology/Annotation.ts";
export { ConstraintEntity, ConstraintRepository } from "./3_ontology/Constraint.ts";
export { IssueEntity, IssueRepository } from "./3_ontology/Issue.ts";

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
import { ServiceEntity, ServiceSchema } from "./1_repo/Service.ts";

import { GameEntity, GameSchema } from "./2_runtime/Game.ts";
import { StrategyEntity, StrategySchema } from "./2_runtime/Strategy.ts";
import { OntologyEntity, OntologySchema } from "./2_runtime/Ontology.ts";
import { CurriculumEntity, CurriculumSchema } from "./2_runtime/Curriculum.ts";
import { DomainEntity, DomainSchema } from "./2_runtime/Domain.ts";

import { TacticEntity, TacticSchema } from "./4_curriculum/Tactic.ts";
import { TagEntity, TagSchema } from "./4_curriculum/Tag.ts";
import { UnitEntity, UnitSchema } from "./4_curriculum/Unit.ts";
import { ConditionEntity, ConditionSchema } from "./4_curriculum/Condition.ts";
import { DependencyEntity, DependencySchema } from "./4_curriculum/Dependency.ts";

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
  curriculum: CurriculumEntity,
  game: GameEntity,
  tactic: TacticEntity,

  // "strategy": StrategyEntity,
};

export const runtimeEntities = {
  runtime: RuntimeEntity,
  service: ServiceEntity,
  domain: DomainEntity,
  ontology: OntologyEntity,
  curriculum: CurriculumEntity,
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
  curriculum: CurriculumEntity,
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
  CurriculumSchema,
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
