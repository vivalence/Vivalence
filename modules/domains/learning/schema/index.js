// ENUMS
// import { MemoryTypeEnum, MemoryFlavorEnum, MemoryStatusEnum } from "./5_userland/Memory.ts";
// import { InstructionStatusEnum } from "./6_transient/Instruction.ts";

// ENTITIES
import { OntologyEntity, OntologySchema } from "./2_module/Ontology.ts";
import { GameEntity, GameSchema } from "./2_module/Game.ts";
import { CorpusEntity, CorpusSchema } from "./2_module/Corpus.ts";
import { TacticEntity, TacticSchema } from "./2_module/Tactic.ts";

import { TagEntity, TagSchema } from "./4_data/Tag.ts";
import { UnitEntity, UnitSchema } from "./4_data/Unit.ts";
import { ConditionEntity, ConditionSchema } from "./4_data/Condition.ts";
import { DependencyEntity, DependencySchema } from "./4_data/Dependency.ts";

import { MemoryEntity, MemorySchema } from "./5_userland/Memory.ts";
import { PlayEntity, PlaySchema } from "./5_userland/Play.ts";

import { InstructionEntity, InstructionSchema } from "./6_transient/Instruction.ts";
import { SessionEntity, SessionSchema } from "./6_transient/Session.ts";

export const enums = {
  // // ModuleInstallation: ModuleInstallationEnum,
  // MemoryType: MemoryTypeEnum,
  // MemoryFlavor: MemoryFlavorEnum,
  // MemoryStatus: MemoryStatusEnum,
  // InstructionStatus: InstructionStatusEnum,
  // // SessionTraits: SessionTraitsEnum,
};

export const entities = {
  ontology: OntologyEntity,
  corpus: CorpusEntity,
  game: GameEntity,
  tactic: TacticEntity,

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

export const schemas = [
  OntologySchema,
  CorpusSchema,
  GameSchema,
  TacticSchema,

  TagSchema,
  UnitSchema,
  ConditionSchema,
  DependencySchema,
  MemorySchema,
  PlaySchema,
  InstructionSchema,
  SessionSchema,
];
const repos = {
  AnnotationRepository,
  TopographyRepository,
  IssueRepository,
  ConstraintRepository,
};
export default { enums, entities, schemas, repos };
