//
// EXPORTS
//
export * from "./0_root/BaseEntity.ts";
export * from "./0_root/BaseDataEntity.ts";
export * from "./0_root/BaseModuleEntity.ts";

export * from "./1_system/User.ts";
export * from "./1_system/Runtime.ts";

export * from "./2_runtime/Module.ts";
// export * from "./2_runtime/Domain.ts";
// export * from "./2_runtime/Service.ts";

// export * from "./3_userland/Session.ts";
// export * from "./3_userland/Intent.ts";

//
// IMPORTS
//

// ENUMS
import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";
// import { IntentTraitsEnum } from "./3_userland/Intent.ts";

// ENTITIES
import { UserEntity, UserSchema } from "./1_system/User.ts";
import { RuntimeEntity, RuntimeSchema } from "./1_system/Runtime.ts";
import { ModuleEntity, ModuleSchema } from "./2_runtime/Module.ts";
// import { SessionEntity, SessionSchema } from "./3_userland/Session.ts";
// import { IntentEntity, IntentSchema } from "./3_userland/Intent.ts";

export const enums = {
  installation: ModuleInstallationEnum,
  // intent: IntentTraitsEnum,
};

export const entities = {
  runtime: RuntimeEntity,
  module: ModuleEntity,
  user: UserEntity,
  // session: SessionEntity,
  // intent: IntentEntity,
};

export const database = [
  RuntimeSchema,
  ModuleSchema,
  UserSchema,
  // IntentSchema,
  // SessionEntity,
];

export const repositories = {};

export default { enums, entities, database, repositories };
