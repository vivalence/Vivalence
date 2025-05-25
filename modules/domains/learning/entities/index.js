// ENUMS
// import { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./5_userland/Memory.ts";
// import { InstructionStatusEnum } from "./6_transient/Instruction.ts";

// ENTITIES
// import { OntologyEntity, OntologySchema } from "./2_module/Ontology.ts";
// import { GameEntity, GameSchema } from "./2_module/Game.ts";
// import { CorpusEntity, CorpusSchema } from "./2_module/Corpus.ts";
// import { TacticEntity, TacticSchema } from "./2_module/Tactic.ts";

import { TagEntity, TagSchema } from "./data/Tag.ts";
import { UnitEntity, UnitSchema } from "./data/Unit.ts";
import { ConditionEntity, ConditionSchema } from "./data/Condition.ts";
import { DependencyEntity, DependencySchema } from "./data/Dependency.ts";

import { MemoryEntity, MemorySchema } from "./userland/Memory.ts";
import { PlayEntity, PlaySchema } from "./userland/Play.ts";

import {
  InstructionEntity,
  InstructionSchema,
} from "./transient/Instruction.ts";
import { SessionEntity, SessionSchema } from "./transient/Session.ts";

import { TopographyRepository } from "./topology/Topography.ts";
import { DimensionRepository } from "./topology/Dimension.ts";
import { ConstraintRepository } from "./topology/Constraint.ts";
import { IssueRepository } from "./topology/Issue.ts";

export const enums = {
  // // ModuleInstallation: ModuleInstallationEnum,
  // MemoryType: MemoryTypeEnum,
  // MemoryFlavor: MemoryFlavorEnum,
  // MemoryStatus: MemoryStatusEnum,
  // InstructionStatus: InstructionStatusEnum,
  // // SessionTraits: SessionTraitsEnum,
};

// const modules = {
//   ontology: OntologyEntity,
//   corpus: CorpusEntity,
//   game: GameEntity,
//   tactic: TacticEntity,
// };

const entities = {
  // ontology: OntologyEntity,
  // corpus: CorpusEntity,
  // game: GameEntity,
  // tactic: TacticEntity,

  tag: TagEntity,
  unit: UnitEntity,
  condition: ConditionEntity,
  dependency: DependencyEntity,
  memory: MemoryEntity,
  play: PlayEntity,
  instruction: InstructionEntity,
  session: SessionEntity,
  // // topography: TopographyEntity,
  // // annotation: AnnotationEntity,
  // // rule: RuleEntity,
};

const schema = [
  // OntologySchema,
  // CorpusSchema,
  // GameSchema,
  // TacticSchema,
  TagSchema,
  UnitSchema,
  ConditionSchema,
  DependencySchema,
  MemorySchema,
  PlaySchema,
  InstructionSchema,
  SessionSchema,
];

const repositories = {
  dimension: DimensionRepository,
  topography: TopographyRepository,
  issue: IssueRepository,
  constraint: ConstraintRepository,
};

export default { enums, entities, repositories, schema };
