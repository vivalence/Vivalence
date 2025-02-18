export { UserEntity, UserSchema } from "./0_root/User.ts";
export { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";
export { ServiceEntity, ServiceSchema } from "./1_repo/Service.ts";
export { OntologyEntity, OntologySchema } from "./2_runtime/Ontology.ts";
export { CurriculumEntity, CurriculumSchema } from "./2_runtime/Curriculum.ts";
export { DomainEntity, DomainSchema } from "./2_runtime/Domain.ts";
export { GameEntity, GameSchema } from "./2_runtime/Game.ts";
export { StrategyEntity, StrategySchema } from "./2_runtime/Strategy.ts";
export { TacticEntity, TacticSchema } from "./3_curriculum/Tactic.ts";
export { TagEntity, TagSchema } from "./3_curriculum/Tag.ts";
export { ConditionEntity, ConditionSchema } from "./3_curriculum/Condition.ts";
export { DependencyEntity, DependencySchema } from "./3_curriculum/Dependency.ts";
export { MemoryEntity, MemorySchema } from "./4_userland/Memory.ts";
export { PlayEntity, PlaySchema } from "./4_userland/Play.ts";
export { InstructionEntity, InstructionSchema } from "./5_transient/Instruction.ts";

export { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";
export { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./4_userland/Memory.ts";
export { InstructionStatusEnum } from "./5_transient/Instruction.ts";

import { UserEntity, UserSchema } from "./0_root/User.ts";
import { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";
import { ServiceEntity, ServiceSchema } from "./1_repo/Service.ts";
import { GameEntity, GameSchema } from "./2_runtime/Game.ts";
import { StrategyEntity, StrategySchema } from "./2_runtime/Strategy.ts";
import { OntologyEntity, OntologySchema } from "./2_runtime/Ontology.ts";
import { CurriculumEntity, CurriculumSchema } from "./2_runtime/Curriculum.ts";
import { DomainEntity, DomainSchema } from "./2_runtime/Domain.ts";
import { TacticEntity, TacticSchema } from "./3_curriculum/Tactic.ts";
import { TagEntity, TagSchema } from "./3_curriculum/Tag.ts";
import { UnitEntity, UnitSchema } from "./3_curriculum/Unit.ts";
import { ConditionEntity, ConditionSchema } from "./3_curriculum/Condition.ts";
import { DependencyEntity, DependencySchema } from "./3_curriculum/Dependency.ts";
import { MemoryEntity, MemorySchema } from "./4_userland/Memory.ts";
import { PlayEntity, PlaySchema } from "./4_userland/Play.ts";
import { InstructionEntity, InstructionSchema } from "./5_transient/Instruction.ts";

import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";
import { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./4_userland/Memory.ts";
import { InstructionStatusEnum } from "./5_transient/Instruction.ts";

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
  user: UserEntity,
  runtime: RuntimeEntity,
  service: ServiceEntity,
  domain: DomainEntity,
  ontology: OntologyEntity,
  curriculum: CurriculumEntity,
  game: GameEntity,
  tactic: TacticEntity,
  tag: TagEntity,
  unit: UnitEntity,
  condition: ConditionEntity,
  dependency: DependencyEntity,
  memory: MemoryEntity,
  play: PlayEntity,
  instruction: InstructionEntity,
  // "strategy": StrategyEntity,
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
