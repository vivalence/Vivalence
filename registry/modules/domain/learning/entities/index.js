// import { UserEntity, UserSchema } from "@vivalence/entities";
// import { IntentEntity, IntentSchema } from "@vivalence/entities";
// import { SessionEntity, SessionSchema } from "@vivalence/entities";

import { TagEntity, TagSchema } from "./corpus/Tag.ts";
import { UnitEntity, UnitSchema } from "./corpus/Unit.ts";

import { MemoryEntity, MemorySchema } from "./userland/Memory.ts";
import { PlayEntity, PlaySchema } from "./userland/Play.ts";
import { ExerciseEntity, ExerciseSchema } from "./userland/Exercise.ts";

import { TopographyRepository } from "./ontology/Topography.ts";
import { DimensionRepository } from "./ontology/Dimension.ts";
import { ConstraintRepository } from "./ontology/Constraint.ts";
import { IssueRepository } from "./ontology/Issue.ts";

import { UserEntity, UserSchema } from "./view/User.ts";

export const enums = {};

export const entities = {
  user: UserEntity,
  // intent: IntentEntity,
  // session: SessionEntity,
  tag: TagEntity,
  unit: UnitEntity,
  exercise: ExerciseEntity,
  memory: MemoryEntity,
  play: PlayEntity,
};

export const database = [
  // UserSchema,
  // IntentSchema,
  // SessionSchema,
  TagSchema,
  UnitSchema,
  ExerciseSchema,
  MemorySchema,
  PlaySchema,
];

export const repositories = {
  dimension: DimensionRepository,
  topography: TopographyRepository,
  issue: IssueRepository,
  constraint: ConstraintRepository,
};

export default { enums, entities, repositories, database };
