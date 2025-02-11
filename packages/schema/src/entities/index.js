export { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";
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

import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";
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

export const vivaEntity = {};
// daemon entities: ["user", "repoo", "daemon", "runtime", "service", "domain", "ontology", "curriculum", "game", "tactic", "strategy",]
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
};
// "strategy": StrategyEntity,

export const enums = {
  ModuleInstallation: ModuleInstallationEnum,
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
  Strategy: StrategyEntity,
  tag: TagEntity,
  unit: UnitEntity,
  condition: ConditionEntity,
  dependency: DependencyEntity,
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
  DependencySchema,
  ConditionSchema,
];

// export default schemas;
