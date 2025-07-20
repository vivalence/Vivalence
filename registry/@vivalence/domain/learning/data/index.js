import { UserEntity, UserSchema } from "@vivalence/entities";
import { IntentEntity, IntentSchema } from "@vivalence/entities";
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

// import { InitialUserIndent } from "./datasets/User.ts";

export default function (runtime) {
  const entities = {
    user: UserEntity,
    intent: IntentEntity,
    // session: SessionEntity,
    tag: TagEntity,
    unit: UnitEntity,
    exercise: ExerciseEntity,
    memory: MemoryEntity,
    play: PlayEntity,
  };

  const schema = [
    UserSchema,
    IntentSchema,
    // SessionSchema,
    TagSchema,
    UnitSchema,
    ExerciseSchema,
    MemorySchema,
    PlaySchema,
  ];

  const ontology = {
    dimension: new DimensionRepository(),
    topography: new TopographyRepository(),
    constraint: new ConstraintRepository(),
    //
    issue: new IssueRepository(),
  };

  const datasets = [
    // new InitialUserIndent()
  ];

  return {
    schema, //
    entities,
    ontology,
    datasets,
    enums: {},
  };
}
